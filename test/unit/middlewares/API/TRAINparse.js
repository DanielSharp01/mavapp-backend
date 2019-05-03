const { expect } = require('chai');
const moment = require("moment");
const TRAINparseMW = require('../../../../src/middlewares/API/TRAINparse');

describe("TRAINparse MW", function () {
  it("Polyline is copyed", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: "mock html",
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };

    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.polyline).to.be.equal("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
      done();
    });
  });

  it("Header with simple type no name", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<table class="vt" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr>
                          <th colspan="5" class="title">7911  személyvonat<br><font style="font-size:12px;">(Kelebia - Budapest-Keleti, 2019.05.03.)</font>
                        </th>
                      </tr>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };

    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.header.number).to.equal(7911);
      expect(res.locals.parsedTrain.header.type).to.equal("személyvonat");
      expect(res.locals.parsedTrain.header.relation.from).to.equal("Kelebia");
      expect(res.locals.parsedTrain.header.relation.to).to.equal("Budapest-Keleti");
      expect(res.locals.parsedTrain.header.date.year()).to.equal(2019);
      expect(res.locals.parsedTrain.header.date.month()).to.equal(4);
      expect(res.locals.parsedTrain.header.date.date()).to.equal(3);
      expect(res.locals.parsedTrain.header.name).to.be.null;
      expect(res.locals.parsedTrain.header.visz).to.be.null;
      done();
    });
  });

  it("Header with simple type name", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<table class="vt" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr>
                          <th colspan="5" class="title">7911 name személyvonat<br><font style="font-size:12px;">(Kelebia - Budapest-Keleti, 2019.05.03.)</font>
                        </th>
                      </tr>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };

    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.header.number).to.equal(7911);
      expect(res.locals.parsedTrain.header.type).to.equal("személyvonat");
      expect(res.locals.parsedTrain.header.relation.from).to.equal("Kelebia");
      expect(res.locals.parsedTrain.header.relation.to).to.equal("Budapest-Keleti");
      expect(res.locals.parsedTrain.header.date.year()).to.equal(2019);
      expect(res.locals.parsedTrain.header.date.month()).to.equal(4);
      expect(res.locals.parsedTrain.header.date.date()).to.equal(3);
      expect(res.locals.parsedTrain.header.name).to.equal("name");
      expect(res.locals.parsedTrain.header.visz).to.be.null;
      done();
    });
  });

  it("Header with image type", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<table class="vt" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr>
                          <th colspan="5" class="title">7911 <img src="http://elvira.mav-start.hu/fontgif/231.gif" alt="InterCity" border="0"><br><font style="font-size:12px;">(Kelebia - Budapest-Keleti, 2019.05.03.)</font>
                        </th>
                      </tr>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };

    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.header.number).to.equal(7911);
      expect(res.locals.parsedTrain.header.type).to.equal("InterCity");
      expect(res.locals.parsedTrain.header.relation.from).to.equal("Kelebia");
      expect(res.locals.parsedTrain.header.relation.to).to.equal("Budapest-Keleti");
      expect(res.locals.parsedTrain.header.date.year()).to.equal(2019);
      expect(res.locals.parsedTrain.header.date.month()).to.equal(4);
      expect(res.locals.parsedTrain.header.date.date()).to.equal(3);
      expect(res.locals.parsedTrain.header.name).to.be.null;
      expect(res.locals.parsedTrain.header.visz).to.be.null;
      done();
    });
  });

  it("Header with complex type", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<table class="vt" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr>
                          <th colspan="5" class="title">7911  <ul>
                          <li style="font-size:12px;">Kelebia - intermediate: 
                                                    <img src="http://elvira.mav-start.hu/fontgif/215.gif" alt="vonatpótló autóbusz" border="0"></li>
                          <li style="font-size:12px;">intermediate - Budapest-Keleti: 
                                                    sebesvonat</li>
                        </ul><br><font style="font-size:12px;">(Kelebia - Budapest-Keleti, 2019.05.03.)</font>
                        </th>
                      </tr>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };

    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.header.number).to.equal(7911);
      expect(res.locals.parsedTrain.header.type).to.eql(
        [
          { rel: { from: "Kelebia", to: "intermediate" }, type: "vonatpótló autóbusz" },
          { rel: { from: "intermediate", to: "Budapest-Keleti" }, type: "sebesvonat" }
        ]
      );
      expect(res.locals.parsedTrain.header.relation.from).to.equal("Kelebia");
      expect(res.locals.parsedTrain.header.relation.to).to.equal("Budapest-Keleti");
      expect(res.locals.parsedTrain.header.date.year()).to.equal(2019);
      expect(res.locals.parsedTrain.header.date.month()).to.equal(4);
      expect(res.locals.parsedTrain.header.date.date()).to.equal(3);
      expect(res.locals.parsedTrain.header.name).to.be.null;
      expect(res.locals.parsedTrain.header.visz).to.be.null;
      done();
    });
  });

  it("Header with visz", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<table class="vt" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr>
                          <th colspan="5" class="title">7911 <img src="http://elvira.mav-start.hu/fontgif/231.gif" alt="InterCity" border="0"><span class="viszszam2">Z50</span><br><font style="font-size:12px;">(Kelebia - Budapest-Keleti, 2019.05.03.)</font>
                        </th>
                      </tr>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };

    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.header.number).to.equal(7911);
      expect(res.locals.parsedTrain.header.type).to.equal("InterCity");
      expect(res.locals.parsedTrain.header.relation.from).to.equal("Kelebia");
      expect(res.locals.parsedTrain.header.relation.to).to.equal("Budapest-Keleti");
      expect(res.locals.parsedTrain.header.date.year()).to.equal(2019);
      expect(res.locals.parsedTrain.header.date.month()).to.equal(4);
      expect(res.locals.parsedTrain.header.date.date()).to.equal(3);
      expect(res.locals.parsedTrain.header.name).to.be.null;
      expect(res.locals.parsedTrain.header.visz).to.equal("Z50");
      done();
    });
  });

  it("Expiry date parsed along with found elviradateid", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<div id = "vt"><h5>
                        Menetrend
                      </h5>
                      <ul>
                      <li>Rouge LI should be ignored<li>
                      <li><a onclick="map.getData('TRAIN', { v: '5614992_190603', d: '', language: '1' } );" href="javascript:;">2019.06.03-2019.12.14</a> : <span style="font-size:80%"></span></li>
                      <li><a onclick="map.getData('TRAIN', { v: '5614992_181209', d: '', language: '1' } );" href="javascript:;">2018.12.09-2019.02.03</a> : <span style="font-size:80%"></span></li>
                      <li><a onclick="map.getData('TRAIN', { v: '5614992_190204', d: '', language: '1' } );" href="javascript:;">2019.02.04-2019.03.17</a> : <span style="font-size:80%"></span></li>
                      <li style="color:red;font-weight:bolder">*
                      <a onclick="map.getData('TRAIN', { v: '5614992_190318', d: '', language: '1' } );" href="javascript:;">2019.03.18-2019.05.12</a> : <span style="font-size:80%"></span></li>
                      <li><a onclick="map.getData('TRAIN', { v: '5614992_190513', d: '', language: '1' } );" href="javascript:;">2019.05.13-2019.06.02</a> : <span style="font-size:80%"></span></li>
                    </ul></div>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };
    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.expiry.year()).to.equal(2019);
      expect(res.locals.parsedTrain.expiry.month()).to.equal(4);
      expect(res.locals.parsedTrain.expiry.date()).to.equal(12);
      expect(res.locals.parsedTrain.elviraId).to.equal(5614992);
      done();
    });
  });

  it("No explicit expiry date should make expiry date the next year's first day", function (done) {
    let lastYear = moment().year();
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: "mock html",
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };
    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.expiry.year()).to.oneOf([moment().year() + 1, lastYear + 1]); // Testing on year boundary should not cause fail
      expect(res.locals.parsedTrain.expiry.month()).to.equal(0);
      expect(res.locals.parsedTrain.expiry.date()).to.equal(1);
      done();
    });
  });

  it("Normal station list", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<table class="vt" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <th colspan="5" class="title">4838  személyvonat <span class="viszszam2">S10</span><br><font style="font-size:12px;">(Budapest-Déli - Komárom, 2019.05.03.)</font>
                  </th>
                </tr>
                <tr>
                  <th>Km</th>
                  <th>Állomás</th>
                  <th>Érk.</th>
                  <th>Ind.</th>
                  <th>Vágány</th>
                </tr>
                <tr onmouseover="this.className='row_highlight';" class="row_odd" onmouseout="this.className='row_odd';" onclick="" style="&#xA;
             cursor: default;&#xA;          ">
                  <td style="width:1px;">0</td>
                  <td><a onclick="map.getData('STATION', { i: '2', a: 'Budapest-Déli', d: '19.05.03', language: '1' } );return false;" href="javascript:;">Budapest-Déli</a></td>
                  <td style="width:1px;text-align:center;"> </td>
                  <td style="width:1px;text-align:center;">22:20<br><span style="color:green">22:20</span></td>
                  <td style="width:1px;text-align:center;">8</td>
                </tr>
                <tr onmouseover="this.className='row_highlight';" class="row_past_even" onmouseout="this.className='row_past_even';" onclick="" style="&#xA;            cursor: default;&#xA;          ">
                  <td style="width:1px;">4</td>
                  <td><a onclick="map.getData('STATION', { i: '3', a: 'Kelenföld [Budapest]', d: '19.05.03', language: '1' } );return false;" href="javascript:;">Kelenföld [Budapest]</a></td>
                  <td style="width:1px;text-align:center;">22:26<br><span style="color:red">22:27</span></td>
                  <td style="width:1px;text-align:center;">22:28<br><span style="color:red">22:29</span></td>
                  <td style="width:1px;text-align:center;">6</td>
                </tr>
                <tr onmouseover="this.className='row_highlight';" class="row_odd" onmouseout="this.className='row_odd';" onclick="" style="&#xA;
             cursor: default;&#xA;          ">
                  <td style="width:1px;">94</td>
                  <td><a onclick="map.getData('STATION', { i: '18', a: 'Komárom', d: '19.05.03', language: '1' } );return false;" href="javascript:;">Komárom</a></td>
                  <td style="width:1px;text-align:center;">23:45<br><span style="color:green;font-style:italic;">23:45</span></td>
                  <td style="width:1px;text-align:center;"> </td>
                  <td style="width:1px;text-align:center;">
                  </td>
                </tr>
              </tbody>
            </table>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };
    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.stations).to.eql(
        [
          {
            name: "Budapest-Déli",
            normName: "budapest deli",
            intDistance: 0,
            arrival: null,
            departure: { scheduled: "22:20", actual: "22:20" },
            platform: "8"
          },
          {
            name: "Kelenföld [Budapest]",
            normName: "kelenfold",
            intDistance: 4,
            arrival: { scheduled: "22:26", actual: "22:27" },
            departure: { scheduled: "22:28", actual: "22:29" },
            platform: "6"
          },
          {
            name: "Komárom",
            normName: "komarom",
            intDistance: 94,
            arrival: { scheduled: "23:45", actual: "23:45" },
            departure: null,
            platform: null
          }
        ]
      );
      done();
    });
  });

  it("Station list with empty integer distance", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<table class="vt" cellpadding="0" cellspacing="0">
                <tbody>
                  <tr>
                    <th colspan="5" class="title">4838  személyvonat <span class="viszszam2">S10</span><br><font style="font-size:12px;">(Budapest-Déli - Komárom, 2019.05.03.)</font>
                    </th>
                  </tr>
                  <tr>
                    <th>Km</th>
                    <th>Állomás</th>
                    <th>Érk.</th>
                    <th>Ind.</th>
                    <th>Vágány</th>
                  </tr>
                  <tr onmouseover="this.className='row_highlight';" class="row_odd" onmouseout="this.className='row_odd';" onclick="" style="&#xA;
               cursor: default;&#xA;          ">
                    <td style="width:1px;">0</td>
                    <td><a onclick="map.getData('STATION', { i: '2', a: 'Budapest-Déli', d: '19.05.03', language: '1' } );return false;" href="javascript:;">Budapest-Déli</a></td>
                    <td style="width:1px;text-align:center;"> </td>
                    <td style="width:1px;text-align:center;">22:20<br><span style="color:green">22:20</span></td>
                    <td style="width:1px;text-align:center;">8</td>
                  </tr>
                  <tr onmouseover="this.className='row_highlight';" class="row_past_even" onmouseout="this.className='row_past_even';" onclick="" style="&#xA;            cursor: default;&#xA;          ">
                    <td style="width:1px;">4</td>
                    <td><a onclick="map.getData('STATION', { i: '3', a: 'Kelenföld [Budapest]', d: '19.05.03', language: '1' } );return false;" href="javascript:;">Kelenföld [Budapest]</a></td>
                    <td style="width:1px;text-align:center;">22:26<br><span style="color:red">22:27</span></td>
                    <td style="width:1px;text-align:center;">22:28<br><span style="color:red">22:29</span></td>
                    <td style="width:1px;text-align:center;">6</td>
                  </tr>
                  <tr onmouseover="this.className='row_highlight';" class="row_odd" onmouseout="this.className='row_odd';" onclick="" style="&#xA;
               cursor: default;&#xA;          ">
                    <td style="width:1px;"></td>
                    <td><a onclick="map.getData('STATION', { i: '18', a: 'Komárom', d: '19.05.03', language: '1' } );return false;" href="javascript:;">Komárom</a></td>
                    <td style="width:1px;text-align:center;">23:45<br><span style="color:green;font-style:italic;">23:45</span></td>
                    <td style="width:1px;text-align:center;"> </td>
                    <td style="width:1px;text-align:center;">
                    </td>
                  </tr>
                </tbody>
              </table>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };

    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.stations).to.eql(
        [
          {
            name: "Budapest-Déli",
            normName: "budapest deli",
            intDistance: 0,
            arrival: null,
            departure: { scheduled: "22:20", actual: "22:20" },
            platform: "8"
          },
          {
            name: "Kelenföld [Budapest]",
            normName: "kelenfold",
            intDistance: 4,
            arrival: { scheduled: "22:26", actual: "22:27" },
            departure: { scheduled: "22:28", actual: "22:29" },
            platform: "6"
          },
          {
            name: "Komárom",
            normName: "komarom",
            intDistance: -1,
            arrival: { scheduled: "23:45", actual: "23:45" },
            departure: null,
            platform: null
          }
        ]
      );
      done();
    });
  });

  it("Empty station list", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<table class="vt" cellpadding="0" cellspacing="0">
                <tbody>
                  <tr>
                    <th colspan="5" class="title">4838  személyvonat <span class="viszszam2">S10</span><br><font style="font-size:12px;">(Budapest-Déli - Komárom, 2019.05.03.)</font>
                    </th>
                  </tr>
                  <tr>
                    <th>Km</th>
                    <th>Állomás</th>
                    <th>Érk.</th>
                    <th>Ind.</th>
                    <th>Vágány</th>
                  </tr>
                </tbody>
              </table>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };
    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.stations).to.eql([]);
      done();
    });
  });

  it("Train is always valid", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<h5>Something else</h5>
                    <h5>Közlekedik:</h5>
                    <ul>
                      <li>naponta</li>
                    </ul>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };
    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.alwaysValid).to.be.true;
      done();
    });
  });

  it("Train is not always valid", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            result:
            {
              html: `<h5>Something else</h5>
                    <h5>Közlekedik:</h5>
                    <ul>
                      <li>definetely not daily</li>
                    </ul>`,
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };
    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.alwaysValid).to.be.false;
      done();
    });
  });

  it("ElviraID from api result echoed request parameter", function (done) {
    let res = {
      locals: {
        apiResult: {
          d: {
            param: {
              v: "111111_111111"
            },
            result:
            {
              html: "mock html",
              line: [{ points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" }]
            }
          }
        }
      }
    };
    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain.elviraId).equal(111111);
      done();
    });
  });

  it("Flow through (no api result set should call next)", function (done) {
    let res = {
      locals: {}
    };
    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.undefined;
      expect(res.locals.parsedTrain).to.be.undefined;
      done();
    });
  });

  it("When API result is incomplete should call next with error", function (done) {
    let res = {
      locals: {
        apiResult: {}
      }
    };
    TRAINparseMW()({}, res, (err) => {
      expect(err).to.be.eql("Parser failed because request is empty");
      expect(res.locals.parsedTrain).to.be.undefined;
      done();
    });
  });
});