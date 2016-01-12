
var ForceDirectedGraph = function(selector, width, height) {
    function chart(data) {
        var nodes = data.nodes.slice(),
            links = [],
            bilinks = [];

        data.links.forEach(function(link) {
            var s = nodes[link.source],
                t = nodes[link.target],
                i = {}; // intermediate node
            nodes.push(i);
            links.push({source: s, target: i}, {source: i, target: t});
            bilinks.push([s, i, t]);
        });

        chart.force
            .nodes(nodes)
            .links(links)
            .start();

        var link = chart.svg.selectAll(".link")
            .data(bilinks)
            .enter().append("path")
            .attr("class", "link");

        var node = chart.svg.selectAll(".node")
            .data(data.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return chart.color(d.group); })
            .call(chart.force.drag);

        node.append("title")
            .text(function(d) { return d.name; });

        chart.force.on("tick", function() {
            link.attr("d", function(d) {
                return "M" + d[0].x + "," + d[0].y
                    + "S" + d[1].x + "," + d[1].y
                    + " " + d[2].x + "," + d[2].y;
            });
            node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });
    }

    chart.color = d3.scale.category20();
    chart.force = d3.layout.force()
        .linkDistance(10)
        .linkStrength(2)
        .size([width, height]);

    chart.svg = d3.select(selector)
        .attr("width", width)
        .attr("height", height);

    return chart;
};


d3.json("/force-directed-graph/", function(error, data) {
    if (error) throw error;

    var forceDirectedGraph = new ForceDirectedGraph(".force-directed-graph", 960, 500);
    forceDirectedGraph(data);
});