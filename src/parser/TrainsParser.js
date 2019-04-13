module.exports = class TrainParser {
  constructor(apiRes) {
    this.trains = apiRes.d.result.Trains.Train;
    this.promises = [];
  }

  run() {
    let self = this;
    this.trains.forEach(train => {
      const trainNumber = parseInt(train["@TrainNumber"].slice(2));
      const trainObj = Train.findOrCreate(trainNumber);
      const trainInstance = TrainInstace.findOrCreate(splitElviraDateId(train["@ElviraID"]));
      trainObj.setElviraDateId(train["@ElviraID"]);
      let relSpl = train["@Relation"].split(" - ");
      trainObj.setRelation(relSpl[0], relSpl[1]);

      const fromTS = TrainStation.findOrCreate(trainNumber, relSpl[0]);
      self.promises.push(fromTS.save());

      const toTS = TrainStation.findOrCreate(trainNumber, relSpl[1]);
      self.promises.push(toTS.save());


      trainInstance.position = { latitude: train["@Lat"], longitude: train["@Lon"] };
      trainInstance.delay = train["@Delay"];

      self.promises.push(trainObj.save());
      self.promises.push(trainInstance.save());
    });

    return Promise.all(this.promises);
  }
};
