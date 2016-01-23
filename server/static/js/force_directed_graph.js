
var ForceDirectedGraph = function(selector, width, height) {
    var circleRadius = 12;
    var maxLinkDistance = 200;

    /*
     Code handling Line Styling
     */
    chart.lineStyles = {
        curved: "Curved",
        straight: "Straight"
    };
    var lineStyle = chart.lineStyles.curved;
    chart.lineStyle = function(style) {
        if (style == undefined) {
            // Get
            return lineStyle;
        } else {
            // Set
            lineStyle = chart.lineStyles[style];
        }
    };

    function chart(data) {
        console.log("data", data);

        // Make sure the SVG is clean
        chart.svg.selectAll("*").remove();

        // Marker definitions
        var defs = chart.svg.append("defs");

        var color = d3.scale.category20();

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .size(width, height)
            .on("zoom", zoomTick);

        // Get all keys
        var keys = extractKeysFromMatrix(data);

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
                return maxLinkDistance - (link.relativeValue * maxLinkDistance) + 2.5 * circleRadius;
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
            .attr("fill", "none")
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
                            // If we don't set markerUnits, then scaling the stroke-width messes up the arrow heads
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
            .attr("stroke-width", "1px")
            .style("stroke", function(node) { return d3.rgb(color(node.name)).darker(2); })
            .style("fill", function(d) { return d3.rgb(color(d.name)).brighter(0.5); });

        var circleLabels = node
            .append("text")
            .attr("fill", function(node) { return d3.rgb(color(node.name)).darker(2); })
            .attr("transform", "translate(0, 3)")
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
            lines.attr("d", function(link) {
                var source = link["source"],
                    target = link["target"];

                if (source == target) {
                    // It's a self-link.  So, we make a little loop.
                    var originX = zoomTransformX(zoom, source.x),
                        originY = zoomTransformY(zoom, source.y),
                        loop1X = zoomTransformX(zoom, source.x + (3 * circleRadius) - (link.relativeValue * 2 * circleRadius)),
                        loopY = zoomTransformY(zoom, source.y + (3 * circleRadius) - (link.relativeValue * 2 * circleRadius)),
                        loop2X = zoomTransformX(zoom, source.x - (3 * circleRadius) + (link.relativeValue * 2 * circleRadius));

                    return "M" + originX + "," + originY + " C" + loop1X + "," + loopY + " " + loop2X + "," + loopY + " " + originX + "," + originY;
                } else {
                    if (lineStyle == chart.lineStyles.curved) {
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
                    } else {
                        return "M" + zoomTransformX(zoom, source.x)
                            + "," + zoomTransformY(zoom, source.y)
                            + " L" + zoomTransformX(zoom, target.x)
                            + "," + zoomTransformY(zoom, target.y);
                    }
                }
            });
            lineLabels.attr("transform", function(link) {
                var source = link["source"],
                    target = link["target"];

                if (source == target) {
                    return "translate(" + zoomTransformX(zoom, source.x)  + "," + zoomTransformY(zoom, source.y + ((1 - link.relativeValue) * 2.5 * circleRadius)) + ")";
                } else {
                    // Multiply determines how far from the line to draw the label.
                    var multiplier = 2;
                    if (lineStyle == chart.lineStyles.straight) {
                        multiplier = 4
                    }

                    var distanceX = (target.x - source.x) / 2,
                        distanceY = (target.y - source.y) / 2,
                        midX = ((source.x + target.x) / 2) + (-distanceY * pythag) / multiplier,
                        midY = ((source.y + target.y) / 2) + (distanceX * pythag) / multiplier;

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

        /**
         * "Search" for a particular node.  Highlight that node and the nodes
         * connected to it.
         *
         * @param searchTerm
         * @param isInbound
         * @param isOutbound
         */
        chart.search = function(searchTerm, isInbound, isOutbound) {
            // Trim whitespace
            searchTerm = searchTerm.trim();

            // Handle non-search case
            if (searchTerm == "") {
                link.attr("opacity", 1);
                node.attr("opacity", 1);
                return;
            }

            var highLightedNodes = d3.set([searchTerm]);
            // Select the nodes and those it is connected to
            link.attr("opacity", function(link) {
                var highLight = 0.1;

                if (isOutbound && link.source.name == searchTerm) {
                    highLightedNodes.add(link.target.name);
                    highLight = 1;
                }
                if (isInbound && link.target.name == searchTerm) {
                    highLightedNodes.add(link.source.name);
                    highLight = 1;
                }

                return highLight;
            });
            // We have the set of nodes to highlight.  Now, we highlight them.
            node.attr("opacity", function(node) {
                if (highLightedNodes.has(node.name)) {
                    return 1;
                } else {
                    return 0.1;
                }
            });
        };
    }

    chart.svg = d3.select(selector)
        .attr("width", width)
        .attr("height", height)
        .style(cssStyling.global)
        .attr("text-anchor", "middle");

    return chart;
};

var selector = ".force-directed-graph";
var forceDirectedGraph = new ForceDirectedGraph(selector, 1600, 900);

var lineStylePicker = d3.select(".force-directed-graph-lines");
d3.keys(forceDirectedGraph.lineStyles).forEach(function(style) {
    lineStylePicker.append("option")
        .attr("value", style)
        .text(forceDirectedGraph.lineStyles[style]);
});
lineStylePicker.on("change", function() {
    forceDirectedGraph.lineStyle(lineStylePicker[0][0].value);
});

var search = d3.select(".force-directed-graph-search");
search.on("submit", function() {
    d3.event.preventDefault();
    console.log(search);
    var value = search[0][0][0].value,
        isInbound = search[0][0][1].checked,
        isOutbound = search[0][0][2].checked;
    console.log(isInbound, isOutbound);
    forceDirectedGraph.search(value, isInbound, isOutbound);
});

var printButton = d3.select(".save-force-directed-graph");
printButton.on("click", function() {
    printToSVG(forceDirectedGraph.svg[0][0]);
});

var dataPicker = d3.select(".force-directed-graph-data");
dataPicker.on("change", function() {
    var value = dataPicker[0][0].value;
    var dataUrl = "/data/ave-maria/" + value + "/";
    forceDirectedGraphLoad(dataUrl);
});


function forceDirectedGraphLoad(dataSource) {
    d3.json(dataSource, function(error, data) {
        if (error) throw error;
        forceDirectedGraph(data);
    });
}

forceDirectedGraphLoad("/data/ave-maria/alto/");