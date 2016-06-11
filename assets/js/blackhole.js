// constants of this canvas
const MAXWIDTH = 1000, MAXHEIGHT = 640, BLUE_SCORE = 5, PURPLE_SCORE = 10,
        BLACK_SCORE = 20, HORIZON_DIST = 50, CLICK_DIST = 25,
        BLUE_FREQUENCY = 10, PURPLE_FREQUENCY = 20, BLACK_FREQUENCY = 30,
        BLUE_IMAGE = "assets/img/blue.svg",
        PURPLE_IMAGE = "assets/img/purple.svg",
        BLACK_IMAGE = "assets/img/black.svg",
        BLACKHOLE_DIAMETER = 50, HIGH_SCORE_NUM = 3,
        BLUE_PULL_SPEED = 11, PURPLE_PULL_SPEED = 7, BLACK_PULL_SPEED = 5,
        BLUE_EAT = 3, PURPLE_EAT = 2, BLACK_EAT = 1;

// variables for the timer
var time = 60, timerOn = 0;

// variables for the current level and score
var score = 200, level = 1;

// array for storing the sprites and

var sprites = new Array(), blackholes = new Array();

var myScore = document.getElementById("score");

var refreshIntervalId, blackholeIntervalId, timeoutId;

// called when page loads and sets up event handlers
window.onload = function() {
    document.getElementById("finish").onclick = showStart;
    document.getElementById("start").onclick = showGame;
    document.getElementById("next").onclick = showNext;
    document.getElementById("timerStart").onclick = startCount;
    document.getElementById("timerPause").onclick = stopCount;
    GameArea.canvas.onclick = removeBlackhole;
    showHighScores();

}

// onclick functions
function showGame() {
    document.getElementById("game-page").style.display = "block";
    document.getElementById("start-page").style.display = "none";
    document.getElementById("level-box").style.display = "none";
    document.getElementById("level").innerHTML = level;
    GameArea.initializeCanvas();
    startGame();
    timedCount();
}

function showNext() {
    document.getElementById("level-box").style.display = "none";
    startGame();
    time = 60;
    timedCount();
}

function sortNumber(a,b) {
    return b - a;
}

function showStart() {
    showHighScores();

    document.getElementById("start-page").style.display = "block";
    document.getElementById("game-page").style.display = "none";
}

function showHighScores() {
    var highScores = new Array();
    for (var i = 0; i < localStorage.length; i++) {
        highScores.push(parseInt(localStorage[i]));
    }

    highScores.push(score);
    highScores.sort(sortNumber);

    for (var i = 0; i < highScores.length; i++) {
        localStorage[i] = (highScores[i]);
    }

    var highScoreString = "High Scores: <br />";
    var i = 0;

    while (typeof localStorage[i] != "undefined" && i < HIGH_SCORE_NUM) {
        highScoreString += localStorage[i] + "<br />";
        i++;
    }

    document.getElementById("high-score").innerHTML = highScoreString;
}

function startCount() {
    if (!timerOn) {
        timerOn = 1;
        timedCount();
        document.getElementById("timerPause").style.display = "block";
    }
}

function stopCount() {
    document.getElementById("timerStart").style.display = "block";
    document.getElementById("timerPause").style.display = "none";
    clearTimeout(timeoutId);
    timerOn = 0;
}

// timer counts down evert 1 second
function timedCount() {
    document.getElementById("timerStart").style.display = "none";
    document.getElementById("timerPause").style.display = "block";
    document.getElementById("timer").innerHTML = time + " seconds";
    time--;
    timeoutId = setTimeout(function() { timedCount() }, 1000);
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
    constructor(width, height, x, y, src, pullSpeed, eatLimit) {
        super(width, height, x, y);
        this.src = src;
        this.pullSpeed = pullSpeed;
        this.eatLimit = eatLimit;
        this.eaten = 0;
    }

    draw() {
        var ctx = GameArea.context;
        this.image = new Image();
        this.image.src = this.src;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    checkLimit() {
        return this.eaten == this.eatLimit;
    }

    ateOne() {
        this.eaten++;
    }
}

class Sprite extends Component {
    constructor(width, height, x, y, speedX, speedY, color, shape, spikes = 5) {
        super(width, height, x, y);
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        this.shape = shape;
        this.spikes = spikes;
    }
    // draw different shapes
    draw() {
        var ctx = GameArea.context;
        if (this.shape == "circle") {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 25, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();

        } else if (this.shape == "planet") {
            var centerX = this.x;
            var centerY = this.y;
            var height = 10;
            var width = 50;

            // middle circle
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.closePath();
            ctx.fill();

            // oval
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
            ctx.closePath();
            ctx.strokeStyle = generateColour();
            ctx.stroke();

        } else if (this.shape == "square") {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.shape == "star") {
            var rot = Math.PI/2*3;
            var x = this.x;
            var y = this.y;
            var spikes = this.spikes;
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
            ctx.fillStyle = generateColour();
            ctx.fill();
        } else if (this.shape == "spaceShip") {
            // spaceShip
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - 25);
            ctx.lineTo(this.x + 10, this.y);
            ctx.lineTo(this.x - 10, this.y);
            ctx.fillStyle = "blue";
            ctx.fill();
            ctx.closePath();


            ctx.beginPath();
            ctx.fillStyle = "yellow";
            ctx.fillRect(this.x - 10, this.y, 20, 25);
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(this.x - 10, this.y + 12.5);
            ctx.lineTo(this.x - 25, this.y + 25);
            ctx.lineTo(this.x - 10, this.y + 25);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y + 12.5);
            ctx.lineTo(this.x + 25, this.y + 25);
            ctx.lineTo(this.x + 10, this.y + 25);
            ctx.fill();
            ctx.closePath();

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
                this.speedX = dx / blackholes[i].pullSpeed;
                this.speedY = dy / blackholes[i].pullSpeed;
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

                blackholes[i].ateOne();

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
            if (this.y > bottom || this.y < this.height + 25) {
                this.speedY = 0 - this.speedY;
            }
        } else {
            if (this.x > right || this.x < this.width) {
                this.speedX = 0 - this.speedX;
            }
            if (this.y > bottom || this.y < this.height + 80) {
                this.speedY = 0 - this.speedY;
            }
        }
    }
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
            if ((removed[0].src) == BLUE_IMAGE) { // blue
                score += BLUE_SCORE;
            } else if ((removed[0].src) == PURPLE_IMAGE) { // purple
                score += PURPLE_SCORE;
            } else {
                score += BLACK_SCORE;
            }
        }
    }
}


function startGame() {
    // updateGameArea runs every 20th millisecond (50 times per second)
    refreshIntervalId = setInterval(updateGameArea, 20);
    blackholeIntervalId = setInterval(generateBlackhole, 1000);

    var shapes = ["circle", "square", "spaceShip", "planet", "star"];
    var listSpikes = [3, 4, 5, 8, 16, 24];

    var i = 0;
    var numShapes = 5;
    var numSpikes = 6;

    // generating 10 shapes
    while (sprites.length < numShapes) {
        if (shapes[i] == "star"){
            for (var j = 0; j < numSpikes; j++) {
                generateSprite(shapes[i], listSpikes[j]);
            }
        } else {
            generateSprite(shapes[i], 0);
            i++;
        }
    }
    i = 0;
}

// check if x and y were the same in the previous position
function checkSamePosition(x, y) {
    for (var i = 0; i < sprites.length; i++) {
        if (x == sprites[i].x && y == sprites[i].y) {
            return true;
        }
    }
    return false;
}

function updateGameArea() {
    GameArea.clearCanvas();

    myScore.innerHTML = score;

    for (var i = 0; i < sprites.length; i++) {
        sprites[i].newPos();
        if (sprites[i] != null) {
           sprites[i].draw();
        }
    }

    for (var i = 0; i < blackholes.length; i++) {
        // blackholes[i].draw();
        if (! (blackholes[i].checkLimit())) {
            blackholes[i].draw();
        }
    }

    if (time == 0) {
        levelUp();
    }
}

function levelUp() {
    document.getElementById("current-level").innerHTML = "Level: " + level;
    if (level == 1) {
        level++;
        document.getElementById("finish").style.display = "none";
    } else {
        document.getElementById("next").style.display = "none";
        document.getElementById("finish").style.display = "block";
    }

    // clearing the array for sprites
    sprites = [];

    document.getElementById("level-box").style.display = "block";
    document.getElementById("level").innerHTML = level;
    document.getElementById("current-score").innerHTML = "Score: " + score;
    GameArea.clearCanvas();
    stopCount();
    document.getElementById("timerStart").style.display = "none";
    clearInterval(refreshIntervalId);
    clearInterval(blackholeIntervalId);

}

function generateSprite(currShape, numSpikes) {
    var speedX = generateSpeed();
    var speedY = generateSpeed();
    var colour = generateColour();
    var spikes = numSpikes;
    var shape = currShape;

    // regenerate starting position if it was alrea picked
    var x, y;
    do {
        x = generatePosition(MAXWIDTH);
        y = generatePosition(MAXHEIGHT);
    } while (checkSamePosition(x, y));

    // setting the values according to the shapes
    var width, height;
    if (shape == "square") {
        width = 50;
        height = 50;
    } else {
        width = 25;
        height = 25;
    }

    // create the sprite
    sprites.push(new Sprite(width, height, x, y, speedX, speedY, colour,
    shape, spikes));
}

function generateBlackhole() {
    if (time % (BLUE_FREQUENCY / level) == 0 && time >= (BLUE_FREQUENCY / level)) {
        blackholes.push(new Blackhole(BLACKHOLE_DIAMETER, BLACKHOLE_DIAMETER,
        generatePosition(MAXWIDTH), generatePosition(MAXHEIGHT), BLUE_IMAGE,
        BLUE_PULL_SPEED, BLUE_EAT));
    }

    if (time % (PURPLE_FREQUENCY / level) == 0 && time >= (PURPLE_FREQUENCY / level)) {
        blackholes.push(new Blackhole(BLACKHOLE_DIAMETER, BLACKHOLE_DIAMETER,
        generatePosition(MAXWIDTH), generatePosition(MAXHEIGHT), PURPLE_IMAGE,
        PURPLE_PULL_SPEED, PURPLE_EAT));
    }

    if (time % (BLACK_FREQUENCY / level) == 0 && time >= (BLACK_FREQUENCY / level)) {
        blackholes.push(new Blackhole(BLACKHOLE_DIAMETER, BLACKHOLE_DIAMETER,
        generatePosition(MAXWIDTH), generatePosition(MAXHEIGHT), BLACK_IMAGE,
        BLACK_PULL_SPEED, BLACK_EAT));
    }
}

function generatePosition(axis) {
    var max = axis - 200;
    var min = 200;
    var pos = Math.random() * (max - min) + min;
    return pos;
}

function generateSpeed() {
    var speedz = [-2, 1, 1, 2];
    var i = Math.floor((Math.random() * 4));
    return speedz[i];
}

function generateColour() {
    var colours = ["red", "orange", "yellow", "green", "blue"];
    var i = Math.floor((Math.random() * 5));
    return colours[i];
}
