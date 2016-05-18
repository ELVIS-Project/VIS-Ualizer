var BarGraph = function(selector, width, height)
{
    var margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
    };


    // Which sort we're using
    var sort = {
        value: SortEnum.label,
        direction: SortDirectionEnum.ascending
    };

    var computedWidth = width - margin.left - margin.right,
        computedHeight = height - margin.left - margin.right;

    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, computedWidth], .1);

    var yScale = d3.scale.linear()
        .range([computedHeight, 0]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    var sortComparator = function(a,b)
    {
        var aValue, bValue;

        if (sort.value === SortEnum.value)
        {
            aValue = a.value;
            bValue = b.value;
        }
        else
        {
            aValue = a.label;
            bValue = b.label;
        }

        if (sort.direction === SortDirectionEnum.ascending)
        {
            return d3.ascending(aValue, bValue);
        }
        else
        {
            return d3.descending(aValue, bValue);
        }
    };
    var colours = undefined;

    function chart(data)
    {
        // Back up the data
        chart.data = data;
        // Make sure the SVG is clean
        chart.g.selectAll("*").remove();

        var labels = d3.map(data,
            function(d)
            {
                return d.label
            }).keys();
        // We only set colours the once
        if (!colours)
        {
            colours = d3.scale.category20().domain(labels);
        }

        // Sort the data
        data = data.sort(sortComparator);


        // Map x-axis labels
        xScale.domain(
            data.map(function(d)
            {
                return d.label;
            }
        ));
        // Map y-axis values
        yScale.domain([0, d3.max(data,
            function(d)
            {
                return d.value;
            }
        )]);

        // Draw the axes
        drawAxisLines(chart.g, xAxis, yAxis, computedHeight, 0, 0, 0);

        var bars = chart.g.append("g")
            .attr("class", "bars")
            .selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x",
                function(d)
                {
                    return xScale(d.label);
                }
            )
            .attr("y",
                function(d)
                {
                    return yScale(d.value);
                }
            )
            .attr("fill",
                function(d)
                {
                    return colours(d.label);
                }
            )
            .attr("height",
                function(d)
                {
                    return computedHeight - yScale(d.value);
                }
            )
            .attr("width", xScale.rangeBand())
            .style(cssStyling.bar);
    }

    chart.svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style(cssStyling.global);

    chart.g = chart.svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function attachSortChooser(selector)
    {
        var parent = d3.select(selector)
            .append("p")
            .append("label")
            .text("Sort: ");

        var sortChooser = parent.append("select");
        sortChooser.append("option")
            .attr("value", "label")
            .text("Label");
        sortChooser.append("option")
            .attr("value", "value")
            .text("Value");
        sortChooser.on("change", function()
        {
            if (this.value == "label")
            {
                sort.value = SortEnum.label;
            }
            else
            {
                sort.value = SortEnum.value;
            }

            chart(chart.data);
        });

        var directionChooser = parent.append("select");
        directionChooser.append("option")
            .attr("value", "asc")
            .text("Asc");
        directionChooser.append("option")
            .attr("value", "desc")
            .text("Desc");
        directionChooser.on("change", function()
        {
            if (this.value == "asc")
            {
                sort.direction = SortDirectionEnum.ascending;
            }
            else
            {
                sort.direction = SortDirectionEnum.descending;
            }
            chart(chart.data);
        });

    }

    // GUI components
    attachPrintButton(selector, d3.select(selector).select("svg")[0][0]);
    attachSortChooser(selector);

    return chart;
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/", function(error, data)
{
    var barGraph = new BarGraph(".bar-graph", 640, 320);
    barGraph(data);
});
