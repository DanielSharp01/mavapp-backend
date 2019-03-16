const objectRepository = require("./objectRepository");
const Vec2 = require("./Vec2");
const Polyline = require("./Polyline");
const decodePolyline = Polyline.decodePolyline;
const { latLonToHunWebMerc, HUN_WEB_MERC_MPU } = require("./geoMath");
const { normalizeStationName } = require("./model/Station");

function resolveStationLocation(name) {
  return new Promise(async (resolve, reject) => {
    try {
      let station = await objectRepository.Station.findOne({ normName: normalizeStationName(name) });
      if (!station) return reject(new Error("Station does not exist!"));

      resolve(new Vec2(station.position.latitude, station.position.longitude));
    }
    catch (err) { reject(err) };
  });
}

function resolveRealDistance(encodedPolyline, name) {
  return new Promise(async (resolve, reject) => {
    try {
      let polyline = new Polyline(decodePolyline(encodedPolyline).map(e => latLonToHunWebMerc(e)));
      resolve(polyline.projectDistance(latLonToHunWebMerc(await resolveStationLocation(name))) * HUN_WEB_MERC_MPU);
    }
    catch (err) { reject(err) };
  });
}

module.exports = { resolveStationLocation, resolveRealDistance };