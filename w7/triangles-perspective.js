"use strict";

var canvas;
var gl;


var n = 18;

var colors = [
	vec4(0.4,  1.0,  0.4,  1.0),
	vec4(0.4,  1.0,  0.4,  1.0),
	vec4( 1.0,  0.4,  0.4,  1.0),

	vec4(1.0,  1.0,  0.4,  1.0),
	vec4(1.0,  1.0,  0.4,  1.0),
	vec4(1.0,  0.4,  0.4,  1.0),

	vec4(0.4,  0.4,  1.0,  1.0),
	vec4(0.4,  0.4,  1.0,  1.0),
	vec4(1.0,  0.4,  0.4,  1.0),

	vec4(0.4,  1.0,  0.4,  1.0),
	vec4(0.4,  1.0,  0.4,  1.0),
	vec4(1.0,  0.4,  0.4,  1.0),

	vec4(1.0,  1.0,  0.4,  1.0),
	vec4(1.0,  1.0,  0.4,  1.0),
	vec4(1.0,  0.4,  0.4,  1.0),

	vec4(0.4,  0.4,  1.0,  1.0),
	vec4(0.4,  0.4,  1.0,  1.0),
	vec4(1.0,  0.4,  0.4,  1.0)
];

var vertices = [
	// Three triangles on the right side
	vec4( 0.75,  1.0,  -4.0, 1.0),
	vec4( 0.25, -1.0,  -4.0, 1.0),
	vec4( 1.25, -1.0,  -4.0, 1.0),
	
	vec4( 0.75,  1.0,  -2.0, 1.0),
	vec4( 0.25, -1.0,  -2.0, 1.0),
	vec4( 1.25, -1.0,  -2.0, 1.0),
	
	vec4( 0.75,  1.0,   0.0, 1.0),
	vec4( 0.25, -1.0,   0.0, 1.0),
	vec4( 1.25, -1.0,   0.0, 1.0),

	// Three triangles on the left side
	vec4( -0.75,  1.0,  -4.0, 1.0),
	vec4( -1.25, -1.0,  -4.0, 1.0),
	vec4( -0.25, -1.0,  -4.0, 1.0),

	vec4( -0.75,  1.0,  -2.0, 1.0),
	vec4( -1.25, -1.0,  -2.0, 1.0),
	vec4( -0.25, -1.0,  -2.0, 1.0),

	vec4( -0.75,  1.0,   0.0, 1.0),
	vec4( -1.25, -1.0,   0.0, 1.0),
	vec4( -0.25, -1.0,   0.0, 1.0)
];

var nf;

var near = 1;
var far = 100;
var fov = 30;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye;
var eyeX = 0, eyeY = 0.0, eyeZ = 5; // Eye position
const at = vec3(0.0, 0.0, -100.0);
const up = vec3(0.0, 1.0, 0.0);



window.onload = function init() {
	// Retrieve the nearFar element
	nf = document.getElementById('nearFar');

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	
	// Register the event handler to be called on key press
	document.onkeydown = function(event){ keydown(event); };	
	
    render();
}


function keydown(event) {
    if(event.keyCode == 39) { // The right arrow key was pressed
      eyeX += 0.01;
    } 
	else if (event.keyCode == 37) { // The left arrow key was pressed
      eyeX -= 0.01;
	}  
	else if(event.keyCode == 38) { // The down arrow key was pressed
      eyeY += 0.01;
    } 
	else if (event.keyCode == 40) { // The up arrow key was pressed
      eyeY -= 0.01;
    } 
	else if(event.keyCode == 189) { // The - key was pressed
      eyeZ += 0.01;
    } 
	else if (event.keyCode == 187) { // The + key was pressed
      eyeZ -= 0.01;
    } 
 	else if(event.keyCode == 78) { // The n key was pressed
      near += 0.1;
    } 
	else if (event.keyCode == 77) { // The m key was pressed
      near -= 0.1;
    } 
 	else if(event.keyCode == 70) { // The f key was pressed
      far += 0.1;
    } 
	else if (event.keyCode == 71) { // The g key was pressed
      far -= 0.1;
    }         
}

function render() {

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(eyeX,eyeY,eyeZ);  
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fov, canvas.width/canvas.height, near, far);
	
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

	// Display the current near and far values
	nf.innerHTML = 'near: ' + Math.round(near * 100)/100 + ', far: ' + Math.round(far*100)/100;

    gl.drawArrays( gl.TRIANGLES, 0, n );
    requestAnimationFrame(render);
}
