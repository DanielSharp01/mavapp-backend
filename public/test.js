let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function drawCircle(vec, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(vec.x, vec.y, radius, 0, 2 * Math.PI);
  context.fill();
}

function drawLineSegment(start, end, thickness, color) {
  context.lineWidth = thickness;
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

let polyline = new Polyline({});
let projecting = false;


function drawPolyline(encodedPolyline) {
  polyline = new Polyline({ encodedPolyline });
  for (let i = 0; i < polyline.points.length; i++) {
    drawCircle(polyline.points[i], 3, "blue");
    if (i >= 1) {
      drawLineSegment(polyline.points[i - 1], polyline.points[i], 2, "black");
    }
  }
}

document.addEventListener("mousedown", e => {
  let point = new Vec2(e.clientX, e.clientY);
  if (projecting) {
    drawCircle(point, 3, "green");
    let projPoint = polyline.atDistance(polyline.projectDistance(point));
    drawCircle(projPoint, 3, "red");
    drawLineSegment(point, projPoint, 1, "gray");
  }
  else {
    polyline.points.push(point);
    drawCircle(point, 3, "blue");
    if (polyline.points.length >= 2) {
      drawLineSegment(polyline.points[polyline.points.length - 2], point, 2, "black");
    }
  }
});