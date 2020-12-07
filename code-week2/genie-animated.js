// genie-animated.js

// Animate the genie using an animation frame and uniform variable

var gl;
var points;
var vertices = [];
var size = 0.25;
var scaleLoc; // Location of the shader's uniform variable
var scaleIncrement = 0.01;
var goingUp = true;
var canvas;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    
    //  Configure WebGL
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Manuture the genie points in the array vertices by calling function

    genie(size);
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );    

    scaleLoc = gl.getUniformLocation(program, "scale");

    render();
};

function genie(size) {
    const NUM = 300;
    var i, t, t_now, t7, t8;
    
	t = (2 * Math.PI) / NUM;
    for (i = 0; i < NUM; ++i) {
		t_now = t * i;
		t7 = t_now * 7;
		t8 = t_now * 8;
		vertices.push( vec2(size * (Math.cos(t_now) + Math.sin(t8)),
					size * (2.0 * Math.sin(t_now) + Math.sin(t7))));
    }
};


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    if (goingUp && scaleIncrement < 0.5) {
		scaleIncrement += 0.01;
    } else if (!goingUp && scaleIncrement > -0.5) {
		scaleIncrement -= 0.01;
    } else {
		goingUp = ! goingUp;
    }
    gl.uniform1f(scaleLoc, 1.0 + scaleIncrement);
    gl.drawArrays( gl.LINE_LOOP, 0, vertices.length );
    requestAnimationFrame(render);

}
