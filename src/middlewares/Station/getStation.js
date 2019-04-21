module.exports = (objectRepository, dispatcher) => {
  return async (req, res, next) => {
    try {
      if (req.params.name) {
        res.station = await dispatcher.requestStation(req.params.name);
      }
      else return next("Invalid parameters.");
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}