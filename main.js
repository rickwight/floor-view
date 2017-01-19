function drawGraph() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  var points = window.points;
  var min_point = window.min_point;
  var max_point = window.max_point;

  console.log('draw: ' + width + 'x' + height + ' points: ' + points.length);

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
      verticalRatio: vertRatio,
      zStep: zStep,
      animationInterval: 500,
      animationPreload: true,
      showAnimationControls: true,
      keepAspectRatio: true
  };

  var container = document.getElementById("the-graph");

  var cameraPosition = null;
  if (typeof window.graph != "undefined") {
    cameraPosition = window.graph.getCameraPosition();
  }

  window.graph = new vis.Graph3d(container, createDataSet(points, createNewPoints(points)), options);

  if (cameraPosition) {
    window.graph.setCameraPosition(cameraPosition);
  }
}

function createDataSet(points, new_points) {
  dataSet = new vis.DataSet();
  for (var p = 0; p < points.length; p++) {
    var point = points[p];
    point.filter = 0;
    dataSet.add(point);
  }
  for (var p = 0; p < new_points.length; p++) {
    var point = new_points[p];
    point.filter = 1;
    dataSet.add(point);
  }
  console.log('');
  console.log(points[0]);
  console.log(new_points[0]);
  return dataSet;
}

function createNewPoints(points) {
  var new_points = [];
  for (var p = 0; p < points.length; p++) {
    var point = points[p];
    new_points.push({
      'x': point.x,
      'y': point.y,
      'z': point.z + 0.5
    });
  }
  return new_points;
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
    var new_point = {
      'x' : parseFloat(points[p][0]),
      'y' : parseFloat(points[p][1]),
      'z' : parseFloat(points[p][2])
    };

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
  var parsed = parseInput($("#the-input-textarea").val());
  window.points = parsed[0];
  window.min_point = parsed[1];
  window.max_point = parsed[2];
}

function updateGraph() {
  initPoints()
  drawGraph();
}

function genCsvPoints() {
  var x, y, z;
  var str = "";
  var res = 20;
  for (x = 0; x < res; x++) {
    for (y = 0; y < res*1.5; y++) {
      str += ("" + (x - 20) + "," + y + "," + (2 * (Math.random() - 0.5)) + "\n")
    }
  }
  return str;
}

$(document).ready(function() {
  window.ortho = false;
  window.hidePanel = false;
  window.orient = 'x';
  window.graph_style = 'surface';
  window.graph_shadow = true;
  unloadScrollBars();
  $("#the-input-textarea").val(genCsvPoints());
  $("#the-input").draggable();
  updatePanel();
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

$("#the-graph-button").click(function() {
  initPoints();
  drawGraph();
});

$("#the-clear-button").click(function() {
  $("#the-input-textarea").val("");
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

