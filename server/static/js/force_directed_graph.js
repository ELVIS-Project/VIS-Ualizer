
var ForceDirectedGraph = function(selector, width, height) {
    var circleRadius = 10;
    var maxLinkDistance = 200;

    function chart(data) {
        var color = d3.scale.category20();

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .size(width, height)
            .on("zoom", zoomTick);

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
            .linkStrength(function(link) {
                return link.relativeValue;
            })
            //.friction(0.9)
            .linkDistance(function(link) {
                // Stronger links are closer
                return maxLinkDistance - (link.relativeValue * 0.5 * maxLinkDistance);
            })
            .charge(-60)
            .gravity(0.01)
            .theta(0.4)
            .alpha(0.2)
            .start();

        var link = chart.svg.selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("stroke", function(link) { var n = parseInt(192 - link.relativeValue * 128); return "rgb(" + n + "," + n + "," + n + ")" })
            .attr("stroke-width", function(link) { return 0.75 + (0.25 * link.relativeValue); });

        var node = chart.svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g");


        var circles = node
            .append("circle")
            .attr("class", "node")
            .attr("alt", function(d) { return d.name })
            .attr("r", circleRadius)
            .style("stroke", function(node) { return d3.rgb(chart.color(node.name)).darker(); })
            .style("fill", function(d) { return chart.color(d.name); });

        var text = node
            .append("text")
            .attr("fill", function(node) { return d3.rgb(chart.color(node.name)).darker(); })
            .attr("transform", "translate(0, " + 2 * circleRadius + ")")
            .text(function(node) { return node.name });


        // Invoke force
        node.call(force.drag);

        var pythag = Math.sqrt(3) / 2;


        function zoomTick() {
            node.selectAll("circle").attr("r", circleRadius * zoom.scale());
            node.selectAll("text").attr("transform", "translate(0, " + zoom.scale() * 2 * circleRadius + ")");

            tick();
        }
        function tick() {
            node.attr("transform", function(d) {
                return "translate(" + zoomTransformX(zoom, d.x) + "," + zoomTransformY(zoom, d.y) + ")";
            });

            link.attr("d", function(d) {
                var source = d["source"],
                    target = d["target"];

                if (source == target) {
                    // It's a self-link.  So, we make a little loop.
                    var r = zoom.scale() * 5;
                    return 'M '+ zoomTransformX(zoom, source.x) +' '
                        + zoomTransformY(zoom, source.y) + 2*circleRadius
                        +' m ' + zoom.scale() * circleRadius + ', 0 a '+r+','
                        +r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0';
                } else {
                    var distanceX = (target.x - source.x) / 2,
                        distanceY = (target.y - source.y) / 2,
                        midX = ((source.x + target.x) / 2) + (-distanceY * pythag),
                        midY = ((source.y + target.y) / 2) + (distanceX * pythag);

                    return "M" + zoomTransformX(zoom, source.x) + " "
                        + zoomTransformY(zoom, source.y) + " Q "
                        + zoomTransformX(zoom, midX) + " "
                        + zoomTransformY(zoom, midY) + " "
                        + zoomTransformX(zoom, target.x) + " "
                        + zoomTransformY(zoom, target.y);
                }
            });
        }

        force.on("tick", tick);

        // Don't have panning
        chart.svg.call(zoom)
            .on("mousedown.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null);

    }

    chart.svg = d3.select(selector)
        .attr("width", width)
        .attr("height", height);

    return chart;
};


d3.json("/data/ave-maria/", function(error, data) {
    if (error) throw error;

    var forceDirectedGraph = new ForceDirectedGraph(".force-directed-graph", 960, 640);
    forceDirectedGraph(data);
});