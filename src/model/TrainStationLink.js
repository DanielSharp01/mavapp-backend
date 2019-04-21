const db = require("./db");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TrainStationLinkSchema = new Schema({
  trainNumber: { type: Number, required: true },
  fromNormName: { type: String },
  toNormName: { type: String }
});

TrainStationLinkSchema.virtual("fromStation", { ref: "Station", localField: "fromNormName", foreignField: "normName", justOne: true });
TrainStationLinkSchema.virtual("toStation", { ref: "Station", localField: "toNormName", foreignField: "normName", justOne: true });

TrainStationLinkSchema.statics.findOrCreate = async function (trainNumber, fromNormName, toNormName) {
  let res = await this.findOne({ trainNumber, fromNormName, toNormName });
  if (res) return res;
  res = new this();

  res._id = mongoose.Types.ObjectId();
  res.trainNumber = trainNumber;
  res.fromNormName = fromNormName;
  res.toNormName = toNormName;
  return res;
}

module.exports = db.model("TrainStationLink", TrainStationLinkSchema);