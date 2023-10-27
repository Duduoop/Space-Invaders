//board / canvas
let titleSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = titleSize * columns; // 32 * 16
let boardHeight = titleSize * rows //32 * 16
let context;

//ship
let shipWidth = titleSize*2;
let shipHeight  = titleSize;
let shipX =  titleSize * columns/2 - titleSize;
let shipY = titleSize * rows - titleSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = titleSize; // i move the ship one tile at a time 1 tile per sec(moving speed)

//aliens
let alienArray = [];
let alienwidth = titleSize*2;
let alienHeight = titleSize;
let alienX = titleSize;
let alienY = titleSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number of aliens to defeat or destroy or kill
let alienVelocityX = 1; //alien moving speed per sicond

//bulets
let bulletArray = [];
let bulletVelocityY = -10; //bullet moving speed per second (it only goes up y direction -10 becouse we go UP)

let score = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");//used for drawing on the board and canvas

    //draw the initial ship
    //context.fillStyle="green";
    //context.fillRect(ship.x, ship.y, ship.width, ship.height);

    //load images ps don't touch code it WORKS
    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function() {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./alien.png"
    createAliens();    

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup",  shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //alien
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //if alien touches the border the bounce
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;

                //move all aliens up by one row
                for (let j =0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);  
            
            if (alien.y >= ship.y) {
                gameOver = true;
                alert("you are dead")
            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
        //bullet colision with the aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectColision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }
    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); // removes the first element of the array
        
    }

    //next level
    if (alienCount == 0) {
        //increase the number of aliens in columns and rows by 1 (level 2...)  we will have to check if all aliens are destroyed so THEN we can spawn more.
        alienColumns + Math.min(alienColumns + 1, columns/2 -2);//the capacity (max) number of aliens in hte canvas is 16 / 2 = 6
        alienRows = Math.min(alienRows + 1, rows-4); //cap at 16-4 = 12
        alienVelocityX += 0.2;//increase the alien movement speed
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score, 5, 20);

}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if(e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; // move leftone tile per second
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; // move right one tile per second 
    }
}

function createAliens () {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c*alienwidth,
                y : alienY + r*alienHeight,
                width : alienwidth,
                height : alienHeight,
                alive : true
            }

            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        //shoot
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : titleSize/8,
            height : titleSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectColision(a, b) {
    return a.x < b.x + b.width  &&  //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x  &&  //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner passes b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b;s top left corner
}