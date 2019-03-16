let request = require("../requestPromise");

module.exports = payload =>
  request({
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
