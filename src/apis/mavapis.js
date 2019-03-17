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

module.exports.TRAIN = ({ number, elviraDateId }) => requestMAV({
  a: "TRAIN",
  jo: { vsz: number ? ("55" + number) : undefined, v: elviraDateId }
});

module.exports.STATION = (name) => requestMAV({
  a: "STATION",
  jo: { a: name }
});

module.exports.TRAINS = () => requestMAV({
  a: "TRAINS",
  jo: { pre: true, history: false, id: false }
});