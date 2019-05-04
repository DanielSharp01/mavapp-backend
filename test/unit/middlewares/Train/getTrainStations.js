const { expect } = require('chai');
const getTrainStationsMW = require('../../../../src/middlewares/Train/getTrainStations');

describe("getTrainStations MW", function () {

  let objectRepository = {
    model: {
      TrainStation: {
        find: ({ trainNumber }) => {
          return {
            populate: () => Promise.resolve([
              {
                trainNumber,
                normName: "a",
                station: { name: "A" }
              },
              {
                trainNumber,
                normName: "c",
                station: { name: "C" }
              },
              {
                trainNumber,
                normName: "b",
                station: { name: "B" }
              }
            ])
          }
        }
      },
      TrainStationLink: {
        find: ({ trainNumber }) => [
          {
            trainNumber,
            fromNormName: null,
            toNormName: "a"
          },
          {
            trainNumber,
            fromNormName: "a",
            toNormName: "b"
          },
          {
            trainNumber,
            fromNormName: "b",
            toNormName: "c"
          },
          {
            trainNumber,
            fromNormName: "c",
            toNormName: null
          }
        ]
      }
    }
  }

  it("Stations should be returned in order of linking", function (done) {
    let res = {
      locals: {
        train: { number: 11 }
      }
    }
    getTrainStationsMW(objectRepository)({}, res, (err) => {
      try {
        expect(err).to.be.undefined;
        expect(res.locals.stations.length).to.equal(3);
        expect(res.locals.stations[0]).to.eql({
          trainNumber: 11,
          normName: "a",
          station: { name: "A" }
        });
        expect(res.locals.stations[1]).to.eql({
          trainNumber: 11,
          normName: "b",
          station: { name: "B" }
        });
        expect(res.locals.stations[2]).to.eql({
          trainNumber: 11,
          normName: "c",
          station: { name: "C" }
        });
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

  it("No res.locals.train should call next", function (done) {
    getTrainStationsMW(objectRepository)({}, {}, (err) => {
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
        train: { number: 11 }
      }
    }
    objectRepository.model.TrainStation.find = () => { return { populate: () => Promise.reject("Rejection test") } };
    objectRepository.model.TrainStationLink.find = () => Promise.reject("Rejection test");

    getTrainStationsMW(objectRepository)({}, res, (err) => {
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