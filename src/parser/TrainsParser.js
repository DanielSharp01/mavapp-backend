const {
  TrainElviraDateId,
  TrainRelation,
  TrainRealTimeInfo
} = require("./statements");

const processStatement = require("../utils/processStatement");

module.exports = class TrainParser {
  constructor(apiRes) {
    this.trains = apiRes.d.result.Trains.Train;
    this.promises = [];
  }

  pushAndProcessStatement(statement) {
    this.promises.push(processStatement(statement));
  }

  run() {
    this.trains.forEach(train => {
      const trainNumber = parseInt(train["@TrainNumber"].slice(2));
      this.pushAndProcessStatement(new TrainElviraDateId(trainNumber, train["@ElviraID"]));
      let relSpl = train["@Relation"].split(" - ");
      this.pushAndProcessStatement(new TrainRelation(trainNumber, relSpl[0], relSpl[1]));
      this.pushAndProcessStatement(new TrainRealTimeInfo(train["@ElviraID"],
        { latitude: train["@Lat"], longitude: train["@Lon"] }, train["@Delay"]));
    });
    return Promise.all(this.promises);
  }
};
