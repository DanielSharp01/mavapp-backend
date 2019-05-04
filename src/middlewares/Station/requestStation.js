const { normalizeStationName } = require("../../utils/parserUtils");
const objectRequire = require("../../utils/objectRequire");

module.exports = (objectRepository) => {
  const STATION = objectRequire(objectRepository, "mavapi.STATION");
  const Station = objectRequire(objectRepository, "model.Station");

  return async (req, res, next) => {
    if (!req.params || !req.params.name) return next("No station specified");
    req.normName = normalizeStationName(req.params.name);
    try {
      const station = await Station.findOne({ normName: req.normName });
      if (!station) return next("Station not found");

      if (!station.fullKnowledge) {
        res.locals.apiResult = await STATION(req.params.name);
      }

      res.locals.station = station;
      return next();
    }
    catch (err) {
      return next(err);
    }
  }
}