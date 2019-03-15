const api = require("./mavapi");

module.exports.TRAIN = ({ number, elviraDateId }) => api({
  a: "TRAIN",
  jo: { vsz: number ? ("55" + number) : undefined, v: elviraDateId }
});

module.exports.STATION = (name) => api({
  a: "STATION",
  jo: { a: name }
});

module.exports.TRAINS = () => api({
  a: "TRAINS",
  jo: { pre: true, history: false, id: false }
});