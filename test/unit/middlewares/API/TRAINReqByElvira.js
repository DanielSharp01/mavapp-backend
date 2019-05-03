const { expect } = require('chai');
const moment = require("moment");
const TRAINReqByElvira = require('../../../../src/middlewares/API/TRAINReqByElvira');

let objectRepository = {
  mavapi: {},
  model: {
    Train: {}
  }
};

describe("TRAINReqByElvira MW", function () {
  it("ElviraDateId parsed correctly", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };

    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.resolve(null);

    TRAINReqByElvira(objectRepository)(req, res, (err) => {
      expect(req.elviraId.elviraId).to.be.eql(111111);
      expect(req.elviraId.date.year()).to.be.eql(2011);
      expect(req.elviraId.date.month()).to.be.eql(10);
      expect(req.elviraId.date.date()).to.be.eql(11); // Needed for midnight tests
      expect(res.locals.apiResult).to.eql(req.elviraId);
      done();
    });
  });

  it("ElviraId parsed correctly", function (done) {
    let lastDate = moment().date;

    let req = {
      params: { elviraId: "111111" }
    };
    let res = { locals: {} };

    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.resolve(null);

    TRAINReqByElvira(objectRepository)(req, res, () => {
      expect(req.elviraId.elviraId).to.be.eql(111111);
      now = moment();
      expect(req.elviraId.date.year()).to.be.eql(now.year());
      expect(req.elviraId.date.month()).to.be.eql(now.month());
      expect(req.elviraId.date.date()).to.be.oneOf([lastDate, now.date()]); // Needed for midnight tests
      expect(res.locals.apiResult).to.eql(req.elviraId);
      done();
    });
  });

  it("No train in database should set API result and call next", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };

    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve(null);


    TRAINReqByElvira(objectRepository)(req, res, () => {
      expect(res.locals.apiResult).to.eql(req.elviraId);
      done();
    });
  });

  it("Expired train in database should set API result and call next", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve({ fullKnowledge: false });

    TRAINReqByElvira(objectRepository)(req, res, () => {
      expect(res.locals.apiResult).to.eql(req.elviraId);
      done();
    });
  });

  it("Full knowledge train in database should not set API result and call next", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.resolve({ elviraId, fullKnowledge: true });

    TRAINReqByElvira(objectRepository)(req, res, () => {
      expect(res.locals.apiResult).to.be.undefined;
      expect(res.locals.train.elviraId).to.eql(111111)
      done();
    });
  });

  it("Expired train with mavapi promise rejection should call next with error", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.reject("rejected mavapi");
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.resolve({ fullKnowledge: false });

    TRAINReqByElvira(objectRepository)(req, res, (err) => {
      expect(err).to.eql("rejected mavapi");
      done();
    });
  });

  it("db promise rejection should call next with error", function (done) {
    let req = {
      params: { elviraId: "111111_111111" }
    };
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.reject("unavailable db");

    TRAINReqByElvira(objectRepository)(req, res, (err) => {
      expect(err).to.eql("unavailable db");
      done();
    });
  });

  it("If no ':number' parameter should call next with error", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(elviraDateId)
    objectRepository.model.Train.findOne = ({ elviraId }) => Promise.reject("unavailable db");

    TRAINReqByElvira(objectRepository)({}, res, (err) => {
      expect(err).to.eql("No elviraid specified");
      done();
    });
  });
});