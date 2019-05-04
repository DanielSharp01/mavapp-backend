const reqTrainByNumberMW = require("../middlewares/Train/reqTrainByNumber");
const reqTrainByElviraIdMW = require("../middlewares/Train/reqTrainByElviraId");
const parseTrainMW = require("../middlewares/Train/parseTrain");
const processTrainMW = require("../middlewares/Train/processTrain"); 
const getTrainStationsMW = require("../middlewares/Train/getTrainStations");
const getInstanceMW = require("../middlewares/Train/getInstance");
const renderTrainMW = require("../middlewares/Train/renderTrain");
const statusCodeMW = require("../middlewares/commons/statusCode");

module.exports = (app, objectRepository) => {
  app.use('/train/number/:number',
    reqTrainByNumberMW(objectRepository),
    parseTrainMW(),
    processTrainMW(objectRepository),
    getTrainStationsMW(objectRepository),
    getInstanceMW(objectRepository),
    renderTrainMW(),
    statusCodeMW()
  );

  app.get('/train/elviraid/:elviraId',
    reqTrainByElviraIdMW(objectRepository),
    parseTrainMW(),
    processTrainMW(objectRepository),
    getTrainStationsMW(objectRepository),
    getInstanceMW(objectRepository),
    renderTrainMW(objectRepository),
    statusCodeMW()
  );
}