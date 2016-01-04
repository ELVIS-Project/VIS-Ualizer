

var BarGraph = function(selector, width, height) {
    this.margin = {top: 20, right: 30, bottom: 30, left: 40};

    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.left - this.margin.right;

    this.x = d3.scale.ordinal()
        .rangeRoundBands([0, this.width], .1);

    this.y = d3.scale.linear()
        .range([this.height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    this.chart = d3.select(selector)
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/", function(error, data) {
    var barGraph = new BarGraph(".bar-graph", 640, 320);

    var labels = d3.map(data, function(d) { return d.label }).keys();

    var colours = d3.scale.category20().domain(labels);

    // Map x-axis labels
    barGraph.x.domain(data.map(function(d) { return d.label; }));
    // Map y-axis values
    barGraph.y.domain([0, d3.max(data, function(d) { return d.value; })]);

    barGraph.chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + barGraph.height + ")")
        .call(barGraph.xAxis);

    barGraph.chart.append("g")
        .attr("class", "y axis")
        .call(barGraph.yAxis);

    barGraph.chart.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return barGraph.x(d.label); })
        .attr("y", function(d) { return barGraph.y(d.value); })
        .attr("fill", function(d) { return colours(d.label) })
        .attr("height", function(d) { return barGraph.height - barGraph.y(d.value); })
        .attr("width", barGraph.x.rangeBand());
});
