const express = require("express");
const app = express();

const {
  startTrainsObserver,
  stopTrainsObserver,
  requestTrain,
  requestTrainElviraId,
  requestStation
} = require("./dispatcher");

require("./model/stationSeed")();

const { splitElviraDateId } = require("./utils/parserUtils");

app.use(express.static("./public"));

app.get((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

app.get("/train/number/:number", (req, res, next) => {
  let number = parseInt(req.params.number);
  if (isNaN(number)) return next(new Error(":number must be a number"));
  requestTrain(number).then(result => res.send(result)).catch(err => next(err));
});

app.get("/train/elviraid/:elviradateid", (req, res, next) => {
  let elviraid = splitElviraDateId(req.params.elviradateid).elviraId;
  if (!elviraid) return next(new Error(":elviradateid is required"));
  requestTrainElviraId(elviraid).then(result => res.send(result)).catch(err => next(err));
});

app.get("/station/:name", (req, res, next) => {
  let name = req.params.name;
  if (!name) return next(new Error(":name is required"));
  requestStation(name).then(result => res.send(result)).catch(err => next(err));
});

app.get("/trains/start", (req, res, next) => {
  startTrainsObserver();
  res.send({ status: "started trains observer" });
});

app.get("/trains/stop", (req, res, next) => {
  stopTrainsObserver();
  res.send({ status: "stopped trains observer" });
});

app.get("/test", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  res.send('<canvas></canvas><script src="Vec2.js"></script><script src="polyline.js"></script><script src="geoMath.js"></script><script src="test.js"></script>')
});

app.use((err, req, res, next) => {
  if (err.stack) console.error(err.stack);
  else console.err(err);
  res.status(500).send("ERROR");
});

module.exports = app;