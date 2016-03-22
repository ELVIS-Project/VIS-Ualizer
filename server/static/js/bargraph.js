

var BarGraph = function(selector, width, height) {
    var margin = {top: 20, right: 30, bottom: 30, left: 40};

    // Which sortt we're using
    var sort = sortEnum.label;

    var computedWidth = width - margin.left - margin.right,
        computedHeight = height - margin.left - margin.right;

    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, computedWidth], .1);

    var yScale = d3.scale.linear()
        .range([computedHeight, 0]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    function chart(data) {
        // Back up the data
        chart.data = data;
        // Make sure the SVG is clean
        chart.g.selectAll("*").remove();

        // Sort the data
        data = data.sort(function(a,b) {
            if (sort === sortEnum.value) {
                return a.value - b.value;
            } else {
                return a.label.toLowerCase() > b.label.toLowerCase();
            }
        });


        var labels = d3.map(data, function(d) { return d.label }).keys();
        var colours = d3.scale.category20().domain(labels);

        // Map x-axis labels
        xScale.domain(
            data.map(function(d) {
                return d.label;
            })
        );
        // Map y-axis values
        yScale.domain([0, d3.max(data, function(d) { return d.value; })]);

        // Draw the axes
        drawAxisLines(chart.g, xAxis, yAxis, computedHeight, 0, 0, 0);

        var bars = chart.g.append("g")
            .attr("class", "bars")
            .selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("x", function(d) { return xScale(d.label); })
            .attr("y", function(d) { return yScale(d.value); })
            .attr("fill", function(d) { return colours(d.label) })
            .attr("height", function(d) { return computedHeight - yScale(d.value); })
            .attr("width", xScale.rangeBand())
            .style(cssStyling.bar);
    }

    chart.svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style(cssStyling.global);

    chart.g = chart.svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function attachSortChooser(selector, sortEnum) {
        var sortChooser = d3.select(selector).append("p").append("label")
            .text("Sort: ")
            .append("select");

        sortChooser.append("option").attr("value", "label").text("Label");
        sortChooser.append("option").attr("value", "value").text("Value");

        sortChooser.on("input", function() {
            if (this.value === "label") {
                sort = sortEnum.label;
            } else {
                sort = sortEnum.value;
            }
            chart(chart.data);
        });
    }

    // GUI components
    attachPrintButton(selector, d3.select(selector).select("svg")[0][0]);
    attachSortChooser(selector, sortEnum);

    return chart;
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/", function(error, data) {
    var barGraph = new BarGraph(".bar-graph", 640, 320);
    barGraph(data);
});
