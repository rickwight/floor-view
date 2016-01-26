function drawGraph() {
  width = $(window).width()
  height = $(window).height()
  points = window.points;

  console.log('draw: ' + width + ' x ' + height);

  var graph = d3.gl.graph()
    .width(width)
    .height(height);

  var pointcloud = graph.points()
    .data(points)
    .size(7)
    .color("#000");

  var scales = {
    "x": d3.scale.linear().domain([window.boundLower.x, window.boundUpper.x]),
    "y": d3.scale.linear().domain([window.boundLower.y, window.boundUpper.y]),
    "z": d3.scale.linear().domain([window.boundLower.z, window.boundUpper.z])
  };

  var axis = graph.axis()
    .data(["x", "y", "z"])
    .scale(function(d) { return scales[d]; })
    .orient(function(d) { return d; })
    .thickness(1)
    .color("#8cc");

  var ticks = axis.ticks()
    .count(5)
    .font("16px Arial")
    .size(50)
    .resolution(64)
    .color("#8cc");

  var label = axis.label()
    .size(100)
    .resolution(128)
    .font("bold 20px Helvetica")
    .color("#8cc");

  graph.zoom(4);
  graph.orient('x');

  var the_graph = d3.select("#the-graph")[0][0];
  if (the_graph.childNodes.length > 0) {
    d3.selectAll(the_graph.childNodes).remove();
  }
  d3.select("#the-graph").call(graph);
}

function parseInput(input) {
  var points = $.csv.toArrays(input);

  var new_points = [];
  for (var p = 0; p < points.length; p++) {
    var new_point = {
      'x' : parseFloat(points[p][0]),
      'y' : parseFloat(points[p][1]),
      'z' : parseFloat(points[p][2])
    };

    new_points.push(new_point);
  }

  return new_points;
}

function findBounds(points) {
  var upper = $.extend({}, points[0]);
  var lower = $.extend({}, points[0]);

  for (var p = 0; p < points.length; p++) {
    upper.x = points[p].x > upper.x ? points[p].x : upper.x;
    upper.y = points[p].y > upper.y ? points[p].y : upper.y;
    upper.z = points[p].z > upper.z ? points[p].z : upper.z;

    lower.x = points[p].x < lower.x ? points[p].x : lower.x;
    lower.y = points[p].y < lower.y ? points[p].y : lower.y;
    lower.z = points[p].z < lower.z ? points[p].z : lower.z;
  }

  window.boundUpper = upper;
  window.boundLower = lower;
}

function transformPoints(points) {
  var scale = {
    'x' : 2,
    'y' : 4,
    'z' : 8,
  }

  var translate = {
    'x' : 2,
    'y' : 4,
    'z' : 8,
  }

  for (var p = 0; p < points.length; p++) {
    points[p] = transformPoint(points[p], scale, translate);
  }

  return points;
}

function transformPoint(point, scale, translate) {
  point.x *= scale.x;
  point.y *= scale.y;
  point.z *= scale.z;

  point.x += translate.x;
  point.y += translate.y;
  point.z += translate.z;

  return point;
}

function printPoints(points) {
  for (var i = 0; i < points.length; i++) {
    printPoint(points[i]);
  }
}

function printPoint(point) {
  console.log("" + point.x + "," + point.y + "," + point.z);
}

function time_ms() {
  return new Date().getTime();
}

function initPoints() {
  points = parseInput($("#the-input-textarea").val());
  //points = transformPoints(points);
  findBounds(points);
  window.points = points;
}

function update() {
  initPoints()
  drawGraph();
}

$(document).ready(function() {
  update();
  $("#the-input").draggable();
});

$("#the-graph-button").click(function() {
  update();
});

$("#the-clear-button").click(function() {
  $("#the-input-textarea").val("");
});

$(window).resize(function() {
  // only draw if we stop resizing for a specified period
  clearTimeout(window.timeout_last_resize);
  window.timeout_last_resize = setTimeout(function() {
    update();
  }, 500);
});

