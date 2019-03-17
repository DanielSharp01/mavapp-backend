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