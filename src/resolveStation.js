const objectRequire = require("./utils/objectRequire")
const Vec2 = require("./math/Vec2");
const Polyline = require("./math/Polyline");
const decodePolyline = Polyline.decodePolyline;
const { latLonToHunWebMerc, HUN_WEB_MERC_MPU } = require("./math/geoMath");
const { normalizeStationName } = require("./utils/parserUtils");

function resolveStationLocation(objectRepository, name) {
  const Station = objectRequire(objectRepository, "model.Station");
  return new Promise(async (resolve, reject) => {
    try {
      let station = await Station.findOne({ normName: normalizeStationName(name) });
      if (!station) return reject(new Error("Station does not exist!"));

      resolve(new Vec2(station.position.latitude, station.position.longitude));
    }
    catch (err) { reject(err) };
  });
}

function resolveRealDistance(objectRepository, encodedPolyline, name) {
  return new Promise(async (resolve, reject) => {
    try {
      let polyline = new Polyline(decodePolyline(encodedPolyline).map(e => latLonToHunWebMerc(e)));
      resolve(polyline.projectDistance(
        latLonToHunWebMerc(await resolveStationLocation(objectRepository, name))) * HUN_WEB_MERC_MPU);
    }
    catch (err) { reject(err) };
  });
}

module.exports = { resolveStationLocation, resolveRealDistance };