const objectRepository = require("../../objectRepository");
const { normalizeStationName } = require("../../model/Station");
const moment = require("moment");
const mongoose = require("mongoose");

let idMap = {};

function findOrCreate(trainNumber, normName) {
  return new Promise(async (resolve, reject) => {
    try {
      let trainStation = await objectRepository.TrainStation.findOne({ trainNumber, normName });
      let key = trainNumber + "." + normName;
      if (trainStation) {
        delete idMap[key];
      } else {
        idMap[key] = idMap[key] || mongoose.Types.ObjectId();
        trainStation = new objectRepository.TrainStation();
        trainStation._id = idMap[key];
        trainStation.trainNumber = trainNumber;
        trainStation.normName = normName;
      }

      resolve(trainStation);
    }
    catch (err) {
      reject(err);
    }
  });
}

function addOrUpdate(trainStation) {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await objectRepository.TrainStation.updateOne({ _id: trainStation._id }, trainStation, { upsert: true });
      resolve(res);
    }
    catch (err) {
      resolve(addOrUpdate(trainStation, counter + 1));
      if (counter > 3) reject(err);
    }
  });
}

class TrainStationInfo {
  constructor(trainNumber, stationName, { intDistance, platform, arrival, departure }) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, intDistance, platform, arrival, departure });
    this.normName = normalizeStationName(stationName);
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let trainStation = await findOrCreate(this.trainNumber, this.normName);
        if (typeof this.intDistance !== "undefined") trainStation.intDistance = this.intDistance;
        if (typeof this.platform !== "undefined") trainStation.platform = this.platform;
        if (this.arrival && this.arrival.scheduled) trainStation.arrival = this.arrival.scheduled;
        if (this.departure && this.departure.scheduled) trainStation.departure = this.departure.scheduled;
        resolve(addOrUpdate(trainStation));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

class TrainStationRealDistance {
  constructor(trainNumber, stationName, distance) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, distance });
    this.normName = normalizeStationName(stationName);
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let trainStation = await findOrCreate(this.trainNumber, this.normName);
        if (typeof this.distance !== "undefined") trainStation.distance = this.distance;
        resolve(addOrUpdate(trainStation));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = {
  TrainStationInfo,
  TrainStationRealDistance,
  normalizeStationName
}