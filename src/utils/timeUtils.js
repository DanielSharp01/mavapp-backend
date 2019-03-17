const moment = require("moment");

function momentCombine(date, time) {
  let newMoment = moment(time);
  newMoment.year(date.year());
  newMoment.month(date.month());
  newMoment.date(date.date());
  return newMoment;
}

function fixDateOrder(before, after) {
  if (before && after && after.isBefore(before)) after.add(1, "d");
}

module.exports = { momentCombine, fixDateOrder };