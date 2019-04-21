const moment = require("moment");
module.exports = (objectRepository) => {
  return async (req, res, next) => {
    try {
      let elviraIds = res.trainStations.map(st => st.train.elviraId).filter(id => id);
      let now = moment();
      date = moment({ year: now.year(), month: now.month(), date: now.date() });
      res.trainIntances = await objectRepository.TrainInstance.find({ elviraId: { $in: elviraIds }, date });
      res.trainIntances = res.trainIntances.reduce((map, ti) => {
        map[ti.elviraId] = ti;
        return map;
      }, {});
    }
    catch (err) {
      return next(err);
    }

    return next();
  };
}