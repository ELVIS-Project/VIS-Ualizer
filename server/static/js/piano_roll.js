
var PianoRoll = function(selector, width, height) {
    var margins = {
        top: 10,
        left: 40,
        right: 120,
        bottom: 30
    };

    var noteHeight = 4;

    chart.svg = d3.select(selector)
        .attr("width", width)
        .attr("height", height)
        .style(cssStyling.global);

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
            .domain(d3.range(data["minpitch"]["b12"], data["maxpitch"]["b12"]))
            .rangeRoundBands([0, height - margins.bottom - margins.top], 0, 0);
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

        // Construct the legend
        var legend = chart.g.append("g")
            .attr("transform", "translate(" + (width - margins.right + 10) + "," + margins.top + ")");

        var cubeSize = 10;
        for(var i = 0; i < data["partcount"]; i++) {
            legend.append("rect")
                .attr("width", cubeSize)
                .attr("height", cubeSize)
                .attr("y", i * (cubeSize + 2))
                .style("fill", colours(i));

            legend.append("text")
                .text(data["partnames"][i])
                .attr("y", i * (cubeSize + 2) + margins.top)
                .attr("x", cubeSize + 2);
        }
    }

    chart.zoomTick = function (xZoom, yZoom, xLocation) {
        // Update the x range
        chart.x.range([0, chart.scoreLength * xZoom]);

        var pixelLocation = chart.x(xLocation / 100);

        chart.g.selectAll(".x-axis")
            .call(chart.xAxis);
        chart.g.selectAll(".y-axis")
            .call(chart.yAxis);

        chart.g.selectAll(".barline")
            .attr("x1", function(note) {
                return note["time"][0] * xZoom - pixelLocation;
            })
            .attr("x2", function(note) {
                return note["time"][0] * xZoom - pixelLocation;
            });

        chart.g.selectAll(".note")
            .attr("width", function(note) {
                return note["duration"][0] * xZoom;
            })
            .attr("height", function(note) {
                return chart.pitch.rangeBand();
            })
            .attr("x", function(note) {
                return note["starttime"][0] * xZoom - pixelLocation;
            })
            .attr("y", function(note) {
                return chart.pitch(note["pitch"]["b12"]);
            });
    };

    return chart;
};

d3.json("/data/piano-roll/", function(error, data) {
    if (error) throw error;
    var pianoRoll = new PianoRoll(".piano-roll", 1280, 320);
    pianoRoll(data);

    var xZoomPicker = d3.select('input[name="x_zoom"]');
    //var yZoomPicker = d3.select('input[name="y_zoom"]');
    var xLocationPicker = d3.select('input[name="x_location"]');
    console.log(xLocationPicker);

    function onPickerChange() {
        var xZoom = xZoomPicker[0][0].value;
        //var yZoom = yZoomPicker[0][0].value;
        var xLocation = xLocationPicker[0][0].value;
        pianoRoll.zoomTick(
            xZoom,
            1,
            xLocation);
    }

    xZoomPicker.on("change", onPickerChange);
    //yZoomPicker.on("change", onPickerChange);
    xLocationPicker.on("change", onPickerChange);

    var printButton = d3.select(".save-piano-roll");
    printButton.on("click", function() {
        printToSVG(pianoRoll.svg[0][0]);
    });
});