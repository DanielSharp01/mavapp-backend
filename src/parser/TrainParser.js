const { parseTimeTuple, getElviraIdFromOnClick, normalizeStationName } = require("../utils/parserUtils");

const cheerio = require("cheerio");
const moment = require("moment");
const { momentCombine, fixDateOrder } = require("../utils/timeUtils");
const { resolveRealDistance } = require("../resolveStation");
const { Train, TrainStation, TrainStationLink } = require("../objectRepository");

module.exports = class TrainParser {
  constructor(apiRes) {
    this.reqParam = apiRes.d.param;

    if (!apiRes.d.result || !apiRes.d.result.line || apiRes.d.result.line.length === 0) {
      this.failed = true;
      return;
    }

    this.ch = cheerio.load(apiRes.d.result.html, { decodeEntities: true });
    this.polyline = apiRes.d.result.line[0].points;
    this.promises = [];
  }

  run() {
    if (this.failed) return Promise.reject("Request failed!");

    return this.parseTrainHeader().then(() => {
      this.parseTrainStations();
      this.parseTrainExpiry();
      this.train.encodedPolyline = this.polyline;
      this.promises.push(this.train.save());
      return Promise.all(this.promises);
    });
  }

  async parseTrainHeader() {
    const $ = this.ch;
    const header = $("th.title").first();
    const contents = header.contents();
    const textNode = contents.eq(0).text();
    const words = textNode.split(" ").map(w => w.trim());
    this.trainNumber = parseInt(words[0]);
    this.train = await Train.findOrCreate(this.trainNumber);

    if (typeof this.reqParam.v !== "undefined") {
      this.train.setElviraDateId(this.reqParam.v);
    }

    let { name, type } = this.parseTypeAndName(words, contents);
    let viszSpan = header.find(".viszszam2");
    let visz = viszSpan ? viszSpan.text().trim().replaceEmpty(null) : null;

    let { date, from, to } = parseRelation(header.find("font").text());
    this.date = date;
    this.train.setHeader(type, { name, visz });
    this.train.setRelation(from, to);
  }

  parseTypeAndName(words, contents) {
    let name, type;
    if (contents.get(1).tagName === "img") {
      name = words.slice(1).join(" ").trim().replaceEmpty(null);
      type = contents.eq(1).attr("alt").trim();
    }
    else if (contents.get(1).tagName == "ul") {
      name = words.slice(1).join(" ").trim().replaceEmpty(null);
      this.parseUlTypes(contents);
    }
    else {
      name = words.slice(1, -1).join(" ").trim().replaceEmpty(null);
      type = words[words.length - 1];
    }
    return { name, type };
  }

  parseUlTypes(contents) {
    type = [];
    contents.eq(1).find("li").each((i, li) => {
      let liC = $(li).contents();
      let spl = liC.eq(0).text().split(":").map(s => s.trim());
      type[type.length] = {
        rel: spl[0], type: spl[1]
          && spl[1] !== "" ? spl[1] : liC.eq(1).attr("alt").trim()
      };
    });
    return type;
  }

  parseRelation(text) {
    let spl = text.slice(1, -1).split(",").map(s => s.trim());
    let date = moment(spl[1], "YYYY.MM.DD");
    let relationSpl = spl[0].split(" - ").map(s => s.trim());

    return { date, from: relationSpl[0], to: relationSpl[1] };
  }

  parseTrainExpiry() {
    const $ = this.ch;
    let self = this;
    let explicitExpiry = false;
    $("div#vt").children("ul").first().find("li").each((i, li) => {
      const a = $(li).children().eq(0);
      const onclick = a.attr("onclick");
      if (!onclick) return; // This is probably not an expiry date li

      if ($(li).attr("style")) {
        let expiry = a.text().split("-")[1];
        self.train.expiry = expiry;
        explicitExpiry = true;
      }

      let elviraDateId = getElviraIdFromOnClick(onclick);
      self.train.setElviraDateId(elviraDateId);
    });

    if (!explicitExpiry) {
      self.train.expiry = moment({ year: moment().year() + 1, month: 0, date: 1 });
    }
  }

  parseTrainStations() {
    const $ = this.ch;
    let lastTrainStation = null;

    // Arbitrary day to know if some station times are on the next day compared to the departure time
    // Station times on the next day will get 2000, 0, 2
    let lastMoments = {
      departure: moment(2000, 0, 1, 0, 0, 0)
    };

    let self = this;
    $("table.vt tr")
      .filter((i, tr) => (typeof $(tr).attr("class") !== "undefined") && (typeof $(tr).attr("id") === "undefined"))
      .each((i, tr) => {
        let currentTrainStation = this.parseTrainStation($(tr), lastMoments);
        self.promises.push(TrainStationLink.findOrCreate(this.trainNumber,
          lastTrainStation && normalizeStationName(lastTrainStation),
          normalizeStationName(currentTrainStation))
          .then(trainStationLink => {
            return trainStationLink.save();
          }));
        lastTrainStation = currentTrainStation;
      });

    self.promises.push(TrainStationLink.findOrCreate(this.trainNumber, normalizeStationName(lastTrainStation), null)
      .then(trainStationLink => {
        return trainStationLink.save();
      }));
  }

  parseTrainStation(tr, lastMoments) {
    const tds = tr.children("td");
    let intDistance = parseInt(tds.eq(0).text());
    if (isNaN(intDistance)) intDistance = -1;
    let name = tds.eq(1).text();
    let arrival = parseTimeTuple(tds.eq(2));
    let departure = parseTimeTuple(tds.eq(3));
    let platform = tds.eq(4).text().trim().replaceEmpty(null);

    let lastDeparture = lastMoments.departure;
    if (arrival) {
      arrival = arrival.scheduled;
      arrival = arrival && momentCombine(lastDeparture, moment(arrival, "HH:mm"));
      fixDateOrder(lastMoments.departure, arrival);
    }

    if (departure) {
      departure = departure.scheduled;
      departure = departure && momentCombine(lastDeparture, moment(departure, "HH:mm"));
      fixDateOrder(lastMoments.departure, departure);
    }

    fixDateOrder(arrival, departure);
    lastMoments.departure = departure;

    this.promises.push(Promise.all([
      TrainStation.findOrCreate(this.trainNumber, normalizeStationName(name)),
      resolveRealDistance(this.polyline, name).then(d => d).catch(err => { if (intDistance != -1) console.log(err); })])
      .then(([trainStation, dist]) => {
        trainStation.distance = dist;
        trainStation.setInfo({ mavName: name, intDistance, platform, arrival: arrival || null, departure: departure || null });
        return trainStation.save();
      }));

    return name;
  }
};
