const getTrainInstancesMW = require("../middlewares/Trains/getTrainInstances");
const renderTrainInstancesMW = require("../middlewares/Trains/renderTrainInstances");

module.exports = (app, objectRepository) => {
  app.get('/trains',
    getTrainInstancesMW(objectRepository),
    renderTrainInstancesMW(objectRepository),
  );

  app.get('/trains/running',
    getTrainInstancesMW(objectRepository, "running"),
    renderTrainInstancesMW(objectRepository),
  );

  app.get('/trains/stopped',
    getTrainInstancesMW(objectRepository, "stopped"),
    renderTrainInstancesMW(objectRepository),
  );
}