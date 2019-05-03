const objectRequire = require("../../utils/objectRequire")

module.exports = (objectRepository) => {
  const TRAIN = objectRequire(objectRepository, "mavapi.TRAIN");
  const Train = objectRequire(objectRepository, "model.Train");

  return async (req, res, next) => {
    if (!req.params || !req.params.number) return next("No train number specified");
    try {
      const train = await Train.findOne({ number: req.params.number });
      if (!train || !train.fullKnowledge) {
        TRAIN({ number: req.params.number }).then(apiRes => {
          res.locals.apiResult = apiRes;
          return next();
        }).catch(err => next(err));
      }
      else {
        res.locals.train = train;
        return next();
      }
    }
    catch (err) {
      return next(err);
    }
  }
};