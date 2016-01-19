

var BarGraphGrouped = function(selector, width, height) {

    var margin = {top: 20, right: 30, bottom: 30, left: 40};

    function chart(data) {
        // Get all labels
        var labels = d3.set();
        data.forEach(function(group) {
            group.group_members.forEach(function(bar) {
                labels.add(bar.label);
            });
        });

        var colors = d3.scale.category20().domain(labels.values());

        var maxValue = d3.max(data,
            function(d) {
                return d3.max(d.group_members, function(member) {
                    return member.value;
                })
            }
        );

        // Maximum number of members per group
        var maxWidth = d3.max(data,
            function(d) {
                return d.group_members.length;
            }
        );

        // Map x-axis labels
        chart.x.domain(data.map(function(d) { return d.group_label; }));
        //chart.x.domain(labels.values());
        // Map y-axis values
        chart.y.domain([0, maxValue]);

        chart.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .call(chart.xAxis);

        chart.svg.append("g")
            .attr("class", "y axis")
            .call(chart.yAxis);

        data.forEach(function(group) {
            console.log("group", group);

            var groupOffset = chart.x(group.group_label);
            // Get the group labels
            var groupLabels = d3.map(group.group_members, function(d) { return d.label; }).keys();

            // The ordinal of this group        // The ordinal of this group
            var o = d3.scale.ordinal()
                .domain(groupLabels)
                .rangeBands([0, chart.x.rangeBand()]);

            var groupArea = chart.svg.append("g")
                .attr("label", group.group_label)
                .attr("class", "group")
                .attr("height", chart.height)
                .attr("width", chart.x.rangeBand())
                .attr("x", chart.x(group.group_label));


            groupArea.selectAll(".group")
                .data(group.group_members)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return groupOffset + o(d.label) })
                .attr("y", function(d) { return chart.y(d.value); })
                .attr("fill", function(d) { console.log(d); return colors(d.label) })
                .attr("height", function(d) { return chart.height - chart.y(d.value); })
                .attr("width", o.rangeBand());
        });
    }

    chart.width = width - margin.left - margin.right;
    chart.height = height - margin.left - margin.right;

    chart.x = d3.scale.ordinal()
        .rangeRoundBands([0, chart.width], .1);

    chart.y = d3.scale.linear()
        .range([chart.height, 0]);

    chart.xAxis = d3.svg.axis()
        .scale(chart.x)
        .orient("bottom");

    chart.yAxis = d3.svg.axis()
        .scale(chart.y)
        .orient("left");

    chart.svg = d3.select(selector)
        .attr("width", chart.width + margin.left + margin.right)
        .attr("height", chart.height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return chart;
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/grouped/", function(error, data) {
    var barGraphGrouped = new BarGraphGrouped(".bar-graph-grouped", 640, 320);
    barGraphGrouped(data);
});