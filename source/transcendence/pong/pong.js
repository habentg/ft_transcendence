// issues
// paddle doesnt remove visuals when used but not properly. 


//Game settings
let paddleSpeed = 6;
let ballSpeed = 4.5;
let maxScore = 500;
let slowServe = false;
let	aiFlag = false;
let parryFlag = false;

// Board setup
let board;
let boardWidth = 800;
let boardHeight = 500;
let context;

// Player setup
let playerWidth = 15;
let playerHeight = 80;
let playerVelocityY = 0;
let activeKeys = {};
const cooldownTime = 3000; // cooldown for parry power up

let player1 = {
    x: 10,
    y: (boardHeight / 2) - (playerHeight / 2),
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
    cooldownFlag: false,
    parryKey: "KeyA",
    parryCooldown: 0,
};

let player2 = {
    x: boardWidth - 10 - playerWidth,
    y: (boardHeight / 2) - (playerHeight / 2),
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
    cooldownFlag: false,
    parryKey: "Numpad0",
    parryCooldown: 0,
};

// Ball setup
let ballRadius = 7.5;
let defballSpeed = 4.5;
let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    velocityX: defballSpeed,
    velocityY: defballSpeed 
};  

let player1Score = 0;
let player2Score = 0;
let player1LastKey = null;
let player2LastKey = null;
let drawFlag = false;

window.onload = function () {
    // this is the part where we should get which type of game does the user wants to play.
    // Should grab players info by grabbing its PK (primary key)
    


	
    
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    requestAnimationFrame(draw);
    document.getElementById("startButton").addEventListener("click", startGame);
    document.getElementById("settingButton").addEventListener("click", openSettings);
    document.getElementById("applyButton").addEventListener("click", changeSetting);
	document.getElementById("aiButton").addEventListener("click", startaiGame);

    document.addEventListener("keydown", move);
    document.addEventListener("keyup", stopMovement);
    displayStartMessage();
};

function openSettings() {
    document.getElementById("settingsMenu").style.display = "block";
}

function changeSetting() {
    // valid ranges for the settings
    const MIN_PADDLE_SPEED = 1, MAX_PADDLE_SPEED = 10;
    const MIN_BALL_SPEED = 1, MAX_BALL_SPEED = 10;
    const MIN_MAX_SCORE = 1, MAX_MAX_SCORE = 20;

    const paddleSpeedInput = parseInt(document.getElementById("paddleSpeed").value);
    const ballSpeedInput = parseFloat(document.getElementById("ballSpeed").value);
    const maxScoreInput = parseInt(document.getElementById("maxScore").value);
    const slowServeInput = document.getElementById("slowServe").checked;

    let errors = [];

    if (paddleSpeedInput < MIN_PADDLE_SPEED || paddleSpeedInput > MAX_PADDLE_SPEED) {
        errors.push(`Paddle Speed must be between ${MIN_PADDLE_SPEED} and ${MAX_PADDLE_SPEED}.`);
    }
    if (ballSpeedInput < MIN_BALL_SPEED || ballSpeedInput > MAX_BALL_SPEED) {
        errors.push(`Ball Speed must be between ${MIN_BALL_SPEED} and ${MAX_BALL_SPEED}.`);
    }
    if (maxScoreInput < MIN_MAX_SCORE || maxScoreInput > MAX_MAX_SCORE) {
        errors.push(`Winning Score must be between ${MIN_MAX_SCORE} and ${MAX_MAX_SCORE}.`);
    }
    const errorContainer = document.getElementById("errorMessages");
    errorContainer.innerHTML = ""; // Clear existing messages
    if (errors.length > 0) {
        errors.forEach(error => {
            const errorElement = document.createElement("p");
            errorElement.textContent = error;
            errorElement.style.color = "red";
            errorContainer.appendChild(errorElement);
        });
        return; // Stop applying settings if there are errors
    }

    paddleSpeed = paddleSpeedInput;
    defballSpeed = ballSpeedInput;
    maxScore = maxScoreInput;
    slowServe = slowServeInput;

    document.getElementById("settingsMenu").style.display = "none";
    console.log("Settings Applied: ", { paddleSpeed, defballSpeed, maxScore, slowServe });

    ball.velocityX = ball.velocityX > 0 ? defballSpeed : -defballSpeed;
    ball.velocityY = ball.velocityY > 0 ? defballSpeed : -defballSpeed;

    document.getElementById("settingsMenu").style.display = "none";
    console.log("Settings Applied: ", { paddleSpeed, defballSpeed, maxScore });
}

function displayStartMessage() {
    context.clearRect(0, 0, board.width, board.height);
    context.font = "30px sans-serif";
    context.fillStyle = "white";
    context.fillText("Press 'Start Game' to Play!", boardWidth / 5, boardHeight / 2);
}

function startGame() {
    player1Score = 0;
    player2Score = 0;
    player1LastKey = null;
    player2LastKey = null;
    drawFlag = true;
    parryFlag = true;
    requestAnimationFrame(draw);
    document.getElementById("startButton").disabled = true; //disable start button when the game starts
}

function drawLine() {
    // Draw dotted line in the middle
    context.setLineDash([10, 20]); // Pattern: 5px dash, 15px space
    context.strokeStyle = 'white'; // Line color
    context.lineWidth = 5; // Line thickness
    context.beginPath();
    context.moveTo(boardWidth / 2, 0); // Start at the top middle
    context.lineTo(boardWidth / 2, boardHeight); // Draw to the bottom middle
    context.stroke();
    context.setLineDash([]); // Reset line dash to solid
}

function draw() {
    if (!drawFlag){
        return ;
    }
    requestAnimationFrame(draw);
    updatePaddleVelocities();

    // Clear board
    context.clearRect(0, 0, board.width, board.height);

	// if (aiFlag) aiLogic();

    drawLine();
    // Update player positions
    if (!oob(player1.y + player1.velocityY)) player1.y += player1.velocityY;
    if (!oob(player2.y + player2.velocityY)) player2.y += player2.velocityY;

	if (!player1.cooldownFlag)
    	drawCapsulePaddle(player1.x, player1.y, player1.width, player1.height, player1.width / 2, '#84ddfc', 'green');
	else
		drawCapsulePaddle(player1.x, player1.y, player1.width, player1.height, player1.width / 2, '#84ddfc', 'black');
	if (!player2.cooldownFlag)
    	drawCapsulePaddle(player2.x, player2.y, player2.width, player2.height, player2.width / 2, '#84ddfc', 'green');
	else
    	drawCapsulePaddle(player2.x, player2.y, player2.width, player2.height, player2.width / 2, '#84ddfc', 'black');

    // Update ball position
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Check ball collision with walls
    if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= boardHeight) ball.velocityY *= -1;

    // Check ball collision with players
    // if (ballCollision(ball, player1, player1LastKey)) player1LastKey = null;
    // if (ballCollision(ball, player2, player2LastKey)) player2LastKey = null;
	// if (ballCollision(ball, player1, "left"));
	// if (ballCollision(ball, player2, "right"));
	ballCollision(ball, player1, "left");
	ballCollision(ball, player2, "right");
    // Draw ball as a circle
    context.beginPath();
    context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    context.fillStyle = '#b02c98';
    context.fill();
    context.closePath();

    // Check for goals
    if (ball.x - ballRadius < 0) {
        player2Score++;
        resetGame(1);
    } else if (ball.x + ballRadius > boardWidth) {
        player1Score++;
        resetGame(-1);
    }

    // Display scores
    context.fillStyle = '#ffffff';
    context.font = "45px sans-serif";
    context.fillText(player1Score, boardWidth / 5, 45);
    context.fillText(player2Score, (boardWidth * 4) / 5, 45);
}

// function move(e) {
//     if (e.code === "KeyW") {
//         player1.velocityY = -paddleSpeed;
//         player1LastKey = "KeyW";
//     }
//     if (e.code === "KeyS") {
//         player1.velocityY = paddleSpeed;
//         player1LastKey = "KeyS";
//     }
//     if (e.code === "ArrowUp") {
//         player2.velocityY = -paddleSpeed;
//         player2LastKey = "ArrowUp";
//     }
//     if (e.code === "ArrowDown") {
//         player2.velocityY = paddleSpeed;
//         player2LastKey = "ArrowDown";
//     }
// }

// function stopMovement(e) {
//     if (e.code === "KeyW" || e.code === "KeyS"){
//         player1.velocityY = 0;
//         player1LastKey = e.code;
//     }
//     if (e.code === "ArrowUp" || e.code === "ArrowDown"){
//         player2.velocityY = 0;
//         player2LastKey = e.code;
//     }
// }

function updatePaddleVelocities() {
    // Player 1 movement
    if (activeKeys["KeyW"]) {
        player1.velocityY = -paddleSpeed;
    } else if (activeKeys["KeyS"]) {
        player1.velocityY = paddleSpeed;
    } else {
        player1.velocityY = 0;
    }

    // Player 2 movement
    if (activeKeys["ArrowUp"]) {
        player2.velocityY = -paddleSpeed;
    } else if (activeKeys["ArrowDown"]) {
        player2.velocityY = paddleSpeed;
    } else {
        player2.velocityY = 0;
    }
	// change this one so it works like if it uses it and failed it would still go cooldown instead of cannot be used if cannot be parried. // to work on
    if (parryFlag) {
        if (activeKeys["KeyA"] && !player1.cooldownFlag) {
            if (isParry(player1)) {
				ball.velocityX *= 2;
            	ball.velocityY = 0;
			}
            parryCoolDown(player1);
        }
        if (activeKeys["Numpad0"] && !player2.cooldownFlag) {
            if (isParry(player2)) {
				ball.velocityX *= -2;
            	ball.velocityY = 0;
			}
            parryCoolDown(player2);
        }
        parryRefresh(player1);
        parryRefresh(player2);
    }
}

function isParry(player) {
    const parryRange = 10; // Adjust as needed
    const ballNearPlayer = 
        player.x < boardWidth / 2 // Check which side the player is on
        ? ball.x - ballRadius <= player.x + player.width + parryRange // Near Player 1
        : ball.x + ballRadius >= player.x - parryRange; // Near Player 2
    const withinVerticalRange = 
        ball.y + ballRadius > player.y && ball.y - ballRadius < player.y + player.height;
    return ballNearPlayer && withinVerticalRange;
}

function parryCoolDown(player) {
    player.cooldownFlag = true
    player.parryCooldown = Date.now() + cooldownTime;
}

function parryRefresh(player) {
    if (player.cooldownFlag && Date.now() > player.parryCooldown) {
        player.cooldownFlag = false
    }
}

function move(e) {
    activeKeys[e.code] = true;
    console.log(`Key Down: ${e.code}`); // Debugging
}


function stopMovement(e) {
    activeKeys[e.code] = false;
    console.log(`Key Up: ${e.code}`);
}

// function to check if the paddle is inside the walls, by walls the top and bottom part of the board.
function oob(yPosition) {
    return yPosition < 0 || yPosition + playerHeight > boardHeight;
}

function ballCollision(ball, player, position) {
    // Define the maximum speed for the ball
    const MAX_SPEED_X = 4; // Maximum horizontal speed (velocityX)
    const MAX_SPEED_Y = 4; // Maximum vertical speed (velocityY)

    let isCollision =
        ball.x - ballRadius < player.x + player.width &&   // Right side of the ball is past the left side of the player
        ball.x + ballRadius > player.x &&                 // Left side of the ball is past the right side of the player
        ball.y + ballRadius > player.y &&                 // Bottom side of the ball is past the top of the player
        ball.y - ballRadius < player.y + player.height;   // Top side of the ball is past the bottom of the player

    if (isCollision) {
        // Reverse the horizontal direction based on which side of the paddle the ball hits
        let hitPosition = (ball.y - player.y) / player.height; // Normalize hit position between 0 and 1
        let section = Math.floor(hitPosition * 4); // Section index (0, 1, 2, 3)

        if (position === "left") {
            // Ball hit the left player's paddle, reverse the horizontal velocity
            ball.velocityX = Math.abs(ball.velocityX);  // Ensure velocityX is positive (moving right)
            
            switch (section) {
                case 0: // Top section (first 1/4th of the paddle)
                    ball.velocityY = 2.5; // Strong upwards angle
                    break;
                case 1: // Upper middle section (second 1/4th of the paddle)
                    ball.velocityY = -1.5; // Slightly upwards
                    break;
                case 2: // Lower middle section (third 1/4th of the paddle)
                    ball.velocityY = 1.5; // Slightly downwards
                    break;
                case 3: // Bottom section (last 1/4th of the paddle)
                    ball.velocityY = -2.5; // Strong downward angle
                    break;
            }
        } else if (position === "right") {
            // Ball hit the right player's paddle, reverse the horizontal velocity
            ball.velocityX = -Math.abs(ball.velocityX); // Ensure velocityX is negative (moving left)
            
            switch (section) {
                case 0: // Top section (first 1/4th of the paddle)
                    ball.velocityY = -2.5; // Strong upwards angle
                    break;
                case 1: // Upper middle section (second 1/4th of the paddle)
                    ball.velocityY = -1.5; // Slightly upwards
                    break;
                case 2: // Lower middle section (third 1/4th of the paddle)
                    ball.velocityY = 1.5; // Slightly downwards
                    break;
                case 3: // Bottom section (last 1/4th of the paddle)
                    ball.velocityY = 2.5; // Strong downward angle
                    break;
            }
        }

        // Optional: Increase the ball's speed based on where it hits the paddle
        if (section === 0 || section === 3) {
            ball.velocityX *= 1.2; // Slightly increase the horizontal speed for top/bottom hits (more challenge)
        }

        // Resolve collision by moving the ball just outside the paddle (avoid sticking or going through the paddle)
        if (position === "left") {
            // Ball hit the left player's paddle, so move it just to the right of the paddle
            ball.x = player.x + player.width + ballRadius;
        } else if (position === "right") {
            // Ball hit the right player's paddle, so move it just to the left of the paddle
            ball.x = player.x - ballRadius;
        }

        // Clamp the velocities to ensure they do not exceed the maximum speed
        ball.velocityX = Math.min(Math.max(ball.velocityX, -MAX_SPEED_X), MAX_SPEED_X);
        ball.velocityY = Math.min(Math.max(ball.velocityY, -MAX_SPEED_Y), MAX_SPEED_Y);
    }

    return isCollision;
}


// function ballCollision(ball, player, position) {
//     let isCollision =
//         ball.x - ballRadius < player.x + player.width &&   // Right side of the ball is past the left side of the player
//         ball.x + ballRadius > player.x &&                 // Left side of the ball is past the right side of the player
//         ball.y + ballRadius > player.y &&                 // Bottom side of the ball is past the top of the player
//         ball.y - ballRadius < player.y + player.height;   // Top side of the ball is past the bottom of the player

//     if (isCollision) {
//         // Reverse the horizontal direction based on which side of the paddle the ball hits
        
// 		let hitPosition = (ball.y - player.y) / player.height; // Normalize hit position between 0 and 1
// 		let section = Math.floor(hitPosition * 4); // Section index (0, 1, 2, 3)
	
// 		if (position === "left") {
//             // Ball hit the left player's paddle, reverse the horizontal velocity
//             ball.velocityX = Math.abs(ball.velocityX);  // Ensure velocityX is positive (moving right)
// 			switch (section) {
// 				case 0: // Top section (first 1/4th of the paddle)
// 					ball.velocityY = 2.5; // Strong upwards angle
// 					break;
// 				case 1: // Upper middle section (second 1/4th of the paddle)
// 					ball.velocityY = -1.5; // Slightly upwards
// 					break;
// 				case 2: // Lower middle section (third 1/4th of the paddle)
// 					ball.velocityY = 1.5; // Slightly downwards
// 					break;
// 				case 3: // Bottom section (last 1/4th of the paddle)
// 					ball.velocityY = -2.5; // Strong downward angle
// 					break;
// 			}
//         } else if (position === "right") {
//             // Ball hit the right player's paddle, reverse the horizontal velocity
//             ball.velocityX = -Math.abs(ball.velocityX); // Ensure velocityX is negative (moving left)
// 			switch (section) {
// 				case 0: // Top section (first 1/4th of the paddle)
// 					ball.velocityY = -2.5; // Strong upwards angle
// 					break;
// 				case 1: // Upper middle section (second 1/4th of the paddle)
// 					ball.velocityY = -1.5; // Slightly upwards
// 					break;
// 				case 2: // Lower middle section (third 1/4th of the paddle)
// 					ball.velocityY = 1.5; // Slightly downwards
// 					break;
// 				case 3: // Bottom section (last 1/4th of the paddle)
// 					ball.velocityY = 2.5; // Strong downward angle
// 					break;
// 			}
//         }
//         // Optional: Increase the ball's speed based on where it hits the paddle
//         if (section === 0 || section === 3) {
//             ball.velocityX *= 1.2; // Slightly increase the horizontal speed for top/bottom hits (more challenge)
//         }
//         // Resolve collision by moving the ball just outside the paddle (avoid sticking or going through the paddle)
//         if (position === "left") {
//             // Ball hit the left player's paddle, so move it just to the right of the paddle
//             ball.x = player.x + player.width + ballRadius;
//         } else if (position === "right") {
//             // Ball hit the right player's paddle, so move it just to the left of the paddle
//             ball.x = player.x - ballRadius;
//         }
//     }
// }


function resetGame(direction) {
    //bring back ball to the middle
    ball.x = boardWidth / 2;
    ball.y = boardHeight / 2;
    //resets cooldown of the parry 
    if (parryFlag) {
        player1.cooldownFlag = false;
        player2.cooldownFlag = false;
        player1.parryCooldown = 0;
        player2.parryCooldown = 0;
    }

    if (slowServe) {
        // Apply reduced speed if slow serve is enabled
        ball.velocityX = direction * Math.abs(defballSpeed) * 0.5;
        ball.velocityY = 2 * (Math.random() > 0.5 ? 1 : -1) * 0.5;
    } else {
        // Use normal initial speed
        ball.velocityX = direction * Math.abs(defballSpeed);
        ball.velocityY = 2 * (Math.random() > 0.5 ? 1 : -1);
    }

    // drawFlag = !isGameOver();
    if (isGameOver()) {
        drawFlag = false;
		aiFlag = false;
        parryFlag = false;
        document.getElementById("startButton").disabled = false;
		document.getElementById("aiButton").disabled = false;
    }
}

function isGameOver(){
    if (player1Score >= maxScore || player2Score >= maxScore){
        displayGameOver();
        return true;
    }
    return false;
}

// this display sucks need a better one 
function displayGameOver() {
    context.clearRect(0, 0, board.width, board.height);

    context.font = "50px sans-serif";
    context.fillStyle = "red";
    let winner = player1Score >= maxScore ? "Player 1" : "Player 2";
    context.fillText(`${winner} Wins!`, boardWidth / 4, boardHeight / 2);

    context.font = "30px sans-serif";
    context.fillStyle = "white";
}

function drawCapsulePaddle(x, y, width, height, radius, fillColor, borderColor) {
    context.beginPath();
    context.arc(x + width / 2, y + radius, radius, Math.PI, 0); // Top cap
    context.lineTo(x + width, y + height - radius); // Right edge
    context.arc(x + width / 2, y + height - radius, radius, 0, Math.PI); // Bottom cap
    context.lineTo(x, y + radius); // Left edge
    context.closePath();

    context.fillStyle = fillColor; // Fill color
    context.fill();
    if (borderColor ) {
        context.strokeStyle = borderColor; // Border color
        context.stroke();
    }
}

