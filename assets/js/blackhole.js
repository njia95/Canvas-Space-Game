// constants of this canvas
const MAXWIDTH = 1000, MAXHEIGHT = 640, BLUE_SCORE = 5, PURPLE_SCORE = 10,
        BLACK_SCORE = 20, HORIZON_DIST = 50, CLICK_DIST = 25;

// variables for the timer
var time = 60, timerOn = 0;

// variables for the current level and score
var score = 200, level = 1;

// array for storing the sprites and blackholes
var sprites = new Array(), blackholes = new Array();

var myScore = document.getElementById("score");

// called when page loads and sets up event handlers
window.onload = function() {
    document.getElementById("finish").onclick = showStart;
    document.getElementById("start").onclick = showGame;
    document.getElementById("timerStart").onclick = startCount;
    document.getElementById("timerPause").onclick = stopCount;
    GameArea.canvas.onclick = removeBlackhole;
    startGame();
}

// onclick functions
function showGame() {
    document.getElementById("game-page").style.display = "block";
    document.getElementById("start-page").style.display = "none";
    document.getElementById("level-box").style.display = "none";
    timedCount();
}

function showStart() {
    document.getElementById("start-page").style.display = "block";
    document.getElementById("game-page").style.display = "none";
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

// timer counts down evert 1 second
function timedCount() {
    document.getElementById("timer").innerHTML = time;
    time--;
    setTimeout(function() { timedCount() }, 1000);
}

var GameArea = {
    canvas : document.createElement("canvas"),
    initializeCanvas() {
        this.canvas.width = MAXWIDTH;
        this.canvas.height = MAXHEIGHT;
        this.context = this.canvas.getContext("2d");
        let gamePage = document.getElementById("game-page");
        // insert canvas as the first child of game page
        gamePage.insertBefore(this.canvas, gamePage.childNodes[0]);

        this.frameNo = 0;
        // updateGameArea runs every 20th millisecond (50 times per second)
        setInterval(updateGameArea, 20);
        setInterval(generateBlackholes, 1000);
    },

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// this class used for creating sprites
class Component {
    constructor(width, height, x, y) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }
}

class Blackhole extends Component {
    constructor(width, height, x, y, src) {
        super(width, height, x, y);
        this.src = src;
    }

    draw() {
        var ctx = GameArea.context;
        this.image = new Image();
        this.image.src = this.src;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Sprite extends Component {
    constructor(width, height, x, y, speedX, speedY, color, shape) {
        super(width, height, x, y);
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        this.shape = shape;
    }

    draw() {
        var ctx = GameArea.context;

        if (this.shape == "circle") {
            var centerX = this.x;
            var centerY = this.y;
            var height = 25;
            var width = 100;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width, 0, 2*Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(centerX, centerY - height/2); // A1

            ctx.bezierCurveTo(
            centerX + width/2, centerY - height/2, // C1
            centerX + width/2, centerY + height/2, // C2
            centerX, centerY + height/2); // A2

            ctx.bezierCurveTo(
            centerX - width/2, centerY + height/2, // C3
            centerX - width/2, centerY - height/2, // C4
            centerX, centerY - height/2); // A1
            ctx.stroke();

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
        } else if (this.shape == "spaceShip") {
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(this.x + 9, this.y + 17.7);
            ctx.lineTo(this.x - 9, this.y + 17.7);
            ctx.lineTo(this.x, this.y);
            ctx.fillStyle = this.color;
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            ctx.fillRect(this.x-12.5, this.y + 17.7, 25, 37.5);
            ctx.closePath();
            ctx.stroke();

            var shipY = this.y - 25;
            var leftShipX = this.x - 14;
            var rightShipX = this.x + 14;

            ctx.beginPath();
            ctx.moveTo(leftShipX, shipY + 65);
            ctx.lineTo(leftShipX, shipY + 77.5);
            ctx.lineTo(leftShipX - 12.5, shipY + 77.5);
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(rightShipX, shipY + 65);
            ctx.lineTo(rightShipX, shipY + 77.5);
            ctx.lineTo(rightShipX + 12.5, shipY + 77.5);
            ctx.closePath();
            ctx.stroke();

        } else if (this.shape == "alien") {
            ctx.beginPath();
            ctx.arc(centerX, centerY - 20, 40, 0, 2 * Math.PI,false); // x, y, radius, startAngle, endAngle, antiClockWise
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(centerX, centerY - height/2); // A1

            ctx.bezierCurveTo(
            centerX + width/2, centerY - height/2, // C1
            centerX + width/2, centerY + height/2, // C2
            centerX, centerY + height/2); // A2

            ctx.bezierCurveTo(
            centerX - width/2, centerY + height/2, // C3
            centerX - width/2, centerY - height/2, // C4
            centerX, centerY - height/2); // A1

            ctx.fillStyle =this.color;
            ctx.fill();
            ctx.closePath();
            ctx.stroke();
        }
    }

    newPos() { // change position
        for (var i = 0; i < blackholes.length; i++) {
            if (this.x >= blackholes[i].x - HORIZON_DIST &&
                this.x <= blackholes[i].x + HORIZON_DIST &&
                this.y >= blackholes[i].y - HORIZON_DIST &&
                this.y <= blackholes[i].y + HORIZON_DIST) {
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
                score -= 50;
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
            if (this.y > bottom || this.y < this.height - 50) {
                this.speedY = 0 - this.speedY;
            }
        } else {
            if (this.x > right || this.x < this.width) {
                this.speedX = 0 - this.speedX;
            }
            if (this.y > bottom || this.y < this.height) {
                this.speedY = 0 - this.speedY;
            }
        }
    }
}


function startGame() {
    document.getElementById("level").innerHTML = level;
    GameArea.initializeCanvas();

    // store all the starting positions of the shapes
    var allPos = new Array();
    for (var i = 0; i < 10; i++) {
        var empty = [-1, -1];
        allPos.push(empty);
    }

    // generating 10 shapes
    var numSprites = 0;
    while (numSprites < 10) {
        var shape = generateShape();
        var x = generatePosition(MAXWIDTH);
        var y = generatePosition(MAXHEIGHT);
        var speedX = generateSpeed();
        var speedY = generateSpeed();

        // regenerate starting position if it was alrea picked
        while (samePos(x, y)) {
            var x = generatePosition(MAXWIDTH);
            var y = generatePosition(MAXHEIGHT);
        }

        // setting the values according to the shapes
        var width;
        var height;
        if (shape == "square") {
            width = 50;
            height = 50;
        } else {
            width = 25;
            height = 25;
        }

        // generate random colour
        var colour = generateColour();

        // create the sprite
        sprites.push(new Sprite(width, height, x, y, speedX, speedY, colour, 
        shape));

        numSprites++;
    }
}

// check if x and y were the same in the previous position
function samePos(x, y) {
    for (var i = 0; i < sprites.length; i++) {
        if (x == sprites[i].x && y == sprites[i].y) {
            return true;
        }
    }
    return false;
}


function updateGameArea() {
    GameArea.clearCanvas();
    GameArea.frameNo += 1;

    myScore.innerHTML = score;

    for (let i = 0; i < sprites.length; i++) {
        sprites[i].newPos();
        if (sprites[i] != null) {
           sprites[i].draw();
        }
    }

    for (let i = 0; i < blackholes.length; i++) {
        blackholes[i].draw();
    }
    
    if (level == 1 && time == 0) {
        document.getElementById("level-box").style.display = "block";
    }
}

function generateBlackholes() {
    if (time == 10 || time == 20 || time == 30 ||
    time == 40 || time == 50 || time == 60) {
        blackholes.push(new Blackhole(50, 50, randgen("x"), randgen("y"),
        "assets/img/blue.svg"));
    } else if (time == 45 || time == 30 || time == 15) {
        blackholes.push(new Blackhole(50, 50, randgen("x"), randgen("y"),
        "assets/img/purple.svg"));
    } else if (time == 30) {
        blackholes.push(new Blackhole(50, 50, randgen("x"), randgen("y"),
        "assets/img/black.svg"));
    }
}

// random generator
function randgen(purpose) {
    var i;

    // for colour only 5 though
    if (purpose == "colour"){
        var colourNum = Math.floor((Math.random() * 5));
        var col = ["red", "orange", "yellow", "green", "blue"];
        i = col[colourNum];
    }
    return i;
}

function generateShape() {
    var num = Math.floor((Math.random() * 4));
    if (num == 0) {
        shape = "circle";
    } else if (num == 1) {
        shape = "square";
    } else if (num == 2){
        shape = "star";
    } else if (num == 3) {
        shape = "spaceShip";
    } else {
        shape = "alien";
    }
    return shape;
}

function generatePosition(axis) {
    return Math.floor(Math.random() * (axis - 200 + 1)) + 50;
}

function generateSpeed() {
    var num = Math.random();
    
    if (num >= 0.25) {
        speed = 1;
    } else if (num >= 0.5){
        speed = -1;
    } else if (num >= 0.75) {
        speed = 2;
    } else {
        speed = -2;
    }
    return speed;
}

function generateColour() {
    var col = ["red", "orange", "yellow", "green", "blue"];
    var idx = Math.floor((Math.random() * 5));
    
    return col[idx];
}


// remove blacholes from the array once clicked; assign scores given different
// kinds of blackholes clicked
function removeBlackhole(event) {
    var clickX = event.clientX - 10;
    var clickY = event.clientY - 10;

    for (let i = 0; i < blackholes.length; i++) {
        if (clickX >= blackholes[i].x - CLICK_DIST&&
            clickX <= blackholes[i].x + CLICK_DIST &&
            clickY >= blackholes[i].y - CLICK_DIST &&
            clickY <= blackholes[i].y + CLICK_DIST) {
            var removed = blackholes.splice(i, 1); // remove one blackhole
            if ((removed[0].src)[11] == "b") { // blue
                score += BLUE_SCORE;
            } else if ((removed[0].src)[11] == "p") { // purple
                score += PURPLE_SCORE;
            } else {
                score += BLACK_SCORE;
            }
        }
    }
}
