const db = require("./db");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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


TrainInstanceSchema.statics.findOrCreate = async function (elviraId, date) {
  let res = await this.findOne({ elviraId, date });
  if (res) return res;

  res = new this();
  res._id = mongoose.Types.ObjectId();
  res.elviraId = elviraId;
  res.date = date;
  return res;
}

module.exports = db.model("TrainInstance", TrainInstanceSchema);