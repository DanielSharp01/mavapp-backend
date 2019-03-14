class TrainHeader {
  constructor(trainNumber, type, date, { name, visz }) {
    Object.assign(this, { trainNumber, type, date, name, visz });
  }
}

class TrainPolyline {
  constructor(trainNumber, polyline) {
    Object.assign(this, { trainNumber, polyline });
  }
}

class TrainExpiry {
  constructor(trainNumber, expiry) {
    Object.assign(this, { trainNumber, expiry });
  }
}

class TrainRelation {
  constructor(trainNumber, from, to) {
    Object.assign(this, { trainNumber, from, to });
  }
}

class TrainStationInfo {
  constructor(trainNumber, stationName, { intDistance, platform, arrival, departure }) {
    Object.assign(this, { trainNumber, stationName, intDistance, platform, arrival, departure });
  }
}

class TrainStationLink {
  constructor(trainNumber, fromSt, toSt, direct = true) {
    Object.assign(this, { trainNumber, fromSt, toSt, direct });
  }
}

class TrainElviraId {
  constructor(trainNumber, elviraId) {
    Object.assign(this, { trainNumber, elviraId });
  }
}

class TrainInstanceStatus {
  constructor(elviraId, status) {
    Object.assign(this, { elviraId, status });
  }
}

class TrainRealTimeInfo {
  constructor(elviraId, trainNumber, position, delay) {
    Object.assign(this, { elviraId, trainNumber, position, delay });
  }
}

module.exports = {
  TrainHeader,
  TrainPolyline,
  TrainExpiry,
  TrainRelation,
  TrainStationInfo,
  TrainStationLink,
  TrainElviraId,
  TrainInstanceStatus,
  TrainRealTimeInfo
};
