
var HeatMap = function(selector, width, height, xAxisLabel, yAxisLabel) {
    var margin = {top: 20, right: 90, bottom: 30, left: 50};

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    chart.z = d3.scale.linear();
    chart.legend = undefined;
    chart.boxes = undefined;


    /*
    Code handling the legend
     */

    function renderLegend() {
        chart.legend.select("rect").remove();
        chart.legend.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", chart.z);
    }

    function chart(data) {
        // Get the keys as a sorted int array
        var keys = extractKeysFromMatrix(data).values().map(function(key) {
            return parseInt(key);
        }).sort(function(a, b) {
            return a - b;
        });

        var x = d3.scale.ordinal()
                .range([0, keys[5]]),
            y = d3.scale.ordinal();

        chart.z.domain(chart.colourPalettes.fruitSalad.domain)
               .range(chart.colourPalettes.fruitSalad.range);

        // Compute the scale domains.
        x.domain(keys).rangeBands([0, width]);
        y.domain(keys.reverse()).rangeBands([0, height]);

        var dataArray = [];
        for (var i = 0; i < keys.length; i++) {
            for (var j = 0; j < keys.length; j++) {
                var dataPoint = {};
                dataPoint.value = data[keys[i]][keys[j]];
                dataPoint.firstKey = keys[i];
                dataPoint.secondKey = keys[j];
                dataArray.push(dataPoint);
            }
        }

        // Display the tiles for each non-zero bucket.
        chart.boxes = chart.g.selectAll(selector).data(dataArray)
            .enter().append("rect");

        chart.boxes
            .attr("class", "tile")
            .attr("x", function(d) {
                return x(d.firstKey);
            })
            .attr("y", function(d) {
                return y(d.secondKey);
            })
            .attr("width", x.rangeBand())
            .attr("height", y.rangeBand())
            .style("fill", function(d) {
                return chart.z(d.value);
            });

        // Add a legend for the color values.
        chart.legend = chart.g.selectAll(".legend")
            .data(chart.z.ticks(20).slice(1).reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(" + (width + 20) + "," + (20 + i * 20) + ")"; });

        renderLegend();

        chart.legend.append("text")
            .attr("x", 26)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text(String);

        chart.g.append("text")
            .attr("class", "label")
            .attr("x", width + 20)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text("Value");

        // Add an x-axis with label.
        chart.g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"))
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .attr("text-anchor", "end")
            .text(xAxisLabel);

        // Add a y-axis with label.
        chart.g.append("g")
            .attr("class", "y axis")
            .call(d3.svg.axis().scale(y).orient("left"))
            .append("text")
            .attr("class", "label")
            .attr("y", 6)
            .attr("dy", ".71em")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .text(yAxisLabel);

        // Apply CSS styling
        chart.svg.selectAll([".axis path ", ".axis line"]).style(cssStyling.axis);
    }

    chart.svg = d3.select(selector)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style(cssStyling.global);

    chart.g = chart.svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("shape-rendering", "crispEdges");

    /**
     * Set the colour scheme of the heat map.
     * @param schemeName
     */
    chart.setColourScheme = function(schemeId) {
        var colourPalette = chart.colourPalettes[schemeId];
        // Quit if not valid colour palette
        if (colourPalette == undefined) return;
        chart.z.domain(colourPalette.domain).range(colourPalette.range);

        // Redraw the box colors
        chart.boxes.style("fill", function(d) {
            return chart.z(d.value);
        });

        // Render the legend
        renderLegend();
    };


    chart.colourPalettes = {
        "fruitSalad": {
            name: "Fruit Salad",
            domain: [0, 0.4, 0.65, 0.8, 1],
            range: ["#000000", "#1C3F3F", "#48941A", "#E8E20C", "#F50204"]
        },
        "flame": {
            name: "Flame",
            domain: [0, 0.5, 0.75, 0.875, 1],
            range: ["#CCCCCC", "#FFFFB2", "#FECC5C", "#FD8D3C", "#E31A1C"]
        },
        "greyscale": {
            name: "Greyscale",
            domain: [0, 1],
            range: ["#000000", "#FFFFFF"]
        },
        "deuteranopia": {
            name: "Deuteranopia",
            domain: [0, 0.25, 0.5, 0.75, 1],
            range: ["#1A1A1A", "#D4D5DB", "#003696", "#FFFC61", "#625900"]
        },
        "tritanopia": {
            name: "Tritanopia",
            domain: [0, (1.0/6.0), (2.5/6.0), (3.5/6.0), 1],
            range: ["#4D2328", "#035B5E", "#79EBFF", "#FFF0FA", "#FE1601"]
        }
    };

    return chart;
};


d3.json("/data/duet/heat/", function(error, data) {
    if (error) throw error;
    var heatMap = new HeatMap(".heat-map", 1280, 960, "Lorem", "Ipsum");
    heatMap(data);

    var colourPicker = d3.select(".heat-map-color");
    d3.keys(heatMap.colourPalettes).forEach(function(palette) {
        colourPicker.append("option")
            .attr("value", palette)
            .text(heatMap.colourPalettes[palette].name);
    });
    colourPicker.on("change", function() {
        // Grab the name of the colour scheme from the picker
        var schemeName = colourPicker[0][0].value;
        // Change the scheme
        heatMap.setColourScheme(schemeName);
    });

    var printButton = d3.select(".save-heat-map");
    printButton.on("click", function() {
        printToSVG(heatMap.svg[0][0]);
    });
});