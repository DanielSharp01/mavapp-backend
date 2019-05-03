const { expect } = require('chai');
const TRAINReqByNumber = require('../../../../src/middlewares/API/TRAINReqByNumber');

describe("TRAINReqByNumber MW", function () {
  it("No train in database should set API result and call next", function (done) {
    let req = {
      params: { number: 12 }
    };

    let res = { locals: {} };
    let objectRepository = {
      mavapi: {
        TRAIN: ({ number, elviraDateId }) => Promise.resolve(number)
      },
      model: {
        Train: {
          findOne: () => Promise.resolve(null)
        }
      }
    };

    TRAINReqByNumber(objectRepository)(req, res, () => {
      expect(res.locals.apiResult).to.eql(12);
      done();
    });
  });

  it("Expired train in database should set API result and call next", function (done) {
    let req = {
      params: { number: 12 }
    };

    let res = { locals: {} };
    let objectRepository = {
      mavapi: {
        TRAIN: ({ number, elviraDateId }) => Promise.resolve(number)
      },
      model: {
        Train: {
          findOne: () => Promise.resolve({ fullKnowledge: false })
        }
      }
    };

    TRAINReqByNumber(objectRepository)(req, res, () => {
      expect(res.locals.apiResult).to.eql(12);
      done();
    });
  });

  it("Full knowledge train in database should not set API result and call next", function (done) {
    let req = {
      params: { number: 12 }
    };

    let res = { locals: {} };
    let objectRepository = {
      mavapi: {
        TRAIN: ({ number, elviraDateId }) => Promise.resolve(number)
      },
      model: {
        Train: {
          findOne: ({ number }) => Promise.resolve({ id: number, fullKnowledge: true })
        }
      }
    };

    TRAINReqByNumber(objectRepository)(req, res, () => {
      expect(res.locals.apiResult).to.eql(12);
      expect(res.locals.train.id).to.eql(12)
      done();
    });
  });

  it("mavapi promise rejection should call next with error", function (done) {
    let req = {
      params: { number: 12 }
    };

    let res = { locals: {} };
    let objectRepository = {
      mavapi: {
        TRAIN: ({ number, elviraDateId }) => Promise.reject("some error")
      },
      model: {
        Train: {
          findOne: ({ number }) => Promise.resolve({ id: number, fullKnowledge: true })
        }
      }
    };

    TRAINReqByNumber(objectRepository)(req, res, (err) => {
      expect(err).to.eql("some error");
      done();
    });
  });
});