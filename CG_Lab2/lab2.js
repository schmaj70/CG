/**
 * CG_Lab2
 * 
 * Create a 3d "W" 
 * 
 * Make it rotate on the screen accross various axes 
 * Use  the  lookAt  function  to  change  the  default  position  of  the  camera  on  startup 
 * create the projection matrix and send it to the vertex shader 
 * Make it be created with different colors for a 3d effect
 * Make it have one or more translations 
 * Make it have one or more scalings
 * Do something "creative", I chose to make the "W" be colored in randomly each time
 * 
 */
var canvas;
var gl;

//stuff needed to create the "W"
var numPositions  = 180;		
var positions = [];
var colors = [];
var modelViewMatrix;
var modelViewMatrixLoc;

//variables needed for scaling
var scalingIncrement = 0.01;
var growing = true;
//variables needed for translations
var translateIncrement = 0.01;
var translating = true;

//variable needed for the rotations
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var thetaArr = [ 0, 0, 0 ];	// Angles of rotation for each axis

//variables needed for the camera
var near = 0.3;         
var far = 300.0;
var radius = 6.0;// Used to establish eye point
var theta  = 0.0;// Used to establish eye point
var phi    = 0.0;// Used to establish eye point
var rotation = 20.0 * Math.PI/180.0;
var  fovy = 45.0;// Field-of-view in Y direction angle (in degrees)
var  aspect;// Viewport aspect ratio
var eye;// Established by radius, theta, phi as we move
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var projectionMatrix;
var projectionMatrixLoc;

//vertices for the "W"
var vertices = [
    vec4(.1, .7, 0.0, 1.0),
    vec4(.2, .7, 0.0, 1.0),
    vec4(.25, .3, 0.0, 1.0),
    vec4(.25, .1, 0.0, 1.0),
    vec4(.4, .6, 0.0, 1.0),
    vec4(.4, .4, 0.0, 1.0),
    vec4(.55, .3, 0.0, 1.0),
    vec4(.55, .1, 0.0, 1.0),
    vec4(.6, .7, 0.0, 1.0),
    vec4(.7, .7, 0.0, 1.0),
    vec4(.1, .7, -0.1, 1.0),
    vec4(.2, .7, -0.1, 1.0),
    vec4(.25, .1, -0.1, 1.0),
    vec4(.25, .3, -0.1, 1.0),
    vec4(.4, .6, -0.1, 1.0),
    vec4(.4, .4, -0.1, 1.0),
    vec4(.55, .3, -0.1, 1.0),
    vec4(.55, .1, -0.1, 1.0),
    vec4(.6, .7, -0.1, 1.0),
    vec4(.7, .7, -0.1, 1.0)
];

//colors for the "W"
//"Creative" part of project is using random colors to generate the "W"
var vertexColors = [
    
    //getRandomInt returns either a 1 or 0 randomly to generate a random color 
    
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2)),
    vec4(getRandomInt(2), getRandomInt(2), getRandomInt(2), getRandomInt(2))    
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    //creates "W"
    
    colorW();

    //set aspect ratio
    aspect =  canvas.width/canvas.height;

    gl.viewport( 0, 0, canvas.width, canvas.height);
    
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    //event listeners for buttons
    document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    document.getElementById("Button4").onclick = function(){radius *= 0.9;};
    document.getElementById("Button5").onclick = function(){theta += rotation;};
    document.getElementById("Button6").onclick = function(){theta -= rotation;};
    document.getElementById("Button7").onclick = function(){phi += rotation;};
    document.getElementById("Button8").onclick = function(){phi -= rotation;};
    
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };

    render();
};

//all the indices for the "W"
function colorW()
{

    //frontside
    quad(0, 1, 3);
    quad(3, 1, 2);
    quad(3, 2, 5);
    quad(2, 5, 4);
    quad(4, 5, 6);
    quad(5, 6, 7);
    quad(7, 6, 9);
    quad(6, 8, 9);

    //backside
    quad(10, 11, 12);
    quad(11, 12, 13);
    quad(12, 13, 15);
    quad(13, 14, 15);
    quad(14, 15, 17);
    quad(14, 16, 17);
    quad(16, 17, 19);
    quad(16, 18, 19);

    //left side parts
    quad(0, 10, 3);
    quad(10, 3, 12);

    //bot left side parts
    quad(3, 12, 5);
    quad(12, 5, 15);

    //bot right side parts
    quad(5, 7, 15);
    quad(7, 15, 17);

    //right side parts
    quad(7, 17, 9);
    quad(17, 9, 19);

    //top right side parts
    quad(18, 6, 16);
    quad(8, 6, 16);

    //mid right side parts
    quad(4, 14, 6);
    quad(6, 14, 16);

    //mid left side parts
    quad(4, 14, 13);
    quad(4, 2, 13);
};

//gets a random number between 1 and 2
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  };

// fill in  the "W" with the colors
function quad(a, b, c) 
{
    var indices = [ a, b, c, a, c, b ];

    for ( var i = 0; i < indices.length; ++i ) {
        
        positions.push( vertices[indices[i]] );
        colors.push( vertexColors[indices[i]] );
        
    }

};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //calculates the eye variable for lookat
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
    radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    //camera 
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

     //speed of rotation
     thetaArr[axis] += 1.5;

     //rotates object depending on button pressed
     modelViewMatrix = mult(modelViewMatrix, rotateZ(thetaArr[zAxis]));
     modelViewMatrix = mult(modelViewMatrix, rotateY(thetaArr[yAxis]));
     modelViewMatrix = mult(modelViewMatrix, rotateX(thetaArr[xAxis]));
     gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
     
     //loops for translation
     if(translating && translateIncrement < 1){
        translateIncrement += 0.01;
     }else if(!translating && translateIncrement > -1){
        translateIncrement -= 0.01
     }else{
        translating = !translating;
     }

     //loops for scaling
     if(growing && scalingIncrement < 2){
        scalingIncrement += 0.01;
    }else if(!growing && scalingIncrement > -2){
        scalingIncrement -= 0.01
    }else{
        growing = !growing;
    }
    
    //translate call
    modelViewMatrix = mult(modelViewMatrix, translate(translateIncrement, translateIncrement ,translateIncrement));

    //scale call
    modelViewMatrix = mult(modelViewMatrix, scale(scalingIncrement, scalingIncrement, scalingIncrement));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    
    gl.drawArrays( gl.TRIANGLES, 0, numPositions );

    requestAnimationFrame( render );
};

