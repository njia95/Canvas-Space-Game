// called when page loads and sets up event handlers
window.onload = function() {
    document.getElementById("finish").onclick = showStart;
    document.getElementById("start").onclick = showGame;
    document.getElementById("timerStart").onclick = startCount;
    document.getElementById("timerPause").onclick = stopCount;
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


// timer
var time = 60;
var t;
var timerOn = 0;

function timedCount() {
    document.getElementById("timer").value = time;
    time--;
    t = setTimeout(function() { timedCount() }, 1000);
}

function startCount() {
    if (!timerOn) {
        timerOn = 1;
        timedCount();
    }
}

function stopCount() {
    clearTimeout(t);
    timerOn = 0;
}

// main
class Component {
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

    draw() {
        var ctx = GameArea.context;
        if (this.type == "text") { // draw score
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type == "image") { // draw svg
            this.image = new Image();
            this.image.onload = function() {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
            this.image.src = this.color;
        } else {
            // draw square
            // ctx.fillStyle = this.color;
            // ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // draw circles
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width, 0, 2*Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();     
        }
    }
    
    newPos() { // change position
        this.x += this.speedX;
        this.y += this.speedY;
        this.check();
    }
    
    check() { // check for boundary conditions
        var right = GameArea.canvas.width - this.width;
        if (this.x > right || this.x < this.width) {
            this.speedX = 0 - this.speedX;
        }
        
        var bottom = GameArea.canvas.height - this.height;
        if (this.y > bottom || this.y < this.height) {
            this.speedY = 0 - this.speedY;
        }
    }
}


var myScore, sprites, blackholes;

function startGame() {
    GameArea.start();
 
    myScore = new Component("30px", "Consolas", 280, 40, 0, 0, "black", "text");   
    
    sprites = new Array();
    blackholes = new Array();
    
    // insert objects into the sprites
    sprites.push(new Component(25, 25, 70, 90, 1, 1, "red"));
    sprites.push(new Component(25, 25, 80, 110, 1, -1, "blue"));
    sprites.push(new Component(25, 25, 50, 60, -1, 1, "yellow"));
    
    blackholes.push(new Component(25, 25, 70, 120, 0, 0, "assets/img/black.svg", "image"));
}

var GameArea = {
    canvas : document.createElement("canvas"),
    start() {
        this.canvas.width = 1000;
        this.canvas.height = 640;
        this.context = this.canvas.getContext("2d");
        let gamePageNode = document.getElementById("game-page");
        // insert canvas as the first child of game page
        gamePageNode.insertBefore(this.canvas, gamePageNode.childNodes[0]);
        
        this.frameNo = 0;
        // updateGameArea runs every 20th millisecond (50 times per second)
        this.interval = setInterval(updateGameArea, 20);
    },
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateGameArea() {
    GameArea.clear();
    GameArea.frameNo += 1;
    
    myScore.text = "SCORE: " + GameArea.frameNo;
    myScore.draw();
    
    for (var i = 0; i < sprites.length; i++) {
        sprites[i].newPos();
        sprites[i].draw();
    }
    
    for (var i = 0; i < blackholes.length; i++) {
        blackholes[i].draw();
    }
}
