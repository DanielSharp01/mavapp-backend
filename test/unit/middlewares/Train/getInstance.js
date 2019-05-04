const { expect } = require('chai');
const moment = require("moment");
const getInstanceMW = require('../../../../src/middlewares/Train/getInstance');

Date.now = () => new Date('2019') // Mock date

describe("getInstance MW", function () {

  let objectRepository = {
    model: {
      TrainInstance: {
        findOne: ({ elviraId, date }) => { return { elviraId, date } }
      }
    }
  }

  it("Requested with elviraId should use the date of request", function (done) {
    let req = { elviraId: { elviraId: 111111, date: moment({ year: 2019, month: 3, date: 1 }) } };
    let res = {
      locals: {
        train: { elviraId: 111111 }
      }
    }
    getInstanceMW(objectRepository)(req, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.instance.elviraId).to.equal(111111);
        expect(res.locals.instance.date.year()).to.equal(2019);
        expect(res.locals.instance.date.month()).to.equal(3);
        expect(res.locals.instance.date.date()).to.equal(1);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("Requested with number should use date of today", function (done) {
    let res = {
      locals: {
        train: { elviraId: 111111 }
      }
    }
    getInstanceMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.instance.elviraId).to.equal(111111);
        expect(res.locals.instance.date.year()).to.equal(moment().year());
        expect(res.locals.instance.date.month()).to.equal(moment().month());
        expect(res.locals.instance.date.date()).to.equal(moment().date());
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("No res.locals.train should call next", function (done) {
    getInstanceMW(objectRepository)({}, {}, (err) => {
      try {
        expect(err).to.be.undefined;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("No res.locals.train.elviraId should call next", function (done) {
    let res = {
      locals: {
        train: {}
      }
    }
    getInstanceMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("DB error should call next with error", function (done) {
    let res = {
      locals: {
        train: { elviraId: 111111 }
      }
    }
    objectRepository.model.TrainInstance.findOne = () => Promise.reject("Rejection test");

    getInstanceMW(objectRepository)({}, res, (err) => {
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