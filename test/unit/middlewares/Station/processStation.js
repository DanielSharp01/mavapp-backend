const chai = require('chai');
chai.use(require('chai-subset'));
const expect = chai.expect;
const moment = require("moment");
const processStationMW = require('../../../../src/middlewares/Station/processStation');

Date.now = () => new Date('2019') // Mock date

let mockSaveTrainCallback = () => { };
let mockSaveTrainStationCallback = () => { };

let objectRepository = {
  model: {
    Train: {
      findOrCreate: (number) => {
        return Promise.resolve({
          number,
          validity: [moment({ year: 2019, month: 3, date: 3 })],
          save: function () { return mockSaveTrainCallback(this) },
          isValid: function (date) {
            return this.validity.filter(d => moment(d).isSame(moment(date))).length == 1;
          }
        });
      }
    },
    TrainStation: {
      findOrCreate: (trainNumber, normName) => {
        return Promise.resolve({
          trainNumber,
          normName,
          save: function () { return mockSaveTrainStationCallback(this) }
        });
      }
    }
  }
};

let res = {
  locals: {
    parsedStation: {
      name: "Budapest-Nyugati",
      normName: "budapest nyugati",
      date: moment(),
      entries: [
        {
          arrival: null,
          departure: { scheduled: "00:06", actual: "00:07" },
          platform: "6",
          train:
          {
            number: 2510,
            date: moment(),
            type: "személy",
            name: null,
            elviraId: 5608162,
            relation: {
              from: {
                name: "Budapest-Nyugati",
                normName: "budapest nyugati",
                time: "00:06"
              },
              to: {
                name: "Vác",
                normName: "vac",
                time: "01:24"
              }
            }
          }
        },
        {
          arrival: { scheduled: "00:14", actual: "00:17" },
          departure: null,
          platform: "14",
          train: {
            number: 2611,
            date: moment({ year: 2019, month: 3, date: 3 }),
            type: "személy",
            name: null,
            elviraId: 5609187,
            relation: {
              from: {
                name: "Szolnok",
                normName: "szolnok",
                time: "22:25"
              },
              to: {
                name: "Budapest-Nyugati",
                normName: "budapest nyugati",
                time: "00:14"
              }
            }
          }
        },
        {
          arrival: { scheduled: "00:14", actual: "00:17" },
          departure: { scheduled: "02:14", actual: "02:16" },
          platform: null,
          train:
          {
            number: 2711,
            date: moment().subtract(1, "days"),
            name: "mock name",
            type: "személy",
            elviraId: 5609187,
            relation: {
              from: {
                name: "Szolnok",
                normName: "szolnok",
                time: "22:25"
              },
              to: {
                name: "Some station",
                normName: "some station",
                time: "01:25"
              }
            }
          }
        }
      ]
    }
  }
};

describe("processStation MW", function () {
  it("Parsed station -> Trains", function (done) {
    let savedTrains = {};
    mockSaveTrainCallback = (train) => {
      let key = train.number;
      if (savedTrains[key]) throw `Train '${key}' saved multiple times`;

      savedTrains[key] = train;
      return Promise.resolve(train);
    }

    processStationMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrains).to.have.property(2510).that.containSubset({
          number: 2510,
          name: null,
          type: "személy",
          elviraId: 5608162,
          relation: { from: "budapest nyugati", to: "vac" }
        });
        expect(savedTrains).to.have.property(2611).that.containSubset({
          number: 2611,
          name: null,
          type: "személy",
          elviraId: 5609187,
          relation: { from: "szolnok", to: "budapest nyugati" }
        });
        expect(savedTrains).to.have.property(2711).that.containSubset({
          number: 2711,
          name: "mock name",
          type: "személy",
          elviraId: 5609187,
          relation: { from: "szolnok", to: "some station" }
        });
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Parsed station -> Local TrainStations", function (done) {
    let savedTrainStations = {};
    mockSaveTrainStationCallback = (trainStation) => {
      let key = trainStation.trainNumber + "." + trainStation.normName;
      if (savedTrainStations[key]) throw `TrainStation '${key}' saved multiple times`;

      savedTrainStations[key] = trainStation;
      return Promise.resolve(trainStation);
    }

    processStationMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrainStations).to.have.property("2510.budapest nyugati").that.containSubset({
          trainNumber: 2510,
          mavName: "Budapest-nyugati",
          normName: "budapest nyugati",
          platform: "6"
        });
        expect(savedTrains).to.have.property("2611.budapest nyugati").that.containSubset({
          trainNumber: 2611,
          mavName: "Budapest-nyugati",
          normName: "budapest nyugati",
          platform: "14"
        });
        expect(savedTrains).to.have.property("2711.budapest nyugati").that.containSubset({
          trainNumber: 2711,
          mavName: "Budapest-nyugati",
          normName: "budapest nyugati",
          platform: null
        });
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Parsed station -> Relation TrainStations", function (done) {
    let savedTrainStations = {};
    mockSaveTrainStationCallback = (trainStation) => {
      let key = trainStation.trainNumber + "." + trainStation.normName;
      if (savedTrainStations[key]) throw `TrainStation '${key}' saved multiple times`;

      savedTrainStations[key] = trainStation;
      return Promise.resolve(trainStation);
    }

    processStationMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrainStations).to.have.property("2510.budapest nyugati").that.containSubset({
          trainNumber: 2510,
          mavName: "Budapest-nyugati",
          normName: "budapest nyugati",
        });
        expect(savedTrainStations).to.have.property("2510.vac").that.containSubset({
          trainNumber: 2510,
          mavName: "Vác",
          normName: "vac"
        });
        expect(savedTrains).to.have.property("2611.budapest nyugati").that.containSubset({
          trainNumber: 2611,
          mavName: "Budapest-nyugati",
          normName: "budapest nyugati"
        });
        expect(savedTrains).to.have.property("2611.szolnok").that.containSubset({
          trainNumber: 2611,
          mavName: "Szolnok",
          normName: "szolnok"
        });
        expect(savedTrains).to.have.property("2711.szolnok").that.containSubset({
          trainNumber: 2711,
          mavName: "Szolnok",
          normName: "szolnok"
        });
        expect(savedTrains).to.have.property("2711.some station").that.containSubset({
          trainNumber: 2611,
          mavName: "Some station",
          normName: "some station"
        });
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Local TrainStations timing logic", function (done) {
    let savedTrainStations = {};
    mockSaveTrainStationCallback = (trainStation) => {
      let key = trainStation.trainNumber + "." + trainStation.normName;
      if (savedTrainStations[key]) throw `TrainStation '${key}' saved multiple times`;

      savedTrainStations[key] = trainStation;
      return Promise.resolve(trainStation);
    }

    processStationMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedStations).to.have.property("2510.budapest nyugati")
          .that.has.property("arrival").to.equal(null);
        expect(savedStations).to.have.property("2510.budapest nyugati")
          .that.has.property("departure").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 0, minute: 6 }))
          });

        expect(savedStations).to.have.property("2611.budapest nyugati")
          .that.has.property("arrival").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 2, hour: 0, minute: 14 }))
          });
        expect(savedStations).to.have.property("2611.budapest nyugati")
          .that.has.property("departure").to.equal(null);


        expect(savedStations).to.have.property("2711.budapest nyugati")
          .that.has.property("arrival").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 2, hour: 0, minute: 14 }))
          });
        expect(savedStations).to.have.property("2711.budapest nyugati")
          .that.has.property("departure").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 2, hour: 02, minute: 14 }))
          });
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Relation TrainStations timing logic", function (done) {
    let savedTrainStations = {};
    mockSaveTrainStationCallback = (trainStation) => {
      let key = trainStation.trainNumber + "." + trainStation.normName;
      if (savedTrainStations[key]) throw `TrainStation '${key}' saved multiple times`;

      savedTrainStations[key] = trainStation;
      return Promise.resolve(trainStation);
    }

    processStationMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedStations).to.have.property("2510.budapest nyugati")
          .that.has.property("arrival").that.be.null;
        expect(savedStations).to.have.property("2510.budapest nyugati")
          .that.has.property("departure").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 0, minute: 6 }))
          });

        expect(savedStations).to.have.property("2510.vac")
          .that.has.property("arrival").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 1, minute: 24 }))
          });
        expect(savedStations).to.have.property("2510.vac")
          .that.has.property("departure").that.be.null;

        expect(savedStations).to.have.property("2611.szolnok")
          .that.has.property("arrival").that.be.null;
        expect(savedStations).to.have.property("2611.szolnok")
          .that.has.property("departure").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 22, minute: 25 }))
          });

        expect(savedStations).to.have.property("2611.budapest nyugati")
          .that.has.property("arrival").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 2, hour: 0, minute: 14 }))
          });
        expect(savedStations).to.have.property("2611.budapest nyugati")
          .that.has.property("departure").that.be.null;

        expect(savedStations).to.have.property("2711.szolnok")
          .that.has.property("arrival").that.be.null;
        expect(savedStations).to.have.property("2711.szolnok")
          .that.has.property("departure").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 22, minute: 25 }))
          });

        expect(savedStations).to.have.property("2711.some station")
          .that.has.property("arrival").that.be.satisfy((date) => {
            return date.isSame(moment({ year: 2000, month: 0, date: 2, hour: 1, minute: 25 }))
          });
        expect(savedStations).to.have.property("2711.some station")
          .that.has.property("departure").that.be.null;

        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Train validity logic", function (done) {
    let savedTrains = {};
    mockSaveTrainCallback = (train) => {
      let key = train.number;
      if (savedTrains[key]) throw `Train '${key}' saved multiple times`;

      savedTrains[key] = train;
      return Promise.resolve(train);
    }

    processStationMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrains).to.have.property(2510)
          .that.satisfies(t => t.validity.length == 2 && t.isValid(moment({ year: 2019, month: 3, date: 3 }))
            && t.isValid(moment()));

        expect(savedTrains).to.have.property(2611)
          .that.satisfies(t => t.validity.length == 1 && t.isValid(moment({ year: 2019, month: 3, date: 3 })))

        expect(savedTrains).to.have.property(2711)
          .that.satisfies(t => t.validity.length == 2 && t.isValid(moment({ year: 2019, month: 3, date: 3 }))
            && t.isValid(moment().subtract(1, "days")));
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("No parsedStation should call next", function (done) {
    let res = { locals: {} };
    processStationMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("DB error while saving should call next with error", function (done) {
    objectRepository.model.Train.save = () => Promise.reject("Rejection test");
    objectRepository.model.TrainStation.save = () => Promise.reject("Rejection test");
    processStationMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.equal("Rejection test");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });


  it("DB error while creating should call next with error", function (done) {
    objectRepository.model.Train.findOrCreate = () => Promise.reject("Rejection test");
    objectRepository.model.TrainStation.findOrCreate = () => Promise.reject("Rejection test");
    processStationMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.equal("Rejection test");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });
});