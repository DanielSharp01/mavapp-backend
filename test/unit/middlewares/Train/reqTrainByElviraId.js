const { expect } = require('chai');
const moment = require("moment");
const reqTrainByElviraIdMW = require('../../../../src/middlewares/Train/reqTrainByElviraId');

Date.now = () => new Date('2019') // Mock date

let objectRepository = {
  mavapi: {},
  model: {
    Train: {}
  }
};

describe("reqTrainByElviraId MW", function () {
  it("ElviraDateId parsed correctly", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };

    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.resolve(null);

    reqTrainByElviraIdMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(req.elviraId.elviraId).to.equal(111111);
        expect(req.elviraId.date.year()).to.equal(2011);
        expect(req.elviraId.date.month()).to.equal(10);
        expect(req.elviraId.date.date()).to.equal(11); // Needed for midnight tests
        expect(res.locals.apiResult).to.equal(req.elviraId);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("ElviraId parsed correctly", function (done) {
    let req = {
      params: { elviraId: "111111" }
    };
    let res = { locals: {} };

    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.resolve(null);

    reqTrainByElviraIdMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(req.elviraId.elviraId).to.equal(111111);
        now = moment();
        expect(req.elviraId.date.year()).to.equal(now.year());
        expect(req.elviraId.date.month()).to.equal(now.month());
        expect(req.elviraId.date.date()).to.equal(now.date());
        expect(res.locals.apiResult).to.equal(req.elviraId);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("No train in database should set API result and call next", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };

    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve(null);


    reqTrainByElviraIdMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.apiResult).to.equal(req.elviraId);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Expired train in database should set API result and call next", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve({ fullKnowledge: false });

    reqTrainByElviraIdMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.apiResult).to.equal(req.elviraId);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Full knowledge train in database should not set API result and call next", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.resolve({ elviraId, fullKnowledge: true });

    reqTrainByElviraIdMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.apiResult).to.be.undefined;
        expect(res.locals.train.elviraId).to.equal(111111)
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Expired train with mavapi promise rejection should call next with error", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.reject("rejected mavapi");
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.resolve({ fullKnowledge: false });

    reqTrainByElviraIdMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.equal("rejected mavapi");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("db promise rejection should call next with error", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.reject("unavailable db");

    reqTrainByElviraIdMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.equal("unavailable db");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("If no ':number' parameter should call next with error", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.reject("unavailable db");

    reqTrainByElviraIdMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.equal("No elviraid specified");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });
});