var gl;
var points;
var vertices = [];
var size = 0.7;
var canvas;

/**
 * This program uses webGL to generate a grid of 3 different tiles accross the canvas
 * Tile 1 is made up of a square with a circle at each vertex, such that only a quarter of the circle shows
 * Tile 2 is made up of just the top right and bottom left circles in tile 1
 * Tile 3 is made up of just the top left and bottom right circles in tile 1
 * Each of these tiles is made with a modified version of genie from class
 * 
 * I was not able to implement the image changing when a button is clicked
 * I was not able to implement the randomization on the grid of tile2 and tile3 
 */
window.onload = function() {
    canvas = document.getElementById("gl-canvas");
    
    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }


    //Configure WebGL
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    
    //Comment and uncomment each of these functions to see the tiles i made. Couldn't get it to work with buttons
    tile1(size);
    //tile2(size);
    //tile3(size);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //I tried making the button onclick handlers but they wouldnt work
    // document.getElementById("tile1").onclick = function(){tile1(size);};
    // document.getElementById("tile2").onclick = function(){tile2(size);};
    // document.getElementById("tile3").onclick = function(){tile3(size);};
     
    
    render();
};



/**
 * This is a modified version of genie from class where I tweaked some variables in order
 * to make the shape needed for the first tile we are supposed to make
 * @param {size of the object in the viewport} size 
 */
function tile1(size) {
    const NUM = 200;
    var i, t_then, t_now;
    var t_then = (2 * Math.PI) / NUM;

    //First gotta make the square
    vertices.push(vec2(-1, 1),vec2(1, 1), vec2(1, -1), vec2(-1, -1), vec2(-1, 1));

    //Then the top right quarter circle
    moveRight1 = 2; //makes the circle move right
    moveUp1 = 2;//makes the circle move up
    radius1 = 3.45;//changes radius so the circle gets bigger or smaller

    for (i = 0; i < NUM; ++i) {

        t_now = t_then * i;
        vertices.push(vec2(size * (moveRight1 + radius1 * Math.cos(t_now)),
            size * (moveUp1 + radius1 * Math.sin(t_now))));
    }

    //Then the bottom left circle
    moveRight2 = -2;
    moveUp2 = -2;
    radius2 = 3.45;

    for (i = 0; i < NUM; ++i) {

        t_now = t_then * i;
        vertices.push(vec2(size * (moveRight2 + radius2 * Math.cos(t_now)),
            size * (moveUp2 + radius2 * Math.sin(t_now))));
    }

    //Then the top left circle
    moveRight3 = -2; 
    moveUp3 = 2;
    radius3 = 3.45;

    for (i = 0; i < NUM; ++i) {

        t_now = t_then * i;
        vertices.push(vec2(size * (moveRight3 + radius3 * Math.cos(t_now)),
            size * (moveUp3 + radius3 * Math.sin(t_now))));
    }

    //Finally the bottom right circle
    moveRight4 = 2; 
    moveUp4 = -2;
    radius4 = 3.45;

    for (i = 0; i < NUM; ++i) {

        t_now = t_then * i;
        vertices.push(vec2(size * (moveRight4 + radius4 * Math.cos(t_now)),
            size * (moveUp4 + radius4 * Math.sin(t_now))));
    }
    
    
};

/**
 * This is a modified version of tile 1 such that the top right and bottom left circles are all that appear
 * This is supposed to appear when the user hits the button, but for some reason that doesn't work. Also there
 * is one line that shows up that isn't supposed to be there, but if I try to get rid of it the entire thing 
 * crashes
 * @param {size of the object in the viewport} size 
 */
function tile2(size){
    const NUM = 200;
    var i, t_then, t_now;
    t_then = (2 * Math.PI) / NUM;

    //Then I make the top right circle
    moveRight1 = 2; 
    moveUp1 = 2;
    radius1 = 2;

    for (i = 0; i < NUM; ++i) {

        t_now = t_then * i;
        vertices.push(vec2(size * (moveRight1 + radius1 * Math.cos(t_now)),
            size * (moveUp1 + radius1 * Math.sin(t_now))));
    }

    //Then I make the bottom Left circle
    moveRight2 = -2; 
    moveUp2 = -2;
    radius2 = 2;

    for (i = 0; i < NUM; ++i) {

        t_now = t_then * i;
        vertices.push(vec2(size * (moveRight2 + radius2 * Math.cos(t_now)),
            size * (moveUp2 + radius2 * Math.sin(t_now))));
    }
}

/**
 * This is a modified version of tile 3 such that the top left and bottom right circles are all that appear
 * This is supposed to appear when the user hits the button, but for some reason that doesn't work. Also there
 * is one line that shows up that isn't supposed to be there, but if I try to get rid of it the entire thing 
 * crashes
 * @param {size of the object in the viewport} size 
 */
function tile3(size){
    const NUM = 200;
    var i, t_then, t_now;
    t_then = (2 * Math.PI) / NUM;

    // Then I make the top left circle
    moveRight1 = -2; 
    moveUp1 = 2;
    radius1 = 2;

    for (i = 0; i < NUM; ++i) {

        t_now = t_then * i;
        vertices.push(vec2(size * (moveRight1 + radius1 * Math.cos(t_now)),
            size * (moveUp1 + radius1 * Math.sin(t_now))));
    }

    //Then I make the bottom right circle
    moveRight2 = 2; //move right
    moveUp2 = -2;//move up
    radius2 = 2;//get bigger

    for (i = 0; i < NUM; ++i) {

        t_now = t_then * i;
        vertices.push(vec2(size * (moveRight2 + radius2 * Math.cos(t_now)),
            size * (moveUp2 + radius2 * Math.sin(t_now))));
    }
}

/**
 * This renders the image on the page, I have it so there is an 8x8 grid of tiles on the canvas
 */
function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport((canvas.width / 8) * 0, (canvas.height / 8) * 0, canvas.width / 8, (canvas.height * (canvas.width / canvas.height)) / 8);

    for (i = 0; i < 8; ++i) {
        for (j = 0; j < 8; ++j) {
            gl.viewport((canvas.width / 8) * i, (canvas.height / 8) * j, canvas.width / 8, (canvas.height * (canvas.width / canvas.height)) / 8);
            gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);

            gl.viewport((canvas.width / 8) * i, (canvas.height / 8) * j, canvas.width / 8, (canvas.height * (canvas.width / canvas.height)) / 8);
            gl.drawArrays(gl.LINE_STRIP, vertices.length / 2, vertices.length);

            gl.drawArrays(gl.LINE_STRIP, 0, vertices.length);
        }
    }

    
}





