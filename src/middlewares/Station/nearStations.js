const Vec2 = require("../../math/Vec2");
const { latLonToHunWebMerc, HUN_WEB_MERC_MPU } = require("../../math/geoMath");

module.exports = (objectRepository) => {
  return async (req, res, next) => {
    try {
      if (req.query.position && req.query.distance) {
        let spl = req.query.position.split(",");
        let wm = latLonToHunWebMerc(new Vec2(parseFloat(spl[0]), parseFloat(spl[1])));
        let dist = parseFloat(req.query.distance);
        res.stations = await objectRepository.Station.find();
        res.stations = res.stations.map(st => {
          let wmSt = latLonToHunWebMerc(new Vec2(st.position.latitude, st.position.longitude));
          let stDist = wm.sub(wmSt).length * HUN_WEB_MERC_MPU;
          return { ...st._doc, distance: stDist };
        }).filter(st => st.distance <= dist);
      }
      else return next("Invalid parameters.");
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}