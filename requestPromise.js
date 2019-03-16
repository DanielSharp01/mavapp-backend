let request = require("request");

module.exports = options =>
  new Promise((resolve, reject) =>
    request(options,
      (err, res, body) => {
        if (!err && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject({ err, statusCode: res.statusCode });
        }
      }
    )
  );
