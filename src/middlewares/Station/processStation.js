const moment = require("moment");
const objectRequire = require("../../utils/objectRequire");

module.exports = (objectRepository) => {

  const Train = objectRequire(objectRepository, "model.Train");
  const TrainStation = objectRequire(objectRepository, "model.TrainStation");

  return (req, res, next) => {
    if (!res.locals || !res.locals.parsedStation) return next();

    function createTrain(parsedTrain) {
      promises.push(Train.findOrCreate(parsedTrain.number).then(train => {
        train.name = parsedTrain.name;
        train.type = parsedTrain.type;
        if (parsedTrain.relation) train.relation = {
          from: parsedTrain.relation.from.normName,
          to: parsedTrain.relation.to.normName
        };
        if (parsedTrain.date && !train.isValid(parsedTrain.date)) {
          train.validity.push(parsedTrain.date);
        }
        return train.save();
      }));
    };

    function createTrainStation(parsedStation) {
      createTrain(parsedStation.train);
      let startTime = moment(parsedStation.train.relation.from.time, "HH:mm")
      startTime.year(2000);
      startTime.month(0);
      startTime.date(1);

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
    }

    return next();
  }
};