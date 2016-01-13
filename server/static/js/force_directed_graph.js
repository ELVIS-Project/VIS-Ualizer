
var ForceDirectedGraph = function(selector, width, height) {
    function chart(data) {
        console.log("test: ", data);

        var keys = d3.keys(data);

        var keyNodeMapping = {};

        var nodes = [],
            links = [];

        keys.forEach(function(key) {
            var node = {
                name: key
            };

            keyNodeMapping[key] = node;
            nodes.push(node);
        });

        // Build the links
        keys.forEach(function(source) {
            keys.forEach(function(target) {
                if (data[source][target] > 0) {
                    links.push({source: keyNodeMapping[source], target: keyNodeMapping[target]});
                }
            });
        });

        console.log("keys:", keys, "nodes:", nodes, "links:", links);

        var force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([width, height])
            .linkStrength(0.05)
            //.friction(0.9)
            .linkDistance(30)
            .charge(-30)
            .gravity(0.1)
            .theta(0.4)
            .alpha(0.2)
            .start();

        var link = chart.svg.selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("marker-end", "url(#arrow)"); // Add the arrowhead

        var node = chart.svg.selectAll(".node")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("alt", function(d) { return d.name })
            .attr("r", 5)
            .style("fill", function(d) { return chart.color(d.name); })
            .call(force.drag);

        force.on("tick", function() {
            link.attr("d", function(d) {
                var source = d["source"],
                    target = d["target"];
                return "M" + source.x + "," + source.y + "S" + source.x + "," + source.y + " " + target.x + "," + target.y;
            });

            node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });
    }

    chart.color = d3.scale.category20();


    chart.svg = d3.select(selector)
        .attr("width", width)
        .attr("height", height);

    return chart;
};


d3.json("/data/ave-maria/", function(error, data) {
    if (error) throw error;

    var forceDirectedGraph = new ForceDirectedGraph(".force-directed-graph", 640, 320);
    forceDirectedGraph(data);
});