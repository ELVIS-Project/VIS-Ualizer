
var PianoRoll = function(selector, width, height) {
    var margins = {
        top: 10,
        left: 40,
        right: 120,
        bottom: 30
    };

    var minZoom = 0.001,
        maxZoom = 0.01;
    var zoom = d3.behavior.zoom().scaleExtent([minZoom, maxZoom]).on("zoom", zoomTick);

    chart.svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style(cssStyling.global)
        .call(zoom);

    chart.g = chart.svg
        .append("g")
        .attr("shape-rendering", "crispEdges");

    chart.contentArea = chart.g.append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .append("svg")
        .attr({
            width: width - margins.left - margins.right,
            height: height - margins.top - margins.bottom,
            overflow: "hidden"
        })
        .style("fill", "none");

    function chart(data) {
        // Construct a mapping between midi numbers and pitches
        var midiNumberToPitch = {};
        data["partdata"].forEach(function(part) {
            part["notedata"].forEach(function(note) {
                var pitch = note["pitch"];
                midiNumberToPitch[pitch["b12"]] = pitch["name"];
            });
        });
        // This is the formatting function we will pass to the y-axis
        function formatMidiPitch(midiNumber) {
            return midiNumberToPitch[midiNumber];
        }

        // Build scales
        chart.x = d3.scale.linear().range([0, data["scorelength"][0]]);
        chart.pitch = d3.scale.ordinal()
            .domain(d3.range(data["minpitch"]["b12"], data["maxpitch"]["b12"]).reverse())
            .rangeRoundBands([0, height - margins.bottom - margins.top], 0, 0);

        // X and Pitch axes will be zoomed on
        zoom.x(chart.x);
        //zoom.y(chart.pitch);

        // Build the axes
        chart.xAxis = d3.svg.axis()
            .scale(chart.x)
            .orient("bottom");
        chart.yAxis = d3.svg.axis()
            .scale(chart.pitch)
            .tickFormat(formatMidiPitch)
            .orient("left");

        var xAxis = chart.g.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(" + margins.left + "," + (height - margins.bottom) + ")")
            .call(chart.xAxis);
        var yAxis = chart.g.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
            .call(chart.yAxis);
        // Apply CSS styling
        chart.svg.selectAll([".axis path ", ".axis line"]).style(cssStyling.axis);


        chart.scoreLength = data["scorelength"][0];
        var colours = d3.scale.category20().domain(data["partcount"]);

        chart.contentArea.selectAll(selector).data(data["barlines"]).enter().append('line')
            .attr("x1", function(note) {
                return note["time"][0];
            })
            .attr("y1", 0)
            .attr("x2", function(note) {
                return note["time"][0];
            })
            .attr("y2", height)
            .attr("class", "barline")
            .style({
                "stroke": "rgb(192,192,192)",
                "stroke-width": 1
            });

        data["partdata"].forEach(function(part) {
            var colour = colours(part["partindex"]);
            var noteData = part["notedata"];

            var notes = chart.contentArea.selectAll(selector).data(noteData);
            notes.enter().append('rect')
                .attr("width", function(note) {
                    return note["duration"][0];
                })
                .attr("height", function(note) {
                    return chart.pitch.rangeBand();
                })
                .attr("x", function(note) {
                    return note["starttime"][0];
                })
                .attr("y", function(note) {
                    return chart.pitch(note["pitch"]["b12"]);
                })
                .attr("class", "note")
                .style("fill", colour);
        });

        // Hover titles
        chart.g.selectAll(".note").append("title").text(function(note) { return note["pitch"]["name"]; });

        // Build the legend
        buildLegend(chart.g, data["partnames"], colours, margins.right, margins.top, width);
    }

    function zoomTick() {
        // Scale the axes
        chart.svg.select(".x-axis").call(chart.xAxis);
        chart.svg.select(".y-axis").call(chart.yAxis);

        chart.g.selectAll(".barline")
            .attr({
                "x1": function (note) {
                    return chart.x(note["time"][0]);
                },
                "x2": function (note) {
                    return chart.x(note["time"][0]);
                }
            });
        chart.g.selectAll(".note")
            .attr({
                "width": function(note) {
                    var startPoint = note["starttime"][0];
                    return chart.x(startPoint + note["duration"][0]) - chart.x(startPoint);
                },
                "x": function(note){
                    return chart.x(note["starttime"][0]);
                }
            });
            //.attr("height", function(note) {
            //    return chart.pitch.rangeBand();
            //})
            //.attr("y", function(note) {
            //    return chart.pitch(note["pitch"]["b12"]);
            //});
    }

    /*
    Zoom Controls
     */

    var xZoomPicker = d3.select(selector).append("p")
        .append("label")
        .text("X-Zoom")
        .append("input")
        .attr({
            name: "x_zoom",
            type: "range",
            min: 1,
            max: 10,
            value: 1
        }).on("input", onPickerChange);
    var xLocationPicker = d3.select(selector).append("p")
        .append("label")
        .text("X-Location")
        .append("input")
        .attr({
            name: "x_location",
            type: "range",
            min: 0,
            max: 99,
            value: 0
        }).on("input", onPickerChange);

    /**
     * Handle the zoom and location picker input.
     */
    function onPickerChange() {
        var xZoom = xZoomPicker[0][0].value;
        var xLocation = xLocationPicker[0][0].value;
        zoomTick(xZoom, 1, xLocation);
    }

    /*
     Print Button
     */
    var printButton = d3.select(selector).append("p").append("button")
        .text("Save SVG")
        .on("click", function() {
            printToSVG(d3.select(selector).select("svg")[0][0]);
        });

    return chart;
};

d3.json("/data/piano-roll/", function(error, data) {
    if (error) throw error;
    var pianoRoll = new PianoRoll(".piano-roll", 1280, 420);
    pianoRoll(data);
});