const moment = require("moment");

Object.defineProperty(String.prototype, "replaceEmpty", {
  value: function replaceEmpty(def = undefined) {
    return this.length == 0 ? def : this.toString();
  }
});

function normalizeStationName(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .replace("railway station crossing", "").replace("railway station", "").replace("train station", "")
    .replace("vonatallomas", "").replace("vasutallomas", "").replace("pu", "").replace("mav pu", "")
    .replace("vm", "").replace("palyaudvar", "")
    .replace("-", " ").replace(".", "").replace(/n\s+/g, " ").replace(/\[.*\]/g, "").trim();
}

function parseTimeTuple(elem) {
  const contents = elem.contents();
  let timeTuple = { actual: null };
  timeTuple.scheduled = contents.eq(0).text().trim().replaceEmpty(null);
  if (elem.contents().length >= 3)
    timeTuple.actual = contents.eq(2).text().trim().replaceEmpty(null);

  if (timeTuple.scheduled == null) return null;
  return timeTuple;
}

function splitElviraDateId(elviraDateId) {
  if (!elviraDateId) return undefined;
  const spl = elviraDateId.split("_");
  if (spl.length !== 2) return undefined;

  return { elviraId: parseInt(spl[0]), date: moment(spl[1], "YYMMDD") };
}

function fixJson(json) {
  // Courtesy of: https://stackoverflow.com/a/39050609/2132821
  return json.replace(/:\s*"([^"]*)"/g, (match, p1) => ': "' + p1.replace(/:/g, '@colon@') + '"')
    .replace(/:\s*'([^']*)'/g, (match, p1) => ': "' + p1.replace(/:/g, '@colon@') + '"')
    .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ').replace(/@colon@/g, ':')
}

function getElviraIdFromOnClick(onclick) {
  return JSON.parse(fixJson(onclick.slice(onclick.indexOf("{"), onclick.indexOf("}") + 1))).v;
}

module.exports = { normalizeStationName, parseTimeTuple, splitElviraDateId, fixJson, getElviraIdFromOnClick };
