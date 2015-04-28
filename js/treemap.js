$(function() {
  var margin = {top: 40, right: 10, bottom: 10, left: 10},
      width = 1000 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  // var color = d3.scale.category10();
  var color = d3.scale.ordinal()
    .domain(["pizza", "mexican", "chinese", "bars", "bbq", "southern", "steak"])
    .range(["#2196F3", "#4CAF50", "#009688", "#607D8B", "#E91E63", "#9C27B0", "#795548"]);

  var treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(true)
      .value(function(d) { return d.size; });

  var div = d3.select("body").append("div")
    .classed('treemap-wrapper', true)
      .style("position", "relative")
      .style("width", (width + margin.left + margin.right) + "px")
      .style("height", (height + margin.top + margin.bottom) + "px")
      .style("left", margin.left + "px")
      .style("top", margin.top + "px");

  d3.json("/data/tree.json", function(error, root) {
    var mousemove = function(d) {
      var xPosition = d3.event.pageX + 5;
      var yPosition = d3.event.pageY + 5;

      d3.select("#tooltip.tree")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");
      d3.select("#tooltip.tree #header")
        .text(d.category);
      d3.select("#tooltip.tree #citystate")
        .text(d.city + ', ' + d.name);
      d3.select("#tooltip.tree #percent")
        .text(d.percent);
      d3.select("#tooltip.tree").classed("hidden", false);
    };

    var mouseout = function() {
      d3.select("#tooltip.tree").classed("hidden", true);
    };

    console.log(root);
    var node = div.datum(root).selectAll(".node")
        .data(treemap.nodes)
      .enter().append("div")
        .attr("class", "node")
        .call(position)
        .style("background", function(d) { return d.children ? color(d.name) : null; })
        .text(function(d) { return d.children ? null : d.name; })
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

  });
  function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
  }



})