const moment = require("moment");
const objectRequire = require("../../utils/objectRequire");
const { resolveRealDistance } = require("../../resolveStation");

module.exports = (objectRepository) => {

  const Train = objectRequire(objectRepository, "model.Train");
  const TrainStation = objectRequire(objectRepository, "model.TrainStation");
  const TrainStationLink = objectRequire(objectRepository, "model.TrainStationLink");

  return (req, res, next) => {
    const parsedTrain = res.locals.parsedTrain;
    if (!parsedTrain) return next();

    let header = parsedTrain.header;
    if (isNaN(header.number)) return next("TRAIN parsing failed");

    const promises = [];

    (function createTrain() {
      promises.push(Train.findOrCreate(header.number).then(train => {
        train.name = header.name;
        train.visz = header.visz;
        train.type = header.type;
        if (header.relation) train.relation = {
          from: header.relation.from && header.relation.from.normName,
          to: header.relation.to && header.relation.to.normName
        };
        train.encodedPolyline = parsedTrain.polyline;
        train.expiry = parsedTrain.expiry;
        train.alwaysValid = parsedTrain.alwaysValid;
        if (header.date && !train.isValid(header.date)) {
          train.validity.push(header.date);
        }
        res.locals.train = train;
        return train.save();
      }));
    })();

    (function createStations() {
      let parsedStations = parsedTrain.stations;
      if (!parsedStations) return;

      let lastNormName = null;
      let startTime = null;
      for (ps of parsedStations) {
        let parsedStation = ps;
        promises.push(TrainStation.findOrCreate(header.number, parsedStation.normName).then(async trainStation => {
          trainStation.mavName = parsedStation.name;
          trainStation.intDistance = parsedStation.intDistance;
          trainStation.platform = parsedStation.platform;

          let arrival = null, departure = null;

          if (parsedStation.arrival && parsedStation.arrival.scheduled) {
            arrival = moment(parsedStation.arrival.scheduled, "HH:mm")
            arrival.year(2000);
            arrival.month(0);
            arrival.date(1);
          }
          if (parsedStation.departure && parsedStation.departure.scheduled) {
            departure = moment(parsedStation.departure.scheduled, "HH:mm")
            departure.year(2000);
            departure.month(0);
            departure.date(1);
          }

          // NOTE: This can fail, technically it's possible for a train to run for more than a full day
          if (!startTime) {
            startTime = departure;
          }
          else {
            if (startTime.isAfter(arrival)) arrival.add(1, "days");
            if (startTime.isAfter(departure)) departure.add(1, "days");
          }

          trainStation.arrival = arrival;
          trainStation.departure = departure;
          trainStation.distance = null;
          try {
            trainStation.distance = await resolveRealDistance(objectRepository, parsedTrain.polyline, parsedStation.normName);
          }
          catch (err) {
            if (parsedStation.intDistance != -1) console.log(`Could not resolve ${parsedStation.name}'s distance`)
          }

          return trainStation.save();
        }));
        promises.push(TrainStationLink.findOrCreate(header.number, lastNormName, parsedStation.normName).then(link => link.save()));
        lastNormName = parsedStation.normName;
      }
      promises.push(TrainStationLink.findOrCreate(header.number, lastNormName, null).then(link => link.save()));
    })();

    Promise.all(promises).then(() => next()).catch(err => next(err));
  }
}