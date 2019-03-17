const db = require("./db");
const Schema = require("mongoose").Schema;
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
  encodedPolyline: String
});

TrainSchema.virtual("fullKnowledge").get(function () {
  return (typeof this.expiry !== "undefined") && !moment(this.expiry).isBefore(moment())
});

module.exports = db.model("Train", TrainSchema);