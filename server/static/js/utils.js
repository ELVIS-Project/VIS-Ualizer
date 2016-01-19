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