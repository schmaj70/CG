// accum-trans-matrix.js

// Illustrate how to build and use an accumulated composite
// transformation matrix to maneuver the display of a polygon that is
// clicked in by the user.
"use strict";

var canvas;
var gl;

var vertices = [  ];	// Array of vertices 
var vPosition;		// Linked to shader attribute
var modelTransform;	// Matrix that holds the accumulated composite transformation
var bufferID;
var program;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }
    
	modelTransform = mat3();
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //////////////// Set up event listeners //////////

    // Process the vertices that were clicked in to set up polygon
    document.getElementById("Button1").addEventListener("click",
	// When clicked we are done clicking in the polygon
	function(event) {
	    bufferID = gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, bufferID );
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	    vPosition = gl.getAttribLocation( program, "vPosition" );
	    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	    gl.enableVertexAttribArray( vPosition );
	    render();
	});

    // Button to rest to original display
    document.getElementById("Button2").addEventListener("click",
	// When clicked we want to reset to a display of polygon as
	// originally clicked in
	function(event) {
	    modelTransform = mat3();
	});

    // On mouse click, add a vertex due to mouse down event
    canvas.onmousedown =
	function(event) {
	    var t;
	    // Must convert canvas pixel to world coordinate
            t  = vec2(2*event.clientX/canvas.width-1,
		      2*(canvas.height-event.clientY)/canvas.height-1);
	    vertices.push(t);
	};

    // Register the event handler to be called on key press.  There
    // are lots of different options, so we will defer the details to
    // another function
    document.onkeydown = function(ev) { keydown(ev); };

    //////////// End event listerers ///////////

    //    render();  Don't call until there is something to draw
};

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.uniformMatrix3fv(gl.getUniformLocation(program, "modelTransform"),
			false,
			flatten(modelTransform));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length );

    requestAnimationFrame( render );
}

// Because of the many options, put keystroke handler in a separate
// function
function keydown(ev) {
    //    console.log(ev.keyCode);
    switch (ev.keyCode) {
    case 38: // Up arrow key -> translate polygon upward
	modelTransform = mult(mat3(vec3(1.0,0.0,0.0),
				   vec3(0.0,1.0,0.02),
				   vec3(0.0,0.0,1.0)),
			      modelTransform);
	break;
    case 40: // Down arrow key -> translate polygon downward
	modelTransform = mult(mat3(vec3(1.0,0.0,0.0),
				   vec3(0.0,1.0,-0.02),
				   vec3(0.0,0.0,1.0)),
			      modelTransform);
	break;
    case 39: // Right arrow key -> translate polygon to the right
	modelTransform = mult(mat3(vec3(1.0,0.0,0.02),
				   vec3(0.0,1.0,0.0),
				   vec3(0.0,0.0,1.0)),
			      modelTransform);
	break;
    case 37: // Left arrow key -> translate polygon to the left
	modelTransform = mult(mat3(vec3(1.0,0.0,-0.02),
				   vec3(0.0,1.0,0.0),
				   vec3(0.0,0.0,1.0)),
			      modelTransform);
	break;
    case 67: // 'c'key -> counter-clockwise rotation
	modelTransform = mult(mat3(vec3(Math.cos(radians(2)),
					-Math.sin(radians(2)),
					0.0),
				   vec3(Math.sin(radians(2)),
					Math.cos(radians(2)),
					0.0),
				   vec3(0.0,0.0,1.0)),
			      modelTransform);
	break;
    case 76: // 'l'key -> clockwise rotation
	modelTransform = mult(mat3(vec3(Math.cos(radians(-2)),
					-Math.sin(radians(-2)),
					0.0),
				   vec3(Math.sin(radians(-2)),
					Math.cos(radians(-2)),
					0.0),
				   vec3(0.0,0.0,1.0)),
			      modelTransform);
	break;
    case 83: // 's'key -> shrink the polygon
	modelTransform = mult(mat3(vec3(0.98,0.0,0.0),
				   vec3(0.0,0.98,0.0),
				   vec3(0.0,0.0,1.0)),
			      modelTransform);
	break;
    case 71: // 'g'key -> enlarge the polygon
	modelTransform = mult(mat3(vec3(1.02,0.0,0.0),
				   vec3(0.0,1.02,0.0),
				   vec3(0.0,0.0,1.0)),
			      modelTransform);
	break;
    default: return; // Skip drawing if no effective action
    }
}