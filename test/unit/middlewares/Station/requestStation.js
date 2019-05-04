const { expect } = require('chai');
const requestStationMW = require('../../../../src/middlewares/Station/requestStation');

let objectRepository = {
  mavapi: {},
  model: {
    Station: {}
  }
};

describe("requestStation MW", function () {
  it("Station in DB has no full knownledge should set API result and call next", function (done) {
    let res = { locals: {} };

    objectRepository.mavapi.STATION = (normName) => Promise.resolve(normName)
    objectRepository.model.Station.findOne = ({ normName }) => Promise.resolve({ normName, fullKnowledge: false });

    requestStationMW(objectRepository)({ params: { name: "asd" } }, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.station.normName).to.equal("asd");
        expect(res.locals.apiResult).to.equal("asd");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Station in DB has full knownledge should call next", function (done) {
    let res = { locals: {} };

    objectRepository.mavapi.STATION = (normName) => Promise.resolve(normName)
    objectRepository.model.Station.findOne = ({ normName }) => Promise.resolve({ normName, fullKnowledge: true });

    requestStationMW(objectRepository)({ params: { name: "asd" } }, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.station.normName).to.equal("asd");
        expect(res.locals.apiResult).to.be.undefined;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Station in DB does not exist should call next with error", function (done) {
    objectRepository.mavapi.STATION = (normName) => Promise.resolve(normName)
    objectRepository.model.Station.findOne = ({ normName }) => Promise.resolve(null);

    requestStationMW(objectRepository)({ params: { name: "asd" } }, {}, (err) => {
      try {
        expect(err).to.equal("Station not found");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("If no ':name' parameter should call next with error", function (done) {
    requestStationMW(objectRepository)({}, {}, (err) => {
      try {
        expect(err).to.equal("No station specified");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("db promise rejection should call next with error", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.STATION = (normName) => Promise.resolve(normName)
    objectRepository.model.Station.findOne = ({ normName }) => Promise.reject("unavailable db");

    requestStationMW(objectRepository)({ params: { name: "asd" } }, res, (err) => {
      try {
        expect(err).to.equal("unavailable db");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("mavapi promise rejection should call next with error", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.STATION = (normName) => Promise.reject("unavailable api")
    objectRepository.model.Station.findOne = ({ normName }) => Promise.resolve({ normName, fullKnowledge: false });

    requestStationMW(objectRepository)({ params: { name: "asd" } }, res, (err) => {
      try {
        expect(err).to.equal("unavailable api");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });
});