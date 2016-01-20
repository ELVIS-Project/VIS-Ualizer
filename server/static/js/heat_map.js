
var HeatMap = function(selector, width, height) {
    var margin = {top: 20, right: 90, bottom: 30, left: 50};

    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    function chart(data) {
        // Get the keys as a sorted int array
        var keys = extractKeysFromMatrix(data).values().map(function(key) {
            return parseInt(key);
        }).sort(function(a, b) {
            return a - b;
        });

        var x = d3.scale.ordinal()
                .range([0, keys[5]]),
            y = d3.scale.ordinal(),
            z = d3.scale.linear()
                .domain([0, 0.4, 0.65, 0.8 ,1])
                .range(["#000000", "#1C3F3F", "#48941A", "#E8E20C", "#F50204"]);

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
        chart.svg.selectAll(selector).data(dataArray)
            .enter().append("rect")
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
                return z(d.value);
            });

        // Add a legend for the color values.
        var legend = chart.svg.selectAll(".legend")
            .data(z.ticks(20).slice(1).reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(" + (width + 20) + "," + (20 + i * 20) + ")"; });

        legend.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", z);

        legend.append("text")
            .attr("x", 26)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text(String);

        chart.svg.append("text")
            .attr("class", "label")
            .attr("x", width + 20)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text("Value");

        // Add an x-axis with label.
        chart.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"))
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .attr("text-anchor", "end")
            .text("X-Axis");

        // Add a y-axis with label.
        chart.svg.append("g")
            .attr("class", "y axis")
            .call(d3.svg.axis().scale(y).orient("left"))
            .append("text")
            .attr("class", "label")
            .attr("y", 6)
            .attr("dy", ".71em")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .text("Y-Axis");
    }

    chart.svg = d3.select(selector)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return chart;
};


d3.json("/data/duet/heat/", function(error, data) {
    if (error) throw error;
    var heatMap = new HeatMap(".heat-map", 960, 640);
    heatMap(data);
});