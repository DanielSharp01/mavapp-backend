const { expect } = require('chai');
const reqTrainByNumberMW = require('../../../../src/middlewares/Train/reqTrainByNumber');

let objectRepository = {
  mavapi: {},
  model: {
    Train: {}
  }
};

let req = {
  params: { number: 12 }
};

describe("reqTrainByNumber MW", function () {
  it("No train in database should set API result and call next", function (done) {
    let res = { locals: {} };

    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve(null);

    reqTrainByNumberMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.apiResult).to.equal(12);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Expired train in database should set API result and call next", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve({ fullKnowledge: false });

    reqTrainByNumberMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.apiResult).to.equal(12);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Full knowledge train in database should not set API result and call next", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve({ id: number, fullKnowledge: true });

    reqTrainByNumberMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.apiResult).to.be.undefined;
        expect(res.locals.train.id).to.equal(12)
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Expired train with mavapi promise rejection should call next with error", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.reject("rejected mavapi");
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve({ fullKnowledge: false });

    reqTrainByNumberMW(objectRepository)(req, res, (err) => {
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
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.reject("unavailable db");

    reqTrainByNumberMW(objectRepository)(req, res, (err) => {
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
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.reject("unavailable db");

    reqTrainByNumberMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.equal("No train number specified");
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });
});