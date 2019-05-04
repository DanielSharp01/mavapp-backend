const db = require("./db");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const TrainSchema = new Schema({
  number: { type: Number, required: true, unique: true, index: true },
  elviraId: { type: Number, unique: true, sparse: true },
  name: String,
  visz: String,
  type: String,
  relation: {
    from: String,
    to: String
  },
  expiry: Date,
  alwaysValid: Boolean,
  validityExpiry: Date,
  encodedPolyline: String
});

TrainSchema.virtual("fullKnowledge").get(function () {
  return (typeof this.expiry !== "undefined") && !moment(this.expiry).isBefore(moment())
});


TrainSchema.statics.findOrCreate = async function (number) {
  let res = await this.findOne({ number });
  if (res) return res;

  res = new this();
  res._id = mongoose.Types.ObjectId();
  res.number = number;
  return res;
}

module.exports = db.model("Train", TrainSchema);