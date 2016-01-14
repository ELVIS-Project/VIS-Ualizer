
var ForceDirectedGraph = function(selector, width, height) {
    var circleRadius = 5;

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
        keys.forEach(function(sourceKey) {
            keys.forEach(function(targetKey) {
                var value = parseFloat(data[sourceKey][targetKey]);
                if (value > 0) {
                    var i = {},
                        source = keyNodeMapping[sourceKey],
                        target = keyNodeMapping[targetKey];
 
                    links.push({source: source, target: target, value: value});
                }
            });
        });

        // Calculate the normalized values (that we will use to colour the lines
        var linkValues = links.map(function(link) { return link.value }),
            maxLinkValue = d3.min(linkValues),
            minLinkValue = d3.max(linkValues);
        links.forEach(function(link) {
            link["relativeValue"] = (link.value - minLinkValue) / (maxLinkValue - minLinkValue);
        });


        console.log("keys:", keys, "nodes:", nodes, "links:", links);

        var force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([width, height])
            .linkStrength(0.05)
            //.friction(0.9)
            .linkDistance(100)
            .charge(-30)
            .gravity(0.01)
            .theta(0.4)
            .alpha(0.2)
            .start();

        var link = chart.svg.selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("stroke", function(link) { var n = parseInt(192 - link.relativeValue * 128); return "rgb(" + n + "," + n + "," + n + ")" });

        var node = chart.svg.selectAll(".node")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("alt", function(d) { return d.name })
            .attr("r", circleRadius)
            .style("fill", function(d) { return chart.color(d.name); })
            .call(force.drag);

        var pythag = Math.sqrt(3) / 2;
        force.on("tick", function() {
            link.attr("d", function(d) {
                var source = d["source"],
                    target = d["target"];

                if (source == target) {
                    // It's a self-link.  So, we make a little loop.
                    var r = 5;
                    return 'M '+source.x + circleRadius +' '+source.y + circleRadius +' m 0, 0 a '+r+','+r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0';
                } else {
                    var distanceX = (target.x - source.x) / 2,
                        distanceY = (target.y - source.y) / 2,
                        midX = ((source.x + target.x) / 2) + (-distanceY * pythag),
                        midY = ((source.y + target.y) / 2) + (distanceX * pythag);

                    return "M" + source.x + " " + source.y + " Q " + midX + " " + midY + " " + target.x + " " + target.y;
                }
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