const { parseTimeTuple } = require("./parser-commons");

function parseTrainStations($) {
  let trainStations = [];
  $("table.vt tr")
    .filter((i, tr) => typeof $(tr).attr("class") !== "undefined")
    .map((i, tr) => {
      trainStations.push(parseTrainStation(tr, $));
    });

  return trainStations;
}

function parseTrainStation(tr, $) {
  let trainStation = {};
  $(tr)
    .children("td")
    .each((i, td) => {
      if (i == 0) trainStation.distance = parseInt($(td).text());
      else if (i == 1) trainStation.stationName = $(td).text();
      else if (i == 2) trainStation.arrival = parseTimeTuple($(td).text());
      else if (i == 3) trainStation.departure = parseTimeTuple($(td).text());
      else if (i == 4) trainStation.platform = $(td).text();
    });

  if (trainStation.platform) {
    let str = trainStation.platform.trim();
    trainStation.platform = str.length > 0 ? str : null;
  }

  return trainStation;
}

module.exports = { parseTrainStations };
