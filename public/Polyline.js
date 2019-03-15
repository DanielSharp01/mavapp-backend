class Polyline {
  constructor({ encodedPolyline, points }) {
    if (points) this.points = points;
    else if (encodedPolyline) this.points = decodePolyline(encodedPolyline);
    else this.points = [];
  }

  atDistance(distance) {
    if (distance < 0) return this.points[0];

    let length = this.points[1].sub(this.points[0]).length;
    let i = 1;
    while (length <= distance && i < this.points.length - 1) {
      distance -= length;
      length = this.points[i + 1].sub(this.points[i]).length;
      i++;
    };

    if (distance < length) return atDistanceSegment(this.points[i - 1], this.points[i], distance);
    return this.points[this.points.length - 1];
  }

  projectDistance(vec) {
    let minProjDistance;
    let minDistance = false;
    let length = 0;
    for (let i = 0; i < this.points.length - 1; i++) {
      let projDistance = projectDistanceSegment(this.points[i], this.points[i + 1], vec);
      let segmentLength = this.points[i + 1].sub(this.points[i]).length;
      if (projDistance < 0) projDistance = 0;
      if (projDistance > segmentLength) projDistance = segmentLength;
      let projPoint = atDistanceSegment(this.points[i], this.points[i + 1], projDistance);
      let distance = projPoint.sub(vec).length;

      if (minDistance === false || minDistance > distance) {
        minProjDistance = length + projDistance;
        minDistance = distance;
      }
      length += segmentLength;
    }

    return minProjDistance;
  }
}

function encodedPolyline(points, precision = 5) {
  let factor = Math.pow(10, precision);
  let prevLat = 0;
  let prevLon = 0;
  let encodedPolyline = "";

  encodeSingedValue = (val) => {
    val = (val < 0) ? ~(val << 1) : val << 1;

    let str = "";
    while (val >= 0x20) {
      str += String.fromCharCode((0x20 | (val & 0x1f)) + 63);
      val >>= 5;
    }
    str += String.fromCharCode(val + 63);
    return str;
  };

  for (let i = 0; i < points.length; i++) {
    let currLat = Math.round(points[i].x * factor);
    let currLon = Math.round(points[i].y * factor);
    encodedPolyline += encodeSingedValue(currLat - prevLat) + encodeSingedValue(currLon - prevLon);
    prevLat = currLat;
    prevLon = currLon;
  }

  return encodedPolyline;
}

function decodePolyline(encodedPolyline, precision = 5) {
  let factor = Math.pow(10, precision);
  let lat = 0, lon = 0, i = 0;
  let points = [];
  let isLat = true;
  while (i < encodedPolyline.length) {
    let byte;
    let shift = 0, val = 0;
    do {
      byte = encodedPolyline.charCodeAt(i++) - 63;
      val |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    val = (val % 2 == 0) ? (val >> 1) : (~val >> 1);

    if (isLat)
      lat += val;
    else {
      lon += val;
      points.push(new Vec2(lat / factor, lon / factor));
    }

    isLat = !isLat;
  }

  return points;
}

function projectDistanceSegment(start, end, point) {
  let a = point.sub(start);
  let b = end.sub(start);
  return a.dot(b) / b.length;
}

function atDistanceSegment(start, end, distance) {
  let b = end.sub(start);
  return start.add(b.mul(distance / b.length));
}