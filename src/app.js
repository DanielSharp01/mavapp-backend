const express = require("express");
const app = express();
const objectRepository = require("./objectRepository");
const dispatcher = new (require("./dispatcher")(objectRepository))();
const statusCodeMW = require("./middlewares/commons/statusCode");

require("./model/stationSeed")();

dispatcher.startTrainsObserver();
console.log("Started trains observer");

app.use(express.static("./public"));

app.get((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

require("./routes/Train")(app, objectRepository, dispatcher);
require("./routes/Trains")(app, objectRepository);
require("./routes/Station")(app, objectRepository, dispatcher);
require("./routes/Route")(app, objectRepository);

/*
app.get("/station/:name", (req, res, next) => {
  let name = req.params.name;
  if (!name) return next(new Error(":name is required"));
  requestStation(name).then(result => res.send(result)).catch(err => next(err));
});
*/

app.get("/trains/start", (req, res, next) => {
  dispatcher.startTrainsObserver();
  res.send({ status: "started trains observer" });
});

app.get("/trains/stop", (req, res, next) => {
  dispatcher.stopTrainsObserver();
  res.send({ status: "stopped trains observer" });
});

app.use((err, req, res, next) => {
  if (err.stack) console.error(err.stack);
  else console.error(err);

  res.statusCode = 500;
  res.result = { error: err };
  statusCodeMW()(req, res, next);
});

module.exports = app;