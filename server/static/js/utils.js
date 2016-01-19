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