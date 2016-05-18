/**
 * Given a zoom object, transform an x co-ordinate to the given zoom level.
 * @param zoom
 * @param x
 * @returns {*}
 */
function zoomTransformX(zoom, x) {
    return zoom.scale() * x + zoom.translate()[0];
}
function zoomTransformY(zoom, y) {
    return zoom.scale() * y + zoom.translate()[1];
}


/**
 * Given a matrix with matrix[key1][key2] mapping, get the set of all keys in
 * both dimensions.
 *
 * @param matrix
 */
function extractKeysFromMatrix(matrix) {
    var keys = d3.set(d3.keys(matrix));
    keys.forEach(function(key) {
        d3.keys(matrix[key]).forEach(function (newKey) {
            keys.add(newKey);
        });
    });
    return keys;
}

function printToSVG(svg) {
    var s = new XMLSerializer();
    // Build the file
    var file = '<?xml version="1.0" standalone="no"?>\r\n'
        + "<!-- Generated with VIS-Ualizer (https://github.com/ELVIS-Project/VIS-Ualizer)-->\n"
        + s.serializeToString(svg);

    var blob = new Blob([file], {type: 'image/svg'});
    var url = window.URL.createObjectURL(blob);

    // For now, we append a link to the document
    var a = document.createElement("a");
    a.textContent = "File";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    delete a;
}

/**
 * Attach a print button to the visualization.
 *
 * @param selector Global selector for the visualization
 * @param svg The SVG that we print.
 */
function attachPrintButton(selector, svg) {

    d3.select(selector).append("p").append("button")
        .text("Save SVG")
        .on("click", function() {
            printToSVG(svg);
        });
}

var cssStyling = {
    global: {
        "font-family": "sans-serif",
        "font-size": "10px"
    },
    axis: {
        "fill": "none",
        "stroke": "#000000",
        "shape-rendering": "crispEdges"
    },
    bar: {
        "shape-rendering": "crispEdges"
    }
};

/**
 * Construct a legend at the top right of the visualization.
 *
 * @param element
 * @param names
 * @param colourScale
 * @param rightMargin
 * @param topMargin
 * @param width
 */
function buildLegend(element, names, colourScale, rightMargin, topMargin, width) {
    // Construct the legend
    var legend = element.append("g")
        .attr("transform", "translate(" + (width - rightMargin + 10) + "," + topMargin + ")")
        .attr("name", "legend");

    var cubeSize = 10;
    for(var i = 0; i < names.length; i++) {
        legend.append("rect")
            .attr("width", cubeSize)
            .attr("height", cubeSize)
            .attr("y", i * (cubeSize + 2))
            .style("fill", colourScale(names[i]));

        legend.append("text")
            .text(names[i])
            .attr("y", i * (cubeSize + 2) + cubeSize - 1)
            .attr("x", cubeSize + 2);
    }
}

/**
 * Given a vector, return the normalized vector.
 *
 * @param vector
 * @returns {Array|*}
 */
function normalizeVector(vector) {
    var norm = getNorm(vector);
    return vector.map(function(x) {
        return x / norm;
    })
}

function getNorm(array) {
    var squares = array.map(function (x) {
        return x * x;
    });
    return Math.sqrt(sumArray(squares));
}

function sumArray(array) {
    return array.reduce(function(a,b) {
        return a + b;
    });
}

/**
 * Test if a key is black.
 *
 * @param tone
 * @param cTone
 * @returns {boolean}
 */
function isKeyBlack(tone, cTone) {
    // Map the keynumber onto the 12 note scale
    var keyNumber = (tone % 12) - (cTone % 12);
    // Return true if the keyNumber is one of the black keys
    return keyNumber == 1 || keyNumber == 3 || keyNumber == 6
        || keyNumber == 8 || keyNumber == 10;
}

/**
 * Draw the x and y axis lines.
 *
 * @param parentElement
 * @param xAxis
 * @param yAxis
 * @param svgHeight
 * @param topMargin
 * @param leftMargin
 * @param bottomMargin
 */
function drawAxisLines(parentElement, xAxis, yAxis, svgHeight, topMargin, leftMargin, bottomMargin) {
    parentElement.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(" + leftMargin + "," + (svgHeight - bottomMargin) + ")")
        .call(xAxis);
    parentElement.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(" + leftMargin + "," + topMargin + ")")
        .call(yAxis);
    // Apply CSS styling
    parentElement.selectAll([".axis path ", ".axis line"]).style(cssStyling.axis);
}

/**
 * Attach an empty control panel div to the parent.
 *
 * @param parentSelector
 * @returns {*}
 */
function attachEmptyControlPanel(parentSelector) {
    return d3.select(parentSelector)
        .insert("div", ":last-child")
        .attr("class", "control-panel")
        .style(cssStyling.global)
        .style({
            "position": "fixed"
        });
}

/**
 * An enum to handle possible sorting.
 * @type {Object}
 */
var SortEnum = Object.freeze({
    label: 0,
    value: 1
});

/**
 * An enum to handle ascending and descending sorting.
 *
 * @type {Object}
 */
var SortDirectionEnum = Object.freeze({
    ascending: 0,
    descending: 1
});

/**
 * An enum to handle curved or straight lines.
 *
 * @type {Object}
 */
var LineStylesEnum = Object.freeze({
    curved: "Curved",
    straight: "Straight"
});