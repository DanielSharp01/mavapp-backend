const db = require("./db");
const Schema = require("mongoose").Schema;

const TrainStationLinkSchema = new Schema({
  trainNumber: { type: Number, required: true },
  fromNormName: { type: String },
  toNormName: { type: String }
});

TrainStationLinkSchema.virtual("fromStation", { ref: "Station", localField: "fromNormName", foreignField: "normName", justOne: true });
TrainStationLinkSchema.virtual("toStation", { ref: "Station", localField: "toNormName", foreignField: "normName", justOne: true });

module.exports = db.model("TrainStationLink", TrainStationLinkSchema);

TrainStationLinkSchema.statics.findOrCreate = async function (trainNumber, fromNormName, toNormName) {
  const TrainStationLink = module.exports;
  res = new TrainStationLink();
  let res = await TrainStationLink.findOne({ trainNumber, fromNormName, toNormName });
  if (res) return res;

  res._id = mongoose.Types.ObjectId();
  res.trainNumber = trainNumber;
  res.fromNormName = fromNormName;
  res.toNormName = toNormName;
  return res;
}