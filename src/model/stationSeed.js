const objectRepository = require("../objectRepository");
const { normalizeStationName } = require("../utils/parserUtils");
const osmapi = require("../apis/osmapi")

module.exports = () => {
  objectRepository.Station.countDocuments({}).then(async res => {
    if (res === 0) {
      console.log("Acquiring OSM data!");
      let json = await osmapi("./osm-stations.json");
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
          let station = new objectRepository.Station();
          station.displayName = e.tags.name;
          station.normName = e.tags.normName;
          station.position = { latitude: e.lat, longitude: e.lon };
          console.log(`Inserting '${station.normName}'`);
          return station.save();
        });
        Promise.all(promises).then(res => console.log("Station database ready!")).catch(err => console.error(err));
      }
      else console.error("Could not fill up station database!")
    }
    else console.log("Station database already filled!");
  });
};