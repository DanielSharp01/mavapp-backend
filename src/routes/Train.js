const TRAINReqByNumberMW = require("../middlewares/API/TRAINReqByNumber");
const TRAINReqByElviraMW = require("../middlewares/API/TRAINReqByElvira");
const TRAINparseMW = require("../middlewares/API/TRAINparse");
const TRAINprocessMW = require("../middlewares/API/TRAINprocess");
const getTrainStationsMW = require("../middlewares/Train/getTrainStations");
const getInstanceMW = require("../middlewares/Train/getInstance");
const renderTrainMW = require("../middlewares/Train/renderTrain");
const statusCodeMW = require("../middlewares/commons/statusCode");

module.exports = (app, objectRepository) => {
  app.use('/train/number/:number',
    TRAINReqByNumberMW(objectRepository),
    TRAINparseMW(),
    TRAINprocessMW(objectRepository),
    getTrainStationsMW(objectRepository),
    getInstanceMW(objectRepository),
    renderTrainMW(),
    statusCodeMW()
  );

  app.get('/train/elviraid/:elviraId',
    TRAINReqByElviraMW(objectRepository),
    TRAINparseMW(),
    TRAINprocessMW(objectRepository),
    getTrainStationsMW(objectRepository),
    getInstanceMW(objectRepository),
    renderTrainMW(objectRepository),
    statusCodeMW()
  );
}