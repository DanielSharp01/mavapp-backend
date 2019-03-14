const express = require("express");
const app = express();

const { TRAIN, STATION, TRAINS } = require("./mav/apis");
const TrainParser = require("./parser/TrainParser");
const StationParser = require("./parser/StationParser");
const TrainsParser = require("./parser/TrainsParser");

app.use(express.static("./public"));

app.get("/train/number/:id", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  TRAIN({ number: req.params.id }).then(apiRes => {
    let parser = new TrainParser(apiRes);
    parser.run();
    res.send(parser.ch.html());
  }).catch(err => console.error(err));
});

app.get("/train/elviraid/:id", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  TRAIN({ elviraId: req.params.id }).then(apiRes => {
    let parser = new TrainParser(apiRes);
    parser.run();
    res.send(parser.ch.html());
  }).catch(err => console.error(err));
});

app.get("/station/:name", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  STATION(req.params.name).then(apiRes => {
    let parser = new StationParser(apiRes);
    parser.run();
    res.send(parser.ch.html());
  }).catch(err => console.error(err));
});

app.get("/trains", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  TRAINS().then(apiRes => {
    let parser = new TrainsParser(apiRes);
    parser.run();
    res.send("<pre>" + JSON.stringify(parser.trains, null, 4) + "</pre");
  }).catch(err => console.error(err));
});

app.listen(3000, () => {
  console.log(":3000");
});
