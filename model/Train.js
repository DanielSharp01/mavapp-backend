const db = require("../db");
const Schema = require("mongoose").Schema;

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

module.exports = db.model("Train", TrainSchema);