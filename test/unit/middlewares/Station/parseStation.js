const chai = require('chai');
chai.use(require('chai-subset'));
const expect = chai.expect;

const parseStationMW = require('../../../../src/middlewares/Station/parseStation');

describe("parseStation MW", function () {
  it("Parses header", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result: `<table class="af">
            <tr>
              <th>
                Budapest-Nyugati<br><font style="font-size:12px;">2019.05.05.</font>
              </th>
            </tr>
          </table>`
          }
        }
      }
    };

    parseStationMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedStation.name).to.equal("Budapest-Nyugati");
      expect(res.locals.parsedStation.normName).to.equal("budapest nyugati");
      expect(res.locals.parsedStation.date.year()).to.equal(2019);
      expect(res.locals.parsedStation.date.month()).to.equal(4);
      expect(res.locals.parsedStation.date.date()).to.equal(5);
      done();
    });
  });

  it("Parses station table", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result: `<table class="af">
            <tr>
              <th>
                Budapest-Nyugati<br><font style="font-size:12px;">2019.05.05.</font>
              </th>
            </tr>
            <tr class="row_odd">
              <td>

              </td>
              <td>00:06</td>
              <td>6</td>
              <td><a onclick="map.getData('TRAIN', { v: '5608162_190505', d: '19.05.05', language: '1' } );">2510</a>


              személy <br>&nbsp;  -- Vác &nbsp;01:24</td>
            </tr>
            <tr class="row_even">
              <td>00:14<br><span style="color:red">00:17</span></td>
              <td>

        			</td>
              <td style="width:1px;text-align:center;">14</td>
              <td style="color:#000000"><a onclick="map.getData('TRAIN', { v: '5609187_190504', d: '19.05.05', language: '1' } );">2611</a>


        		  személy <br>22:25&nbsp; Szolnok -- &nbsp; </td>
            </tr>
            <tr class="row_odd">
              <td>00:14<br><span style="color:red">00:17</span></td>
              <td>
              02:14<br><span style="color:red">02:16</span></td>
        			</td>
              <td style="width:1px;text-align:center;"></td>
              <td style="color:#000000"><a onclick="map.getData('TRAIN', { v: '5609187_190504', d: '19.05.05', language: '1' } );">2711</a>


        		  mock name személy <br>22:25&nbsp; Szolnok -- Some station &nbsp; 01:25</td>
            </tr>
          </table>`
          }
        }
      }
    };

    parseStationMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      let entries = res.locals.parsedStation.entries;
      expect(entries.length).to.equal(3);

      expect(entries[0]).containSubset({
        arrival: null,
        departure: { scheduled: "00:06", actual: null },
        platform: "6",
        train:
        {
          number: 2510,
          type: "személy",
          name: null,
          elviraId: 5608162,
          relation: {
            from: {
              name: "Budapest-Nyugati",
              normName: "budapest nyugati",
              time: "00:06"
            },
            to: {
              name: "Vác",
              normName: "vac",
              time: "01:24"
            }
          }
        }
      });

      expect(entries[0].train.date.year()).to.equal(2019);
      expect(entries[0].train.date.month()).to.equal(4);
      expect(entries[0].train.date.date()).to.equal(5);

      expect(entries[1]).containSubset({
        arrival: { scheduled: "00:14", actual: "00:17" },
        departure: null,
        platform: "14",
        train: {
          number: 2611,
          type: "személy",
          name: null,
          elviraId: 5609187,
          relation: {
            from: {
              name: "Szolnok",
              normName: "szolnok",
              time: "22:25"
            },
            to: {
              name: "Budapest-Nyugati",
              normName: "budapest nyugati",
              time: "00:14"
            }
          }
        }
      });

      expect(entries[1].train.date.year()).to.equal(2019);
      expect(entries[1].train.date.month()).to.equal(4);
      expect(entries[1].train.date.date()).to.equal(4);

      expect(entries[2]).containSubset({
        arrival: { scheduled: "00:14", actual: "00:17" },
        departure: { scheduled: "02:14", actual: "02:16" },
        platform: null,
        train:
        {
          number: 2711,
          name: "mock name",
          type: "személy",
          elviraId: 5609187,
          relation: {
            from: {
              name: "Szolnok",
              normName: "szolnok",
              time: "22:25"
            },
            to: {
              name: "Some station",
              normName: "some station",
              time: "01:25"
            }
          }
        }
      });

      expect(entries[2].train.date.year()).to.equal(2019);
      expect(entries[2].train.date.month()).to.equal(4);
      expect(entries[2].train.date.date()).to.equal(4);

      done();
    });
  });

  it("When API result is incomplete should call next with error", function (done) {
    let res = {
      locals: {
        apiResult: {}
      }
    };
    parseStationMW()({}, res, (err) => {
      expect(err).to.be.eql("Parser failed because request is empty");
      expect(res.locals.parsedStation).to.be.undefined;

      done();
    });
  });

  it("If no api result should call next", function (done) {
    let res = { locals: {} };

    parseStationMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedStation).to.be.undefined;
      done();
    });
  });
});