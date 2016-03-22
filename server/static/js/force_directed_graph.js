
var ForceDirectedGraph = function(selector, width, height) {
    var circleRadius = 12;
    var maxLinkDistance = 200;

    /*
    Private fields
     */
    var lines = {};
    var lineLabels = {};

    /*
     Code handling Line Styling
     */
    var lineStyles = {
        curved: "Curved",
        straight: "Straight"
    };
    var lineStyle = lineStyles.curved;
    chart.lineStyle = function(style) {
        if (style == undefined) {
            // Get
            return lineStyle;
        } else {
            // Set
            lineStyle = lineStyles[style];
        }
        chart.tick();
    };

    chart.svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style(cssStyling.global)
        .attr("text-anchor", "middle");

    /**
     * Control whether or not opacity is enabled globally.
     *
     * @type {{disable: opacityController.disable, enable: opacityController.enable}}
     */
    var opacityController = {
        disable: function() {
            // Make everything opaque
            lines.style("opacity", null);
            lineLabels.style("opacity", null);
        },
        enable: function () {
            lines.style("opacity", function(link) { return 0.5 + 0.5 * link.relativeValue; });
            lineLabels.style("opacity", function(link) { return 0.5 + 0.5 * link.relativeValue; });
        }
    };

    var constructForceController = function(nodes, links) {
        return d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([width, height])
            .linkStrength(1)
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
    };

    /**
     * Attach normalized values for the links between 0 and 1.
     *
     * @param links
     */
    var calculateNormalizedLinkValues = function(links) {
        // Calculate the normalized values (that we will use to colour the lines
        var linkValues = links.map(function(link) { return link.value }),
            minLinkValue = d3.min(linkValues),
            maxLinkValue = d3.max(linkValues);
        links.forEach(function(link) {
            link["relativeValue"] = (link.value - minLinkValue) / (maxLinkValue - minLinkValue);
        });
    };

    /**
     * Build the links.
     *
     * @param keys
     * @param links
     * @param data
     * @param keyNodeMapping
     */
    var buildLinks = function(keys, links, data, keyNodeMapping) {
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
    };

    /**
     * Draw the line labels from data embedded in the parent objects.
     *
     * @param parent
     * @param colours
     */
    var drawLineLabels = function(parent, colours) {
        lineLabels = parent
            .append("text")
            .style("fill", function(link) {
                return d3.rgb(colours(link.source.name)).darker(2);
            })
            .attr("fill", function(link) {
                var n = parseInt(192 - link.relativeValue * 128);
                return "rgb(" + n + "," + n + "," + n + ")";
            })
            .text(function(link) {
                return link.value;
            });
    };

    /**
     * Draw and return the arrows from node to node.
     *
     * @param parent
     * @param defs
     * @param colours
     * @returns {*}
     */
    var drawArrows = function(parent, defs, colours) {
        var arrowNames = d3.set();
        return parent.append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", function(link) {
                return d3.rgb(colours(link.source.name)).darker(1);
            })
            .attr("stroke-width", function(link) {
                return 1 + link.relativeValue;
            })
            .attr("marker-fill", function(link) {
                var n = parseInt(192 - link.relativeValue * 128);
                return "rgb(" + n + "," + n + "," + n + ")"
            })
            .attr("marker-end", function(link) {
                var colour = d3.rgb(colours(link.source.name)).darker(1);
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
            });
    };

    var drawNodes = function(parent, nodes, colours) {
        var node = parent.append("g").attr("name", "nodes")
            .selectAll(".node")
            .data(nodes)
            .enter()
            .append("g");
        // Create the circles
        node.append("circle")
            .attr("class", "node")
            .attr("alt", function(d) { return d.name })
            .attr("r", circleRadius)
            .attr("stroke-width", "1px")
            .style("stroke", function(node) { return d3.rgb(colours(node.name)).darker(2); })
            .style("fill", function(d) { return d3.rgb(colours(d.name)).brighter(0.5); });
        // Create the circle labels
        node.append("text")
            .attr("fill", function(node) { return d3.rgb(colours(node.name)).darker(2); })
            .attr("transform", "translate(0, 3)")
            .text(function(node) { return node.name });
        return node;
    };

    function chart(data) {
        // Make sure the SVG is clean
        chart.svg.selectAll("*").remove();

        // Marker definitions
        var defs = chart.svg.append("defs");
        var colour = d3.scale.category20();
        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .size(width, height)
            .on("zoom", chart.tick);

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

        buildLinks(keys, links, data, keyNodeMapping);

        // Include link strength values normalized from 0 to 1.
        calculateNormalizedLinkValues(links);

        var force = constructForceController(nodes, links);

        var linkVectors = chart.svg.append("g").attr("name", "links")
            .selectAll(".link")
            .data(links)
            .enter()
            .append("g");

        // Draw the arrows
        lines = drawArrows(linkVectors, defs, colour);
        drawLineLabels(linkVectors, colour);
        var node = drawNodes(chart.svg, nodes, colour, force);
        // Invoke force
        node.call(force.drag);

        // Enable opacity
        opacityController.enable();

        /*
        Create Node Graphics
         */

        var pythagoreanConstant = Math.sqrt(3) / 2;
        var radiusMultiplier = 3 * circleRadius;
        /**
         * Advance the force-based simulation by one "tick".
         */
        chart.tick = function() {
            node.attr("transform", function(node) {
                return "translate(" +
                    zoomTransformX(zoom, node.x) + "," +
                    zoomTransformY(zoom, node.y) + ")";
            });

            lines.attr("d", function(link) {
                var source = link.source,
                    target = link.target;

                if (source == target) {
                    // Values that affect the loop size
                    var relativeMultiplier = link.relativeValue * 2 * circleRadius;
                    // It's a self-link.  So, we make a little loop.
                    var originX = zoomTransformX(zoom, source.x),
                        originY = zoomTransformY(zoom, source.y),
                        loop1X = zoomTransformX(zoom, source.x + radiusMultiplier - relativeMultiplier),
                        loopY = zoomTransformY(zoom, source.y + radiusMultiplier - relativeMultiplier),
                        loop2X = zoomTransformX(zoom, source.x - radiusMultiplier + relativeMultiplier);

                    return "M" + originX + "," + originY + " C" + loop1X + "," + loopY + " " + loop2X + "," + loopY + " " + originX + "," + originY;
                } else {
                    if (lineStyle == lineStyles.curved) {
                        // Cache the math for later
                        link.midComponents = {
                            x: {
                                a: ((source.x + target.x) / 2),
                                b: (-((target.y - source.y) / 2) * pythagoreanConstant)
                            },
                            y: {
                                a: ((source.y + target.y) / 2),
                                b: (((target.x - source.x) / 2) * pythagoreanConstant)
                            }
                        };

                        return "M" + zoomTransformX(zoom, source.x) + " "
                            + zoomTransformY(zoom, source.y) + " Q "
                            + zoomTransformX(zoom, link.midComponents.x.a + link.midComponents.x.b) + " "
                            + zoomTransformY(zoom, link.midComponents.y.a + link.midComponents.y.b) + " "
                            + zoomTransformX(zoom, target.x) + " "
                            + zoomTransformY(zoom, target.y);
                    } else {
                        return "M" +
                            zoomTransformX(zoom, source.x) + "," +
                            zoomTransformY(zoom, source.y) + " L" +
                            zoomTransformX(zoom, target.x) + "," +
                            zoomTransformY(zoom, target.y);
                    }
                }
            });

            // Multiply determines how far from the line to draw the label.
            var multiplier;
            if (lineStyle == lineStyles.straight) {
                multiplier = 4
            } else {
                multiplier = 2;
            }
            lineLabels.attr("transform", function(link) {
                if (link.source == link.target) {
                    return "translate(" +
                        zoomTransformX(zoom, link.source.x)  + "," +
                        zoomTransformY(zoom, link.source.y + ((1 - link.relativeValue) * 2.5 * circleRadius)) + ")";
                } else {
                    return "translate(" +
                        zoomTransformX(zoom, link.midComponents.x.a + link.midComponents.x.b / multiplier) + "," +
                        zoomTransformY(zoom, link.midComponents.y.a + link.midComponents.y.b / multiplier) + ")";
                }
            });
        };

        force.on("tick", chart.tick);

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
                linkVectors.attr("opacity", null);
                node.attr("opacity", null);
                return;
            }

            var highLightedNodes = d3.set([searchTerm]);
            // Select the nodes and those it is connected to
            linkVectors.attr("opacity", function(link) {
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

    var attachLineStylePicker = function(parentSelector) {
        var lineStylePicker = d3.select(parentSelector).append("p").append("label").text("Edges:").append("select");
        d3.keys(lineStyles).forEach(function(style) {
            lineStylePicker.append("option")
                .attr("value", style)
                .text(lineStyles[style]);
        });
        lineStylePicker.on("change", function() {
            chart.lineStyle(lineStylePicker[0][0].value);
        });
    };

    var attachSearchInput = function(parentSelector) {
        var search = d3.select(parentSelector).append("form");
        //Build the form
        search.append("label").text("Node:").append("input").attr("name", "node");
        search.append("label").text("Inbound:").append("input").attr({"type": "checkbox", "name": "inbound"});
        search.append("label").text("Outbound:").append("input").attr({"type": "checkbox", "name": "outbound"});
        search.append("input").attr({type: "submit", value: "Search"});
        search.on("submit", function() {
            d3.event.preventDefault();
            var value = search[0][0][0].value,
                isInbound = search[0][0][1].checked,
                isOutbound = search[0][0][2].checked;
            chart.search(value, isInbound, isOutbound);
        });
    };

    var attachDataSourcePicker = function(parentSelector) {
        var dataPicker = d3.select(parentSelector).append("p").append("label").text("Part:").append("select");
        dataPicker.append("option").attr("value", "all").text("All Parts");
        dataPicker.append("option").attr("value", "soprano").text("Soprano");
        dataPicker.append("option").attr("value", "alto").text("Alto");
        dataPicker.append("option").attr("value", "tenor").text("Tenor");
        dataPicker.append("option").attr("value", "bass").text("Bass");
        dataPicker.on("change", function() {
            var value = dataPicker[0][0].value;
            var dataUrl = "/data/ave-maria/" + value + "/";
            d3.json(dataUrl, function(error, data) {
                if (error) throw error;
                chart(data);
            });
        });
    };

    var attachOpacityPicker = function (parentSelector) {
        // Create a selector to choose whether or not to use opacity.
        d3.select(parentSelector).append("p")
            .append("label").text("Opacity:")
            .append("input")
            .attr("type", "checkbox")
            .attr("checked", true)
            .on("change", function() {
                if (this.checked) {
                    // Have opacity
                    opacityController.enable();
                } else {
                    // Make everything opaque
                    opacityController.disable();
                }
            });
    };

    // Attach GUI components
    attachEmptyControlPanel(selector);
    attachPrintButton(".control-panel", chart.svg[0][0]);
    attachLineStylePicker(".control-panel");
    attachSearchInput(".control-panel");
    attachDataSourcePicker(".control-panel");
    attachOpacityPicker(".control-panel");

    return chart;
};


function forceDirectedGraphLoad(dataSource) {
    var selector = ".force-directed-graph";
    var forceDirectedGraph = new ForceDirectedGraph(selector, 1600, 900);

    d3.json(dataSource, function(error, data) {
        if (error) throw error;
        forceDirectedGraph(data);
    });
}

forceDirectedGraphLoad("/data/ave-maria/alto/");