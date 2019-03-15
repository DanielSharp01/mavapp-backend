const {
  TrainElviraId,
  TrainRelation,
  TrainRealTimeInfo
} = require("./statements");

const processStatement = require("./processStatement");

module.exports = class TrainParser {
  constructor(apiRes) {
    this.trains = apiRes.d.result.Trains.Train;
  }

  run() {
    this.trains.forEach(train => {
      const trainNumber = parseInt(train["@TrainNumber"].slice(2));
      processStatement(new TrainElviraId(trainNumber, train["@ElviraID"]));
      let relSpl = train["@Relation"].split(" - ");
      processStatement(new TrainRelation(trainNumber, relSpl[0], relSpl[1]));
      processStatement(new TrainRealTimeInfo(train["@ElviraID"],
        { latitude: train["@Lat"], longitude: train["@Lon"] }, train["@Delay"]));
    });
  }
};
