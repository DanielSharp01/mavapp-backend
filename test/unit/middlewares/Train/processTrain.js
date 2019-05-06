const { expect } = require('chai');
const moment = require("moment");
const processTrainMW = require('../../../../src/middlewares/Train/processTrain');

Date.now = () => new Date('2019') // Mock date

let mockSaveTrainCallback = () => { };
let mockSaveTrainStationCallback = () => { };
let mockSaveTrainStationLinkCallback = () => { };

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
    Station: {
      findOne: ({ normName }) => Promise.resolve({ normName, position: { latitude: 0, longitude: 0 } })
    },
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


describe("processTrain MW", function () {
  it("Parsed train -> Train model transformation", function (done) {
    let res = {
      locals: {
        parsedTrain: {
          header:
          {
            number: 652,
            name: "mock name",
            type: "mock type",
            relation: { from: { name: "A", normName: "a" }, to: { name: "B", normName: "b" } },
            visz: "mock visz",
            date: moment(),
          },
          expiry: moment({ year: 2019, month: 4, date: 30 }),
          alwaysValid: true,
          polyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
        }
      }
    };

    let savedTrain;
    mockSaveTrainCallback = (train) => {
      savedTrain = train;
      return Promise.resolve(train);
    }

    processTrainMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrain.number).to.equal(652);
        expect(savedTrain.name).to.equal("mock name");
        expect(savedTrain.type).to.equal("mock type");
        expect(savedTrain.relation).to.eql({ from: "a", to: "b" });
        expect(savedTrain.visz).to.equal("mock visz");
        expect(savedTrain.expiry.year()).to.equal(2019);
        expect(savedTrain.expiry.month()).to.equal(4);
        expect(savedTrain.expiry.date()).to.equal(30);
        expect(savedTrain.encodedPolyline).to.equal("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
        expect(savedTrain.alwaysValid).to.be.true;
        expect(savedTrain).to.equal(res.locals.train);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Train push validity", function (done) {
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

    processTrainMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrain.validity.length).to.equal(2);
        expect(savedTrain.isValid(moment())).to.be.true;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Train validity already exists", function (done) {
    let res = {
      locals: {
        parsedTrain: {
          header:
          {
            number: 652,
            date: moment({ year: 2019, month: 3, date: 3 }),
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

    processTrainMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedTrain.validity.length).to.equal(1);
        expect(savedTrain.isValid(moment({ year: 2019, month: 3, date: 3 }))).to.be.true;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Parsed station list -> Station models transformation", function (done) {
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
          ],
          polyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
        }
      }
    };

    let savedStations = {};
    mockSaveTrainStationCallback = (station) => {
      savedStations[station.normName] = station;
      return Promise.resolve(station);
    }

    processTrainMW(objectRepository)({}, res, (err) => {
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
          ],
          polyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
        }
      }
    };

    let savedStations = {};
    mockSaveTrainStationCallback = (station) => {
      savedStations[station.normName] = station;
      return Promise.resolve(station);
    }

    processTrainMW(objectRepository)({}, res, (err) => {
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

  it("Parsed station list -> TrainStationLink models transformation", function (done) {
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
          ],
          polyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
        }
      }
    };

    let savedLinks = {};
    mockSaveTrainStationLinkCallback = (link) => {
      savedLinks[link.fromNormName + "." + link.toNormName] = link;
      return Promise.resolve(link);
    }

    processTrainMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(savedLinks).to.have.property("null.a").that.includes({ trainNumber: 652, fromNormName: null, toNormName: "a" });
        expect(savedLinks).to.have.property("a.b").that.includes({ trainNumber: 652, fromNormName: "a", toNormName: "b" });
        expect(savedLinks).to.have.property("b.c").that.includes({ trainNumber: 652, fromNormName: "b", toNormName: "c" });
        expect(savedLinks).to.have.property("c.null").that.includes({ trainNumber: 652, fromNormName: "c", toNormName: null });
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("If parsed train number is NaN should call next with error", function (done) {
    let res = { locals: { parsedTrain: { header: { number: NaN } } } };

    processTrainMW(objectRepository)({}, res, (err) => {
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
    processTrainMW(objectRepository)({}, res, (err) => {
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

  it("DB error when saving should call next with error", function (done) {
    let res = {
      locals: {
        parsedTrain: {
          header:
          {
            number: 652,
            date: moment(),
          }
        }
      }
    };

    mockSaveTrainCallback = () => Promise.reject("Rejection test");

    processTrainMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.equal("Rejection test");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("DB error when creating should call next with error", function (done) {
    let res = {
      locals: {
        parsedTrain: {
          header:
          {
            number: 652,
            date: moment(),
          }
        }
      }
    };

    objectRepository.model.Train.findOrCreate = () => Promise.reject("Rejection test");

    processTrainMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.equal("Rejection test");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });
});