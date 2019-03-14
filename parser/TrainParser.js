const { parseTimeTuple, fixJson } = require("./parserCommons");
const {
  TrainHeader,
  TrainPolyline,
  TrainExpiry,
  TrainRelation,
  TrainStationInfo,
  TrainStationLink,
  TrainElviraId
} = require("./statements");

const processStatement = require("./processStatement");
const cheerio = require("cheerio");

module.exports = class TrainParser {
  constructor(apiRes) {
    this.reqParam = apiRes.d.param;
    this.ch = cheerio.load(apiRes.d.result.html, { decodeEntities: true });
    this.polyline = apiRes.d.result.line[0].points;
  }

  run() {
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
      processStatement(new TrainElviraId(this.trainNumber, this.reqParam.v));
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

      let elviraId = JSON.parse(fixJson(onclick.slice(onclick.indexOf("{"), onclick.indexOf("}") + 1))).v;
      processStatement(new TrainElviraId(this.trainNumber, elviraId));
    });
  }

  parseTrainStations() {
    const $ = this.ch;
    let lastTrainStation = null;
    $("table.vt tr")
      .filter((i, tr) => typeof $(tr).attr("class") !== "undefined")
      .each((i, tr) => {
        let currentTrainStation = this.parseTrainStation($(tr));
        processStatement(new TrainStationLink(this.trainNumber, lastTrainStation, currentTrainStation));
        lastTrainStation = currentTrainStation;
      });

    processStatement(new TrainStationLink(this.trainNumber, lastTrainStation, null));
  }

  parseTrainStation(tr) {
    const tds = tr.children("td");
    let intDistance = parseInt(tds.eq(0).text());
    let name = tds.eq(1).text();
    let arrival = parseTimeTuple(tds.eq(2));
    let departure = parseTimeTuple(tds.eq(3));
    let platform = tds.eq(4).text().trim().replaceEmpty(null);

    processStatement(new TrainStationInfo(this.trainNumber, name, { intDistance, platform, arrival, departure }));
    return name;
  }
};
