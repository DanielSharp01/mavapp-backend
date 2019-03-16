const EARTH_R = 6371;
const HUN_TOPLEFT = new Vec2(47.1569903, 18.4769959);
const HUN_ZOOM = 8.13;

function latLonToUnscaledWebMerc(point) {
  return new Vec2((point.y / 180 + 1) / 2, (Math.PI - Math.log(Math.tan(Math.PI / 4 + point.x * Math.PI / 360))) / (2 * Math.PI));
}

function unscaledWebMercToLatLon(point) {
  return new Vec2((Math.atan(Math.exp(Math.PI - 2 * Math.PI * point.y)) - Math.PI / 4) * 360 / Math.PI, 180 * (point.x * 2 - 1));
}

function scaleWebMerc(point, center, centerAsLatLon, zoom, tileSize = 256) {
  center = centerAsLatLon ? latLonToUnscaledWebMerc(center) : center;
  return point.sub(center).mul(tileSize * Math.pow(2, zoom));
}

function unscaleWebMerc(point, center, centerAsLatLon, zoom, tileSize = 256) {
  center = centerAsLatLon ? latLonToUnscaledWebMerc(center) : center;
  return point.div(tileSize * Math.pow(2, zoom)).add(center);
}

function latLonToHunWebMerc(point) {
  return scaleWebMerc(latLonToUnscaledWebMerc(point), HUN_TOPLEFT, true, HUN_ZOOM);
}

function hunWebMercToLatLon(point) {
  return unscaledWebMercToLatLon(unscaleWebMerc(point, HUN_TOPLEFT, true, HUN_ZOOM));
}