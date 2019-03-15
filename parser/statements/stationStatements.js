const objectRepository = require("../../objectRepository");
const mongoose = require("mongoose");

let idMap = {};

function findOrCreate(normName) {
  return new Promise(async (resolve, reject) => {
    try {
      let station = await objectRepository.Station.findOne({ normName });
      if (station) {
        delete idMap[normName];
      } else {
        idMap[normName] = idMap[normName] || mongoose.Types.ObjectId();
        station = new objectRepository.Station();
        station._id = idMap[normName];
        station.normName = normName;
      }

      resolve(station);
    }
    catch (err) {
      reject(err);
    }
  });
}

function addOrUpdate(station) {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await objectRepository.Station.updateOne({ _id: station._id }, station, { upsert: true });
      resolve(res);
    }
    catch (err) {
      resolve(addOrUpdate(station, counter + 1));
      if (counter > 3) reject(err);
    }
  });
}

function normalizeStationName(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .replace("railway station crossing", "").replace("railway station", "").replace("train station", "")
    .replace("vonatallomas", "").replace("vasutallomas", "").replace("mav pu", "").replace("-", " ").replace("/\s\s+/g", " ").trim();
}

class StationDisplayName {
  constructor(stationName) {
    this.stationName = stationName;
    this.normName = normalizeStationName(stationName);
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let station = await findOrCreate(this.normName);
        station.displayName = this.stationName;
        resolve(await addOrUpdate(station));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

class StationPosition {
  constructor(stationName, position) {
    this.position = position;
    this.normName = normalizeStationName(stationName);
  }

  process() {
    return new Promise(async (resolve, reject) => {
      try {
        let station = await findOrCreate(this.normName);
        station.position = position;
        resolve(await addOrUpdate(station));
      }
      catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = {
  StationDisplayName,
  StationPosition,
  normalizeStationName
}