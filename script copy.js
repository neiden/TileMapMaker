//TODO
// - Add a pause screen that shows controls and goal
// - Add a game over screen that shows the score and a button to restart
// - Add a score counter
// - Refactor death animation
//      - Add image of dissapearing and normalize death animation to always be 2 seconds regardless of length
// - Normalize the position of spawning project to be relative to the canvas


const canvas = document.getElementById('gameScreen');
const ctx = canvas.getContext('2d'); 

canvas.width = window.innerWidth / 1.8;
canvas.height = window.innerHeight / 1.0;

var board = new Image();
board.src = "assets/output-onlinepngtools.png";

var head = new Image();
head.src = "assets/character/head.png";

var bodyImg = new Image();
bodyImg.src = "assets/character/body.png";

var tail = new Image();
tail.src = "assets/character/tail.png";

var bottomLeft = new Image();
bottomLeft.src = "assets/character/bottomLeft.png";

var bottomRight = new Image();
bottomRight.src = "assets/character/bottomRight.png";

var scroll = new Image();
scroll.src = "assets/items/Papyrus 1-19X22-min.png";

var projectTemplate = new Image();
projectTemplate.src = "assets/items/ScrollTemplate.png";

var keymap = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space',
    27: 'escape'
};

var keydown = {};
var currKey = 'right';

document.addEventListener('keydown', function(event){
    currKey = keymap[event.which];
    if (currKey == 'escape'){
        paused = !paused;
        if (!paused){
            startAnimating(FPS);
        }
    }
})

var angle = 0;
var xVel = 0;
var yVel = 0;

//Speed needs to relative to the tile size. 
const FPS = 20;
const speed = 18;
var bodyx = 80;
var bodyy = 200;
var tailx = 60;
var taily = 200;

var paused = false;
var death = false;
var deathTimer = 0;


var scrollFrame = 0;
var scrollWidth = 19;
var scrollHeight = 22;
var scrollFramesPerRow =18
var scrollTotalFrames = 1;
var scrollFrameX = 0;
var scrollFrameY = 0;
var scrollScale = 2;
var scrollX = Math.floor(Math.random() * ((canvas.width - 80 - scrollHeight * scrollScale)/speed)) * speed + 30;
var scrollY = Math.floor(Math.random() * ((canvas.height - 130 - scrollHeight * scrollScale)/speed)) * speed + 100;




function Body(x, y, image, rotation, type){
    this.x = x;
    this.y = y;
    this.image = image;
    this.rotation = rotation;
    this.type = type;
    this.width = 300;
    this.height = 300;
}

function renderTurn(angle, nextAngle){
    if (angle == nextAngle){
        snake.body[0].image = bodyImg;
        return;
    }
    if (angle == 270 * Math.PI / 180 && nextAngle == 0){
        snake.body[0].image = bottomLeft;
        return;
    }
    if (angle > nextAngle || (angle == 0 && nextAngle == 270 * Math.PI / 180)){
        snake.body[0].image = bottomRight;
        return;
    }
    snake.body[0].image = bottomLeft;
}



function animateScroll() {
    scrollFrame++;
    if (scrollFrame >= scrollFramesPerRow) {
        scrollFrame = 0;
    }
    scrollFrameX = scrollFrame % scrollFramesPerRow * scrollWidth;
    scrollFrameY = Math.floor(scrollFrame / scrollFramesPerRow) * scrollHeight;

    ctx.drawImage(scroll, scrollFrameX, scrollFrameY, scrollWidth, scrollHeight, scrollX, scrollY, scrollWidth*scrollScale, scrollHeight*scrollScale);
}

function spawnScroll(){
    scrollX = Math.floor(Math.random() * ((canvas.width - 80 - scrollHeight * scrollScale)/speed)) * speed + 30;
    scrollY = Math.floor(Math.random() * ((canvas.height - 130 - scrollHeight * scrollScale)/speed)) * speed + 100;
}

var snake = {
    x: 100,         
    y: 200,
    width: 300, 
    height: 300,
    head: new Body(this.x, this.y, head, 0, "head"),
    body: [new Body(80, 200, bodyImg, 90 * Math.PI / 180, "body"), new Body(60, 200, bodyImg, 0, "body"), new Body(40, 200, bodyImg, 0, "tail"), new Body(20, 200, bodyImg, 0, "tail")],
    //Need to draw the snake at even the 'inbetween' values of the grid squares
    render: function(){
        rotate(angle, this.x, this.y, this.head.image);
        this.body.forEach(piece => {
            rotate(piece.rotation, piece.x, piece.y, piece.image);
        })
    },
    //Should update the body every frame but only accept input changes 
    updateBody: function(){
        if (death){
            deathTimer++;
            if (deathTimer > 5){
                if (this.body.length > 4){
                    this.body.pop();
                }
                else{
                    //reset
                    snake.x = 300;
                    snake.y = 300;
                    death = false;
                }
                deathTimer = 0;
            }
        }
        else{
            renderTurn(this.body[0].rotation, angle);
            this.body[0].y = this.y;
            this.body[0].rotation = angle;
            for (let i = this.body.length - 1; i > 0; i--){
                this.body[0].x = this.x;
                this.body[i].x = this.body[i - 1].x;
                this.body[i].y = this.body[i - 1].y;
                this.body[i].rotation = this.body[i - 1].rotation;
                this.body[i].type = this.body[i - 1].type;
                if (i == this.body.length - 1){
                    this.body[i].image = tail;
                }
                else{
                    this.body[i].image = this.body[i - 1].image;
                }
            }
    
            this.x += xVel;
            this.y += yVel;
        }
    }
}

function rotate(angle, x, y, img){
    let width = img.width * .5;
    let height = img.height * .5;
    ctx.setTransform(1,0,0,1,x,y); 
    ctx.rotate(angle);
    ctx.drawImage(img, -width/2,-height/2, width , height); 
    ctx.setTransform(1,0,0,1,0,0); 
}


function collide(){
    if (snake.x < 35 || snake.x > canvas.width - 35 || snake.y < 55 || snake.y > canvas.height - 55){
        return true;
    }
    for (let i = 0; i < snake.body.length; i++){
        let piece = snake.body[i];
        if (snake.x == piece.x && snake.y == piece.y){
            return true;
        }
    }
    return false;
}




var fpsInterval;
var then;
var startTime;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    tick();
}

let frameCount = 0;
let moveInterval = 3;

let eaten = false;

function tick(){
    now = Date.now();
    var elapsed = now - then;
    if (!paused){
        if (elapsed > fpsInterval) {
            if (currKey == 'left' && xVel == 0){
                xVel = -speed
                yVel = 0
                angle = 270 * Math.PI / 180;
            }
            if (currKey == 'right' && xVel == 0){
                xVel = speed
                yVel = 0
                angle = 90 * Math.PI / 180;
            }
            if (currKey == 'up' && yVel == 0){  
                yVel = -speed
                xVel = 0
                angle = 0;
            }
            if (currKey == 'down' && yVel == 0){
                yVel = speed
                xVel = 0
                angle = 180 * Math.PI / 180;
            }
            // if (currKey == 'space'){
            //     snake.body.push(new Body(snake.body[snake.body.length - 1].x - 20, snake.body[snake.body.length - 1].y, bodyImg, 0, "body"));
            // }
            if (currKey == 'space'){
                spawnScroll();
            }

            snake.updateBody();
            
            //Need to update this to move in smaller increments that account for the time between frames
            // i.e xVel * elapsed / 1000 
            // This will result in the snake having positions "inbetween" the grid squares
            // - to account for this, need to round it's position up to the nearest grid square
            // - i.e Math.round(snake.x / speed) * speed

            if (snake.x >= scrollX && snake.x <= scrollX + scrollWidth *2 && snake.y >= scrollY && snake.y <= scrollY + scrollHeight * 2){
                spawnScroll();
                eaten = true;
                //Have a counter for the number of scrolls eaten and use that to get the corresponding project
                var project = document.getElementById("1");
                var rect = canvas.getBoundingClientRect();
                var scrollPageX = rect.left + scrollX;
                var scrollPageY = rect.top + scrollY;
                
                console.log(scrollPageX, scrollPageY, scrollX, scrollY)
                project.style.x= scrollPageX + "px";
                project.style.y = scrollPageY + "px";
                project.style.display = "block";
                project.style.animation = "expand 2s ease-in-out";
                project.style.animation = 'none';
                project.offsetHeight;
                project.style.animation = null;
            }
            
            if (collide()){
                death = true;
                // snake.x = 100;
                // snake.y = 200;
            }
            
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (head.complete && board.complete){
                ctx.drawImage(board, 0, 0, canvas.width, canvas.height);
                snake.render();
                animateScroll();
            }

            if (eaten){
                snake.body.push(new Body(snake.body[snake.body.length - 1].x - 20, snake.body[snake.body.length - 1].y, bodyImg, 0, "body"));
                eaten = false;
            }
            

            window.requestAnimationFrame(tick);
            then = now - (elapsed % fpsInterval);
        }
        else{
            window.requestAnimationFrame(tick);
        }
    }

}

startAnimating(FPS);