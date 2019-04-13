module.exports = class TrainParser {
  constructor(apiRes) {
    this.trains = apiRes.d.result.Trains.Train;
  }

  run() {
    this.trains.forEach(train => {
      const trainNumber = parseInt(train["@TrainNumber"].slice(2));
      const trainObj = Train.findOrCreate(trainNumber);
      const trainInstance = TrainInstace.findOrCreate(splitElviraDateId(train["@ElviraID"]));
      trainObj.setElviraDateId(train["@ElviraID"]);
      let relSpl = train["@Relation"].split(" - ");
      trainObj.setRelation(relSpl[0], relSpl[1]);

      const fromTS = TrainStation.findOrCreate(trainNumber, relSpl[0]);
      fromTS.save(); // TODO: Promises

      const fromTS = TrainStation.findOrCreate(trainNumber, relSpl[1]);
      toTS.save(); // TODO: Promises


      trainInstance.position = { latitude: train["@Lat"], longitude: train["@Lon"] };
      trainInstance.delay = train["@Delay"];

      // TODO: Promises
      trainObj.save();
      trainInstance.save();
    });
  }
};
