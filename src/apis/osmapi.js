const request = require("./requestPromise");
const fs = require("fs");

module.exports = (cacheFile) => {
  let json = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  if (json) {
    console.log("Local OSM data found!");
    return json;
  }
  console.log("No local data found! Querying overpass!");
  return request({
    url: "http://overpass-api.de/api/interpreter?data=[out:json][timeout:2500];%20area(3600021335)-%3E.searchArea;%20(%20node[%22railway%22=%22station%22](area.searchArea);%20node[%22railway%22=%22halt%22](area.searchArea);%20node[%22railway%22=%22stop%22](area.searchArea);%20);%20out%20body;%20%3E;%20out%20skel%20qt;",
    json: true
  });
}