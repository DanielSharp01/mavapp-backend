const db = require("../db");
const Schema = require("mongoose").Schema;

const StationSchema = new Schema({
  normName: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, required: true },
  position: {
    latitude: Number,
    longitude: Number
  }
});

module.exports = db.model("Station", StationSchema);