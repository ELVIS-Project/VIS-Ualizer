

var PieChart = function(selector, width, height) {
    var margin = 120;
    var centre = {x: width/2, y: height/2};
    var radius = parseInt(Math.min(width, height) / 2 - margin);

    var minZoom = 0.5,
        maxZoom = 4;
    var zoom = d3.behavior.zoom()
        .scaleExtent([minZoom, maxZoom])
        .on("zoom", zoomCallback);

    // Keep track of whether or not the pie is exploding
    var isNotExploded = true;

    var sortEnum = Object.freeze({
        label: 0,
        value: 1
    });
    var sort = sortEnum.label;

    chart.svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style(cssStyling.global);

    chart.g = chart.svg.append("g")
        .attr("transform", "translate(" + centre.x + "," + centre.y + ")")
        .call(zoom);

    function zoomCallback() {
        var newTranslation = d3.event.translate;
        newTranslation[0] += centre.x;
        newTranslation[1] += centre.y;
        chart.g.attr("transform", "translate(" + newTranslation + ")scale(" + d3.event.scale + ")");
    }

    function chart(data) {
        // Make sure the SVG is clean
        chart.g.selectAll("*").remove();
        chart.svg.selectAll('g[name="legend"]').remove();

        // Backup the data
        chart.data = data;

        data = data.sort(function(a, b) {
            switch (sort) {
                case sortEnum.label:
                    return a.label > b.label;
                default:
                    return a.value > b.value;
            }
        });

        var colours = d3.scale.category20();

        chart.arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

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

        chart.labels = g.append("text")
            .attr("dy", ".35em")
            .text(function(d) { return d.data["label"]; });

        // Set labels to default position
        positionLabels(chart.labels, radius);

        // Build the legend
        var names = data.map(function(datum) {
            return datum["label"];
        });

        // Make sure that we're in the right explosion state
        if (isNotExploded) {
            implode();
        } else {
            explode();
        }

        buildLegend(chart.svg, names, colours, margin, margin, width);
    }

    function positionLabels(labels, radius) {
        var labelArc = d3.svg.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        labels
            .attr("transform", function(d) {
                return "translate(" + labelArc.centroid(d) + ")";
            });
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

    /**
     * Attach an "explode" button to the visualization.
     *
     * @param selector
     */
    function attachExplodeButton(selector) {
        d3.select(selector).append("p").append("button")
            .text("Explode")
            .on("click", function() {
                // Flip explode/implode
                isNotExploded = !isNotExploded;
                if (isNotExploded) {
                    implode();
                    this.innerHTML = "Explode";
                } else {
                    explode();
                    this.innerHTML = "Implode";
                }
            });
    }

    /**
     * Attach a zoom slider to the visualization.
     *
     * @param selector
     * @param maxZoom
     */
    function attachZoomSlider(selector, maxZoom) {
        var numberOfZoomNotches = 20;
        d3.select(selector).append("p").append("label")
            .text("Zoom")
            .append("input")
            .attr("name", "zoom")
            .attr("type", "range")
            .attr("min", "1")
            .attr("max", numberOfZoomNotches)
            .attr("value", "1")
            .on("input", function() {
                var value = this.value;
                zoom.scale((value / numberOfZoomNotches) * maxZoom);
                zoom.event(d3.select(selector));
            });
    }

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

    function attachLabelLocationSlider(selector) {
        d3.select(selector).append("p").append("label")
            .text("Label Position: ")
            .append("input")
            .attr({
                type: "range",
                min: 0,
                max: 80,
                value: 0
            })
            .on("input", function() {
                positionLabels(chart.labels, radius + parseInt(this.value));
            });
    }


    // Attach GUI elements
    attachPrintButton(selector, chart.svg[0][0]);
    attachExplodeButton(selector);
    attachZoomSlider(selector, maxZoom);
    attachSortChooser(selector, sortEnum);
    attachLabelLocationSlider(selector);

    return chart;
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/10/", function(error, data) {
    var pieChart = new PieChart(".pie-chart", 1280, 640);
    pieChart(data);
});
