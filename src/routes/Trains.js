const getTrainInstancesMW = require("../middlewares/Trains/getTrainInstances");
const renderTrainInstancesMW = require("../middlewares/Trains/renderTrainInstances");
const statusCodeMW = require("../middlewares/commons/statusCode");

module.exports = (app, objectRepository) => {
  app.get('/trains',
    getTrainInstancesMW(objectRepository),
    renderTrainInstancesMW(objectRepository),
    statusCodeMW()
  );

  app.get('/trains/running',
    getTrainInstancesMW(objectRepository, "running"),
    renderTrainInstancesMW(objectRepository),
    statusCodeMW()
  );

  app.get('/trains/stopped',
    getTrainInstancesMW(objectRepository, "stopped"),
    renderTrainInstancesMW(objectRepository),
    statusCodeMW()
  );
}