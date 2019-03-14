const express = require("express");
const app = express();
var fs = require("fs");

const api = require("./mavapi");
const TrainParser = require("./parser/train-parser");

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

app.listen(3000, () => {
  console.log(":3000");
});
