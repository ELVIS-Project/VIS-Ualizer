
/**
 * Draw a bar graph.
 *
 * @param data
 */
var drawBarGraph = function(data) {
    var graph = d3.select(".bar-graph");
    graph.selectAll("div")
        .data(data)
        .enter().append("div")
        .style("width", function(d) { return d * 10 + "px"; })
        .style("background", "#ff9900")
        .text(function(d) { return d; });
};

/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/", function(error, json) {
    if (error) return console.warn(error);
    drawBarGraph(json);
});

console.log(graph);