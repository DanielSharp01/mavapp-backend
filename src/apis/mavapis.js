const request = require("./requestPromise");

function requestMAV(payload) {
  return request({
    method: "POST",
    url: "http://vonatinfo.mav-start.hu/map.aspx/getData",
    headers: {
      Host: "vonatinfo.mav-start.hu",
      Referrer: "http://vonatinfo.mav-start.hu/"
    },
    body: payload,
    gzip: true,
    json: true
  });
}

function doubleDigit(num) {
  num %= 100;
  if (num < 10) return "0" + num;
  else return num;
}

module.exports.TRAIN = ({ number, elviraDateId }) => {
  if (elviraDateId) elviraDateId = `${elviraDateId.elviraId}_${doubleDigit(elviraDateId.date.year())}${doubleDigit(elviraDateId.date.month() + 1)}${doubleDigit(elviraDateId.date.date())}`;
  else elviraDateId = undefined;

  return requestMAV({
    a: "TRAIN",
    jo: { vsz: number ? ("55" + number) : undefined, v: elviraDateId }
  });
}

module.exports.STATION = (name) => requestMAV({
  a: "STATION",
  jo: { a: name }
});

module.exports.TRAINS = () => requestMAV({
  a: "TRAINS",
  jo: { pre: true, history: false, id: false }
});

module.exports.ROUTE = (from, to, { via, date }) => requestMAV({
  a: "ROUTE",
  jo: { i: from, e: to, v: via, d: date && date.format("YYYY.MM.DD") }
});