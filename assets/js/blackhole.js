// called when page loads and sets up event handlers
window.onload = function() {
    document.getElementById("finish").onclick = showStart;
    document.getElementById("start").onclick = showGame;
    document.getElementById("timerStart").onclick = startCount;
    document.getElementById("timerPause").onclick = stopCount;
    GameArea.canvas.onclick = removeBlackhole;
    startGame();
}

function showGame() {
    document.getElementById("game-page").style.display = "block";
    document.getElementById("start-page").style.display = "none";
    timedCount();
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

const MAXWIDTH = 1000;
const MAXHEIGHT = 640;
// main
class Component {
    constructor(width, height, x, y, speedX, speedY, color, type, shape) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        this.type = type;
        this.shape = shape;
    }

    draw() {
        var ctx = GameArea.context;
        if (this.type == "text") { // draw score
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type == "image") { // draw svg
            this.image = new Image();
            this.image.src = this.color;
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        } else {
            if (this.shape == "circle") {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width, 0, 2*Math.PI);
                ctx.fillStyle = this.color;
                ctx.fill();
            } else if (this.shape == "square") {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            } else if (this.shape == "star") {
                var rot = Math.PI/2*3;
                var x = this.x;
                var y = this.y;
                var spikes = 5;
                var step=Math.PI/spikes;
                var outerRadius = 25;
                var innerRadius = 10;

                ctx.beginPath();
                ctx.moveTo(this.x,this.y - outerRadius)
                for (var i = 0; i < spikes; i++){
                    x = this.x + Math.cos(rot)*outerRadius;
                    y = this.y + Math.sin(rot)*outerRadius;
                    ctx.lineTo(x,y)
                    rot+=step

                    x = this.x + Math.cos(rot)*innerRadius;
                    y = this.y + Math.sin(rot)*innerRadius;
                    ctx.lineTo(x,y)
                    rot += step
                }
                ctx.lineTo(this.x,this.y - outerRadius);
                ctx.closePath();
                ctx.lineWidth = 5;
                ctx.strokeStyle = this.color;
                ctx.stroke();
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }
    }

    newPos() { // change position
        for (var i = 0; i < blackholes.length; i++) {
            if (this.x >= blackholes[i].x - 50 && 
                this.x <= blackholes[i].x + 50 && 
                this.y >= blackholes[i].y - 50 && 
                this.y <= blackholes[i].y + 50) {
                var dx = blackholes[i].x - this.x;
                var dy = blackholes[i].y - this.y;
                this.speedX = dx / 5;
                this.speedY = dy / 5;
            }
        }
        this.x += this.speedX;
        this.y += this.speedY;
        
        for (var i = 0; i < blackholes.length; i++) {
            if (this.x >= blackholes[i].x - 10 && 
                this.x <= blackholes[i].x + 10 && 
                this.y >= blackholes[i].y - 10 && 
                this.y <= blackholes[i].y + 10) {
                var idx = sprites.indexOf(this);
                sprites.splice(idx, 1);
            }
        }  
        this.check();
    }

    check() { // check for boundary conditions
        var right = GameArea.canvas.width - this.width;
        var bottom = GameArea.canvas.height - this.height;

        if (this.shape == "square") {
            if (this.x > right || this.x < this.width - 50) {
                this.speedX = 0 - this.speedX ;
            }
            if (this.y > bottom || this.y < this.height) {
                this.speedY = 0 - this.speedY;
            }
        } else {
            if (this.x > right || this.x < this.width) {
                this.speedX = 0 - this.speedX;
            }
            if (this.y > bottom || this.y < this.height + 50) {
                this.speedY = 0 - this.speedY;
            }
        }
    }
}


var myScore, score = 0, sprites = new Array(), blackholes = new Array();

function startGame() {
    GameArea.start();

    myScore = new Component("30px", "Consolas", 280, 40, 0, 0, "black", "text");

    // check if x and y were the same in the previous position
    function samePos(currPos, allPos) {
        for (var i = 0; i < 10; i++) {
            if (allPos[i][0] == currPos[0] && allPos[i][1] == currPos[1]) {
                return true;
            }
        }
        return false;
    }

    // store all the starting positions of the shapes
    var allPos = new Array();
    for (var i = 0; i < 10; i++) {
        var empty = [-1, -1];
        allPos.push(empty);
    }

    // generating 10 shapes
    var numSprites = 0;
    while (numSprites < 10) {
        var currShape = randgen("shape");
        var currX = randgen("x");
        var currY = randgen("y");
        var currSpeedX = randgen("speed");
        var currSpeedY = randgen("speed");

        var pos = new Array();
        pos.push(currX, currY);
        // regenerate starting position if it was alrea picked
        while (samePos(pos, allPos)) {
            currX = randgen("x");
            currY = randgen("y");
        }
        allPos.push(pos);

        // setting the values according to the shapes
        var currWidth;
        var currHeight;
        if (currShape == "square") {
            currWidth = 50;
            currHeight = 50;
        } else {
            currWidth = 25;
            currHeight = 25;
        }

        // generate random colour
        var currColour =randgen("colour");

        // create the sprite
        sprites.push(new Component(currWidth, currHeight, currX, currY, 
        currSpeedX, currSpeedY, currColour, "sprite", currShape));

        numSprites++;
    }   
}

var GameArea = {
    canvas : document.createElement("canvas"),
    start() {
        this.canvas.width = MAXWIDTH;
        this.canvas.height = MAXHEIGHT;
        this.context = this.canvas.getContext("2d");
        let gamePageNode = document.getElementById("game-page");
        // insert canvas as the first child of game page
        gamePageNode.insertBefore(this.canvas, gamePageNode.childNodes[0]);

        this.frameNo = 0;
        // updateGameArea runs every 20th millisecond (50 times per second)
        this.interval = setInterval(updateGameArea, 20);
        this.bh = setInterval(generateBH, 1000);
    },
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateGameArea() {
    GameArea.clear();
    GameArea.frameNo += 1;
    

    myScore.text = "SCORE: " + score;
    myScore.draw();

    for (var i = 0; i < sprites.length; i++) {
        sprites[i].newPos();
        sprites[i].draw();
    }
    

    for (var i = 0; i < blackholes.length; i++) {
        blackholes[i].draw();
    }
}

function generateBH() {
    if (time == 10 || time == 20 || time == 30 || 
    time == 40 || time == 50 || time == 60) {
        blackholes.push(new Component(50, 50, randgen("x"), randgen("y"), 0, 0, 
        "assets/img/blue.svg", "image"));
    } else if (time == 45 || time == 30 || time == 15) {
        blackholes.push(new Component(50, 50, randgen("x"), randgen("y"), 0, 0, 
        "assets/img/purple.svg", "image"));
    } else if (time == 30) {
        blackholes.push(new Component(50, 50, randgen("x"), randgen("y"), 0, 0, 
        "assets/img/black.svg", "image"));
    } 
}

// random generator
function randgen(purpose) {
    var i;
    // for shapes
    if (purpose == "shape") {
        i = Math.floor((Math.random() * 3));
        if (i == 0) {
            i = "circle";
        } else if (i == 1) {
            i = "square";
        } else {
            i = "star";
        }
    // for x starting position
    } else if (purpose == "x") {
        i = Math.floor(Math.random() * (MAXWIDTH - 100 + 1)) + 50;
    // for y starting position
    } else if (purpose == "y") {
        i = Math.floor(Math.random() * (MAXHEIGHT - 100 + 1)) + 50;
    // for speed
    } else if (purpose == "speed"){
        if (Math.random() >= 0.5) {
            i = 1;
        } else {
            i = -1;
        }
    // for colour only 5 though
    } else if (purpose == "colour"){
        var colourNum = Math.floor((Math.random() * 5));
        var col = ["red", "orange", "yellow", "green", "blue"];
        i = col[colourNum];
    }
    return i;
}

function removeBlackhole(event) {
    var clickX = event.clientX - 10;
    var clickY = event.clientY - 10;
    
    for (var i = 0; i < blackholes.length; i++) {
        if (clickX >= blackholes[i].x - 50 && 
            clickX <= blackholes[i].x + 50 && 
            clickY >= blackholes[i].y - 50 && 
            clickY <= blackholes[i].y + 50) {
            var removed = blackholes.splice(i, 1); // remove one blackhole
            if ((removed[0].color)[11] == "b") { // blue
                score += 5;
            } else if ((removed[0].color)[11] == "p") { // purple
                score += 10;
            } else {
                score += 20;
            }
        }
    }
}