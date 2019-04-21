const moment = require("moment");
const { splitElviraDateId } = require("../../utils/parserUtils");

module.exports = (objectRepository) => {
  return async (req, res, next) => {
    try {
      if (res.train.elviraId) {
        let date;
        if (req.elviraId) {
          date = req.elviraId.date;
        }
        else {
          let now = moment();
          date = moment({ year: now.year(), month: now.month(), date: now.date() });
        }

        res.instance = await objectRepository.TrainInstance.findOne({
          elviraId: res.train.elviraId,
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