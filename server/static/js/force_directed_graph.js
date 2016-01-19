
var ForceDirectedGraph = function(selector, width, height) {
    var circleRadius = 12;
    var maxLinkDistance = 200;

    function chart(data) {
        console.log("data", data);

        // Marker definitions
        var defs = chart.svg.append("defs");

        var color = d3.scale.category20();

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .size(width, height)
            .on("zoom", zoomTick);

        //var keys = d3.keys(data);
        var keys = d3.set(d3.keys(data));
        keys.forEach(function(key) {
            d3.keys(data[key]).forEach(function (newKey) {
                keys.add(newKey);
            });
        });

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
                // It could theoretically be undefined
                if (data[sourceKey]) {
                    var value = parseFloat(data[sourceKey][targetKey]);
                    if (value > 0) {
                        var i = {},
                            source = keyNodeMapping[sourceKey],
                            target = keyNodeMapping[targetKey];

                        links.push({source: source, target: target, value: value});
                    }
                }
            });
        });

        // Calculate the normalized values (that we will use to colour the lines
        var linkValues = links.map(function(link) { return link.value }),
            minLinkValue = d3.min(linkValues),
            maxLinkValue = d3.max(linkValues);
        links.forEach(function(link) {
            link["relativeValue"] = (link.value - minLinkValue) / (maxLinkValue - minLinkValue);
        });


        console.log("keys:", keys, "nodes:", nodes, "links:", links);

        var force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([width, height])
            .linkStrength(function(link) {
                return 1;
                //return link.relativeValue;
            })
            //.friction(0.9)
            .linkDistance(function(link) {
                // Stronger links are closer
                return maxLinkDistance - (link.relativeValue * maxLinkDistance);
            })
            .charge(-20)
            .gravity(0.01)
            .theta(0.4)
            .alpha(0.2)
            .start();

        var link = chart.svg.selectAll(".link")
            .data(links)
            .enter()
            .append("g");


        // The set of names for the line arrowheads
        var arrowNames = d3.set();
        var lines = link.append("path")
            .attr("class", "link")
            .attr("stroke", function(link) { return d3.rgb(color(link.source.name)).darker(1); })
            //.attr("stroke", function(link) { var n = parseInt(192 - link.relativeValue * 128); return "rgb(" + n + "," + n + "," + n + ")" })
            //.attr("stroke-width", function(link) { return (0.75 + (0.25 * link.relativeValue)); })
            .attr("stroke-width", function(link) {
                return 1 + link.relativeValue;
            })
            .attr("marker-fill", function(link) { var n = parseInt(192 - link.relativeValue * 128); return "rgb(" + n + "," + n + "," + n + ")" })
            .attr("marker-end", function(link) {
                var colour = d3.rgb(color(link.source.name)).darker(1);
                var arrowName = "arrow" + colour.toString().substring(1);

                if (!arrowNames.has(arrowName)) {
                    // Create an arrowhead of the specified colour
                    arrowNames.add(arrowName);

                    defs.append("marker")
                        .attr({
                            "id": arrowName,
                            "viewBox":"0 -5 10 10",
                            "refX": 20,
                            "refY":0,
                            "markerWidth":10,
                            "markerHeight":10,
                            "orient":"auto",
                            "fill": colour,
                            "markerUnits": "userSpaceOnUse"
                        })
                        .append("path")
                        .attr("d", "M0,-5L10,0L0,5")
                        .attr("class","arrowHead");
                }

                return "url(#" + arrowName + ")";
            })
            .style("opacity", function(link) { return 0.5 + 0.5 * link.relativeValue; });

        var node = chart.svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g");


        var circles = node
            .append("circle")
            .attr("class", "node")
            .attr("alt", function(d) { return d.name })
            .attr("r", circleRadius)
            .style("stroke", function(node) { return d3.rgb(color(node.name)).darker(2); })
            .style("fill", function(d) { return d3.rgb(color(d.name)).brighter(0.5); });

        var circleLabels = node
            .append("text")
            .attr("fill", function(node) { return d3.rgb(color(node.name)).darker(2); })
            .attr("transform", "translate(-3, 3)")
            .text(function(node) { return node.name });

        var lineLabels = link
            .append("text")
            .style("fill", function(link) { return d3.rgb(color(link.source.name)).darker(2); })
            //.attr("fill", function(link) { var n = parseInt(192 - link.relativeValue * 128); return "rgb(" + n + "," + n + "," + n + ")" })
            .text(function(link) { return link.value })
            .style("opacity", function(link) { return 0.5 + 0.5 * link.relativeValue; });

        // Invoke force
        node.call(force.drag);

        var pythag = Math.sqrt(3) / 2;


        function zoomTick() {
            //node.selectAll("circle").attr("r", circleRadius * zoom.scale());
            //node.selectAll("text").attr("transform", "translate(0, " + zoom.scale() * 2 * circleRadius + ")");

            tick();
        }
        function tick() {
            node.attr("transform", function(d) {
                return "translate(" + zoomTransformX(zoom, d.x) + "," + zoomTransformY(zoom, d.y) + ")";
            });

            var r = zoom.scale() * 5;
            lines.attr("d", function(d) {
                var source = d["source"],
                    target = d["target"];

                if (source == target) {
                    // It's a self-link.  So, we make a little loop.
                    var originX = zoomTransformX(zoom, source.x),
                        originY = zoomTransformY(zoom, source.y),
                        loop1X = zoomTransformX(zoom, source.x + (3 * circleRadius)),
                        loopY = zoomTransformY(zoom, source.y + (3 * circleRadius)),
                        loop2X = zoomTransformX(zoom, source.x - (3 * circleRadius));

                    return "M" + originX + "," + originY + " C" + loop1X + "," + loopY + " " + loop2X + "," + loopY + " " + originX + "," + originY;
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
            lineLabels.attr("transform", function(link) {
                var source = link["source"],
                    target = link["target"];

                if (source == target) {
                    return "translate(" + zoomTransformX(zoom, source.x)  + "," + zoomTransformY(zoom, source.y + 2.25 * circleRadius) + ")";
                } else {
                    var distanceX = (target.x - source.x) / 2,
                        distanceY = (target.y - source.y) / 2,
                        midX = ((source.x + target.x) / 2) + (-distanceY * pythag) / 2,
                        midY = ((source.y + target.y) / 2) + (distanceX * pythag) / 2;

                    return "translate(" + zoomTransformX(zoom, midX) + "," + zoomTransformY(zoom, midY) + ")";
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