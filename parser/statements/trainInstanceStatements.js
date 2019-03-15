const objectRepository = require("../../objectRepository");
const mongoose = require("mongoose");
const { splitElviraDateId } = require("../parserCommons");

let idMap = {};

function findOrCreate(elviraId, date) {
  return new Promise(async (resolve, reject) => {
    try {
      let instance = await objectRepository.TrainInstance.findOne({ elviraId, date });
      let key = elviraId + "." + date.toString();
      if (instance) {
        delete idMap[key];
      } else {
        instance = new objectRepository.TrainInstance();
        idMap[key] = idMap[key] || mongoose.Types.ObjectId();
        instance._id = idMap[key];
        instance.elviraId = elviraId;
        instance.date = date;
      }

      resolve(instance);
    }
    catch (err) {
      reject(err);
    }
  });
}

function addOrUpdate(instance, counter = 0) {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await objectRepository.TrainInstance.updateOne({ _id: instance._id }, instance, { upsert: true });
      resolve(res);
    }
    catch (err) {
      resolve(addOrUpdate(instance, counter + 1));
      if (counter > 3) reject(err);
    }
  });
}

class TrainInstanceStatus {
  constructor(elviraDateId, state) {
    Object.assign(this, { timestamp: Date.now(), state }, splitElviraDateId(elviraDateId));
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let trainInstance = await findOrCreate(this.elviraId, this.date);
        trainInstance.state = this.state;
        resolve(await addOrUpdate(trainInstance));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

class TrainRealTimeInfo {
  constructor(elviraDateId, position, delay) {
    Object.assign(this, { timestamp: Date.now(), position, delay }, splitElviraDateId(elviraDateId));
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let trainInstance = await findOrCreate(this.elviraId, this.date);
        trainInstance.position = this.position;
        trainInstance.delay = this.delay;
        resolve(await addOrUpdate(trainInstance));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = {
  TrainInstanceStatus,
  TrainRealTimeInfo
}