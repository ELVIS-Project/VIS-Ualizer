

var PieChart = function(selector, width, height) {
    var margin = {top: 20, right: 30, bottom: 30, left: 40};

    chart.svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .style(cssStyling.global);

    chart.getSVGforPrinting = function() {
        return d3.select(selector).select("svg")[0][0];
    };


    function chart(data) {
        console.log(data);

        var radius = Math.min(width, height) / 2;

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

        var g = chart.svg.selectAll(".arc")
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
    }

    return chart;
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/10/", function(error, data) {
    var pieChart = new PieChart(".pie-chart", 640, 320);
    pieChart(data);

    var printButton = d3.select(".save-pie-chart");
    printButton.on("click", function() {
        printToSVG(pieChart.getSVGforPrinting());
    });
});
