

var BarGraph = function(selector, width, height) {
    this.margin = {top: 20, right: 30, bottom: 30, left: 40};

    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.left - this.margin.right;

    this.x = d3.scale.ordinal()
        .rangeRoundBands([0, this.width], .1);

    this.y = d3.scale.linear()
        .range([this.height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    this.chart = d3.select(selector)
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
};


/**
 * Load the bar graph data from the server, and render it if successful.
 */
d3.json("/graph/grouped/", function(error, data) {
    var barGraph = new BarGraph(".bar-graph-grouped", 640, 320);

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
    barGraph.x.domain(data.map(function(d) { return d.group_label; }));
    //barGraph.x.domain(labels.values());
    // Map y-axis values
    barGraph.y.domain([0, maxValue]);

    barGraph.chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + barGraph.height + ")")
        .call(barGraph.xAxis);

    barGraph.chart.append("g")
        .attr("class", "y axis")
        .call(barGraph.yAxis);

    data.forEach(function(group) {
        console.log("group", group);

        var groupOffset = barGraph.x(group.group_label);
        // Get the group labels
        var groupLabels = d3.map(group.group_members, function(d) { return d.label; }).keys();

        // The ordinal of this group        // The ordinal of this group
        var o = d3.scale.ordinal()
            .domain(groupLabels)
            .rangeBands([0, barGraph.x.rangeBand()]);

        var groupArea = barGraph.chart.append("g")
            .attr("label", group.group_label)
            .attr("class", "group")
            .attr("height", barGraph.height)
            .attr("width", barGraph.x.rangeBand())
            .attr("x", barGraph.x(group.group_label));


        groupArea.selectAll(".group")
            .data(group.group_members)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return groupOffset + o(d.label) })
            .attr("y", function(d) { return barGraph.y(d.value); })
            .attr("fill", function(d) { console.log(d); return colors(d.label) })
            .attr("height", function(d) { return barGraph.height - barGraph.y(d.value); })
            .attr("width", o.rangeBand());
    });
});
