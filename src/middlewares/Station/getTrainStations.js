module.exports = (objectRepository) => {
  return async (req, res, next) => {
    try {
      res.trainStations = await objectRepository.TrainStation.find({ normName: res.station.normName }).populate("train");
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}