const { parseTimeTuple, fixJson } = require("../utils/parserUtils");
const {
  TrainHeader,
  TrainRelation,
  TrainStationInfo,
  TrainElviraDateId
} = require("./statements");

const processStatement = require("../utils/processStatement");
const cheerio = require("cheerio");
const moment = require("moment");
const { momentCombine, fixDateOrder } = require("../utils/timeUtils");

module.exports = class StationParser {
  constructor(apiRes) {
    this.ch = cheerio.load(apiRes.d.result, { decodeEntities: true });
    this.promises = [];
  }

  run() {
    this.parseStationHeader();
    this.parseStationTrains();
    return Promise.all(this.promises);
  }

  pushAndProcessStatement(statement) {
    this.promises.push(processStatement(statement));
  }

  parseStationHeader() {
    const $ = this.ch;
    const header = $("table.af th").first();
    this.name = header.contents().eq(0).text();
    this.date = moment(header.find("font").text(), "YYYY.MM.DD");
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

    if (arrival) {
      arrival.scheduled = arrival.scheduled
        && momentCombine(this.date, moment(arrival.scheduled, "HH:mm"));
      arrival.actual = arrival.actual
        && momentCombine(this.date, moment(arrival.actual, "HH:mm"));
    }
    if (departure) {
      departure.scheduled = departure && departure.scheduled
        && momentCombine(this.date, moment(departure.scheduled, "HH:mm"));
      departure.actual = departure.actual
        && momentCombine(this.date, moment(departure.actual, "HH:mm"));
    }

    fixDateOrder(arrival && arrival.scheduled, arrival && arrival.actual);
    fixDateOrder(departure && departure.scheduled, departure && departure.actual);

    fixDateOrder(arrival && arrival.scheduled, departure && departure.scheduled);
    fixDateOrder(arrival && arrival.actual, departure && departure.actual);

    this.pushAndProcessStatement(new TrainStationInfo(trainNumber, this.name, { arrival, departure, platform }));

    let onclick = trainA.attr("onclick");
    let elviraDateId = JSON.parse(fixJson(onclick.slice(onclick.indexOf("{"), onclick.indexOf("}") + 1))).v;
    this.pushAndProcessStatement(new TrainElviraDateId(trainNumber, elviraDateId));

    let nameTypeSpl = trainTdC.eq(1).text().trim().match(/\S+/g).map(s => s.trim());
    let name = nameTypeSpl.slice(0, -1).join(" ").trim().replaceEmpty();
    let type = nameTypeSpl[nameTypeSpl.length - 1].trim();
    this.pushAndProcessStatement(new TrainHeader(trainNumber, type, this.date, { name }));

    let relSpl = trainTdC.eq(3).text().split(" -- ").map(s => s.trim().replaceEmpty());
    let fromRel = relSpl[0] && relSpl[0].split(String.fromCharCode(160)).map(s => s.trim().replaceEmpty());
    let toRel = relSpl[1] && relSpl[1].split(String.fromCharCode(160)).map(s => s.trim().replaceEmpty());

    if (fromRel)
      this.pushAndProcessStatement(new TrainStationInfo(trainNumber, fromRel[1], {}));

    if (toRel)
      this.pushAndProcessStatement(new TrainStationInfo(trainNumber, toRel[0], {}));

    this.pushAndProcessStatement(new TrainRelation(trainNumber, fromRel ? fromRel[1] : this.name, toRel ? toRel[0] : this.name));
  }
};
