const objectRequire = require("../../utils/objectRequire");

module.exports = (objectRepository) => {
  const TrainStation = objectRequire(objectRepository, "model.TrainStation");
  const TrainStationLink = objectRequire(objectRepository, "model.TrainStationLink");

  return async (req, res, next) => {
    if (!res.locals || !res.locals.train) return next();
    try {
      let stations = await TrainStation.find({ trainNumber: res.locals.train.number }).populate("station");
      let stationLinks = await TrainStationLink.find({ trainNumber: res.locals.train.number });
      stations = stations.reduce((map, st) => {
        map[st.normName] = st;
        return map;
      }, {});
      stationLinks = stationLinks.reduce((map, stl) => {
        map[stl.fromNormName] = stl;
        return map;
      }, {});
      res.locals.stations = [];
      let key = stationLinks[null].toNormName;
      while (key) {
        res.locals.stations.push(stations[key]);
        key = stationLinks[key].toNormName;
      }
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}