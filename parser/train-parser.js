const { parseTimeTuple } = require("./parser-commons");
const {
  trainHeader,
  trainPolyline,
  trainExpiry,
  trainRelation,
  trainStationInfo,
  trainStationLink,
  trainInstance
} = require("./statements");
const processStatement = require("./process-statement");

const trainNum = 1;

function parseTrainHeader($) {
  let header = $("th.title").first();
  let contents = header.contents();
  let textNode = contents.eq(0).text();
  let words = textNode.split(" ").map(w => w.trim());
  let number = parseInt(words[0]);
  let name;
  let type = words[words.length - 1];
  if (contents.get(1).tagName === "br" || contents.get(1).tagName === "span") {
    name = words.slice(1, -1).join(" ").trim();
  } else {
    name = words.slice(1).join(" ").trim();
  }

  if (name === "") name = undefined;

  if (contents.get(1).tagName == "img") {
    type = contents.eq(1).attr("alt").trim();
  }

  if (contents.get(1).tagName == "ul") {
    type = [];
    contents.eq(1).find("li").each((i, li) => {
      let liC = $(li).contents();
      let spl = liC.eq(0).text().split(":").map(s => s.trim());
      type[type.length] = { rel: spl[0], type: (spl[1] && spl[1] !== "") ? spl[1] : liC.eq(1).attr("alt").trim() };
    });
  }

  let visz = header.find(".viszszam2").text();
  if (!visz || visz.trim() === "") visz = undefined;

  let spl = header.find("font").text().slice(1, -1).split(",").map(s => s.trim());
  let relationSpl = spl[0].split(" - ").map(s => s.trim());


  let th = trainHeader(number, type, spl[1], { name, visz });
  processStatement(trainHeader(number, type, spl[1], { name, visz }));
  processStatement(trainRelation(number, relationSpl[0], relationSpl[1]));
  return { ...th, tag: contents.get(1).tagName };
}

function parseTrainExpiry($) { }

function processPolyline(polyline) {
  processStatement(trainPolyline(trainNum, polyline));
}

function parseTrainStations($) {
  let lastTrainStation = null;
  $("table.vt tr")
    .filter((i, tr) => typeof $(tr).attr("class") !== "undefined")
    .each((i, tr) => {
      let currentTrainStation = parseTrainStation(tr, $);
      processStatement(trainStationLink(trainNum, lastTrainStation, currentTrainStation));
      lastTrainStation = currentTrainStation;
    });

  processStatement(trainStationLink(trainNum, lastTrainStation, null));
}

function parseTrainStation(tr, $) {
  let trainStation = {};
  $(tr)
    .children("td")
    .each((i, td) => {
      if (i == 0) trainStation.distance = parseInt($(td).text());
      else if (i == 1) trainStation.name = $(td).text();
      else if (i == 2) trainStation.arrival = parseTimeTuple($(td).text());
      else if (i == 3) trainStation.departure = parseTimeTuple($(td).text());
      else if (i == 4) trainStation.platform = $(td).text();
    });

  if (trainStation.platform) {
    let str = trainStation.platform.trim();
    trainStation.platform = str.length > 0 ? str : null;
  }

  processStatement(
    trainStationInfo(1, trainStation.name, {
      distance: trainStation.distance,
      platform: trainStation.platform,
      arrival: trainStation.arrival,
      departure: trainStation.departure
    })
  );

  return trainStation.name;
}

module.exports = { parseTrainStations, parseTrainHeader };
