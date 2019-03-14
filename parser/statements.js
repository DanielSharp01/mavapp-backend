const TRAIN_HEADER = "TRAIN_HEADER";
const TRAIN_POLYLINE = "TRAIN_POLYLINE";
const TRAIN_EXPIRY = "TRAIN_EXPIRY";
const TRAIN_RELATION = "TRAIN_RELATION";
const TRAIN_STATION_INFO = "TRAIN_STATION_INFO";
const TRAIN_STATION_LINK = "TRAIN_STATION_LINK";
const TRAIN_ELVIRAID = "TRAIN_ELVIRAID";
const TRAIN_INSTANCE_STATUS = "TRAIN_INSTANCE_STATUS";
const TRAIN_REALTIME_INFO = "TRAIN_REALTIME_INFO";
const ROUTE_FOUND = "ROUTE_FOUND";

function trainHeader(trainNumber, type, date, { name, visz }) {
  return { type: TRAIN_HEADER, data: { trainNumber, type, date, name, visz } };
}

function trainPolyline(trainNumber, polyline) {
  return { type: TRAIN_POLYLINE, data: { trainNumber, polyline } };
}

function trainExpiry(trainNumber, expiry) {
  return { type: TRAIN_EXPIRY, data: { trainNumber, expiry } };
}

function trainRelation(trainNumber, from, to) {
  return { type: TRAIN_RELATION, data: { trainNumber, from, to } };
}

function trainStationInfo(trainNumber, stationName, { distance, platform, arrival, departure }) {
  return {
    type: TRAIN_STATION_INFO,
    data: { trainNumber, stationName, distance, platform, arrival, departure }
  };
}

function trainStationLink(trainNumber, fromSt, toSt, direct = true) {
  return { type: TRAIN_STATION_LINK, data: { trainNumber, fromSt, toSt, direct } };
}

function trainElviraId(trainNumber, elviraId) {
  return { type: TRAIN_ELVIRAID, data: { trainNumber, elviraId } };
}

function trainInstanceStatus(elviraId, status) {
  return { type: TRAIN_INSTANCE_STATUS, data: { elviraId, status } };
}

function trainRealTimeInfo(elviraId, trainNumber, position, delay) {
  return { type: TRAIN_REALTIME_INFO, data: { elviraId, trainNumber, position, delay } };
}

function routeFound(from, to, touching, trains) {
  return { type: ROUTE_FOUND, data: { from, to, touching, trains } };
}

module.exports = {
  trainHeader,
  trainPolyline,
  trainExpiry,
  trainRelation,
  trainStationInfo,
  trainStationLink,
  trainElviraId,
  trainInstanceStatus,
  trainRealTimeInfo,
  routeFound,
  TRAIN_HEADER,
  TRAIN_POLYLINE,
  TRAIN_EXPIRY,
  TRAIN_RELATION,
  TRAIN_STATION_INFO,
  TRAIN_STATION_LINK,
  TRAIN_ELVIRAID,
  TRAIN_REALTIME_INFO,
  TRAIN_INSTANCE_STATUS,
  ROUTE_FOUND
};
