const { parseTimeTuple } = require("./parser-commons");
const {
  trainHeader,
  trainPolyline,
  trainExpiry,
  trainRelation,
  trainStationInfo,
  trainStationLink,
  trainElviraId
} = require("./statements");

const processStatement = require("./process-statement");
const cheerio = require("cheerio");

module.exports = class TrainParser {
  constructor(apiRes) {
    this.ch = cheerio.load(apiRes.d.result.html, { decodeEntities: true });
    this.polyline = apiRes.d.result.line[0].points;
  }

  run() {
    this.parseTrainHeader();
    this.parseTrainStations();
    this.parseTrainExpiry();
    processStatement(trainPolyline(this.trainNumber, this.polyline));
  }

  parseTrainHeader() {
    const $ = this.ch;
    const header = $("th.title").first();
    const contents = header.contents();
    const textNode = contents.eq(0).text();
    const words = textNode.split(" ").map(w => w.trim());
    this.trainNumber = parseInt(words[0]);
    let name;
    let type = words[words.length - 1];
    if (contents.get(1).tagName === "br" || contents.get(1).tagName === "span") {
      name = words.slice(1, -1).join(" ").trim();
    } else {
      name = words.slice(1).join(" ").trim();
    }

    if (name === "") name = undefined;

    if (contents.get(1).tagName == "img") {
      type = contents.eq(1).attr("alt").trim();
    }

    if (contents.get(1).tagName == "ul") {
      type = [];
      contents.eq(1).find("li").each((i, li) => {
        let liC = $(li).contents();
        let spl = liC.eq(0).text().split(":").map(s => s.trim());
        type[type.length] = {
          rel: spl[0], type: (spl[1] && spl[1] !== "")
            ? spl[1] : liC.eq(1).attr("alt").trim()
        };
      });
    }

    let visz = header.find(".viszszam2").text();
    if (!visz || visz.trim() === "") visz = undefined;

    let spl = header.find("font").text().slice(1, -1).split(",").map(s => s.trim());
    let relationSpl = spl[0].split(" - ").map(s => s.trim());

    processStatement(trainHeader(this.trainNumber, type, spl[1], { name, visz }));
    processStatement(trainRelation(this.trainNumber, relationSpl[0], relationSpl[1]));
  }

  parseTrainExpiry() {
    const $ = this.ch;

    $("div#vt").children("ul").first().find("li")
      .each((i, li) => {
        const a = $(li).children().eq(0);
        if ($(li).attr("style")) {
          let expiry = a.text().split("-")[1];
          processStatement(trainExpiry(this.trainNumber, expiry));
        }

        const onclick = a.attr("onclick");
        const index = onclick.indexOf("{ v: '") + 6;
        let elviraId = onclick.slice(index, onclick.indexOf("'", index));
        processStatement(trainElviraId(this.trainNumber, elviraId));
      });
  }

  parseTrainStations() {
    const $ = this.ch;
    let lastTrainStation = null;
    $("table.vt tr")
      .filter((i, tr) => typeof $(tr).attr("class") !== "undefined")
      .each((i, tr) => {
        let currentTrainStation = this.parseTrainStation(tr, $);
        processStatement(trainStationLink(this.trainNumber, lastTrainStation, currentTrainStation));
        lastTrainStation = currentTrainStation;
      });

    processStatement(trainStationLink(this.trainNumber, lastTrainStation, null));
  }

  parseTrainStation(tr) {
    const $ = this.ch;
    let trainStation = {};
    $(tr)
      .children("td")
      .each((i, td) => {
        if (i == 0) trainStation.distance = parseInt($(td).text());
        else if (i == 1) trainStation.name = $(td).text();
        else if (i == 2) trainStation.arrival = parseTimeTuple($(td).text());
        else if (i == 3) trainStation.departure = parseTimeTuple($(td).text());
        else if (i == 4) trainStation.platform = $(td).text();
      });

    if (trainStation.platform) {
      let str = trainStation.platform.trim();
      trainStation.platform = str.length > 0 ? str : null;
    }

    processStatement(
      trainStationInfo(this.trainNumber, trainStation.name, {
        distance: trainStation.distance,
        platform: trainStation.platform,
        arrival: trainStation.arrival,
        departure: trainStation.departure
      })
    );

    return trainStation.name;
  }
};
