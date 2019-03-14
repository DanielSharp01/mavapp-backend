const express = require("express");
const app = express();

const api = require("./mav/mavapi");
const TrainParser = require("./parser/TrainParser");
const StationParser = require("./parser/StationParser");
const TrainsParser = require("./parser/TrainsParser");

app.use(express.static("./public"));

app.get("/train/:id", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  api({
    a: "TRAIN",
    jo: { vsz: "55" + req.params.id }
  })
    .then(apiRes => {
      let tp = new TrainParser(req, apiRes);

      tp.run();
      res.send(tp.ch.html());
    })
    .catch(err => console.error(err));
});

app.get("/station/:name", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  api({
    a: "STATION",
    jo: { a: req.params.name }
  }).then(apiRes => {
    let sp = new StationParser(apiRes);

    sp.run();
    res.send(sp.ch.html());
  }).catch(err => console.error(err));
});

app.get("/trains", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  api({
    a: "TRAINS",
    jo: { pre: true, history: false, id: false }
  }).then(apiRes => {
    let parser = new TrainsParser(apiRes);
    parser.run();
    res.send("<pre>" + JSON.stringify(parser.trains, null, 4) + "</pre");
  }).catch(err => console.error(err));
});

app.listen(3000, () => {
  console.log(":3000");
});
