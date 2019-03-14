let request = require("request");

module.exports = payload =>
  new Promise((resolve, reject) =>
    request(
      {
        method: "POST",
        url: "http://vonatinfo.mav-start.hu/map.aspx/getData",
        headers: {
          Host: "vonatinfo.mav-start.hu",
          Referrer: "http://vonatinfo.mav-start.hu/"
        },
        body: payload,
        gzip: true,
        json: true
      },
      (err, res, body) => {
        if (!err && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject({ err, statusCode: res.statusCode });
        }
      }
    )
  );
