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
let maxScore = 2;
let slowServe = false;
let aiFlag = false;
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
  y: boardHeight / 2 - playerHeight / 2,
  width: playerWidth,
  height: playerHeight,
  velocityY: playerVelocityY,
  cooldownFlag: false,
  parryKey: "KeyA",
  parryCooldown: 0,
};

let player2 = {
  x: boardWidth - 10 - playerWidth,
  y: boardHeight / 2 - playerHeight / 2,
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
  velocityY: defballSpeed,
};

let player1Score = 0;
let player2Score = 0;
let player1LastKey = null;
let player2LastKey = null;
let drawFlag = false;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  // requestAnimationFrame(draw);
  if (document.getElementById("startButton")) {
        // get Player 2 name and display it from secondPlayerNameModal modal
        const modal = secondPlayerNameModal();
        let secondPlayerName = "";

    document.body.appendChild(modal);


    // Event Listeners
    modal
      .querySelector("#submitSecondPlayerNameBtn")
      .addEventListener("click", () => {
        // get the submitted name
        secondPlayerName = modal.querySelector("#secondPlayerName").value;
        if (secondPlayerName) {
          // close the modal and return the second player name
          console.log("Second Player Name: ", secondPlayerName);

          // replace player 2 with second player name
          document.getElementById("player2Name").textContent =
            "@ " + secondPlayerName;
          document.getElementById("player2Name").style.display = "block";

          closeModal("secondPlayerNameModal");
        } else {
          // show error message if the input is empty and prevent the modal from closing
          const errorMsg = document.getElementById("local-game-error-msg");
          errorMsg.textContent = "Please enter the name of the second player.";
          errorMsg.style.display = "block";
        }
      });
	
	// submit when Enter key is pressed
	modal.querySelector("#secondPlayerName").addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			modal.querySelector("#submitSecondPlayerNameBtn").click();
		}
	});
	  
	// Close & submit the modal when the close button is clicked
	modal.querySelector(".btn-close").addEventListener("click", () => {
		modal.querySelector("#submitSecondPlayerNameBtn").click();
		// closeModal("secondPlayerNameModal");
	});

	// Close & the modal when the modal is clicked outside
	modal.addEventListener("click", (event) => {
		if (event.target === modal) {
			modal.querySelector("#submitSecondPlayerNameBtn").click();
			// closeModal("secondPlayerNameModal");
		}
	});

    document.getElementById("startButton").addEventListener("click", startGame);
  }
  // document.getElementById("settingButton").addEventListener("click", openSettings);
  // document.getElementById("applyButton").addEventListener("click", changeSetting);
  if (document.getElementById("aiButton")) {
    document.getElementById("aiButton").addEventListener("click", startaiGame);
  }

  document.addEventListener("keydown", move);
  document.addEventListener("keyup", stopMovement);
//   displayStartMessage();
};

// function openSettings() {
//     document.getElementById("settingsMenu").style.display = "block";
// }

function changeSetting() {
  // valid ranges for the settings
  const MIN_PADDLE_SPEED = 1,
    MAX_PADDLE_SPEED = 10;
  const MIN_BALL_SPEED = 1,
    MAX_BALL_SPEED = 10;
  const MIN_MAX_SCORE = 1,
    MAX_MAX_SCORE = 20;

  const paddleSpeedInput = parseInt(
    document.getElementById("paddleSpeed").value
  );
  const ballSpeedInput = parseFloat(document.getElementById("ballSpeed").value);
  const maxScoreInput = parseInt(document.getElementById("maxScore").value);
  const slowServeInput = document.getElementById("slowServe").checked;

  let errors = [];

  if (
    paddleSpeedInput < MIN_PADDLE_SPEED ||
    paddleSpeedInput > MAX_PADDLE_SPEED
  ) {
    errors.push(
      `Paddle Speed must be between ${MIN_PADDLE_SPEED} and ${MAX_PADDLE_SPEED}.`
    );
  }
  if (ballSpeedInput < MIN_BALL_SPEED || ballSpeedInput > MAX_BALL_SPEED) {
    errors.push(
      `Ball Speed must be between ${MIN_BALL_SPEED} and ${MAX_BALL_SPEED}.`
    );
  }
  if (maxScoreInput < MIN_MAX_SCORE || maxScoreInput > MAX_MAX_SCORE) {
    errors.push(
      `Winning Score must be between ${MIN_MAX_SCORE} and ${MAX_MAX_SCORE}.`
    );
  }
  const errorContainer = document.getElementById("errorMessages");
  errorContainer.innerHTML = ""; // Clear existing messages
  if (errors.length > 0) {
    errors.forEach((error) => {
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

  // document.getElementById("settingsMenu").style.display = "none";
  console.log("Settings Applied: ", {
    paddleSpeed,
    defballSpeed,
    maxScore,
    slowServe,
  });

  ball.velocityX = ball.velocityX > 0 ? defballSpeed : -defballSpeed;
  ball.velocityY = ball.velocityY > 0 ? defballSpeed : -defballSpeed;

  // document.getElementById("settingsMenu").style.display = "none";
  console.log("Settings Applied: ", { paddleSpeed, defballSpeed, maxScore });
  closeModal("gameSettingsModal");
}

function startGame() {
  player1Score = 0;
  player2Score = 0;
  player1LastKey = null;
  player2LastKey = null;
  drawFlag = true;
  parryFlag = true;
  requestAnimationFrame(draw);

    document.getElementById("player1").classList.remove("d-none");
    document.getElementById("player2").classList.remove("d-none");
			

    document.getElementById("startButton").disabled = true; //disable start button when the game starts
    document.getElementById("settingButton").disabled = true;
    // document.getElementById("aiButton").disabled = true;

    // hide settings menu
    // document.getElementById("settingButton").style.display = "none";
  document.getElementById("startButton").disabled = true; //disable start button when the game starts
    document.getElementById("settingButton").disabled = true;
    // document.getElementById("aiButton").disabled = true;

    // hide settings menu
    // document.getElementById("settingButton").style.display = "none";
}

function drawLine() {
  // Draw dotted line in the middle
  context.setLineDash([10, 20]); // Pattern: 5px dash, 15px space
  context.strokeStyle = "white"; // Line color
  context.lineWidth = 5; // Line thickness
  context.beginPath();
  context.moveTo(boardWidth / 2, 0); // Start at the top middle
  context.lineTo(boardWidth / 2, boardHeight); // Draw to the bottom middle
  context.stroke();
  context.setLineDash([]); // Reset line dash to solid
}

function draw() {
  if (!drawFlag) {
    return;
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
    drawCapsulePaddle(
      player1.x,
      player1.y,
      player1.width,
      player1.height,
      player1.width / 2,
      "#84ddfc",
      "green"
    );
  else
    drawCapsulePaddle(
      player1.x,
      player1.y,
      player1.width,
      player1.height,
      player1.width / 2,
      "#84ddfc",
      "black"
    );
  if (!player2.cooldownFlag)
    drawCapsulePaddle(
      player2.x,
      player2.y,
      player2.width,
      player2.height,
      player2.width / 2,
      "#84ddfc",
      "green"
    );
  else
    drawCapsulePaddle(
      player2.x,
      player2.y,
      player2.width,
      player2.height,
      player2.width / 2,
      "#84ddfc",
      "black"
    );

  // Update ball position
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // Check ball collision with walls(top and bottom wall)
  if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= boardHeight)
    ball.velocityY *= -1;

  // Check ball collision with players
  // if (ballCollision(ball, player1, player1LastKey)) player1LastKey = null;
  // if (ballCollision(ball, player2, player2LastKey)) player2LastKey = null;
  // if (ballCollision(ball, player1, "left"));
  // if (ballCollision(ball, player2, "right"));
  ballCollision(ball, player1, "left");
  ballCollision(ball, player2, "right");
  drawBall();

  // Check for goals
  if (ball.x - ballRadius < 0) {
    player2Score++;
    resetGame(1);
  } else if (ball.x + ballRadius > boardWidth) {
    player1Score++;
    resetGame(-1);
  }

  // Display scores
  context.fillStyle = "#ffffff";
  context.font = "45px sans-serif";
  context.fillText(player1Score, boardWidth / 5, 45);
  context.fillText(player2Score, (boardWidth * 4) / 5, 45);
}

function drawBall() {
  context.beginPath();
  context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  context.fillStyle = "#b02c98";
  context.fill();
  context.closePath();
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
    ball.y + ballRadius > player.y &&
    ball.y - ballRadius < player.y + player.height;
  return ballNearPlayer && withinVerticalRange;
}

function parryCoolDown(player) {
  player.cooldownFlag = true;
  player.parryCooldown = Date.now() + cooldownTime;
}

function parryRefresh(player) {
  if (player.cooldownFlag && Date.now() > player.parryCooldown) {
    player.cooldownFlag = false;
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
  const MAX_SPEED_X = 10; // Maximum horizontal speed (velocityX)
  const MAX_SPEED_Y = 10; // Maximum vertical speed (velocityY)

  let isCollision =
    ball.x - ballRadius < player.x + player.width && // Right side of the ball is past the left side of the player
    ball.x + ballRadius > player.x && // Left side of the ball is past the right side of the player
    ball.y + ballRadius > player.y && // Bottom side of the ball is past the top of the player
    ball.y - ballRadius < player.y + player.height; // Top side of the ball is past the bottom of the player

  if (isCollision) {
    // Reverse the horizontal direction based on which side of the paddle the ball hits
    let hitPosition = (ball.y - player.y) / player.height; // Normalize hit position between 0 and 1
    let section = Math.floor(hitPosition * 4); // Section index (0, 1, 2, 3)

    if (position === "left") {
      // Ball hit the left player's paddle, reverse the horizontal velocity
      ball.velocityX = Math.abs(ball.velocityX); // Ensure velocityX is positive (moving right)

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
    ball.velocityX = Math.min(
      Math.max(ball.velocityX, -MAX_SPEED_X),
      MAX_SPEED_X
    );
    ball.velocityY = Math.min(
      Math.max(ball.velocityY, -MAX_SPEED_Y),
      MAX_SPEED_Y
    );
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
        console.log("Game Over: SHOULD RETURN SETTINGS MENU");

        if (document.getElementById("aiButton")) {
            document.getElementById("aiButton").disabled = false;
        }
        if (document.getElementById("startButton")) {
            document.getElementById("startButton").disabled = false;
        }
        if (document.getElementById("settingButton")) {
            document.getElementById("settingButton").disabled = false;
        }
    }
}

function isGameOver() {
  if (player1Score >= maxScore || player2Score >= maxScore) {
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

function drawCapsulePaddle(
  x,
  y,
  width,
  height,
  radius,
  fillColor,
  borderColor
) {
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



// ----------------- gameai.js ----------------- //
// look for last ball position every one second. >>trans rules.

//ai view
let lastballPosition = { x: 0, y: 0 };

function startaiGame() {
  aiFlag = true; // Enable AI
  player1Score = 0;
  player2Score = 0;
  drawFlag = true;
  setInterval(aiView, 50);
  setInterval(aiLogic, 50);
  requestAnimationFrame(draw);
    document.getElementById("startButton").disabled = true;

    // make player 2 name as AI
    document.getElementById("player2Name").textContent = "@ AI";
    document.getElementById("player2Name").style.display = "block";

    document.getElementById("player1").classList.remove("d-none");
    document.getElementById("player2").classList.remove("d-none");

    document.getElementById("aiButton").disabled = true;
    document.getElementById("settingButton").disabled = true;
}

function aiLogic() {
  const tolerance = 5; // Allow a small margin of error
  const currentBallY = ball.y; // Current ball Y position
  const previousBallY = lastballPosition.y; // Last recorded ball Y position
  const direction = currentBallY - previousBallY; // Determine ball movement direction

  // Calculate predicted target position based on the direction and speed of the ball
  const targetY = currentBallY + direction - player2.height / 2;

  if (targetY > player2.y - 40 && targetY < player2.y + 40) return;
  if (player2.y + tolerance < targetY) {
    aikeyEvents("down");
  } else if (player2.y - tolerance > targetY) {
    aikeyEvents("up");
  } else {
    aikeyEvents("stop");
  }
}


function aikeyEvents(moveDirection) {
  let event;

  // Simulate 'keydown' for up or down based on moveDirection
  if (moveDirection === "up") {
    event = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      code: "ArrowUp",
      keyCode: 38, // Deprecated but still included for backward compatibility
      bubbles: true,
      cancelable: true,
    });
  } else if (moveDirection === "down") {
    event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
      keyCode: 40,
      bubbles: true,
      cancelable: true,
    });
  } else if (moveDirection === "stop") {
    // Simulate 'keyup' for stopping movement
    event = new KeyboardEvent("keyup", {
      key: "ArrowUp",
      code: "ArrowUp",
      keyCode: 38,
      bubbles: true,
      cancelable: true,
    });
  }

  // Dispatch the event
  if (event) document.dispatchEvent(event);
}

// function to check/store balls last position every 1 second.
function aiView() {
  if (aiFlag) {
    lastballPosition.x = ball.x;
    lastballPosition.y = ball.y;
  }
}

function checkScreenSize() {
  const MIN_WINDOW_WIDTH = 820;
  const MIN_WINDOW_HEIGHT = 700;

  const warningMessage = document.getElementById("warningMessage");
  const gameContent = document.getElementById("gameContent");

  if (
    window.innerWidth < MIN_WINDOW_WIDTH ||
    window.innerHeight < MIN_WINDOW_HEIGHT
  ) {
    warningMessage.classList.remove("d-none");
    gameContent.classList.add("d-none");
  } else {
    warningMessage.classList.add("d-none");
    gameContent.classList.remove("d-none");
  }
}

// Run check on page load
checkScreenSize();

// Listen for screen resize
window.addEventListener("resize", checkScreenSize);
