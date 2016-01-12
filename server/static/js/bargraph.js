

var BarGraph = function(selector, width, height) {
    var margin = {top: 20, right: 30, bottom: 30, left: 40};

    function chart(data) {
        var labels = d3.map(data, function(d) { return d.label }).keys();
        var colours = d3.scale.category20().domain(labels);

        // Map x-axis labels
        chart.x.domain(data.map(function(d) { return d.label; }));
        // Map y-axis values
        chart.y.domain([0, d3.max(data, function(d) { return d.value; })]);

        chart.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .call(chart.xAxis);

        chart.svg.append("g")
            .attr("class", "y axis")
            .call(chart.yAxis);

        chart.svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return chart.x(d.label); })
            .attr("y", function(d) { return chart.y(d.value); })
            .attr("fill", function(d) { return colours(d.label) })
            .attr("height", function(d) { return chart.height - chart.y(d.value); })
            .attr("width", chart.x.rangeBand());
    }

    chart.width = width - margin.left - margin.right;
    chart.height = height - margin.left - margin.right;

    chart.x = d3.scale.ordinal()
        .rangeRoundBands([0, chart.width], .1);

    chart.y = d3.scale.linear()
        .range([chart.height, 0]);

    chart.xAxis = d3.svg.axis()
        .scale(chart.x)
        .orient("bottom");

    chart.yAxis = d3.svg.axis()
        .scale(chart.y)
        .orient("left");

    chart.svg = d3.select(selector)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return chart;
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/", function(error, data) {
    var barGraph = new BarGraph(".bar-graph", 640, 320);
    barGraph(data);
});
