const { TRAIN, STATION, TRAINS } = require("./apis/mavapis");
const TrainParser = require("./parser/TrainParser");
const StationParser = require("./parser/StationParser");
const TrainsParser = require("./parser/TrainsParser");
const { normalizeStationName } = require("./utils/parserUtils");
const moment = require("moment");

const TRAINS_OBSERVER_DELAY_MS = 20000;
let trainsObserverHandle = false;
module.exports = (objectRepository) => {
  const { Train, Station, TrainInstance } = objectRepository;
  return class Dispatcher {
    startTrainsObserver() {
      if (trainsObserverHandle) return;
      this.requestTrains();
      trainsObserverHandle = setInterval(() => this.requestTrains(), TRAINS_OBSERVER_DELAY_MS);
    }

    stopTrainsObserver() {
      if (!trainsObserverHandle) return;
      clearInterval(trainsObserverHandle);
    }

    requestTrain(number) {
      return new Promise(async (resolve, reject) => {
        try {
          const train = await Train.findOne({ number });
          if (!train || !train.fullKnowledge) {
            return resolve(await TRAIN({ number }).then(apiRes => {
              let parser = new TrainParser(apiRes);
              return parser.run();
            }).then(res => Train.findOne({ number })));
          }
          else {
            return resolve(train);
          }
        }
        catch (err) { reject(err); }
      });
    }

    requestTrainElviraId(elviraDateId) {
      let elviraId = elviraDateId.elviraId;
      return new Promise(async (resolve, reject) => {
        try {
          const train = await Train.findOne({ elviraId });
          if (!train || !train.fullKnowledge) {
            return resolve(await TRAIN({ elviraDateId }).then(apiRes => {
              let parser = new TrainParser(apiRes);
              return parser.run();
            }).then(res => Train.findOne({ elviraId })));
          }
          else {
            return resolve(train);
          }
        }
        catch (err) { reject(err); }
      });
    }

    requestStation(stationName) {
      const normName = normalizeStationName(stationName);
      return new Promise(async (resolve, reject) => {
        try {
          const station = await Station.findOne({ normName });
          if (!station || !station.fullKnowledge) {
            return resolve(await STATION(stationName).then(apiRes => {
              let parser = new StationParser(apiRes);
              return parser.run();
            }).then(async res => {
              let station = await Station.findOne({ normName })
              if (!station) return reject(`Station '${stationName}' does not exist!`);
              let now = moment();
              station.expiry = moment({ year: now.year(), month: now.month(), date: now.date() + 1 });
              station.save();
              return station;
            }));
          }
          else {
            return resolve(station);
          }
        }
        catch (err) { reject(err); }
      });
    }

    async requestTrains() {
      let idMap = {};
      return Promise.all([TRAINS(), TrainInstance.find({ status: "running" }).then(res => res.reduce((map, ti) => {
        map[ti._id] = ti;
        return map;
      }, idMap))]).then(([apiRes]) => {
        let parser = new TrainsParser(apiRes);
        return parser.run(idMap);
      }).then(() => {
        let ids = Object.keys(idMap);
        if (ids.length > 0) return TrainInstance.updateMany({ _id: { $in: ids } }, { $set: { status: "stopped" } });
        else return Promise.resolve();
      });
    }
  }
}