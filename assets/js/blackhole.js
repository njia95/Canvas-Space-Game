// called when page loads and sets up event handlers
window.onload = function() {
    document.getElementById("finish").onclick = showStart;
    document.getElementById("start").onclick = showGame;
}


function showGame() {
    document.getElementById("game-page").style.display = "block";
    document.getElementById("start-page").style.display = "none";
}

function showStart() {
    document.getElementById("start-page").style.display = "block";
    document.getElementById("game-page").style.display = "none";
}

function startGame() {
    myGameArea.start();
}

var myGameArea = { // obejct 
    // find the canvas element
    canvas : document.getElementById("canvas"),
    start : function() {
        // create a drawing object
        this.context = this.canvas.getContext("2d");
    }
}

