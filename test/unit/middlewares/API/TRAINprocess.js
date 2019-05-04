const { expect } = require('chai');
const moment = require("moment");
const TRAINprocessMW = require('../../../../src/middlewares/API/TRAINprocess');

let mockSaveTrainCallback = () => { };
let mockSaveTrainStationCallback = () => { };
let mockSaveTrainStationLinkCallback = () => { };

let objectRepository = {
  model: {
    Train: {
      findOrCreate: (number) => {
        return Promise.resolve({
          number,
          validityExpiry: moment({ year: 2019, month: 3, date: 3 }),
          save: function () { return mockSaveTrainCallback(this) }
        });
      }
    },
    Station: {},
    TrainStation: {
      findOrCreate: (trainNumber, normName) => {
        return Promise.resolve({
          trainNumber,
          normName,
          save: function () { return mockSaveTrainStationCallback(this) }
        });
      }
    },
    TrainStationLink: {
      findOrCreate: (trainNumber, fromNormName, toNormName) => {
        return Promise.resolve({
          trainNumber,
          fromNormName,
          toNormName,
          save: function () { return mockSaveTrainStationLinkCallback(this) }
        });
      }
    }
  }
};


describe("TRAINprocess MW", function () {
  it("Parsed train -> Train model transformation", function (done) {
    let res = {
      locals: {
        parsedTrain: {
          header:
          {
            number: 652,
            name: "mock name",
            type: "mock type",
            relation: { from: "A", to: "B" },
            visz: "mock visz",
            date: moment(),
          },
          expiry: moment({ year: 2019, month: 4, date: 30 }),
          alwaysValid: true
        }
      }
    };

    let savedTrain;
    mockSaveTrainCallback = (train) => {
      savedTrain = train;
      return Promise.resolve(train);
    }

    TRAINprocessMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrain.number).to.equal(652);
        expect(savedTrain.name).to.equal("mock name");
        expect(savedTrain.type).to.equal("mock type");
        expect(savedTrain.name).to.equal("mock name");
        expect(savedTrain.relation).to.eql({ from: "A", to: "B" });
        expect(savedTrain.visz).to.equal("mock visz");
        expect(savedTrain.expiry.year()).to.equal(2019);
        expect(savedTrain.expiry.month()).to.equal(4);
        expect(savedTrain.expiry.date()).to.equal(30);
        expect(savedTrain.alwaysValid).to.be.true;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Train validity expiry calculation same day", function (done) {
    let res = {
      locals: {
        parsedTrain: {
          header:
          {
            number: 652,
            date: moment(),
          },
          expiry: moment({ year: 2019, month: 4, date: 30 }),
          alwaysValid: false
        }
      }
    };

    let savedTrain;
    mockSaveTrainCallback = (train) => {
      savedTrain = train;
      return Promise.resolve(train);
    }

    TRAINprocessMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrain.validityExpiry).to.be.satisfy((m) => m.isSame(moment().startOf("day").add(1, "days"), "day"));
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Train validity expiry calculation different day", function (done) {
    let res = {
      locals: {
        parsedTrain: {
          header:
          {
            number: 652,
            date: moment().add(1, "days"),
          },
          expiry: moment({ year: 2019, month: 4, date: 30 }),
          alwaysValid: false
        }
      }
    };

    let savedTrain;
    mockSaveTrainCallback = (train) => {
      savedTrain = train;
      return Promise.resolve(train);
    }

    TRAINprocessMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrain.validityExpiry.year()).to.equal(2019);
        expect(savedTrain.validityExpiry.month()).to.equal(3);
        expect(savedTrain.validityExpiry.date()).to.equal(3);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Stations -> Station models transformation", function (done) {
    let res = {
      locals: {
        parsedTrain: {
          header:
          {
            number: 652
          },
          stations: [
            {
              name: "A",
              normName: "a",
              intDistance: 0,
              arrival: null,
              departure: { scheduled: "10:00", actual: "10:01" },
              platform: "1"
            },
            {
              name: "B",
              normName: "b",
              intDistance: 10,
              arrival: { scheduled: "10:19", actual: "10:20" },
              departure: { scheduled: "10:20", actual: "10:21" },
              platform: null
            },
            {
              name: "C",
              normName: "c",
              intDistance: 20,
              arrival: { scheduled: "10:40", actual: "10:41" },
              departure: null,
              platform: "4A"
            }
          ]
        }
      }
    };

    let savedStations = {};
    mockSaveTrainStationCallback = (station) => {
      savedStations[station.normName] = station;
      return Promise.resolve(station);
    }

    TRAINprocessMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;

        expect(savedStations).to.have.property("a").that.includes({
          trainNumber: 652,
          normName: "a",
          mavName: "A",
          intDistance: 0,
          platform: "1"
        });

        expect(savedStations).to.have.property("a").that.has.property("arrival").to.be.null;
        expect(savedStations).to.have.property("a").that.has.property("departure").that.be.satisfy((date) => {
          return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 10, minute: 0 }))
        });

        expect(savedStations).to.have.property("b").that.includes({
          trainNumber: 652,
          normName: "b",
          mavName: "B",
          intDistance: 10,
          platform: null
        });
        expect(savedStations).to.have.property("b").that.has.property("arrival").that.be.satisfy((date) => {
          return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 10, minute: 19 }))
        });
        expect(savedStations).to.have.property("b").that.has.property("departure").that.be.satisfy((date) => {
          return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 10, minute: 20 }))
        });

        expect(savedStations).to.have.property("c").that.includes({
          trainNumber: 652,
          normName: "c",
          mavName: "C",
          intDistance: 20,
          platform: "4A"
        });
        expect(savedStations).to.have.property("c").that.has.property("arrival").that.be.satisfy((date) => {
          return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 10, minute: 40 }))
        });
        expect(savedStations).to.have.property("c").that.has.property("departure").to.be.null;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Station +1 day logic", function (done) {
    let res = {
      locals: {
        parsedTrain: {
          header:
          {
            number: 652
          },
          stations: [
            {
              name: "A",
              normName: "a",
              arrival: null,
              departure: { scheduled: "23:59", actual: "0:00" },
            },
            {
              name: "B",
              normName: "b",
              arrival: { scheduled: "0:19", actual: "0:20" },
              departure: { scheduled: "0:20", actual: "0:21" }
            },
            {
              name: "C",
              normName: "c",
              arrival: { scheduled: "0:40", actual: "0:41" },
              departure: null
            }
          ]
        }
      }
    };

    let savedStations = {};
    mockSaveTrainStationCallback = (station) => {
      savedStations[station.normName] = station;
      return Promise.resolve(station);
    }

    TRAINprocessMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;

        expect(savedStations).to.have.property("a").that.has.property("arrival").to.be.null;
        expect(savedStations).to.have.property("a").that.has.property("departure").that.be.satisfy((date) => {
          return date.isSame(moment({ year: 2000, month: 0, date: 1, hour: 23, minute: 59 }))
        });
        expect(savedStations).to.have.property("b").that.has.property("arrival").that.be.satisfy((date) => {
          return date.isSame(moment({ year: 2000, month: 0, date: 2, hour: 0, minute: 19 }))
        });
        expect(savedStations).to.have.property("b").that.has.property("departure").that.be.satisfy((date) => {
          return date.isSame(moment({ year: 2000, month: 0, date: 2, hour: 0, minute: 20 }))
        });
        expect(savedStations).to.have.property("c").that.has.property("arrival").that.be.satisfy((date) => {
          return date.isSame(moment({ year: 2000, month: 0, date: 2, hour: 0, minute: 40 }))
        });
        expect(savedStations).to.have.property("c").that.has.property("departure").to.be.null;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("If parsed train number is NaN should call next with error", function (done) {
    let res = { locals: { parsedTrain: { header: { number: NaN } } } };

    TRAINprocessMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.equal("TRAIN parsing failed");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Flow through (no parsedTrain set should call next)", function (done) {
    let res = {
      locals: {}
    };
    TRAINprocessMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.savedTrain).to.be.undefined;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });
});