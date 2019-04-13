const db = require("./db");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");
const { splitElviraDateId } = require("../utils/parserUtils");

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
  encodedPolyline: String
});

TrainSchema.virtual("fullKnowledge").get(function () {
  return (typeof this.expiry !== "undefined") && !moment(this.expiry).isBefore(moment())
});

module.exports = db.model("Train", TrainSchema);

TrainSchema.statics.findOrCreate = async function (number) {
  const Train = module.exports;
  let res = await Train.findOne({ number });
  if (res) return res;

  res = new Train();
  res._id = mongoose.Types.ObjectId();
  res.number = number;
  return res;
}

TrainSchema.methods.setHeader = function (type, date, { name, visz }) {
  this.type = type;
  if (typeof this.name !== "undefined") this.name = name;
  if (typeof this.visz !== "undefined") this.visz = visz;
}

TrainSchema.methods.setRelation = function (from, to) {
  this.relation = { from: from, to: to };
}

TrainSchema.methods.setElviraDateId = function (elviraDateId) {
  this.elviraId = splitElviraDateId(elviraDateId).elviraId;
}