let express = require("express");
let app = express();

let cheerio = require("cheerio");
const api = require("./mavapi");
const trainParser = require("./parser/train-parser");
const TrainInfoStatement = require("./parser/TrainInfoStatement");

const { relBetween } = TrainInfoStatement;
const StatementGroup = require("./StatementGroup");

app.use(express.static("./public"));

app.get("/", (req, res, next) => {
  // api(testObj)
  //   .then(apiRes => {
  //     const $ = cheerio.load(apiRes.d.result.html, { decodeEntities: true });
  //     res.header("Content-Type", "text/html; charset=utf-8");

  //     let obj = new TrainInfoStatement(1, "local", "2019.03.13.");
  //     obj.extendWithElviraId("190313-656200");
  //     obj.extendWithRelation(relBetween("Budapest-Nyugati", "Monor"));
  //     res.send(obj);

  //     // res.send(
  //     //   $("th.title")
  //     //     .first()
  //     //     .html() + "<br>"
  //     // );
  //   })
  //   .catch(err => console.error(err));

  let group = new StatementGroup();
  let st0 = group.addStatement({ name: "ST0", shouldFail: true, dependencies: [] });
  let st1 = group.addStatement({ name: "ST1 depends on ST0", dependencies: [st0] });
  let st2 = group.addStatement({ name: "ST2 does depend on ST0, ST1", dependencies: [] });
  group.addStatement({ name: "ST3 does depend on everyone", dependencies: [st1, st2] });
  res.send("<pre>" + JSON.stringify(group.statementGraph, null, 4) + "</pre>");
});

let testObj = {
  a: "TRAIN",
  jo: {
    vsz: "556009"
  }
};

app.listen(3000, () => {
  console.log(":3000");
});
