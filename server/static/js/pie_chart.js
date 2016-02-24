

var PieChart = function(selector, width, height) {
    var margin = 120;
    var centre = {x: width/2, y: height/2};

    var minZoom = 1,
        maxZoom = 4;
    var zoom = d3.behavior.zoom().scaleExtent([minZoom, maxZoom]).on("zoom", zoomCallback);

    chart.svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style(cssStyling.global);

    chart.g = chart.svg.append("g")
        .attr("transform", "translate(" + centre.x + "," + centre.y + ")")
        .call(zoom);

    chart.getSVGforPrinting = function() {
        return d3.select(selector).select("svg")[0][0];
    };

    function zoomCallback() {
        var newTranslation = d3.event.translate;
        newTranslation[0] += centre.x;
        newTranslation[1] += centre.y;
        chart.g.attr("transform", "translate(" + newTranslation + ")scale(" + d3.event.scale + ")");
    }

    function chart(data) {
        console.log(data);

        var radius = Math.min(width, height) / 2 - margin;

        var colours = d3.scale.category20();

        chart.arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var labelArc = d3.svg.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        chart.pie = d3.layout.pie()
            .sort(null)
            .value(function(data) { return data["value"]; });

        var g = chart.g.selectAll(".arc")
            .data(chart.pie(data))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", chart.arc)
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

    /**
     * Pull out the pie pieces.
     */
    var explode = function() {
        d3.selectAll(".arc").attr("transform", function(datum) {
            var distance = 70;
            var normVector = normalizeVector(chart.arc.centroid(datum));
            return "translate(" + normVector.map(function(x) { return distance * x; }) + ")";
        });
    };

    /**
     * Put the pie pieces back together again.
     */
    var implode = function() {
        d3.selectAll(".arc").attr("transform", "translate(0,0)");
    };

    /*
     Print Button
     */
    var printButton = d3.select(selector).append("p").append("button")
        .text("Save SVG")
        .on("click", function() {
            printToSVG(chart.getSVGforPrinting());
        });

    /*
     Explode Button
     */
    var isExploding = true;
    var explodeButton = d3.select(selector).append("p").append("button")
        .text("Explode")
        .on("click", function() {
            // Flip explode/implode
            isExploding = !isExploding;
            if (isExploding) {
                implode();
                explodeButton.text("Explode");
            } else {
                explode();
                explodeButton.text("Implode");
            }
        });

    /*
     Zoom Slider
     */
    var numberOfZoomNotches = 20;
    var zoomSlider = d3.select(selector).append("p").append("label")
        .text("Zoom")
        .append("input")
        .attr("name", "zoom")
        .attr("type", "range")
        .attr("min", "1")
        .attr("max", numberOfZoomNotches)
        .attr("value", "1")
        .on("change", function() {
            console.log("test");
            var value = zoomSlider[0][0].value;
            zoom.scale((value / numberOfZoomNotches) * maxZoom);
            zoom.event(d3.select(selector));
        });

    return chart;
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/10/", function(error, data) {
    var pieChart = new PieChart(".pie-chart", 1280, 640);
    pieChart(data);
});
