const { parseTimeTuple, fixJson, normalizeStationName } = require("../utils/parserUtils");

const cheerio = require("cheerio");
const moment = require("moment");
const { Train, TrainStation, Route, DirectRoute, IndirectRoute } = require("../objectRepository");

module.exports = class RouteParser {
  constructor(apiRes) {
    this.reqParam = apiRes.d.param;

    if (!apiRes.d.result) {
      this.failed = true;
      return;
    }

    this.ch = cheerio.load(apiRes.d.result, { decodeEntities: true });
    this.promises = [];
  }


  // TODO: Indirect Routes
  run() {
    const $ = this.ch;
    if (this.failed) return Promise.reject("Request failed!");
    this.date = moment($("div.rtftop").children().eq(1).text().split(",")[0].trim(), "YYYY.MM.DD");

    let trainsAdded = {};
    let trainStationsAdded = {};

    const self = this;
    let subtables = $("div#timetable").find("table").filter((i, tr) => $(tr).attr("id") && $(tr).attr("id").includes("info"));
    if (subtables.length === 0) return Promise.reject("Request failed!");
    subtables.each((i, subtable) => {
      let lastStationName = null;
      let trainNumber;
      $(subtable).find("tr").filter((i, tr) => typeof $(tr).attr("class") !== "undefined")
        .each((i, tr) => {
          const tds = $(tr).children("td");
          let stationName = tds.eq(0).text().replace("+>>", "").trim();
          let time = parseTimeTuple(tds.eq(1));
          let platform = (tds.length == 4) ? tds.eq(2).text().trim().replaceEmpty(null) : null;
          let trainTd = (tds.length == 4) ? tds.eq(3) : tds.eq(2);
          let trainTdC = trainTd.contents();
          let trainA = trainTdC.eq(0).first();
          let newTrainNumber = parseInt(trainA.text());
          if (isNaN(newTrainNumber)) newTrainNumber = null;

          if (!trainNumber) trainNumber = newTrainNumber;
          if (!trainNumber) return false;

          let relElement = (() => {
            for (let i = 1; i < trainTdC.length; i++) {
              if (trainTdC[i - 1].name === "br") return trainTdC[i];
            }
          })();
          let relSpl = $(relElement).text().slice(1, -1).split(String.fromCharCode(160) + "-" + String.fromCharCode(160)).map(s => s.trim().replaceEmpty());
          let fromRel = relSpl[0] && relSpl[0].trim().replaceEmpty();
          let toRel = relSpl[1] && relSpl[1].trim().replaceEmpty();

          if (fromRel) {
            let fromRelNName = normalizeStationName(fromRel);
            if (!trainStationsAdded[trainNumber + "." + fromRelNName]) {
              trainStationsAdded[trainNumber + "." + fromRelNName] = true;
              self.promises.push(TrainStation.findOrCreate(trainNumber, fromRelNName).then(ts => ts.save()));
            }
          }

          if (toRel) {
            let toRelNName = normalizeStationName(toRel);
            if (!trainStationsAdded[trainNumber + "." + toRelNName]) {
              trainStationsAdded[trainNumber + "." + toRelNName] = true;
              self.promises.push(TrainStation.findOrCreate(trainNumber, toRelNName).then(ts => ts.save()));
            }
          }

          if (!trainsAdded[trainNumber]) {
            trainsAdded[trainNumber] = true;
            self.promises.push(Train.findOrCreate(trainNumber).then(train => {
              if (newTrainNumber) {
                let onclick = trainA.attr("onclick");
                let elviraDateId = JSON.parse(fixJson(onclick.slice(onclick.indexOf("{"), onclick.indexOf("}") + 1))).v;
                train.setElviraDateId(elviraDateId);

                let nameTypeSpl = trainTdC.eq(1).text().trim().match(/\S+/g).map(s => s.trim());
                let name = nameTypeSpl.slice(0, -1).join(" ").trim().replaceEmpty();
                let type = nameTypeSpl[nameTypeSpl.length - 1].trim();
                let visz = trainTd.find("span.viszszam").eq(0).text().trim().replaceEmpty();
                train.setHeader(type, this.date, { name, visz });
                train.setRelation(fromRel ? fromRel : stationName, toRel ? toRel : stationName);
                return train.save();
              }
            }));
          }

          let nname = normalizeStationName(stationName);
          if (!trainStationsAdded[trainNumber + "." + nname]) {
            trainStationsAdded[trainNumber + "." + nname] = true;
            self.promises.push(TrainStation.findOrCreate(trainNumber, nname)
              .then((trainStation) => {
                trainStation.setInfo({
                  mavName: stationName,
                  arrival: lastStationName ? time.scheduled : undefined,
                  departure: !lastStationName ? time.scheduled : undefined,
                  platform
                });
                return trainStation.save();
              }));
            if (lastStationName) {
              self.promises.push(DirectRoute.findOrCreate(
                normalizeStationName(lastStationName),
                normalizeStationName(stationName),
                trainNumber).then(dr => dr.save()));
              lastStationName = null;
              trainNumber = null;
            }
            else {
              lastStationName = stationName;
            }
          }
        });
    });

    return Promise.all(this.promises);
  }
};
