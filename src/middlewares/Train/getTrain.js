const moment = require("moment");
const { splitElviraDateId } = require("../../utils/parserUtils");

module.exports = (objectRepository, dispatcher) => {
  return async (req, res, next) => {
    try {
      if (req.params.number) res.train = await dispatcher.requestTrain(req.params.number);
      if (req.params.elviraId) {
        if (req.params.elviraId.includes("_"))
          req.elviraId = splitElviraDateId(req.params.elviraId);
        else {
          let now = moment();
          req.elviraId = {
            elviraId: req.params.elviraId,
            date: moment({ year: now.year(), month: now.month(), date: now.date() })
          };
        }
        res.train = await dispatcher.requestTrainElviraId(req.elviraId);
      }
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}