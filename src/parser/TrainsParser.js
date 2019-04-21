const { Train, TrainStation, TrainInstance } = require("../objectRepository");
const { splitElviraDateId, normalizeStationName } = require("../utils/parserUtils");

module.exports = class TrainParser {
  constructor(apiRes) {
    this.trains = apiRes.d.result.Trains.Train;
    this.promises = [];
  }

  run() {
    let self = this;
    this.trains.forEach(train => {
      const trainNumber = parseInt(train["@TrainNumber"].slice(2));
      self.promises.push(Train.findOrCreate(trainNumber).then(trainObj => {
        trainObj.setElviraDateId(train["@ElviraID"]);
        let relSpl = train["@Relation"].split(" - ");
        trainObj.setRelation(relSpl[0], relSpl[1]);

        let inPromises = [];
        inPromises.push(TrainStation.findOrCreate(trainNumber, normalizeStationName(relSpl[0])).then(ts => self.promises.push(ts.save())));
        inPromises.push(TrainStation.findOrCreate(trainNumber, normalizeStationName(relSpl[1])).then(ts => self.promises.push(ts.save())));
        inPromises.push(trainObj.save());
        return Promise.all(inPromises);
      }));
      let elviraDateId = splitElviraDateId(train["@ElviraID"]);
      self.promises.push(TrainInstance.findOrCreate(elviraDateId.elviraId, elviraDateId.date).then(trainInstance => {
        trainInstance.position = { latitude: train["@Lat"], longitude: train["@Lon"] };
        trainInstance.delay = train["@Delay"];
        trainInstance.status = "running";
        return trainInstance.save();
      }));
    });

    return Promise.all(this.promises);
  }
};
