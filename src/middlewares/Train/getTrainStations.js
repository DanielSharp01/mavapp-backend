module.exports = (objectRepository) => {
  return async (req, res, next) => {
    try {
      let stations = await objectRepository.TrainStation.find({ trainNumber: res.train.number }).populate("station");
      let stationLinks = await objectRepository.TrainStationLink.find({ trainNumber: res.train.number });
      stations = stations.reduce((map, st) => {
        map[st.normName] = st;
        return map;
      }, {});
      stationLinks = stationLinks.reduce((map, stl) => {
        map[stl.fromNormName] = stl;
        return map;
      }, {});
      res.stations = [];
      let key = stationLinks[null].toNormName;
      while (key) {
        res.stations.push(stations[key]);
        key = stationLinks[key].toNormName;
      }
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}