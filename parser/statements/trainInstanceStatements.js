const objectRepository = require("../../objectRepository");

class TrainInstanceStatus {
  constructor(elviraId, state) {
    Object.assign(this, { timestamp: Date.now(), state }, splitElviraId(elviraId));
  }

  async process() {
    let trainInstance = await findOrCreate(this.elviraId, this.date);
    trainInstance.state = this.state;
    return trainInstance.save();
  }
}

class TrainRealTimeInfo {
  constructor(elviraId, position, delay) {
    Object.assign(this, { timestamp: Date.now(), trainNumber, position, delay }, splitElviraId(elviraId));
  }

  async process() {
    let trainInstance = await findOrCreate(this.elviraId, this.date);
    trainInstance.position = this.position;
    trainInstance.delay = this.delay;
    return trainInstance.save();
  }
}

module.exports = {
  TrainInstanceStatus,
  TrainRealTimeInfo
}