const moment = require("moment");
const objectRequire = require("../../utils/objectRequire");

module.exports = (objectRepository) => {
  const TrainInstance = objectRequire(objectRepository, "model.TrainInstance");

  return async (req, res, next) => {
    try {
      if (res.locals && res.locals.train && res.locals.train.elviraId) {
        let date;
        if (req.elviraId) {
          date = req.elviraId.date;
        }
        else {
          let now = moment();
          date = moment({ year: now.year(), month: now.month(), date: now.date() });
        }

        res.locals.instance = await TrainInstance.findOne({
          elviraId: res.locals.train.elviraId,
          date
        });
      }
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}