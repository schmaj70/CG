// mesh-viewer-lighting.js -- add Phong/Blinn lighting model and make light
// part of model in the shader
var canvas;
var gl;

var near = -100;
var far = 100;
var left = -100.0;
var right = 100.0;
var ytop = 100.0;
var bottom = -100.0;

var radius = 40.0;
var theta  = 0.0;
var phi    = 0.0;
var rotation_by_5_deg = 5.0 * Math.PI/180.0;

var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//For each light source, set RGBA and position:
//Ldr, Ldg, Ldb, Lsr, Lsg, Lsb, Lar, Lag, Lab
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 ); // white light
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
//Position is in homogeneous coordinates
//If w =1.0, we are specifying a finite (x,y,z) location
//If w =0.0, light at infinity
var lightPosition = vec4(1.0, 1.0, 1.0, 1.0 );

//Material properties with ambient, diffuse, specular
var materialDiffuse = vec4( 0.0, 0.0, 1.0, 1.0); // blue material
var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
//metallic?
var materialShininess = 100.0;



var vertices = myMesh.vertices[0].values;

var indices = myMesh.connectivity[0].indices;
//Normals provided by Meshlab in json file
var normals = myMesh.vertices[1].values;


window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
	gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);;

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // array element buffer    
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    setViewParams(vertices);
    
    // vertex array attribute buffer   
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // vertex normal buffer   
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    // Establish uniforms   
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
		 materialShininess);
    
    // buttons for moving viewer and changing size

    document.getElementById("Button1").onclick = function(){near  *= 1.02; far *= 1.02;};
    document.getElementById("Button2").onclick = function(){near *= 0.98; far *= 0.98;};
    document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    document.getElementById("Button4").onclick = function(){radius *= 0.9;};
    document.getElementById("Button5").onclick = function(){theta += rotation_by_5_deg;};
    document.getElementById("Button6").onclick = function(){theta -= rotation_by_5_deg;};
    document.getElementById("Button7").onclick = function(){phi += rotation_by_5_deg;};
    document.getElementById("Button8").onclick = function(){phi -= rotation_by_5_deg;};
    document.getElementById("Button9").onclick = function(){left  *= 0.9; right *= 0.9;};
    document.getElementById("Button10").onclick = function(){left *= 1.1; right *= 1.1;};
    document.getElementById("Button11").onclick = function(){ytop  *= 0.9; bottom *= 0.9;};
    document.getElementById("Button12").onclick = function(){ytop *= 1.1; bottom *= 1.1;};
    
    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi), 
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));
    
    modelViewMatrix = lookAt( eye, at, up );
    projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 ); // SHORT because uint16 above

    requestAnimationFrame( render );
}

