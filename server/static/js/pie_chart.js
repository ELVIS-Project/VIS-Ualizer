

var PieChart = function(selector, width, height) {
    var margin = 120;

    var centre = {x: width/2, y: height/2};

    chart.svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style(cssStyling.global);

    chart.g = chart.svg.append("g")
        .attr("transform", "translate(" + centre.x + "," + centre.y + ")")
        .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom));

    chart.getSVGforPrinting = function() {
        return d3.select(selector).select("svg")[0][0];
    };

    function zoom() {
        var newTranslation = d3.event.translate;
        newTranslation[0] += centre.x;
        newTranslation[1] += centre.y;
        chart.g.attr("transform", "translate(" + newTranslation + ")scale(" + d3.event.scale + ")");
    }

    function chart(data) {
        console.log(data);

        var radius = Math.min(width, height) / 2 - margin;

        var colours = d3.scale.category20();

        var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var labelArc = d3.svg.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(data) { return data["value"]; });

        var g = chart.g.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function(d) { return colours(d.data["label"]); });

        g.append("text")
            .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) {
                console.log(d);
                return d.data["label"]; });

        // Build the legend
        var names = data.map(function(datum) {
            return datum["label"];
        });
        console.log(names);
        buildLegend(chart.svg, names, colours, margin, margin, width);
    }

    return chart;
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/10/", function(error, data) {
    var pieChart = new PieChart(".pie-chart", 1280, 640);
    pieChart(data);

    var printButton = d3.select(".save-pie-chart");
    printButton.on("click", function() {
        printToSVG(pieChart.getSVGforPrinting());
    });
});
