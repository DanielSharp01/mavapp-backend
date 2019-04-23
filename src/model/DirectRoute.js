const db = require("./db");
const Schema = require("mongoose").Schema;

const DirectRouteSchema = new Schema({
  fromNormName: { type: String, required: true },
  toNormName: { type: String, required: true },
  trainNumber: { type: Number, required: true }
});

DirectRouteSchema.virtual("fromStation", { ref: "Station", localField: "fromNormName", foreignField: "normName", justOne: true });
DirectRouteSchema.virtual("toStation", { ref: "Station", localField: "toNormName", foreignField: "normName", justOne: true });
DirectRouteSchema.virtual("train", { ref: "Train", localField: "trainNumber", foreignField: "number", justOne: true });

DirectRouteSchema.statics.findOrCreate = async function (fromNormName, toNormName, trainNumber) {
  let res = await this.findOne({ fromNormName, toNormName, trainNumber });
  if (res) return res;
  res = new this();

  res._id = mongoose.Types.ObjectId();
  res.fromNormName = fromNormName;
  res.toNormName = toNormName;
  res.trainNumber = trainNumber;
  return res;
}

module.exports = db.model("DirectRoute", DirectRouteSchema);