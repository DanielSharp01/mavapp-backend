const db = require("../db");
const Schema = require("mongoose").Schema;

const TrainInstanceSchema = new Schema({
  elviraId: Number,
  date: Date,
  position: {
    latitude: Number,
    longitude: Number
  },
  delay: Number,
  status: String
});

TrainInstanceSchema.index({ elviraId: 1, date: 1 }, { unique: true });
TrainInstanceSchema.virtual("train", { ref: "Train", localField: "elviraId", foreignField: "elviraId", justOne: true });

module.exports = db.model("TrainInstance", TrainInstanceSchema);