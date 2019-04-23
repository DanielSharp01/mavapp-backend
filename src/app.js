const express = require("express");
const app = express();
const objectRepository = require("./objectRepository");
const dispatcher = new (require("./dispatcher")(objectRepository))();
const { ROUTE } = require("./apis/mavapis");
const RouteParser = require("./parser/RouteParser");
const statusCodeMW = require("./middlewares/commons/statusCode");
const moment = require("moment");

// require("./model/stationSeed")();

// dispatcher.startTrainsObserver();
// console.log("Started trains observer");

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

app.get("/test/:from/:to", (req, res, next) => {
  res.header("Content-Type", "text/html");
  ROUTE(req.params.from, req.params.to, {}).then(async apiRes => {
    let parser = new RouteParser(apiRes);
    try {
      await parser.run();
      res.result = {};
      statusCodeMW()(req, res, next);
    }
    catch (err) {
      res.statusCode = 500;
      res.result = { error: err };
      statusCodeMW()(req, res, next);
      throw err;
    }

  });
});

app.use((err, req, res, next) => {
  if (err.stack) console.error(err.stack);
  else console.error(err);

  res.statusCode = 500;
  res.result = { error: err };
  statusCodeMW()(req, res, next);
});

module.exports = app;