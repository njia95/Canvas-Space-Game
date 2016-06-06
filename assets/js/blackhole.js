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

var redSprite, blueSprite, yellowSprite;

function startGame() {
    myGameArea.start();
    redSprite = new component(50, 50, 10, 10, "red");
    blueSprite = new component(50, 50, 10, 110, "blue");
    yellowSprite = new component(50, 50, 50, 60, "yellow"); 
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 1000;
        this.canvas.height = 640;
        this.context = this.canvas.getContext("2d");
        var gamePageNode = document.getElementById("game-page");
        // insert canvas as the first child of game page
        gamePageNode.insertBefore(this.canvas, gamePageNode.childNodes[0]);
        // updateGameArea runs every 20th millisecond (50 times per second)
        this.interval = setInterval(updateGameArea, 20);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, x, y, color) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
    this.update = function(){
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function updateGameArea() {
    myGameArea.clear();
    // move right 1 unit every time we update the canvas
    redSprite.x += 1;
    redSprite.update();
    
    blueSprite.x += 1;
    blueSprite.y -= 1;
    blueSprite.update();
    
    yellowSprite.x += 1;
    yellowSprite.y -= 1;
    yellowSprite.update();
}
