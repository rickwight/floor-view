function drawGraph() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  var startPoints = window.startPoints;
  var min_point = window.startPointsMin;
  var max_point = window.startPointsMax;
  var endPoints = window.endPoints;
  var diffPoints = window.diffPoints;

  console.log('draw: ' + width + 'x' + height + ' points: ' + startPoints.length);

  var dim = Math.min(width, height);
  var vertRatio = Math.abs((max_point.z - min_point.z) / (max_point.y - min_point.y));
  var zStep = (max_point.z - min_point.z) / 3;

  // specify options
  var options = {
      width: "" + width + "px",
      height: "" + height + "px",
      style: window.graph_style,
      showPerspective: !window.ortho,
      showGrid: true,
      showShadow: window.graph_shadow,
      dotSizeRatio: 0.003,
      verticalRatio: window.verticalRange,
      zStep: zStep,
      animationInterval: 1000,
      animationPreload: true,
      showAnimationControls: true,
      keepAspectRatio: true,
      zMin: 0
  };

  var container = document.getElementById("the-graph");

  var cameraPosition = null;
  if (typeof window.graph != "undefined") {
    cameraPosition = window.graph.getCameraPosition();
  }

  window.graph = new vis.Graph3d(container, generateDataSet(startPoints, endPoints, diffPoints), options);

  if (cameraPosition) {
    window.graph.setCameraPosition(cameraPosition);
  }
}

function generateDataSet(startPoints, endPoints, diffPoints) {
  dataSet = new vis.DataSet();

  interCount = 5;
  pauseCount = 10;
  filterCount = 0;

  addPointsToDataSet(dataSet, startPoints, filterCount++);
  addPointsToDataSet(dataSet, endPoints, filterCount++);
  addPointsToDataSet(dataSet, diffPoints, filterCount++);

  return dataSet;
}

function addPointsToDataSet(dataSet, points, filter) {
  for (var p = 0; p < points.length; p++) {
    var point = points[p];
    point.filter = filter;
    dataSet.add(point);
  }
}

function createNewPoints(points) {
  return mapPoints(points, function(p, i) {
    return makePoint(p.x, p.y, p.z * 0.3);
  });
}

function makePoint(x, y, z) {
  return {'x': x, 'y': y, 'z': z};
}

function clonePoint(point) {
  makePoint(point.x, point.y, point.z);
}

function subtractPoints(pointsA, pointsB) {
  return mapPoints(pointsA, function(a, i) {
    var b = pointsB[i];
    return makePoint(a.x, a.y, a.z - b.z);
  });
}

function mapPoints(points, callback) {
  var output = [];
  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    output.push(callback(point, i));
  }
  return output;
}

function generateInterpolation(startPoints, endPoints, interAmount, filter) {
  var output = [];
  for (var p = 0; p < startPoints.length; p++) {
    var startPoint = startPoints[p];
    var endPoint = endPoints[p];
    newPoint = makePoint(
        startPoint.x,
        startPoint.y,
        startPoint.z + (interAmount * (endPoint.z - startPoint.z)));
    newPoint.filter = filter;
    output.push(newPoint);
  }
  return output;
}

function parseInput(input) {
  var points = $.csv.toArrays(input);

  var max_x = 0;
  var max_y = 0;
  var max_z = 0;

  var min_x = 0;
  var min_y = 0;
  var min_z = 0;

  var new_points = [];
  for (var p = 0; p < points.length; p++) {
    var new_point = makePoint(
        parseFloat(points[p][0]),
        parseFloat(points[p][1]),
        parseFloat(points[p][2]));

    if (p == 0) {
      min_x = new_point.x;
      min_y = new_point.y;
      min_z = new_point.z;

      max_x = new_point.x;
      max_y = new_point.y;
      max_z = new_point.z;
    } else {
      min_x = Math.min(min_x, new_point.x);
      min_y = Math.min(min_y, new_point.y);
      min_z = Math.min(min_z, new_point.z);

      max_x = Math.max(max_x, new_point.x);
      max_y = Math.max(max_y, new_point.y);
      max_z = Math.max(max_z, new_point.z);
    }

    new_points.push(new_point);
  }

  var min_point = {
    x: min_x,
    y: min_y,
    z: min_z
  };

  var max_point = {
    x: max_x,
    y: max_y,
    z: max_z
  };

  return [new_points, min_point, max_point];
}

function printPoints(points) {
  for (var i = 0; i < points.length; i++) {
    printPoint(points[i]);
  }
}

function printPoint(point) {
  console.log("" + point.x + "," + point.y + "," + point.z);
}


function initPoints() {
  var parsedStart = parseInput($("#the-input-start-points").val());
  window.startPoints = parsedStart[0];
  window.startPointsMin = parsedStart[1];
  window.startPointsMax = parsedStart[2];

  var parsedEnd = parseInput($("#the-input-end-points").val());
  window.endPoints = parsedEnd[0];

  window.diffPoints = subtractPoints(window.endPoints, window.startPoints);
}

function updateGraph() {
  initPoints()
  drawGraph();
}

function genCsv(points) {
  var str = "";
  for (var p = 0; p < points.length; p++) {
    point = points[p];
    str += ("" + point.x + "," + point.y + "," + point.z + "\n")
  }
  return str;
}

function genStartPoints() {
  var x, y, z;
  var res = 6;
  var points = [];

  for (x = 0; x < res; x++) {
    for (y = 0; y < res*1.5; y++) {
      points.push(makePoint(
            x - 20,
            y,
            x * y - 10 * (Math.random())));
    }
  }
  return points;
}

function genEndPoints() {
  var x, y, z;
  var res = 6;
  var points = [];

  for (x = 0; x < res; x++) {
    for (y = 0; y < res*1.5; y++) {
      points.push(makePoint(
            x - 20,
            y,
            x*y));
    }
  }
  return points;
}

$(document).ready(function() {
  window.ortho = false;
  window.hidePanel = false;
  window.orient = 'x';
  window.graph_style = 'surface';
  window.graph_shadow = true;
  unloadScrollBars();
  startPoints = genStartPoints();
  endPoints = genEndPoints();
  $("#the-input-start-points").val(genCsv(startPoints));
  $("#the-input-end-points").val(genCsv(endPoints));
  $("#the-input").draggable();
  updatePanel();
  initSlider();
  initPoints();
  drawGraph();
});

function unloadScrollBars() {
  document.documentElement.style.overflow = 'hidden';  // firefox, chrome
  document.body.scroll = "no"; // ie only
}

$("#the-input-hide-button").click(function() {
  window.hideTheInput = !window.hideTheInput;
  updatePanel();
});

function updatePanel() {
  if (window.hideTheInput) {
    $("#the-input").find(".hidable").addClass("hide");
    $("#the-input-hide-button").html("Show");
  } else {
    $("#the-input").find(".hidable").removeClass("hide");
    $("#the-input-hide-button").html("Hide");
  }
}

function initSlider() {
  min = 0.02;
  max = 0.5;
  steps = 20;

  value = (min + max) / 2;
  window.verticalRange = value;

  $('#the-input-vertical-range').slider({
    min: min,
    max: max,
    value: value,
    step: (max - min) / steps,
    slide: function(event, ui) {
      window.verticalRange = ui.value;
      drawGraph();
    }
  });
}

$("#the-graph-button").click(function() {
  initPoints();
  drawGraph();
});

$("#the-clear-button").click(function() {
  $("#the-input-start-points").val("");
  $("#the-input-end-points").val("");
});

$("#the-ortho-checkbox").click(function() {
  window.ortho = !window.ortho;
  updatePanel();
  drawGraph();
});

$("#the-style-dot-button").click(function() {
  window.graph_style = 'dot';
  drawGraph();
});
$("#the-style-grid-button").click(function() {
  window.graph_style = 'grid';
  drawGraph();
});
$("#the-style-surface-button").click(function() {
  window.graph_style = 'surface';
  window.graph_shadow = false;
  drawGraph();
});
$("#the-style-shadows-button").click(function() {
  window.graph_style = 'surface';
  window.graph_shadow = true;
  drawGraph();
});

$(window).resize(function() {
  // only draw if we stop resizing for a specified period
  clearTimeout(window.timeout_last_resize);
  window.timeout_last_resize = setTimeout(function() {
    drawGraph();
  }, 500);
});

