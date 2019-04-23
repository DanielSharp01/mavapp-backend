const db = require("./db");
const Schema = require("mongoose").Schema;
const moment = require("moment");

const RouteSchema = new Schema({
  fromNormName: { type: String, required: true },
  toNormName: { type: String, required: true },
  expiry: Date
});

RouteSchema.index({ fromNormName: 1, toNormName: 1 }, { unique: true });
RouteSchema.virtual("fromStation", { ref: "Station", localField: "fromNormName", foreignField: "normName", justOne: true });
RouteSchema.virtual("toStation", { ref: "Station", localField: "toNormName", foreignField: "normName", justOne: true });

RouteSchema.virtual("fullKnowledge").get(function () {
  return (typeof this.expiry !== "undefined") && !moment(this.expiry).isBefore(moment())
});

RouteSchema.statics.findOrCreate = async function (fromNormName, toNormName) {
  let res = await this.findOne({ fromNormName, toNormName });
  if (res) return res;
  res = new this();

  res._id = mongoose.Types.ObjectId();
  res.fromNormName = fromNormName;
  res.toNormName = toNormName;
  return res;
}

module.exports = db.model("Route", RouteSchema);