const db = require("./db");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IndirectRouteSchema = new Schema({
  fromNormName: { type: String, required: true },
  toNormName: { type: String, required: true },
  directRouteId: { type: mongoose.Types.ObjectId, required: true }
});

IndirectRouteSchema.virtual("fromStation", { ref: "Station", localField: "fromNormName", foreignField: "normName", justOne: true });
IndirectRouteSchema.virtual("toStation", { ref: "Station", localField: "toNormName", foreignField: "normName", justOne: true });
IndirectRouteSchema.virtual("directRoute", { ref: "DirectRoute", localField: "directRouteId", foreignField: "_id", justOne: true });

IndirectRouteSchema.statics.findOrCreate = async function (fromNormName, toNormName, directRouteId) {
  let res = await this.findOne({ fromNormName, toNormName, directRouteId });
  if (res) return res;
  res = new this();

  res._id = mongoose.Types.ObjectId();
  res.fromNormName = fromNormName;
  res.toNormName = toNormName;
  res.directRouteId = directRouteId;
  return res;
}

module.exports = db.model("IndirectRoute", IndirectRouteSchema);