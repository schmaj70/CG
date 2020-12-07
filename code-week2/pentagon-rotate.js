// pentagon-rotate.js
// Add event listeners (button and key) to rotate the pentagon.
// Rotation amount control by a uniform variable theta
var gl;
var rotation_by_5_deg = radians(5.0);
var theta = 0.0;
var thetaLoc;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    // Five Vertices

    var sweepAngle = 72.0; // Use radians function from Angel's MV library to convert
    var vertices = [
        vec3( 0.5, 0.0, 0.0 ),
        vec3( 0.5 * Math.cos(radians(sweepAngle)), 0.5 * Math.sin(radians(sweepAngle)), 0.0),
        vec3( 0.5 * Math.cos(2.0 * radians(sweepAngle)), 0.5 * Math.sin(2.0 * radians(sweepAngle)), 0.0),
        vec3( 0.5 * Math.cos(3.0 * radians(sweepAngle)), 0.5 * Math.sin(3.0 * radians(sweepAngle)), 0.0),
        vec3( 0.5 * Math.cos(4.0 * radians(sweepAngle)), 0.5 * Math.sin(4.0 * radians(sweepAngle)), 0.0)
    ];
    
    
    //  Configure WebGL
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer

    // Note that we must change the second parameter to be consistent with the 3-D coordinate
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer(vPosition, 3,gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition );    

    thetaLoc = gl.getUniformLocation(program, "theta");

    document.getElementById("CLButton").onclick = function(){theta -= rotation_by_5_deg;};
    document.getElementById("CCButton").onclick = function(){theta += rotation_by_5_deg;};
    
    render();
};

function render()
{

    gl.clear( gl.COLOR_BUFFER_BIT);

    gl.uniform1f(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 5 );

	requestAnimationFrame(render);
};

// Key listener

window.onkeydown = function(event) {
    var key = String.fromCharCode(event.keyCode);
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    switch (key) {
    case 'L' :
	theta -= rotation_by_5_deg;
	break;
    case 'C' :
	theta += rotation_by_5_deg;
	break;
    }
};

