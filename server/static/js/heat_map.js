
var HeatMap = function(selector, width, height) {
    var margin = {top: 20, right: 90, bottom: 30, left: 50};

    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    // The size of the data in the CSV data file.
    // This could be inferred from the data if it weren't sparse.
    var xStep = 200,
        yStep = 100;

    function chart(data) {
        // Get the keys as a sorted int array
        var keys = extractKeysFromMatrix(data).values().map(function(key) {
            return parseInt(key);
        }).sort(function(a, b) {
            return a - b;
        });

        console.log("keys:", keys);

        // Coerce the CSV data to the appropriate types.
        //data.forEach(function(d) {
        //    d.date = parseDate(d.date);
        //    d.bucket = +d.bucket;
        //    d.count = +d.count;
        //});

        var x = d3.scale.ordinal().range([0, keys[5]]),
        //.range([0, width]),
            y = d3.scale.ordinal(),
        //.range([height, 0]),
            z = d3.scale.linear().range(["white", "steelblue"]);

        // Compute the scale domains.
        //x.domain(d3.extent(data, function(d) { return d.date; }));
        x.domain(keys).rangeBands([0, width]);
        y.domain(keys.reverse()).rangeBands([0, height]);
        z.domain([0, 1]);

        console.log("x domain:", x.domain());

        //y.domain(d3.extent(data, function(d) { return d.bucket; }));
        //z.domain([0, d3.max(data, function(d) { return d.count; })]);

        //// Extend the x- and y-domain to fit the last bucket.
        //// For example, the y-bucket 3200 corresponds to values [3200, 3300].
        //x.domain([x.domain()[0], +x.domain()[1] + xStep]);
        //y.domain([y.domain()[0], y.domain()[1] + yStep]);


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

        console.log("dataArray:", dataArray);


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
            .data(z.ticks(6).slice(1).reverse())
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