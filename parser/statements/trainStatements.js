const objectRepository = require("../../objectRepository");
const mongoose = require("mongoose");
const { normalizeStationName } = require("./stationStatements");

let idMap = {};

function findOrCreate(number) {
  return new Promise(async (resolve, reject) => {
    try {
      let train = await objectRepository.Train.findOne({ number });
      if (train) {
        delete idMap[number];
      } else {
        train = new objectRepository.Train();
        idMap[number] = idMap[number] || mongoose.Types.ObjectId();
        train._id = idMap[number];
        train.number = number;
      }

      resolve(train);
    }
    catch (err) {
      reject(err);
    }
  });
}

function addOrUpdate(train, counter = 0) {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await objectRepository.Train.updateOne({ _id: train._id }, train, { upsert: true });
      resolve(res);
    }
    catch (err) {
      resolve(addOrUpdate(train, counter + 1));
      if (counter > 3) reject(err);
    }
  });
}

class TrainHeader {
  constructor(trainNumber, type, date, { name, visz }) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, type, date, name, visz });
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let train = await findOrCreate(this.trainNumber);
        train.type = this.type;
        if (typeof train.name !== "undefined") train.name = this.name;
        if (typeof train.visz !== "undefined") train.visz = this.visz;
        resolve(await addOrUpdate(train));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

class TrainPolyline {
  constructor(trainNumber, polyline) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, polyline });
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let train = await findOrCreate(this.trainNumber);
        train.encodedPolyline = this.polyline;
        resolve(await addOrUpdate(train));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

class TrainExpiry {
  constructor(trainNumber, expiry) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, expiry });
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let train = await findOrCreate(this.trainNumber);
        console.log(train.isNew);
        train.expiry = this.expiry;
        resolve(await addOrUpdate(train));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

class TrainRelation {
  constructor(trainNumber, from, to) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, from: normalizeStationName(from), to: normalizeStationName(to) });
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let train = await findOrCreate(this.trainNumber);
        train.relation = { from: this.from, to: this.to };
        resolve(await addOrUpdate(train));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

class TrainElviraId {
  constructor(trainNumber, elviraId) {
    Object.assign(this, {
      timestamp: Date.now(), trainNumber,
      elviraId: elviraId && parseInt(elviraId.split("_")[0])
    });
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let train = await findOrCreate(this.trainNumber);
        train.elviraId = this.elviraId;
        resolve(await addOrUpdate(train));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = {
  TrainHeader,
  TrainPolyline,
  TrainExpiry,
  TrainRelation,
  TrainElviraId
};