const getStationMW = require("../middlewares/Station/getStation");
const nearStationsMW = require("../middlewares/Station/nearStations");
const getTrainStationsMW = require("../middlewares/Station/getTrainStations");
const getTrainInstancesMW = require("../middlewares/Station/getTrainInstances");
const getStationLinksMW = require("../middlewares/Station/getStationLinks");
const renderStationMW = require("../middlewares/Station/renderStation");
const renderStationsMW = require("../middlewares/Station/renderStations");
const statusCodeMW = require("../middlewares/commons/statusCode");

module.exports = (app, objectRepository, dispatcher) => {
  app.use('/station/:name',
    getStationMW(objectRepository, dispatcher),
    getTrainStationsMW(objectRepository),
    getTrainInstancesMW(objectRepository),
    getStationLinksMW(objectRepository),
    renderStationMW(objectRepository),
    statusCodeMW()
  );

  app.get('/stations-near',
    nearStationsMW(objectRepository),
    renderStationsMW(objectRepository),
    statusCodeMW()
  );
}