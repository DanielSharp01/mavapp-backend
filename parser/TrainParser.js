const { parseTimeTuple, fixJson } = require("./parserCommons");
const {
  TrainHeader,
  TrainPolyline,
  TrainExpiry,
  TrainRelation,
  StationDisplayName,
  TrainStationInfo,
  TrainStationLink,
  TrainElviraDateId
} = require("./statements");

const processStatement = require("./processStatement");
const cheerio = require("cheerio");
const moment = require("moment");
const { momentCombine, fixDateOrder } = require("./timeCommons");

module.exports = class TrainParser {
  constructor(apiRes) {
    this.reqParam = apiRes.d.param;

    if (apiRes.d.result.line.length === 0) {
      this.failed = true;
      return;
    }

    this.ch = cheerio.load(apiRes.d.result.html, { decodeEntities: true });
    this.polyline = apiRes.d.result.line[0].points;
  }

  run() {
    if (this.failed) return;

    this.parseTrainHeader();
    this.parseTrainStations();
    this.parseTrainExpiry();
    processStatement(new TrainPolyline(this.trainNumber, this.polyline));
  }

  parseTrainHeader() {
    const $ = this.ch;
    const header = $("th.title").first();
    const contents = header.contents();
    const textNode = contents.eq(0).text();
    const words = textNode.split(" ").map(w => w.trim());
    this.trainNumber = parseInt(words[0]);

    if (typeof this.reqParam.v !== "undefined") {
      processStatement(new TrainElviraDateId(this.trainNumber, this.reqParam.v));
    }

    let name;
    let type = words[words.length - 1];
    if (contents.get(1).tagName === "br" || contents.get(1).tagName === "span") {
      name = words.slice(1, -1).join(" ").trim();
    } else {
      name = words.slice(1).join(" ").trim().replaceEmpty(null);
    }

    if (contents.get(1).tagName == "img") {
      type = contents.eq(1).attr("alt").trim();
    }

    if (contents.get(1).tagName == "ul") {
      type = [];
      contents.eq(1).find("li").each((i, li) => {
        let liC = $(li).contents();
        let spl = liC.eq(0).text().split(":").map(s => s.trim());
        type[type.length] = {
          rel: spl[0], type: spl[1]
            && spl[1] !== "" ? spl[1] : liC.eq(1).attr("alt").trim()
        };
      });
    }

    let viszSpan = header.find(".viszszam2");
    let visz = viszSpan ? viszSpan.text().trim().replaceEmpty(null) : null;

    let spl = header.find("font").text().slice(1, -1).split(",").map(s => s.trim());
    this.date = moment(spl[1], "YYYY.MM.DD.");
    let relationSpl = spl[0].split(" - ").map(s => s.trim());

    processStatement(new TrainHeader(this.trainNumber, type, spl[1], { name, visz }));
    processStatement(new TrainRelation(this.trainNumber, relationSpl[0], relationSpl[1]));
  }

  parseTrainExpiry() {
    const $ = this.ch;

    $("div#vt").children("ul").first().find("li").each((i, li) => {
      const a = $(li).children().eq(0);
      const onclick = a.attr("onclick");
      if (!onclick) return; // This is probably not an expiry date li

      if ($(li).attr("style")) {
        let expiry = a.text().split("-")[1];
        processStatement(new TrainExpiry(this.trainNumber, expiry));
      }

      let elviraDateId = JSON.parse(fixJson(onclick.slice(onclick.indexOf("{"), onclick.indexOf("}") + 1))).v;
      processStatement(new TrainElviraDateId(this.trainNumber, elviraDateId));
    });
  }

  parseTrainStations() {
    const $ = this.ch;
    let lastTrainStation = null;

    let m = moment(this.date);
    let lastMoments = {
      departure: { scheduled: m, actual: m }
    };

    $("table.vt tr")
      .filter((i, tr) => typeof $(tr).attr("class") !== "undefined")
      .each((i, tr) => {
        let currentTrainStation = this.parseTrainStation($(tr), lastMoments);
        processStatement(new TrainStationLink(this.trainNumber, lastTrainStation, currentTrainStation));
        lastTrainStation = currentTrainStation;
      });

    processStatement(new TrainStationLink(this.trainNumber, lastTrainStation, null));
  }

  parseTrainStation(tr, lastMoments) {
    const tds = tr.children("td");
    let intDistance = parseInt(tds.eq(0).text());
    let name = tds.eq(1).text();
    let arrival = parseTimeTuple(tds.eq(2));
    let departure = parseTimeTuple(tds.eq(3));
    let platform = tds.eq(4).text().trim().replaceEmpty(null);

    if (arrival) {
      arrival.scheduled = arrival.scheduled
        && momentCombine(lastMoments.departure.scheduled, moment(arrival.scheduled, "HH:mm"));
      arrival.actual = arrival.actual
        && momentCombine(lastMoments.departure.scheduled || lastMoments.departure.actual,
          moment(arrival.actual, "HH:mm"));
    }
    if (departure) {
      departure.scheduled = departure && departure.scheduled
        && momentCombine(lastMoments.departure.scheduled, moment(departure.scheduled, "HH:mm"));
      departure.actual = departure.actual
        && momentCombine(lastMoments.departure.scheduled || lastMoments.departure.actual,
          moment(departure.actual, "HH:mm"));
    }

    fixDateOrder(lastMoments.departure.scheduled, arrival && arrival.scheduled);
    fixDateOrder(lastMoments.departure.actual, arrival && arrival.actual);

    fixDateOrder(lastMoments.departure.scheduled, departure && departure.scheduled);
    fixDateOrder(lastMoments.departure.actual, departure && departure.actual);

    fixDateOrder(arrival && arrival.scheduled, arrival && arrival.actual);
    fixDateOrder(departure && departure.scheduled, departure && departure.actual);

    fixDateOrder(arrival && arrival.scheduled, departure && departure.scheduled);
    fixDateOrder(arrival && arrival.actual, departure && departure.actual);

    lastMoments.departure.scheduled = departure && departure.scheduled;
    lastMoments.departure.actual = departure && (departure.actual || departure.scheduled);

    processStatement(new StationDisplayName(name));
    processStatement(new TrainStationInfo(this.trainNumber, name, { intDistance, platform, arrival, departure }));
    return name;
  }
};
