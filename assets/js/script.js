// height and width of this canvas
const MAXWIDTH = 1000, MAXHEIGHT = 640;

// scores for balckholes once clicked
const BLUE_SCORE = 5, PURPLE_SCORE = 10, BLACK_SCORE = 20;

// how many seocnds to generate a new blackhole in the first level
const BLUE_FREQUENCY = 12, PURPLE_FREQUENCY = 26, BLACK_FREQUENCY = 30;

// paths for all three balckhole svg files (public domain)
const BLUE_IMAGE = "assets/img/blue.svg",
      PURPLE_IMAGE = "assets/img/purple.svg",
      BLACK_IMAGE = "assets/img/black.svg";

// pull speed of blackhoels
const BLUE_PULL_SPEED = 11, PURPLE_PULL_SPEED = 7, BLACK_PULL_SPEED = 5;

// limits of objects each blackhole can take before they disappear
const BLUE_EAT = 3, PURPLE_EAT = 2, BLACK_EAT = 1;

// diameter of balckhole images
const BLACKHOLE_DIAMETER = 50;

// max number of high scores displayed
const HIGH_SCORE_NUM = 3;

// radius fo event horizon
const HORIZON_DIST = 50;

// how far away if the click event from the centre of blackholes
const CLICK_DIST = 25;

// variables for the timer
var time = 60, timerOn = 0;

// variables for the current level and score
var score = 200, level = 1;

// array for storing the sprites and blackholes
var sprites = new Array(), blackholes = new Array();

// ids for time intervals
var refreshIntervalId, blackholeIntervalId, timeoutId;

// called when page loads and sets up event handlers
window.onload = function() {
    // set up on click
    document.getElementById("finish").onclick = showStart;
    document.getElementById("start").onclick = showGame;
    document.getElementById("next").onclick = showNext;
    document.getElementById("timerStart").onclick = startCount;
    document.getElementById("timerPause").onclick = stopCount;
    GameArea.canvas.onclick = removeBlackhole;

    // update and display high scores
    showHighScores();
}

// show the game page
function showGame() {
    // reset all parameters
    time = 60;
    score = 200;
    level = 1;

    // display and undisplay elements
    document.getElementById("game-page").style.display = "block";
    document.getElementById("start-page").style.display = "none";
    document.getElementById("level-box").style.display = "none";

    // display the current level
    document.getElementById("level").innerHTML = level;

    // initialize game canvas
    GameArea.initializeCanvas();

    // start the game
    startGame();

    // start the timer count
    timedCount();
}

// load the second level
function showNext() {
    // hide the level box
    document.getElementById("level-box").style.display = "none";

    // only reset the time, keep score and level
    time = 60;

    // start the second level
    startGame();

    // start the timer again
    timedCount();
}

// the function used to sort numerically
function sortNumber(a,b) {
    return b - a;
}

// go back to the start page
function showStart() {
    // stop generating blacholes under the hood
    clearInterval(blackholeIntervalId);

    // display high scores
    showHighScores();

    // display and hide elements
    document.getElementById("start-page").style.display = "block";
    document.getElementById("game-page").style.display = "none";
}

// process and dispaky the high scores
function showHighScores() {
    var highScores = new Array();
    var highScoreString = "High Scores: <br />";
    var j = 0;

    // set first few high scores to 0 if first time game paly
    if (typeof localStorage[0] == "undefined") {
        for (var i = 0; i < HIGH_SCORE_NUM; i++) {
            localStorage[i] = 0;
        }
    }

    // pass all scores from local storage to an array
    for (var i = 0; i < localStorage.length; i++) {
        highScores.push(parseInt(localStorage[i]));
    }

    // push the score if finished the game play
    if (score != 200) {
        highScores.push(score);
    }

    // sort exisitng high scores
    highScores.sort(sortNumber);

    // transfer back the first few high scores
    for (var i = 0; i < HIGH_SCORE_NUM; i++) {
        localStorage[i] = highScores[i];
    }

    // convert all high scores to a single string
    while (j < HIGH_SCORE_NUM) {
        highScoreString += localStorage[j] + "<br />";
        j++;
    }

    // display the high scores
    document.getElementById("high-score").innerHTML = highScoreString;
}

// start/resume the tiemr
function startCount() {
    if (!timerOn) {
        timerOn = 1;
        timedCount();
        document.getElementById("timerPause").style.display = "block";

        // set refresh rate for the game area
        refreshIntervalId = setInterval(updateGameArea, 20);
    }
}

// pause the tiemr
function stopCount() {
    timerOn = 0;

    // display/hdie elements
    document.getElementById("timerStart").style.display = "block";
    document.getElementById("timerPause").style.display = "none";

    // stop refreshing the game area and geenrating blackholes
    clearInterval(refreshIntervalId);
    clearTimeout(timeoutId);
}

// timer counts down evert 1 second
function timedCount() {
    // display/hdie elements
    document.getElementById("timerStart").style.display = "none";
    document.getElementById("timerPause").style.display = "block";
    document.getElementById("timer").style.display = "block";
    document.getElementById("timer").innerHTML = time + " seconds";

    // timer decrements every 1000 ms
    time--;
    timeoutId = setTimeout(function() { timedCount() }, 1000);
}

// the main game area initialized using object literal
var GameArea = {
    // create the canvas obejct
    canvas : document.createElement("canvas"),

    // initialize the canvas
    initializeCanvas() {
        // set the basic parameters
        this.canvas.width = MAXWIDTH;
        this.canvas.height = MAXHEIGHT;
        this.context = this.canvas.getContext("2d");

        // insert canvas as the first child of game page
        var gamePage = document.getElementById("game-page");
        gamePage.insertBefore(this.canvas, gamePage.childNodes[0]);
    },

    // clear the entire canvas
    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// this class used for creating any mobing objects in the game
class Component {
    // the constructor for Component
    constructor(width, height, x, y) {
        this.width = width; // width
        this.height = height;   // height
        this.x = x; // x position
        this.y = y; // y position
    }
}

// this class is used for creating a blackhole
class Blackhole extends Component {
    // the constructor for Blackhole
    constructor(width, height, x, y, src, pullSpeed, eatLimit) {
        super(width, height, x, y);
        this.src = src; // the image link
        this.pullSpeed = pullSpeed; // the pull speed
        this.eatLimit = eatLimit; // the limit of how many it can eat
        this.eaten = 0; // how many has the blackhole eaten
    }
    // draw the Blackhole with the provided Blackhole image
    draw() {
        var ctx = GameArea.context;
        // creating a new image object
        this.image = new Image();
        this.image.src = this.src;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    // check if the black has reached its full
    checkLimit() {
        return this.eaten == this.eatLimit;
    }
    // increate number of sprites of the blackhole eating
    ateOne() {
        this.eaten++;
    }
}

// the sprites that might get eaten by blackholes
class Sprite extends Component {
    // the constructor for Sprite
    constructor(width, height, x, y, speedX, speedY, color, shape, spikes = 5) {
        super(width, height, x, y);
        this.speedX = speedX;   // horizontal speed
        this.speedY = speedY;   // vertical speedY
        this.color = color;     //colour
        this.shape = shape;     // shape
        this.spikes = spikes;   // number of spikes it has
    }
    // draw different shapes
    draw() {
        var ctx = GameArea.context;
        // draw a circle
        if (this.shape == "circle") {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 25, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        // draw a planet with a right around it
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
            ctx.moveTo(centerX, centerY - height / 2); // A1
            ctx.bezierCurveTo(
                centerX + width / 2, centerY - height / 2, // C1
                centerX + width / 2, centerY + height / 2, // C2
                centerX, centerY + height/2); // A2
            ctx.bezierCurveTo(
                centerX - width / 2, centerY + height / 2, // C3
                centerX - width / 2, centerY - height / 2, // C4
                centerX, centerY - height / 2); // A1
            ctx.closePath();
            ctx.strokeStyle = generateColour();
            ctx.stroke();

        // draw a square
        } else if (this.shape == "square") {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

        // draw a star
        } else if (this.shape == "star") {
            var rot = Math.PI / 2 * 3;
            var x = this.x;
            var y = this.y;
            var spikes = this.spikes;
            var step = Math.PI / spikes;
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

        // Draw a space ship
        } else if (this.shape == "spaceShip") {
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
    // change position
    newPos() {
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
    // check for boundary conditions
    check() {
        var right = GameArea.canvas.width - this.width;
        var bottom = GameArea.canvas.height - this.height;

        // spacial case for squares
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

// remove blacholes from the array once clicked
function removeBlackhole(event) {
    var clickX = event.clientX - 10;
    var clickY = event.clientY - 10;

    // loop through all existing blackholes
    for (let i = 0; i < blackholes.length; i++) {
        // check click distances
        if (clickX >= blackholes[i].x - CLICK_DIST &&
            clickX <= blackholes[i].x + CLICK_DIST &&
            clickY >= blackholes[i].y - CLICK_DIST &&
            clickY <= blackholes[i].y + CLICK_DIST) {

            // remove one blackhole
            var removed = blackholes.splice(i, 1);
            
            // assign scores given different kinds of blackholes clicked
            if ((removed[0].src) == BLUE_IMAGE) {
                score += BLUE_SCORE;
            } else if ((removed[0].src) == PURPLE_IMAGE) {
                score += PURPLE_SCORE;
            } else {
                score += BLACK_SCORE;
            }
        }
    }
}

// start the game
function startGame() {
    // updateGameArea runs every 20th millisecond (50 times per second)
    refreshIntervalId = setInterval(updateGameArea, 20);
    blackholeIntervalId = setInterval(generateBlackhole, 1000);

    // list of possible shapes
    var shapes = ["circle", "square", "spaceShip", "planet", "star"];
    
    // list of possible number of spikes
    var listSpikes = [3, 4, 5, 8, 16, 24];

    // the current position of shapes
    var i = 0;
    var numShapes = shapes.length;
    var numSpikes = listSpikes.length;

    // generating 10 shapes
    while (sprites.length < numShapes) {
        // speicial case if it is a star
        if (shapes[i] == "star") {
            for (var j = 0; j < numSpikes; j++) {
                generateSprite(shapes[i], listSpikes[j]);
            }
        } else {
            generateSprite(shapes[i], 0);
            i++;
        }
    }
    i = 0; // reset for next level
}

// check if newly generated positions are the same
function checkSamePosition(list, x, y) {
    var leftMost, rightMost, upMost, downMost;
    for (var i = 0; i < list.length; i++) {
        if (typeof sprites[i] != "undefined") {
            leftMost = sprites[i].x - 100;
            rightMost = sprites[i].x + 100;
            upMost = sprites[i].y - 100;
            downMost = sprites[i].y + 100;
            if (x >= leftMost && x <= rightMost && 
                y >= upMost && y <= downMost) {
                return true;
            }
        }
    }
    return false;
}


// main function for updating the game area
function updateGameArea() {
    
    // clear the canvas
    GameArea.clearCanvas();

    // update the score
    document.getElementById("score").innerHTML = score;

    // redraw every sprite after moving
    for (var i = 0; i < sprites.length; i++) {
        sprites[i].newPos();
        if (sprites[i] != null) {
           sprites[i].draw();
        }
    }

    // redraw every blackhole that has not eaten enough
    for (var i = 0; i < blackholes.length; i++) {
        if (! (blackholes[i].checkLimit())) {
            blackholes[i].draw();
        }
    }

    // when the time is up, stop the game
    if (time == 0) {
        levelUp();
    }
}

// dsiplay the level box when finishing one level
function levelUp() {
    document.getElementById("current-level").innerHTML = "Level: " + level;
    
    // update current level accordingly
    if (level == 1) {
        level++;
        document.getElementById("next").style.display = "block";
        document.getElementById("finish").style.display = "none";
    } else {
        document.getElementById("next").style.display = "none";
        document.getElementById("finish").style.display = "block";
    }

    // clearing the array for sprites
    sprites = [];

    // dispaly/hide elements
    document.getElementById("timer").style.display = "none";
    document.getElementById("level-box").style.display = "block";
    document.getElementById("level").innerHTML = level;
    document.getElementById("current-score").innerHTML = "Score: " + score;
    document.getElementById("timerStart").style.display = "none";
    
    // stop refreshing the canvas and generating blackholes
    clearInterval(refreshIntervalId);
    clearInterval(blackholeIntervalId);
    
    // clear everything from canvas
    GameArea.clearCanvas();
    
    // stop the timer
    stopCount();
}

// generate a sprite object
function generateSprite(currShape, numSpikes) {
    var speedX = generateSpeed(); // the horizontal speed
    var speedY = generateSpeed();   // the vertical speed
    var colour = generateColour();  // the colour of the sprite
    var spikes = numSpikes;    // the number of spikes it has
    var shape = currShape;  // the shape of the spikes

    // regenerate starting position if it was alrea picked
    var x, y;
    do {
        x = generatePosition(MAXWIDTH);
        y = generatePosition(MAXHEIGHT);
    } while (checkSamePosition(sprites, x, y));

    // setting the values according to the shapes
    var width, height;
    if (shape == "square") {
        width = 50;
        height = 50;
    } else {
        width = 25;
        height = 25;
    }

    // create the sprite and put it into the spites list
    sprites.push(new Sprite(width, height, x, y, speedX, speedY, colour,
    shape, spikes));
}

// generate a Blackhole object
function generateBlackhole() {
    var x, y;   // x, y position

    // blue blackhole
    if (time % (BLUE_FREQUENCY / level) == 0) {
        // generate x, y
        do {
            x = generatePosition(MAXWIDTH);
            y = generatePosition(MAXHEIGHT);
        } while (checkSamePosition(blackholes, x, y));
        // create the blackhole
        blackholes.push(new Blackhole(BLACKHOLE_DIAMETER, BLACKHOLE_DIAMETER,
        x, y, BLUE_IMAGE, BLUE_PULL_SPEED, BLUE_EAT));
    }

    //purple blackhole
    if (time % (PURPLE_FREQUENCY / level) == 0) {
        // generate x, y
        do {
            x = generatePosition(MAXWIDTH);
            y = generatePosition(MAXHEIGHT);
        } while (checkSamePosition(blackholes, x, y));
        // create the blackhole
        blackholes.push(new Blackhole(BLACKHOLE_DIAMETER, BLACKHOLE_DIAMETER,
        x, y, PURPLE_IMAGE, PURPLE_PULL_SPEED, PURPLE_EAT));
    }

    // real blackhole
    if (time % (BLACK_FREQUENCY / level) == 0) {
        // generate x, y
        do {
            x = generatePosition(MAXWIDTH);
            y = generatePosition(MAXHEIGHT);
        } while (checkSamePosition(blackholes, x, y));
        // create the blackhole
        blackholes.push(new Blackhole(BLACKHOLE_DIAMETER, BLACKHOLE_DIAMETER,
        x, y, BLACK_IMAGE, BLACK_PULL_SPEED, BLACK_EAT));
    }
}

// generate random positions within the boundary
function generatePosition(axis) {
    var max = axis - 200;
    var min = 200;
    var pos = Math.random() * (max - min) + min;
    return pos;
}

// generate random speed
function generateSpeed() {
    var speedz = [-2, 1, 1, 2];
    var i = Math.floor((Math.random() * 4));
    return speedz[i];
}

// generate random colours
function generateColour() {
    var colours = ["red", "orange", "yellow", "green", "blue"];
    var i = Math.floor((Math.random() * 5));
    return colours[i];
}
