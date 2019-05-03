module.exports = {
  mavapi: require("./apis/mavapis"),
  model: {
    Station: require("./model/Station"),
    Train: require("./model/Train"),
    TrainInstance: require("./model/TrainInstance"),
    TrainStation: require("./model/TrainStation"),
    TrainStationLink: require("./model/TrainStationLink"),
    Route: require("./model/Route"),
    DirectRoute: require("./model/DirectRoute"),
    IndirectRoute: require("./model/IndirectRoute")
  }
};