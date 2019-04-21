module.exports = (objectRepository) => {
  return async (req, res, next) => {
    try {
      res.previousLinks = await objectRepository.TrainStationLink
        .find({ toNormName: { $in: [res.fromNormName, res.toNormName] } });
      res.previousLinks = res.previousLinks.reduce((map, link) => {
        map[link.trainNumber + "." + link.toNormName] = link.fromNormName;
        return map;
      }, {});
      res.nextLinks = await objectRepository.TrainStationLink
        .find({ fromNormName: { $in: [res.fromNormName, res.toNormName] } });
      res.nextLinks = res.nextLinks.reduce((map, link) => {
        map[link.trainNumber + "." + link.fromNormName] = link.toNormName;
        return map;
      }, {});
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}