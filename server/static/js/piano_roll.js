
var PianoRoll = function(selector, width, height) {

    var noteHeight = 4;

    chart.svg = d3.select(selector)
        .attr("width", width)
        .attr("height", height)
        .style(cssStyling.global);

    chart.g = chart.svg
        .append("g")
        .attr("shape-rendering", "crispEdges");

    function chart(data) {
        // Build axes
        chart.x = d3.scale.linear().range([0, data["scorelength"][0]]);

        console.log(chart.x(0.5));

        chart.scoreLength = data["scorelength"][0];
        var colours = d3.scale.category10().domain(data["partcount"]);

        // For now, we will merge all of the parts into a single array of blocks.
        console.log(data["barlines"]);

        chart.g.selectAll(selector).data(data["barlines"]).enter().append('line')
            .attr("x1", function(note) {
                return note["time"][0];
            })
            .attr("y1", 0)
            .attr("x2", function(note) {
                return note["time"][0];
            })
            .attr("y2", height)
            .style({
                "stroke": "rgb(192,192,192)",
                "stroke-width": 1
            });

        data["partdata"].forEach(function(part) {
            var colour = colours(part["partindex"]);
            var noteData = part["notedata"];

            console.log(colour, noteData);
            chart.notes = chart.g.selectAll(selector).data(noteData);

            chart.notes.enter().append('rect')
                .attr("height", noteHeight)
                .attr("width", function(note) {
                    return note["duration"][0];
                })
                .attr("x", function(note) {
                    return note["starttime"][0];
                })
                .attr("y", function(note) {
                    return note["pitch"]["b12"] * noteHeight;
                })
                .style("fill", colour);
        });
    }

    chart.zoomTick = function (xZoom, yZoom, xLocation) {
        console.log(xZoom, yZoom, xLocation);
        // Update the x range
        chart.x.range([0, chart.scoreLength * xZoom]);

        var pixelLocation = chart.x(xLocation / 100);

        chart.g.selectAll("line") 
            .attr("x1", function(note) {
                return note["time"][0] * xZoom - pixelLocation;
            })
            .attr("x2", function(note) {
                return note["time"][0] * xZoom - pixelLocation;
            });

        chart.g.selectAll("rect")
            .attr("width", function(note) {
                return note["duration"][0] * xZoom;
            })
            .attr("height", function(note) {
                return noteHeight * yZoom;
            })
            .attr("x", function(note) {
                return note["starttime"][0] * xZoom - pixelLocation;
            })
            .attr("y", function(note) {
                return note["pitch"]["b12"] * noteHeight * yZoom;
            })
    };

    return chart;
};

d3.json("/data/piano-roll/", function(error, data) {
    if (error) throw error;
    var pianoRoll = new PianoRoll(".piano-roll", 1280, 640);
    pianoRoll(data);

    var xZoomPicker = d3.select('input[name="x_zoom"]');
    var yZoomPicker = d3.select('input[name="y_zoom"]');
    var xLocationPicker = d3.select('input[name="x_location"]');
    console.log(xLocationPicker);

    function onPickerChange() {
        var xZoom = xZoomPicker[0][0].value;
        var yZoom = yZoomPicker[0][0].value;
        var xLocation = xLocationPicker[0][0].value;
        pianoRoll.zoomTick(xZoom, yZoom, xLocation);
    }

    xZoomPicker.on("change", onPickerChange);
    yZoomPicker.on("change", onPickerChange);
    xLocationPicker.on("change", onPickerChange);

    var printButton = d3.select(".save-heat-map");
    printButton.on("click", function() {
        printToSVG(pianoRoll.svg[0][0]);
    });
});