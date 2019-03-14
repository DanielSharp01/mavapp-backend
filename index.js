const express = require("express");
const app = express();

const api = require("./mavapi");
const TrainParser = require("./parser/train-parser");
const StationParser = require("./parser/station-parser");

app.use(express.static("./public"));

app.get("/train/:id", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  api({
    a: "TRAIN",
    jo: {
      vsz: "55" + req.params.id
    }
  })
    .then(apiRes => {
      let tp = new TrainParser(apiRes);

      tp.run();
      res.send(tp.ch.html());
    })
    .catch(err => console.error(err));
});

app.get("/station/:name", (req, res, next) => {
  res.header("Content-Type", "text/html; charset=utf-8");
  api({
    a: "STATION",
    jo: {
      a: req.params.name
    }
  }).then(apiRes => {
    let sp = new StationParser(apiRes);

    sp.run();
    res.send(sp.ch.html());
  }).catch(err => console.error(err));
});

app.listen(3000, () => {
  console.log(":3000");
});
