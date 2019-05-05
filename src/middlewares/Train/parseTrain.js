const {
  splitElviraDateId,
  parseTimeTuple,
  getElviraIdFromOnClick,
  normalizeStationName
} = require("../../utils/parserUtils");
const cheerio = require("cheerio");
const moment = require("moment");

function parseHeader(cheerio) {
  const $ = cheerio;
  const header = $("th.title").first();
  if (!header.get(0)) return;

  const contents = header.contents();
  const textNode = contents.eq(0).text();
  const words = textNode.split(" ").map(w => w.trim());
  let number = parseInt(words[0]);
  let { name, type } = parseTypeAndName(cheerio, words, contents);
  let viszSpan = header.find(".viszszam2");
  let visz = viszSpan.text().trim().replaceEmpty(null);

  let { date, from, to } = parseRelation(header.find("font").text());
  return {
    number, date, name, type, visz, relation: { from, to }
  }
}

function parseTypeAndName(cheerio, words, contents) {
  let name, type;
  if (contents.get(1) && contents.get(1).tagName === "img") {
    name = words.slice(1).join(" ").trim().replaceEmpty(null);
    type = contents.eq(1).attr("alt").trim();
  }
  else if (contents.get(1) && contents.get(1).tagName == "ul") {
    name = words.slice(1).join(" ").trim().replaceEmpty(null);
    type = parseUlTypes(cheerio, contents);
  }
  else {
    name = words.slice(1, -1).join(" ").trim().replaceEmpty(null);
    type = words[words.length - 1];
  }
  return { name, type };
}

function parseUlTypes(cheerio, contents) {
  const $ = cheerio;
  type = [];
  contents.eq(1).find("li").each((i, li) => {
    let liC = $(li).contents();
    let spl = liC.eq(0).text().split(":").map(s => s.trim());
    let relSpl = spl[0].split(" - ").map(s => s.trim());
    type[type.length] = {
      rel: { from: relSpl[0], to: relSpl[1] }, type: spl[1]
        && spl[1] !== "" ? spl[1] : liC.eq(1).attr("alt").trim()
    };
  });
  return type;
}

function parseRelation(text) {
  let spl = text.slice(1, -1).split(",").map(s => s.trim());
  let date = moment(spl[1], "YYYY.MM.DD");
  let relationSpl = spl[0].split(" - ").map(s => s.trim());

  return {
    date,
    from: { name: relationSpl[0], normName: normalizeStationName(relationSpl[0]) },
    to: { name: relationSpl[1], normName: normalizeStationName(relationSpl[1]) }
  };
}

function parseExpiry(cheerio) {
  const $ = cheerio;
  let explicitExpiry = false;
  let expiry;
  let elviraDateId;
  $("div#vt").children("ul").first().find("li").each((i, li) => {
    const a = $(li).children().eq(0);
    const onclick = a.attr("onclick");
    if (!onclick) return; // This is probably not an expiry date li

    if ($(li).attr("style")) {
      expiry = moment(a.text().split("-")[1], "YYYY.MM.DD");
      explicitExpiry = true;
    }
    else return;

    elviraDateId = getElviraIdFromOnClick(onclick);
  });

  if (!explicitExpiry) {
    expiry = moment({ year: moment().year() + 1, month: 0, date: 1 });
  }

  return { expiry, elviraDateId };
}

function parseStations(cheerio) {
  const $ = cheerio;
  let stations = [];
  $("table.vt tr")
    .filter((i, tr) => (typeof $(tr).attr("class") !== "undefined") && (typeof $(tr).attr("id") === "undefined"))
    .each((i, tr) => {
      const tds = $(tr).children("td");
      let intDistance = parseInt(tds.eq(0).text());
      if (isNaN(intDistance)) intDistance = -1;
      let name = tds.eq(1).text();
      let normName = normalizeStationName(name);
      let arrival = parseTimeTuple(tds.eq(2));
      let departure = parseTimeTuple(tds.eq(3));
      let platform = tds.eq(4).text().trim().replaceEmpty(null);
      stations.push({
        name,
        normName,
        intDistance,
        arrival,
        departure,
        platform
      })
    });
  return stations;
}

function findValidityInfo(cheerio) {
  const $ = cheerio;
  let validityInfo;
  $("h5").each((i, h5) => {
    if ($(h5).text().trim() == "Közlekedik:") {
      validityInfo = $(h5).next("ul").find("li").eq(0).text().trim();
      return false;
    }
  });

  return validityInfo;
}

module.exports = () => {
  return (req, res, next) => {
    const apiRes = res.locals.apiResult;
    if (!apiRes) return next();

    if (!apiRes.d || !apiRes.d.result || !apiRes.d.result.html || !apiRes.d.result.line || apiRes.d.result.line.length === 0)
      return next("Parser failed because request is empty");

    let ch = cheerio.load(apiRes.d.result.html, { decodeEntities: true });
    let expiryObj = parseExpiry(ch);
    let elviraDateId = expiryObj.elviraDateId || (apiRes.d.param && apiRes.d.param.v ? apiRes.d.param.v : undefined);
    elviraDateId = splitElviraDateId(elviraDateId);
    res.locals.parsedTrain = {
      header: parseHeader(ch),
      stations: parseStations(ch),
      expiry: expiryObj.expiry,
      elviraId: elviraDateId && elviraDateId.elviraId,
      polyline: apiRes.d.result.line[0].points,
      alwaysValid: findValidityInfo(ch) == "naponta"
    };

    return next();
  }
};