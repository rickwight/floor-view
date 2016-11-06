function drawGraph() {
  width = $(window).width()
  height = $(window).height()
  points = window.points;

  console.log('draw: ' + width + 'x' + height + ' points: ' + points.length);

  var dim = Math.min(width, height);

  // specify options
  var options = {
      width: "" + dim + "px",
      height: "" + dim + "px",
      style: window.graph_style,
      showPerspective: !window.ortho,
      showGrid: true,
      showShadow: false,
      keepAspectRatio: true,
      dotSizeRatio: 0.003,
      verticalRatio: 0.5
  };

  var useCameraPosition = typeof window.graph != "undefined";
  var container = document.getElementById("the-graph");

  var cameraPosition;
  if (useCameraPosition) {
    cameraPosition = window.graph.getCameraPosition();
  }

  window.graph = new vis.Graph3d(container, points, options);

  if (useCameraPosition) {
    window.graph.setCameraPosition(cameraPosition);
  }
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

function printPoints(points) {
  for (var i = 0; i < points.length; i++) {
    printPoint(points[i]);
  }
}

function printPoint(point) {
  console.log("" + point.x + "," + point.y + "," + point.z);
}


function initPoints() {
  var points = parseInput($("#the-input-textarea").val());
  window.points = points;
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
    for (y = 0; y < res; y++) {
      str += ("" + x + "," + y + "," + Math.random() + "\n")
    }
  }
  return str;
}

$(document).ready(function() {
  window.ortho = false;
  window.hidePanel = false;
  window.orient = 'x';
  window.graph_style = 'surface';
  $("#the-input-textarea").val(genCsvPoints());
  $("#the-input").draggable();
  updatePanel();
  initPoints();
  drawGraph();
});

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
  drawGraph();
});

$(window).resize(function() {
  // only draw if we stop resizing for a specified period
  clearTimeout(window.timeout_last_resize);
  window.timeout_last_resize = setTimeout(function() {
    drawGraph();
  }, 500);
});

