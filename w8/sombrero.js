// sombrero.js -- Sombrero function surface generation
var gl;

var nRows = 50;
var nColumns = 50;

var data = [];  // Coords for sombrero function sin(Pi*r)/(Pi*r) will
                // be stored in this global array

var pointsArray = [];

var fragmentColor;                     // Uniform for color

var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var rotation_by_5_deg = 5.0 * Math.PI/180.0;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var width;
var height;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
	gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport( 0, 0, canvas.width, canvas.height );
    width = canvas.width;
    height = canvas.height;

    computeSombrero();
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    // Enable depth testing and polygon offset
    // so lines will be in front of filled triangles
    
    //gl.enable(gl.DEPTH_TEST);
    //gl.depthFunc(gl.LEQUAL);
    //gl.enable(gl.POLYGON_OFFSET_FILL);
    //gl.polygonOffset(1.0, 2.0);

    // Vertex array of nRows*nColumns quadrilaterals (two
    // triangles/quad) from data array.  This array is used as the
    // y-coordinate so that sombrero is aligned with y-axis.
    
    for(var i=0; i<nRows-1; i++) {
        for(var j=0; j<nColumns-1;j++) {
            pointsArray.push( vec4(2*i/nRows-1, data[i][j], 2*j/nColumns-1, 1.0));
            pointsArray.push( vec4(2*(i+1)/nRows-1, data[i+1][j], 2*j/nColumns-1, 1.0)); 
            pointsArray.push( vec4(2*(i+1)/nRows-1, data[i+1][j+1], 2*(j+1)/nColumns-1, 1.0));
            pointsArray.push( vec4(2*i/nRows-1, data[i][j+1], 2*(j+1)/nColumns-1, 1.0) );
        }
    }

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    fragmentColor = gl.getUniformLocation(program, "tColor");
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // buttons for moving viewer and changing size

    document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    document.getElementById("Button4").onclick = function(){radius *= 0.9;};
    document.getElementById("Button5").onclick = function(){theta += rotation_by_5_deg;};
    document.getElementById("Button6").onclick = function(){theta -= rotation_by_5_deg;};
    document.getElementById("Button7").onclick = function(){phi += rotation_by_5_deg;};
    document.getElementById("Button8").onclick = function(){phi -= rotation_by_5_deg;};

    render();
    
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi), 
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));
    
    modelViewMatrix = lookAt( eye, at, up );
    projectionMatrix = perspective(45.0, width/height, 1.0, 10.0);
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    // Draw each quad as two filled red triangles
    // and then outlined by line loop
    
    for(var i=0; i<pointsArray.length; i+=4) { 
        gl.uniform4fv(fragmentColor, flatten(red));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(fragmentColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }

    requestAnimationFrame(render);
}

function computeSombrero () {

    for( var i = 0; i < nRows; ++i ) {
        data.push( [] );
        var x = Math.PI*(4*i/nRows-2.0);
        
        for( var j = 0; j < nColumns; ++j ) {
            var z = Math.PI*(4*j/nColumns-2.0);
            var r = Math.sqrt(x*x+z*z);
            // Take care of 0/0 for r = 0
            data[i][j] = r ? Math.sin(r) / r : 1.0;
        }
    }
}

