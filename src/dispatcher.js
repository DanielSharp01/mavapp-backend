const { TRAIN, STATION, TRAINS } = require("./apis/mavapis");
const TrainParser = require("./parser/TrainParser");
const StationParser = require("./parser/StationParser");
const TrainsParser = require("./parser/TrainsParser");
const objectRepository = require("./objectRepository");
const { normalizeStationName } = require("./utils/parserUtils");
const moment = require("moment");

const TRAINS_OBSERVER_DELAY_MS = 20000;

let trainsObserverHandle;

function startTrainsObserver() {
  if (trainsObserverHandle) return;
  requestTrains();
  trainsObserverHandle = setInterval(() => requestTrains(), TRAINS_OBSERVER_DELAY_MS);
}

function stopTrainsObserver() {
  if (!trainsObserverHandle) return;
  clearInterval(trainsObserverHandle);
}

function requestTrain(number) {
  return new Promise(async (resolve, reject) => {
    try {
      const train = await objectRepository.Train.findOne({ number });
      if (!train || !train.fullKnowledge) {
        return resolve(await TRAIN({ number }).then(apiRes => {
          let parser = new TrainParser(apiRes);
          return parser.run();
        }).then(res => objectRepository.Train.findOne({ number })));
      }
      else {
        return resolve(train);
      }
    }
    catch (err) { reject(err); }
  });
}

function requestTrainElviraId(elviraId) {
  return new Promise(async (resolve, reject) => {
    try {
      const train = await objectRepository.Train.findOne({ elviraId });
      if (!train || !train.fullKnowledge) {
        return resolve(await TRAIN({ elviraDateId }).then(apiRes => {
          let parser = new TrainParser(apiRes);
          return parser.run();
        }).then(res => objectRepository.Train.findOne({ elviraId })));
      }
      else {
        return resolve(train);
      }
    }
    catch (err) { reject(err); }
  });
}

function requestStation(stationName) {
  const normName = normalizeStationName(stationName);
  return new Promise(async (resolve, reject) => {
    try {
      const station = await objectRepository.Station.findOne({ normName });
      if (!station || !station.fullKnowledge) {
        return resolve(await STATION(stationName).then(apiRes => {
          let parser = new StationParser(apiRes);
          return parser.run();
        }).then(async res => {
          let station = await objectRepository.Station.findOne({ normName })
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

async function requestTrains() {
  TRAINS().then(apiRes => {
    let parser = new TrainsParser(apiRes);
    return parser.run();
  });
}

module.exports = {
  startTrainsObserver,
  stopTrainsObserver,
  requestTrain,
  requestTrainElviraId,
  requestStation
}