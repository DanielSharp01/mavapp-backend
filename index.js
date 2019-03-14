let express = require("express");
let app = express();
var fs = require("fs");

let cheerio = require("cheerio");
const api = require("./mavapi");
const { parseTrainStations, parseTrainHeader } = require("./parser/train-parser");
const TrainInfoStatement = require("./parser/statements");

app.use(express.static("./public"));

app.get("/:id", (req, res, next) => {
  api({
    a: "TRAIN",
    jo: {
      vsz: "55" + req.params.id
    }
  })
    .then(apiRes => {
      const $ = cheerio.load(apiRes.d.result.html, { decodeEntities: true });
      res.header("Content-Type", "text/html; charset=utf-8");

      // parseTrainStations($);

      // res.send(
      //   $("th.title")
      //     .first()
      //     .html() + "<br>"
      // );

      res.send(parseTrainHeader($));

      //res.end($.html({ decodeEntities: false }));
    })
    .catch(err => console.error(err));
});

// let testObj = { a: "STATION", jo: { a: "Monor" } };

// let testObj = {
//   a: "TRAIN",
//   jo: {
//     vsz: "55347"
//   }
// };

// let testObj = {
//   a: "TRAIN",
//   jo: {
//     vsz: "552648"
//   }
// };

app.listen(3000, () => {
  console.log(":3000");
});
