const objectRepository = require("../../objectRepository");
const mongoose = require("mongoose");
const { normalizeStationName } = require("./trainStationStatements");

let idMap = {};

function create(trainNumber, fromNormName, toNormName) {
  return new Promise(async (resolve, reject) => {
    try {
      let link = await objectRepository.TrainStationLink.findOne({ trainNumber, fromNormName, toNormName });
      if (!link) {
        let idMapKey = trainNumber + "." + fromNormName + "." + toNormName;
        if (idMap[idMapKey]) return resolve(false);

        idMap[idMapKey] = mongoose.Types.ObjectId();
        link = new objectRepository.TrainStationLink();
        link._id = idMap[idMapKey];
        link.trainNumber = trainNumber;
        link.fromNormName = fromNormName;
        link.toNormName = toNormName;
        resolve(link);
      }
      else resolve(false);
    }
    catch (err) {
      reject(err);
    }
  });
}

class TrainStationLink {
  constructor(trainNumber, fromSt, toSt, direct = true) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, direct });
    this.fromNormName = fromSt ? normalizeStationName(fromSt) : null;
    this.toNormName = toSt ? normalizeStationName(toSt) : null;
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let link = await create(this.trainNumber, this.fromNormName, this.toNormName);
        if (link) resolve(await link.save());
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = { TrainStationLink };