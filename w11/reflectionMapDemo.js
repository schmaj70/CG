// reflectionMapDemo.js
"use strict";

var canvas;
var gl;
var program;

// Meshlab's sphere
var vertices = myMesh.vertices[0].values;
var indices = myMesh.connectivity[0].indices;
var normals = myMesh.vertices[1].values;

var radius = 3.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

// Six images for each side of box
var texture_images = [
   "textures/posx.jpg", "textures/negx.jpg", 
   "textures/posy.jpg", "textures/negy.jpg", 
   "textures/posz.jpg", "textures/negz.jpg"
];

var image_count;		// Used to make sure we don't render until textures loaded

var cubeMap;

window.onload = init;

function configureCubeMap() { 	// Called to load all textures
    image_count = 0;
    var img = new Array(6);

    for (var i = 0; i < 6; i++) {
	img[i] = new Image();
	img[i].src = texture_images[i];
	img[i].onload = function() {
            image_count++;
            if (image_count == 6) {
                cubeMap = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
                var targets = [
                            gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
                ];
                try {
                        for (var j = 0; j < 6; j++) {
                            gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        }
                } catch(e) {}
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            };
	};
    };
}


function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
    var projectionMatrix = ortho(-2, 2, -2, 2, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix" ), false, flatten(projectionMatrix) );

    configureCubeMap();
    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(gl.getUniformLocation(program, "texMap"),0);

    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};

    render();
}

var render = function(){
    if (image_count == 6) {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
                   radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
        var at = vec3(0.0, 0.0, 0.0);
        var up = vec3(0.0, 1.0, 0.0);
        
        var modelViewMatrix = lookAt(eye, at, up);
        
        gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"),
                     false, flatten(modelViewMatrix) );

        var normalMatrix = [
                vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
                vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
                vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
        ];
        gl.uniformMatrix3fv(gl.getUniformLocation(program, "normalMatrix"), false,
                    flatten(normalMatrix) );

        // SHORT because uint16 above
        gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 ); 
    }
    requestAnimationFrame(render);
};
