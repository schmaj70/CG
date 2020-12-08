/**
 * Jeff Schmadebeck
 * Graphics lab 3
 * 
 * *I USED 2 OF MY 3 EXTRA DAYS ON THIS PROJECT*
 *  
 * 
 * How I modeled each object?
 * -i used 3 different mesh files, 1 sphere, 1 cube, 1 bunny
 * 
 * Material properties of each object?
 * -each object has the same properties, all blue materials with white light
 * 
 * Lighting model i used?
 * -phong-blinn
 * 
 * initial position of light/camera?
 * -light =  vec4(5.0, -10.0, 20.0, 1.0);
 * -camera
 *  near = -100;
 *  far = 100;
 *  left = -300.0;
 *  right = 300.0;
 *  ytop = 300.0;
 *  bottom = -300.0;
 * 
 * how and to what extent can camera move?
 * -you can rotate with buttons by 50 degrees each time
 * 
 * 
 */
var canvas;
var gl;

//camera stuff
var near = -100;
var far = 100;
var left = -300.0;
var right = 300.0;
var ytop = 300.0;
var bottom = -300.0;

var radius = 40.0;
var theta = 0.0;
var phi = 0.0;
var rotation_by_50_deg = 50.0 * Math.PI / 180.0;

var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var modelViewMatrix, projectionMatrix;
var program1, vPosition, vColor;
var modelViewMatrixLoc, projectionMatrixLoc;

//bunny
var vertices1 = myMesh1.vertices[0].values;
var indices1 = myMesh1.connectivity[0].indices;
var iBuffer1, vBuffer1, nBuffer, vNormal;
var normals1 = myMesh1.vertices[1].values;

//cube
var vertices2 = myMesh2.vertices[0].values;
var indices2 = myMesh2.connectivity[0].indices;

//sphere
var vertices3 = myMesh3.vertices[0].values;
var indices3 = myMesh3.connectivity[0].indices;

//light stuff
var lightPosition = vec4(5.0, -10.0, 20.0, 1.0);
var lightDiffuse1 = vec4(1.0, 1.0, 1.0, 1.0); // white light
var lightAmbient1 = vec4(0.2, 0.2, 0.2, 1.0);
var lightSpecular1 = vec4(1.0, 1.0, 1.0, 1.0);

var materialDiffuse1 = vec4(0.0, 0.0, 1.0, 1.0); // blue material
var materialAmbient1 = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular1 = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess1 = 100.0;
var nf;

window.onload = function init() {
    // Retrieve the nearFar element
    nf = document.getElementById('nearFar');

    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    //program for everything
    gl.useProgram(program);

    //Object 1: bunny
    //array element buffer
    iBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer1);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices1), gl.STATIC_DRAW);

    //vertex array attribute buffer 1  
    vBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices1), gl.STATIC_DRAW);

    //Object 2: Cube
    iBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices2), gl.STATIC_DRAW);

    //vertex array attribute buffer  2  
    vBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);

    //Object 3: Sphere
    iBuffer3 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer3);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices3), gl.STATIC_DRAW);

    //vertex array attribute buffer  3  
    vBuffer3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer3);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices3), gl.STATIC_DRAW);

    //set variables for program
    vPosition = gl.getAttribLocation(program, "vPosition");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // vertex normal buffer   
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals1), gl.STATIC_DRAW);

    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Establish uniforms   
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    var ambientProduct1 = mult(lightAmbient1, materialAmbient1);
    var diffuseProduct1 = mult(lightDiffuse1, materialDiffuse1);
    var specularProduct1 = mult(lightSpecular1, materialSpecular1);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct1));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct1));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct1));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
        materialShininess1);

    // buttons for moving viewer and changing size
    document.getElementById("Button1").onclick = function () { near *= 1.02 };
    document.getElementById("Button2").onclick = function () { near *= 0.98 };
    document.getElementById("Button13").onclick = function () { far *= 1.02; };
    document.getElementById("Button14").onclick = function () { far *= 0.98; };
    document.getElementById("Button3").onclick = function () { radius *= 1.1; };
    document.getElementById("Button4").onclick = function () { radius *= 0.9; };
    document.getElementById("Button5").onclick = function () { theta += rotation_by_50_deg; };
    document.getElementById("Button6").onclick = function () { theta -= rotation_by_50_deg; };
    document.getElementById("Button7").onclick = function () { phi += rotation_by_50_deg; };
    document.getElementById("Button8").onclick = function () { phi -= rotation_by_50_deg; };
    document.getElementById("Button9").onclick = function () { left *= 0.9; right *= 0.9; };
    document.getElementById("Button10").onclick = function () { left *= 1.1; right *= 1.1; };
    document.getElementById("Button11").onclick = function () { ytop *= 0.9; bottom *= 0.9; };
    document.getElementById("Button12").onclick = function () { ytop *= 1.1; bottom *= 1.1; };

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //camera stuff
    var eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    //draw images
    gl.useProgram(program);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //Draw object 1: bunny
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer1);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer1);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.drawElements(gl.TRIANGLES, indices1.length, gl.UNSIGNED_SHORT, 0);

    //Draw object 2: cube
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer2);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.drawElements(gl.TRIANGLES, indices2.length, gl.UNSIGNED_SHORT, 0);

    //Draw object 3: Sphere
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer3);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer3);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.drawElements(gl.TRIANGLES, indices3.length, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    requestAnimationFrame(render);
}

