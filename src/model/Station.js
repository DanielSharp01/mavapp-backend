const db = require("./db");
const Schema = require("mongoose").Schema;
const moment = require("moment");

const StationSchema = new Schema({
  normName: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, required: true },
  position: {
    latitude: Number,
    longitude: Number
  },
  expiry: Date
});

StationSchema.virtual("fullKnowledge").get(function () {
  return (typeof this.expiry !== "undefined") && !moment(this.expiry).isBefore(moment())
});

module.exports = db.model("Station", StationSchema);