const { normalizeStationName } = require("../../utils/parserUtils");
const { mergeWithoutDuplicates } = require("../../utils/arrayUtils");

module.exports = (objectRepository) => {
  return async (req, res, next) => {
    if (!req.params.fromName || !req.params.toName) return next("Invalid parameters.");
    res.fromNormName = normalizeStationName(req.params.fromName);
    res.toNormName = normalizeStationName(req.params.toName);
    try {
      let fromStations = await objectRepository.TrainStation.find({ normName: res.fromNormName })
        .populate("train").populate("station");
      fromStations = fromStations.reduce((map, st) => {
        map[st.trainNumber] = st;
        return map;
      }, {});

      let toStations = await objectRepository.TrainStation.find({ normName: res.toNormName })
        .populate("train").populate("station");
      toStations = toStations.reduce((map, st) => {
        map[st.trainNumber] = st;
        return map;
      }, {});

      let fromKeys = Object.keys(fromStations);
      let toKeys = Object.keys(toStations);
      let keys = mergeWithoutDuplicates([fromKeys, toKeys]);
      res.trains = keys.filter(key => fromKeys.includes(key) && toKeys.includes(key))
        .reduce((arr, key) => {
          arr[arr.length] = {
            ...fromStations[key].train._doc,
            fromStation: fromStations[key],
            toStation: toStations[key]
          }
          return arr;
        }, []).filter(
          t => t.fromStation.intDistance <= t.toStation.intDistance);
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}