// called when page loads and sets up event handlers
window.onload = function() {
    document.getElementById("finish").onclick = showStart;
    document.getElementById("start").onclick = showGame;
    startGame();
}

function showGame() {
    document.getElementById("game-page").style.display = "block";
    document.getElementById("start-page").style.display = "none";
}

function showStart() {
    document.getElementById("start-page").style.display = "block";
    document.getElementById("game-page").style.display = "none";
}

var sprite;

function startGame() {
    myGameArea.start();
    sprite = new component(50, 50, 50, 50, "red");

}

function component(x, y, width, height, color) {
    this.x = x;
    this.y = w;
    this.width = width;
    this.height = height;
    this.color = color;
    ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height, this.color);
}

var myGameArea = { // obejct
    // find the canvas element
    canvas : document.getElementById("canvas"),
    start : function() {
        // create a drawing object
        this.context = this.canvas.getContext("2d");
    }
}
