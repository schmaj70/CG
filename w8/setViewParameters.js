// This function tries to guess what the appropriate viewing
// parameters should be based on the overall values of the
// coordinates
function setViewParams(vertices) {
    var xmin = Infinity;
    var xmax = -Infinity;
    var ymin = Infinity;
    var ymax = -Infinity;
    var zmin = Infinity;
    var zmax = -Infinity;
    for (var i = 0; i < vertices.length; i = i + 3) {
        if (vertices[i] < xmin)
            xmin = vertices[i];
        else if (vertices[i] > xmax)
            xmax = vertices[i];
        if (vertices[i+1] < ymin)
            ymin = vertices[i+1];
        else if (vertices[i+1] > ymax)
            ymax = vertices[i+1];
        if (vertices[i+2] < zmin)
            zmin = vertices[i+2];
        else if (vertices[i+2] > zmax)
            zmax = vertices[i+2];
    }

    /* translate the center of the object to the origin */
    var centerX = (xmin+xmax)/2;
    var centerY = (ymin+ymax)/2; 
    var centerZ = (zmin+zmax)/2;
    var max = Math.max(centerX - xmin, xmax - centerX);
    max = Math.max(max, Math.max(centerY - ymin, ymax - centerY) );
    max = Math.max(max, Math.max(centerZ - zmin, zmax - centerZ) );
    var margin = max * 0.2;
    left = -(max+margin);
    right = max+margin;
    bottom = -(max+margin);
    ytop = max+margin;
    far = -(max+margin);
    near = max+margin;
    radius = max + margin;
}

