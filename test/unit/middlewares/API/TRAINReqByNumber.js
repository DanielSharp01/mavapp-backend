const { expect } = require('chai');
const TRAINReqByNumber = require('../../../../src/middlewares/API/TRAINReqByNumber');

let objectRepository = {
  mavapi: {},
  model: {
    Train: {}
  }
};

let req = {
  params: { number: 12 }
};

describe("TRAINReqByNumber MW", function () {
  it("No train in database should set API result and call next", function (done) {
    let res = { locals: {} };

    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve(null);

    TRAINReqByNumber(objectRepository)(req, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.apiResult).to.equal(12);
      done();
    });
  });

  it("Expired train in database should set API result and call next", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve({ fullKnowledge: false });

    TRAINReqByNumber(objectRepository)(req, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.apiResult).to.equal(12);
      done();
    });
  });

  it("Full knowledge train in database should not set API result and call next", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve({ id: number, fullKnowledge: true });

    TRAINReqByNumber(objectRepository)(req, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.apiResult).to.be.undefined;
      expect(res.locals.train.id).to.equal(12)
      done();
    });
  });

  it("Expired train with mavapi promise rejection should call next with error", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.reject("rejected mavapi");
    objectRepository.model.Train.findOne = ({ number }) => Promise.resolve({ fullKnowledge: false });

    TRAINReqByNumber(objectRepository)(req, res, (err) => {
      expect(err).to.equal("rejected mavapi");
      done();
    });
  });

  it("db promise rejection should call next with error", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.reject("unavailable db");

    TRAINReqByNumber(objectRepository)(req, res, (err) => {
      expect(err).to.equal("unavailable db");
      done();
    });
  });

  it("If no ':number' parameter should call next with error", function (done) {
    let res = { locals: {} };
    objectRepository.mavapi.TRAIN = ({ number, elviraDateId }) => Promise.resolve(number)
    objectRepository.model.Train.findOne = ({ number }) => Promise.reject("unavailable db");

    TRAINReqByNumber(objectRepository)({}, res, (err) => {
      expect(err).to.equal("No train number specified");
      done();
    });
  });
});