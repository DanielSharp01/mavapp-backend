const getStationsMW = require("../middlewares/Route/getStations");
const getStationLinksMW = require("../middlewares/Route/getStationLinks");
const getTrainInstancesMW = require("../middlewares/Route/getTrainInstances");
const renderDirectRouteMW = require("../middlewares/Route/renderDirectRoute");
const statusCodeMW = require("../middlewares/commons/statusCode");

module.exports = (app, objectRepository) => {
  app.use('/direct-route/:fromName/:toName',
    getStationsMW(objectRepository),
    getStationLinksMW(objectRepository),
    getTrainInstancesMW(objectRepository),
    renderDirectRouteMW(objectRepository),
    statusCodeMW()
  );
}