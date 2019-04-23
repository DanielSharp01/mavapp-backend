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

  run() {
    const $ = this.ch;
    // if (this.failed) return Promise.reject("Request failed!");
    if (this.failed) return "<b>Request failed.</b>";
    const self = this;
    $("div#timetable").find("table").filter((i, tr) => $(tr).attr("id") && $(tr).attr("id").includes("info"))
      .each((i, subtable) => {
        let lastStationName = null;
        let trainNumber;
        // TODO: Indirect Routes
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
            if (!trainNumber) return false; // Break

            //self.promises.push(Train.findOrCreate(trainNumber).then(train => {
            if (newTrainNumber) {
              let onclick = trainA.attr("onclick");
              let elviraDateId = JSON.parse(fixJson(onclick.slice(onclick.indexOf("{"), onclick.indexOf("}") + 1))).v;
              //train.setElviraDateId(elviraDateId);

              let nameTypeSpl = trainTdC.eq(1).text().trim().match(/\S+/g).map(s => s.trim());
              let name = nameTypeSpl.slice(0, -1).join(" ").trim().replaceEmpty();
              let type = nameTypeSpl[nameTypeSpl.length - 1].trim();
              //train.setHeader(type, this.date, { name });

              // TODO: VISZ parse, rel is parsed not on eq(3) but depends on where the br is

              let relSpl = trainTdC.eq(3).text().split(" - ").map(s => s.trim().replaceEmpty());
              let fromRel = relSpl[0] && relSpl[0].split(String.fromCharCode(160)).map(s => s.trim().replaceEmpty());
              let toRel = relSpl[1] && relSpl[1].split(String.fromCharCode(160)).map(s => s.trim().replaceEmpty());

              console.log(`TRAIN #${trainNumber} ${name} ${type} ${fromRel || stationName} - ${toRel || stationName}`);
            }
            /*let inPromises = [];
            if (fromRel) {
              inPromises.push(TrainStation.findOrCreate(trainNumber, normalizeStationName(fromRel[1])).then(ts => ts.save()));
            }

            if (toRel) {
              inPromises.push(TrainStation.findOrCreate(trainNumber, normalizeStationName(toRel[0])).then(ts => ts.save()));
            }

            train.setRelation(fromRel ? fromRel[1] : this.name, toRel ? toRel[0] : this.name);
            inPromises.push(train.save());

            return Promise.all(inPromises);*/
            //}));

            /*self.promises.push(TrainStation.findOrCreate(trainNumber, normalizeStationName(stationName))
              .then((trainStation) => {
                trainStation.setInfo({
                  mavName: stationName,
                  arrival: lastStationName ? time.scheduled : undefined,
                  departure: !lastStationName ? time.scheduled : undefined,
                  platform
                });
                return trainStation.save();
              }));*/
            if (lastStationName) {
              // console.log(`DR between ${lastStationName} and ${stationName} with train #${trainNumber}`);
              /*self.promises.push(DirectRoute.findOrCreate(
                normalizeStationName(lastStationName),
                normalizeStationName(stationName),
                trainNumber));*/
              lastStationName = null;
              trainNumber = null;
            }
            else {
              lastStationName = stationName;
            }
          });
      });

    return Promise.all(this.promises);
  }
};
