//  ----------- game.js ----------- //

/*
    todos
    Settings that could be adjusted by the player

    Game customization module { 
        Max Score for the game;
        Paddle speed when adjusted should be the same as the other opponent except when playing with an AI;
        An option for slow serves. (if toggled on it should slow down the ball, decreasing the default speed of the ball);
        An option for designing the board, maybe gives a list of actual themes that we could create for paddle designs, board designs,  etc.;
        Ball radius (provide a minimum and maximum amount);
        Overtime (happens whenever both players are 1 goal away from the score. players need to score 2 consecutive goals)
        
        maps/modes
        Portal Map = map that would have random portals that could teleport the ball;
        Bounce Map = map that will make players have a skill that could make the ball bounce back when near the goal when timed correctly 
    }

    Game AI module {
        Explore alternative algorithms and techniques for AI. (AVOID USING A* ALGORITHM)
        
        must simulate keyboard input for the AI. The ai can only refresh its view of the game once per second.
        store ball location, and speed every one second, and depending on that values we will be moving the paddle.
        ballX
        ballY
        ballVelocityX
        ballVelocityY
        
    }
*/

//Game settings
let paddleSpeed = 6;
let ballSpeed = 4.5;
let maxScore = 3;
let slowServe = false;
let	aiFlag = false;

// Board setup
let board;
let boardWidth = 800;
let boardHeight = 500;
let context;

// Player setup
let playerWidth = 15;
let playerHeight = 80;
let playerVelocityY = 0;

let player1 = {
    x: 10,
    y: (boardHeight / 2) - (playerHeight / 2),
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
};

let player2 = {
    x: boardWidth - 10 - playerWidth,
    y: (boardHeight / 2) - (playerHeight / 2),
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY
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
    board = document.getElementById("canvasBoard");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // requestAnimationFrame(draw);
    // document.getElementById("startButton").addEventListener("click", startGame);

    document.addEventListener("keydown", move);
    document.addEventListener("keyup", stopMovement);
    displayStartMessage();
};

// function openSettings() {
//     document.getElementById("settingsMenu").style.display = "block";
// }

// function changeSetting() {
//     // valid ranges for the settings
//     const MIN_PADDLE_SPEED = 1, MAX_PADDLE_SPEED = 10;
//     const MIN_BALL_SPEED = 1, MAX_BALL_SPEED = 10;
//     const MIN_MAX_SCORE = 1, MAX_MAX_SCORE = 20;

//     const paddleSpeedInput = 10;
//     const ballSpeedInput = 7;
//     const maxScoreInput = 5;
//     const slowServeInput = false;

//     let errors = [];

//     if (paddleSpeedInput < MIN_PADDLE_SPEED || paddleSpeedInput > MAX_PADDLE_SPEED) {
//         errors.push(`Paddle Speed must be between ${MIN_PADDLE_SPEED} and ${MAX_PADDLE_SPEED}.`);
//     }
//     if (ballSpeedInput < MIN_BALL_SPEED || ballSpeedInput > MAX_BALL_SPEED) {
//         errors.push(`Ball Speed must be between ${MIN_BALL_SPEED} and ${MAX_BALL_SPEED}.`);
//     }
//     if (maxScoreInput < MIN_MAX_SCORE || maxScoreInput > MAX_MAX_SCORE) {
//         errors.push(`Winning Score must be between ${MIN_MAX_SCORE} and ${MAX_MAX_SCORE}.`);
//     }
//     const errorContainer = document.getElementById("errorMessages");
//     errorContainer.innerHTML = ""; // Clear existing messages
//     if (errors.length > 0) {
//         errors.forEach(error => {
//             const errorElement = document.createElement("p");
//             errorElement.textContent = error;
//             errorElement.style.color = "red";
//             errorContainer.appendChild(errorElement);
//         });
//         return; // Stop applying settings if there are errors
//     }

//     paddleSpeed = paddleSpeedInput;
//     defballSpeed = ballSpeedInput;
//     maxScore = maxScoreInput;
//     slowServe = slowServeInput;

//     document.getElementById("settingsMenu").style.display = "none";
//     console.log("Settings Applied: ", { paddleSpeed, defballSpeed, maxScore, slowServe });

//     ball.velocityX = ball.velocityX > 0 ? defballSpeed : -defballSpeed;
//     ball.velocityY = ball.velocityY > 0 ? defballSpeed : -defballSpeed;

//     document.getElementById("settingsMenu").style.display = "none";
//     console.log("Settings Applied: ", { paddleSpeed, defballSpeed, maxScore });
// }

function displayStartMessage() {
    context.clearRect(0, 0, board.width, board.height);
    context.font = "30px sans-serif";
    context.fillStyle = "white";
    context.fillText("Select Local or AI game.", boardWidth / 5, boardHeight / 2);
}

function startGame() {
    player1Score = 0;
    player2Score = 0;
    player1LastKey = null;
    player2LastKey = null;
    drawFlag = true;
    requestAnimationFrame(draw);
    document.getElementById("startButton").disabled = true; //disable start button when the game starts
}

function draw() {
    if (!drawFlag){
        return ;
    }
    requestAnimationFrame(draw);

    // Clear board
    context.clearRect(0, 0, board.width, board.height);

	if (aiFlag) aiLogic();

    // Draw dotted line in the middle
    context.setLineDash([10, 20]); // Pattern: 5px dash, 15px space
    context.strokeStyle = 'white'; // Line color
    context.lineWidth = 5; // Line thickness
    context.beginPath();
    context.moveTo(boardWidth / 2, 0); // Start at the top middle
    context.lineTo(boardWidth / 2, boardHeight); // Draw to the bottom middle
    context.stroke();
    context.setLineDash([]); // Reset line dash to solid

    // Update player positions
    if (!oob(player1.y + player1.velocityY)) player1.y += player1.velocityY;
    if (!oob(player2.y + player2.velocityY)) player2.y += player2.velocityY;

    drawCapsulePaddle(player1.x, player1.y, player1.width, player1.height, player1.width / 2, '#84ddfc', 'black');
    drawCapsulePaddle(player2.x, player2.y, player2.width, player2.height, player2.width / 2, '#84ddfc', 'black');

    // Update ball position
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Check ball collision with walls
    if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= boardHeight) ball.velocityY *= -1;

    // Check ball collision with players
    if (ballCollision(ball, player1, player1LastKey)) player1LastKey = null;
    if (ballCollision(ball, player2, player2LastKey)) player2LastKey = null;

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

function move(e) {
    if (e.code === "KeyW") {
        player1.velocityY = -paddleSpeed;
        player1LastKey = "KeyW";
    }
    if (e.code === "KeyS") {
        player1.velocityY = paddleSpeed;
        player1LastKey = "KeyS";
    }
    if (e.code === "ArrowUp") {
        player2.velocityY = -paddleSpeed;
        player2LastKey = "ArrowUp";
    }
    if (e.code === "ArrowDown") {
        player2.velocityY = paddleSpeed;
        player2LastKey = "ArrowDown";
    }
}

function stopMovement(e) {
    if (e.code === "KeyW" || e.code === "KeyS"){
        player1.velocityY = 0;
        player1LastKey = e.code;
    }
    if (e.code === "ArrowUp" || e.code === "ArrowDown"){
        player2.velocityY = 0;
        player2LastKey = e.code;
    }
}


// function to check if the paddle is inside the walls, by walls the top and bottom part of the board.
function oob(yPosition) {
    return yPosition < 0 || yPosition + playerHeight > boardHeight;
}

function ballCollision(ball, player) {
    let isCollision =
        ball.x - ballRadius < player.x + player.width &&   // Right side of the ball is past the left side of the player
        ball.x + ballRadius > player.x &&                 // Left side of the ball is past the right side of the player
        ball.y + ballRadius > player.y &&                 // Bottom side of the ball is past the top of the player
        ball.y - ballRadius < player.y + player.height;   // Top side of the ball is past the bottom of the player

    if (isCollision) {
        // Reverse horizontal direction
        ball.velocityX *= -1;

        // Calculate the relative hit position
        let paddleCenter = player.y + player.height / 2;
        let hitPosition = (ball.y - paddleCenter) / (player.height / 2); // Normalize between -1 and 1

        // Adjust vertical velocity based on hit position
        ball.velocityY = hitPosition * 2.5; // Increase ball speed and angle

        // Optional: Slightly increase ball speed for more challenge
        ball.velocityX *= 1.1; // Increase horizontal speed

        // Resolve collision by repositioning the ball outside the paddle
        // Move the ball just outside the paddle to avoid it sticking or passing through
        if (ball.x < player.x) {
            ball.x = player.x - ballRadius; // Push ball to the left of the paddle
        } else {
            ball.x = player.x + player.width + ballRadius; // Push ball to the right of the paddle
        }
    }

    return isCollision;
}

function resetGame(direction) {
    ball.x = boardWidth / 2;
    ball.y = boardHeight / 2;

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
    if (borderColor) {
        context.strokeStyle = borderColor; // Border color
        context.stroke();
    }
}