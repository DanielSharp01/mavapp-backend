const { parseTimeTuple, fixJson } = require("./parserCommons");
const {
  TrainHeader,
  TrainRelation,
  TrainStationInfo,
  TrainElviraId
} = require("./statements");

const processStatement = require("./processStatement");
const cheerio = require("cheerio");

module.exports = class StationParser {
  constructor(apiRes) {
    this.ch = cheerio.load(apiRes.d.result, { decodeEntities: true });
  }

  run() {
    this.parseStationHeader();
    this.parseStationTrains();
  }

  parseStationHeader() {
    const $ = this.ch;
    const header = $("table.af th").first();
    this.name = header.contents().eq(0).text();
    this.date = header.find("font").text();
  }

  parseStationTrains() {
    const $ = this.ch;
    $("table.af tr")
      .filter((i, tr) => (typeof $(tr).attr("class") !== "undefined") && (typeof $(tr).attr("id") === "undefined"))
      .each((i, tr) => {
        this.parseStationTrain($(tr));
      });
  }

  parseStationTrain(tr) {
    const tds = tr.children("td");
    let arrival = parseTimeTuple(tds.eq(0));
    let departure = parseTimeTuple(tds.eq(1));
    let platform = (tds.length == 4) ? tds.eq(2).text().trim().replaceEmpty() : undefined;
    let trainTd = (tds.length == 3) ? tds.eq(2) : tds.eq(3);

    let trainTdC = trainTd.contents();
    let trainA = trainTdC.eq(0).first();
    let trainNumber = trainA.text();
    processStatement(new TrainStationInfo(trainNumber, this.name, { arrival, departure, platform }));

    let onclick = trainA.attr("onclick");
    let elviraId = JSON.parse(fixJson(onclick.slice(onclick.indexOf("{"), onclick.indexOf("}") + 1))).v;
    processStatement(new TrainElviraId(trainNumber, elviraId));

    let nameTypeSpl = trainTdC.eq(1).text().trim().match(/\S+/g).map(s => s.trim());
    let name = nameTypeSpl.slice(0, -1).join(" ").trim().replaceEmpty();
    let type = nameTypeSpl[nameTypeSpl.length - 1].trim();
    processStatement(new TrainHeader(trainNumber, type, this.date, { name }));

    let relSpl = trainTdC.eq(3).text().split(" -- ").map(s => s.trim().replaceEmpty());
    let fromRel = relSpl[0] && relSpl[0].split(String.fromCharCode(160)).map(s => s.trim().replaceEmpty());
    let toRel = relSpl[1] && relSpl[1].split(String.fromCharCode(160)).map(s => s.trim().replaceEmpty());

    if (fromRel)
      processStatement(new TrainStationInfo(trainNumber, fromRel[1],
        { departure: { scheduled: fromRel[0], actual: null }, arrival: null }));

    if (toRel)
      processStatement(new TrainStationInfo(trainNumber, toRel[0],
        { arrival: { scheduled: toRel[1], actual: null }, departure: null }));

    processStatement(new TrainRelation(trainNumber, fromRel ? fromRel[1] : this.name, toRel ? toRel[0] : this.name));
  }
};
