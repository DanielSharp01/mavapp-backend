const db = require("./db");
const Schema = require("mongoose").Schema;

const TrainStationSchema = new Schema({
  trainNumber: { type: Number, required: true },
  normName: { type: String, required: true },
  intDistance: Number,
  distance: Number,
  platform: String,
  arrival: Date,
  departure: Date
});

TrainStationSchema.index({ trainNumber: 1, normName: 1 }, { unique: true });
TrainStationSchema.virtual("station", { ref: "Station", localField: "normName", foreignField: "normName", justOne: true });
TrainStationSchema.virtual("train", { ref: "Train", localField: "trainNumber", foreignField: "number", justOne: true });

module.exports = db.model("TrainStation", TrainStationSchema);

TrainStationSchema.statics.findOrCreate = async function (trainNumber, normName) {
  const TrainStation = module.exports;
  let res = await TrainStation.findOne({ trainNumber, normName });
  if (res) return res;

  res = new TrainStation();
  res._id = mongoose.Types.ObjectId();
  res.trainNumber = trainNumber;
  res.normName = normName;
  return res;
}

TrainStationSchema.methods.setInfo = function ({ intDistance, platform, arrival, departure }) {
  if (typeof intDistance !== "undefined") this.intDistance = intDistance;
  if (typeof platform !== "undefined") this.platform = platform;
  if (arrival && arrival.scheduled) this.arrival = arrival.scheduled;
  if (departure && departure.scheduled) this.departure = departure.scheduled;
}