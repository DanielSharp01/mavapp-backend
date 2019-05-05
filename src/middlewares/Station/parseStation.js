const cheerio = require("cheerio");
const {
  splitElviraDateId,
  parseTimeTuple,
  getElviraIdFromOnClick,
  normalizeStationName
} = require("../../utils/parserUtils");
const moment = require("moment");

function parseStationHeader(cheerio) {
  const $ = cheerio;
  const header = $("table.af th").first();
  name = header.contents().eq(0).text().trim();
  date = moment(header.find("font").text(), "YYYY.MM.DD");
  return { name, date };
}

function parseStationTrains(cheerio, stationName) {
  const $ = cheerio;
  let entries = [];
  $("table.af tr")
    .filter((i, tr) => (typeof $(tr).attr("class") !== "undefined") && (typeof $(tr).attr("id") === "undefined"))
    .each((i, tr) => {
      const tds = $(tr).children("td");
      let arrival = parseTimeTuple(tds.eq(0));
      let departure = parseTimeTuple(tds.eq(1));
      let platform = (tds.length == 4) ? tds.eq(2).text().trim().replaceEmpty(null) : null;
      let trainTd = (tds.length == 3) ? tds.eq(2) : tds.eq(3);

      let trainTdC = trainTd.contents();
      let trainA = trainTdC.eq(0).first();
      let trainNumber = parseInt(trainA.text());
      let onclick = trainA.attr("onclick");
      let elviraDateId = splitElviraDateId(getElviraIdFromOnClick(onclick));

      let nameTypeSpl = trainTdC.eq(1).text().trim().match(/\S+/g).map(s => s.trim());
      let name = nameTypeSpl.slice(0, -1).join(" ").trim().replaceEmpty(null);
      let type = nameTypeSpl[nameTypeSpl.length - 1].trim();

      let relSpl = trainTdC.eq(3).text().split(" -- ").map(s => s.trim().replaceEmpty());
      let fromRel = relSpl[0] && relSpl[0].split(String.fromCharCode(160)).map(s => s.trim().replaceEmpty());
      let toRel = relSpl[1] && relSpl[1].split(String.fromCharCode(160)).map(s => s.trim().replaceEmpty());

      let fromRelTime = fromRel ? fromRel[0].trim() : departure.scheduled;
      let fromRelName = fromRel ? fromRel[1].trim() : stationName;

      let toRelName = toRel ? toRel[0].trim() : stationName;
      let toRelTime = toRel ? toRel[1].trim() : arrival.scheduled;

      entries.push({
        arrival,
        departure,
        platform,
        train: {
          number: trainNumber,
          name,
          type,
          elviraId: elviraDateId.elviraId,
          date: elviraDateId.date,
          relation: {
            from: {
              name: fromRelName,
              normName: normalizeStationName(fromRelName),
              time: fromRelTime
            },
            to: {
              name: toRelName,
              normName: normalizeStationName(toRelName),
              time: toRelTime
            }
          }
        }
      })
    });
  return entries;
}

module.exports = () => {
  return (req, res, next) => {
    const apiRes = res.locals.apiResult;
    if (!apiRes) return next();

    if (!apiRes.d || !apiRes.d.result)
      return next("Parser failed because request is empty");

    let ch = cheerio.load(apiRes.d.result, { decodeEntities: true });

    let { name, date } = parseStationHeader(ch);
    res.locals.parsedStation = {
      name,
      normName: normalizeStationName(name),
      date,
      entries: parseStationTrains(ch, name)
    }
    return next();
  }
}