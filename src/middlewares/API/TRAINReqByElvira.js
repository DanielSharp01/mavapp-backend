const moment = require("moment");
const { splitElviraDateId } = require("../../utils/parserUtils");
const objectRequire = require("../../utils/objectRequire")

module.exports = (objectRepository) => {
  const TRAIN = objectRequire(objectRepository, "mavapi.TRAIN");
  const Train = objectRequire(objectRepository, "model.Train");
  return async (req, res, next) => {
    if (!req.params || !req.params.elviraId) return next("No elviraid specified");

    if (req.params.elviraId.includes("_"))
      req.elviraId = splitElviraDateId(req.params.elviraId);
    else {
      let now = moment();
      req.elviraId = {
        elviraId: parseInt(req.params.elviraId),
        date: moment({ year: now.year(), month: now.month(), date: now.date() })
      };
    }
    try {
      const train = await Train.findOne({ elviraId: req.elviraId.elviraId });
      if (!train || !train.fullKnowledge) {
        TRAIN({ elviraDateId: req.elviraId }).then(apiRes => {
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
  };
};