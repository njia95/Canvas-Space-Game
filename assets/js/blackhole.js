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
var myScore;

function startGame() {
    myGameArea.start();
    redSprite = new component(50, 50, 10, 10, 1, 1, "red");
    blueSprite = new component(50, 50, 10, 110, 1, -1, "blue");
    yellowSprite = new component(50, 50, 50, 60, -1, 1, "yellow"); 
    myScore = new component("30px", "Consolas", 280, 40, 0, 0, "black", "text");
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
        
        this.frameNo = 0;
        // updateGameArea runs every 20th millisecond (50 times per second)
        this.interval = setInterval(updateGameArea, 20);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class component {
    constructor(width, height, x, y, speedX, speedY, color, type) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        this.type = type;
    }

    update() {
        var ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);            
        }
    }
    
    newPos() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.check();
    }
    
    check() {
        var bottom = myGameArea.canvas.height - this.height;
        if (this.y > bottom || this.y < 0) {
            this.speedY = 0 - this.speedY;
        }
        
        var right = myGameArea.canvas.width - this.width;
        if (this.x > right || this.x < 0) {
            this.speedX = 0 - this.speedX;
        }
    }
}

function updateGameArea() {
    myGameArea.clear();
    myGameArea.frameNo += 1;
    
    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();
    
    redSprite.newPos();
    redSprite.update();
    
    blueSprite.newPos();
    blueSprite.update();
    
    yellowSprite.newPos();
    yellowSprite.update();
}
