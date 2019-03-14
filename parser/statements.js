class TrainHeader {
  constructor(trainNumber, type, date, { name, visz }) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, type, date, name, visz });
  }
}

class TrainPolyline {
  constructor(trainNumber, polyline) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, polyline });
  }
}

class TrainExpiry {
  constructor(trainNumber, expiry) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, expiry });
  }
}

class TrainRelation {
  constructor(trainNumber, from, to) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, from, to });
  }
}

class TrainStationInfo {
  constructor(trainNumber, stationName, { intDistance, platform, arrival, departure }) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, stationName, intDistance, platform, arrival, departure });
  }
}

class TrainStationRealDistance {
  constructor(trainNumber, stationName, distance) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, stationName, distance });
  }
}

class TrainStationLink {
  constructor(trainNumber, fromSt, toSt, direct = true) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, fromSt, toSt, direct });
  }
}

class TrainElviraId {
  constructor(trainNumber, elviraId) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, elviraId });
  }
}

class TrainInstanceStatus {
  constructor(elviraId, status) {
    Object.assign(this, { timestamp: Date.now(), elviraId, status });
  }
}

class TrainRealTimeInfo {
  constructor(elviraId, trainNumber, position, delay) {
    Object.assign(this, { timestamp: Date.now(), elviraId, trainNumber, position, delay });
  }
}

module.exports = {
  TrainHeader,
  TrainPolyline,
  TrainExpiry,
  TrainRelation,
  TrainStationInfo,
  TrainStationRealDistance,
  TrainStationLink,
  TrainElviraId,
  TrainInstanceStatus,
  TrainRealTimeInfo
};
