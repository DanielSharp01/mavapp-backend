const db = require("../db");
const Schema = require("mongoose").Schema;
const fs = require("fs");
const request = require("../requestPromise");

const StationSchema = new Schema({
  normName: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, required: true },
  position: {
    latitude: Number,
    longitude: Number
  }
});

function normalizeStationName(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .replace("railway station crossing", "").replace("railway station", "").replace("train station", "")
    .replace("vonatallomas", "").replace("vasutallomas", "").replace("pu", "").replace("mav pu", "")
    .replace("vm").replace("palyaudvar")
    .replace("-", " ").replace(".", "").replace("/\s\s+/g", " ").trim();
}

let stationModel = db.model("Station", StationSchema);

async function osmData() {
  let json = JSON.parse(fs.readFileSync('./osm-stations.json', 'utf8')); // your own cache if you use one
  if (json) {
    console.log("Local OSM data found!");
    return json;
  }
  console.log("No local data found! Querying overpass!");
  return await request({
    url: "http://overpass-api.de/api/interpreter?data=[out:json][timeout:2500];%20area(3600021335)-%3E.searchArea;%20(%20node[%22railway%22=%22station%22](area.searchArea);%20node[%22railway%22=%22halt%22](area.searchArea);%20node[%22railway%22=%22stop%22](area.searchArea);%20);%20out%20body;%20%3E;%20out%20skel%20qt;",
    json: true
  });
}

function seedWithData() {
  stationModel.findOne({}).then(async res => {
    if (!res) {
      console.log("Acquiring OSM data!");
      let json = await osmData();
      console.log("Filling up station database!");
      if (json) {
        let dups = {};
        let elements = json.elements.filter(e => e.tags.name).map(e => {
          let ne = { ...e };
          ne.tags.normName = normalizeStationName(e.tags.name);
          return ne;
        }).filter(e => e.tags.normName !== "").filter(e => {
          if (dups[e.tags.normName]) return false;
          dups[e.tags.normName] = true;
          return true;
        });
        console.log(`${elements.length} OSM nodes found!`);
        let promises = elements.map(e => {
          let station = new stationModel();
          station.displayName = e.tags.name;
          station.normName = e.tags.normName;
          station.position = { lat: e.lat, lon: e.lon };
          console.log(`Inserting '${station.normName}'`);
          return station.save();
        });
        Promise.all(promises).then(res => console.log("Station database ready!")).catch(err => console.error(err));
      }
      else console.error("Could not fill up station database!")
    }
    else console.log("Station database already filled!");
  });
}

seedWithData();

module.exports = stationModel;
module.exports.normalizeStationName = normalizeStationName;