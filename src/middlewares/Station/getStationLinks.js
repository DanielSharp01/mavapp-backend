module.exports = (objectRepository) => {
  return async (req, res, next) => {
    try {
      res.previousLinks = await objectRepository.TrainStationLink.find({ toNormName: res.station.normName });
      res.previousLinks = res.previousLinks.reduce((map, link) => {
        map[link.trainNumber] = link.fromNormName;
        return map;
      }, {});
      res.nextLinks = await objectRepository.TrainStationLink.find({ fromNormName: res.station.normName });
      res.nextLinks = res.nextLinks.reduce((map, link) => {
        map[link.trainNumber] = link.toNormName;
        return map;
      }, {});
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}