const getTrainMW = require("../middlewares/Train/getTrain");
const getTrainStationsMW = require("../middlewares/Train/getTrainStations");
const getInstanceMW = require("../middlewares/Train/getInstance");
const renderTrainMW = require("../middlewares/Train/renderTrain");
const statusCodeMW = require("../middlewares/commons/statusCode");

module.exports = (app, objectRepository, dispatcher) => {
  app.use('/train/number/:number',
    getTrainMW(objectRepository, dispatcher),
    getTrainStationsMW(objectRepository),
    getInstanceMW(objectRepository),
    renderTrainMW(),
    statusCodeMW()
  );

  app.get('/train/elviraid/:elviraId',
    getTrainMW(objectRepository, dispatcher),
    getTrainStationsMW(objectRepository),
    getInstanceMW(objectRepository),
    renderTrainMW(objectRepository),
    statusCodeMW()
  );
}