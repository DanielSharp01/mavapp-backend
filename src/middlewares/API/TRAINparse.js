const {
  parseTimeTuple,
  getElviraIdFromOnClick,
  normalizeStationName
} = require("../utils/parserUtils");
const cheerio = require("cheerio");
const moment = require("moment");

function parseHeader(cheerio) {
  const $ = cheerio;
  const header = $("th.title").first();
  const contents = header.contents();
  const textNode = contents.eq(0).text();
  const words = textNode.split(" ").map(w => w.trim());
  let number = parseInt(words[0]);
  let { name, type } = parseTypeAndName(words, contents);
  let viszSpan = header.find(".viszszam2");
  let visz = viszSpan ? viszSpan.text().trim().replaceEmpty(null) : null;

  let { date, from, to } = parseRelation(header.find("font").text());
  return {
    number, date, name, type, visz, relation: { from, to }
  }
}

function parseTypeAndName(words, contents) {
  let name, type;
  if (contents.get(1).tagName === "img") {
    name = words.slice(1).join(" ").trim().replaceEmpty(null);
    type = contents.eq(1).attr("alt").trim();
  }
  else if (contents.get(1).tagName == "ul") {
    name = words.slice(1).join(" ").trim().replaceEmpty(null);
    parseUlTypes(contents);
  }
  else {
    name = words.slice(1, -1).join(" ").trim().replaceEmpty(null);
    type = words[words.length - 1];
  }
  return { name, type };
}

function parseUlTypes(contents) {
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

function parseRelation(text) {
  let spl = text.slice(1, -1).split(",").map(s => s.trim());
  let date = moment(spl[1], "YYYY.MM.DD");
  let relationSpl = spl[0].split(" - ").map(s => s.trim());

  return { date, from: relationSpl[0], to: relationSpl[1] };
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
      expiry = a.text().split("-")[1];
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
      const tds = tr.children("td");
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
}

module.exports = () => {
  return (req, res, next) => {
    if (!res.locals.apiResult) return next();

    const apiResult = res.locals.apiResult;
    if (!apiRes.d.result || !apiRes.d.result.line || apiRes.d.result.line.length === 0)
      return next("Parser failed because request is empty.");

    let ch = cheerio.load(apiRes.d.result.html, { decodeEntities: true });
    let expiryObj = parseExpiry(ch);
    let elviraDateId = expiryObj.elviraDateId || (apiResult.d.param.v ? splitElviraDateId(apiResult.d.param.v) : undefined);
    res.locals.parsedTrain = {
      header: parseHeader(ch),
      stations: parseStations(ch),
      expiry: expiryObj.expiry,
      elviraDateId,
      polyline: apiRes.d.result.line[0].points
    };

    return next();
  }
};