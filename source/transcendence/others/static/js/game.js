/*
   todos
	Need to work on AI logic. If the ball is too fast it wont be able to follow the ball.
	keyinputs are working fine.
*/

//Game settings
let paddleSpeed = 6;
let ballSpeed = 2;
let maxScore = 3;
let slowServe = false;

//this flags would determine which game mode we are playing
let aiFlag = false;
let parryFlag = false;
let tournamentFlag = false;
let versusFlag = false;

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

let players = [];

// need to convert everything to a class so it we could easily handle multiple players when tryin to play tournament mode
class Player {
  constructor(name, position) {
    this.playerName = name;
    this.width = playerWidth;
    this.height = playerHeight;
    this.cooldownFlag = false;
    this.parryCooldown = 0;
    this.velocityY = playerVelocityY;
    this.score = 0;
    this.seed = 0; // this part is for randomizing brackets for the tournament
    this.gameWon = 0;
    this.position = "";
    if (position === "left") {
      this.x = 10;
      this.y = boardHeight / 2 - playerHeight / 2;
      this.parryKey = "KeyA";
    } else if (position === "right") {
      this.x = boardWidth - playerWidth - 10;
      this.y = boardHeight / 2 - playerHeight / 2;
      this.parryKey = "Numpad0";
    }
  }

  setplayPos(position){
    if (position === "left") {
      this.x = 10;
      this.y = boardHeight / 2 - playerHeight / 2;
      this.parryKey = "KeyA";
    } else if (position === "right") {
      this.x = boardWidth - playerWidth - 10;
      this.y = boardHeight / 2 - playerHeight / 2;
      this.parryKey = "Numpad0";
    }
  }
}

// Ball setup
let ballRadius = 7.5;
let defballSpeed = 4.5;
let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  velocityX: defballSpeed,
  velocityY: defballSpeed,
};

let drawFlag = false;
let defp1Name = "";
let defp2Name = "";

function loadGame() {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  defp1Name = document.getElementById("player1Name").textContent;

  // requestAnimationFrame(draw);
  if (document.getElementById("startButton")) {
    // get Player 2 name and display it from secondPlayerNameModal modal
    const modal = secondPlayerNameModal();
    document.body.appendChild(modal);
    // Event Listeners
    modal
      .querySelector("#submitSecondPlayerNameBtn")
      .addEventListener("click", () => {
        // get the submitted name
        defp2Name = modal.querySelector("#secondPlayerName").value;
        if (defp2Name) {
          // close the modal and return the second player name
          console.log("Second Player Name: ", defp2Name);

          // replace player 2 with second player name
          document.getElementById("player2Name").textContent = "@ " + defp2Name;
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
    modal
      .querySelector("#secondPlayerName")
      .addEventListener("keypress", (event) => {
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

    initGame(); //initializing the game flags and adding players etc.
    console.log("Player 1 values:", players[0]);
    console.log("Player 2 values:", players[1]);
    document.getElementById("startButton").addEventListener("click", () => {
      // send to backend to create the game -
      /* 
			
			const resp = await fetch("/game", {
				method: "POST",
				headers:{},
				body: json.stringfy({
				name: player_two,
				game_type:ai/local/tourna
			})
			})
			
			*/
      /* return id */
      startGame(players[0], players[1]);
    });
  }

  if (document.getElementById("aiButton")) {
    document.getElementById("aiButton").addEventListener("click", () => {
      initGame();
      document
        .getElementById("aiButton")
        .addEventListener("click", startaiGame(players[0], players[1]));
    });
  }

  document.addEventListener("keydown", move);
  document.addEventListener("keyup", stopMovement);
  //   displayStartMessage();
}

// function for getting game mode (ai , 1v1, tournament)w
function getgameMode() {
  if (document.getElementById("aiButton")) return "ai";
  else if (document.getElementById("startButton")) return "versus";
  // return document.getElementById("gameType").textContent;
}

function isparryFlag() {
  return document.getElementById("slowServe").checked;
}

//function to initialize game based on the game mode
function initGame() {
  const gameMode = getgameMode();

  if (gameMode === "versus") {
    players.push(new Player(defp1Name, "left"));
    players.push(new Player(defp2Name, "right"));
    versusFlag = true;
  } else if (gameMode === "ai") {
    players.push(new Player(defp1Name, "left"));
    players.push(new Player("AI - HARD", "right"));
    aiFlag = true;
  } else if (gameMode === "tournament") {
    /* 
			// run tournament logic, create players etc.
			// tournamentFlag = true;
			// tournamentLogic();
 		*/
  }
}

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
  const parryInput = document.getElementById("parryMode").checked;

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
  parryFlag = parryInput;

  // document.getElementById("settingsMenu").style.display = "none";
  console.log("Settings Applied: ", {
    paddleSpeed,
    defballSpeed,
    maxScore,
    slowServe,
    parryFlag,
  });

  ball.velocityX = ball.velocityX > 0 ? defballSpeed : -defballSpeed;
  ball.velocityY = ball.velocityY > 0 ? defballSpeed : -defballSpeed;

  // document.getElementById("settingsMenu").style.display = "none";
  console.log("Settings Applied: ", { paddleSpeed, defballSpeed, maxScore });
  closeModal("gameSettingsModal");
}

function startGame(player1, player2) {
  drawFlag = true;

  document.getElementById("player1").classList.remove("d-none");
  document.getElementById("player2").classList.remove("d-none");

  document.getElementById("startButton").disabled = true; //disable start button when the game starts
  document.getElementById("settingButton").disabled = true;

  document.getElementById("startButton").disabled = true; //disable start button when the game starts
  document.getElementById("settingButton").disabled = true;
  requestAnimationFrame(() => draw(player1, player2));
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

function draw(player1, player2) {
  if (!drawFlag) {
    return;
  }
  // Clear board
  context.clearRect(0, 0, board.width, board.height);
  // requestAnimationFrame(draw(player1, player2));
  requestAnimationFrame(() => draw(player1, player2));
  // til this part
  updatePaddleVelocities(player1, player2);

  // if (aiFlag) aiLogic();
  drawLine(); //draw line in the middle
  drawPlayers(player1, player2); //draw players
  drawBall();

  // Checks if the position will be inside the map and adjusts its movement speed
  if (!oob(player1.y + player1.velocityY)) player1.y += player1.velocityY;
  if (!oob(player2.y + player2.velocityY)) player2.y += player2.velocityY;

  // Update ball position
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // Check ball collision with walls(top and bottom wall)
  if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= boardHeight)
    ball.velocityY *= -1;

  // Check ball collision with players
  ballCollision(ball, player1, "left");
  ballCollision(ball, player2, "right");

  displayScores(player1, player2);
  // Check for goals
  if (ball.x - ballRadius < 0) {
    player2.score++;
    resetGame(player1, player2, 1);
  } else if (ball.x + ballRadius > boardWidth) {
    player1.score++;
    resetGame(player1, player2, -1);
  }

  // if (isGameOver(player1, player2)) {
  // 	drawFlag = false;
  // 	aiFlag = false;
  // 	console.log("Game Over: SHOULD RETURN SETTINGS MENU");
  // 	if (document.getElementById("aiButton")) {
  // 		document.getElementById("aiButton").disabled = false;
  // 	}
  // 	if (document.getElementById("startButton")) {
  // 		document.getElementById("startButton").disabled = false;
  // 	}

  // 	//This is the part where we could collect everything for the match history
  // 	// players names, player scores aside from game mode. maybe add another function throw players and return it from there.
  // }
}

// Display scores
function displayScores(player1, player2) {
  context.fillStyle = "#ffffff";
  context.font = "40px Orbitron";
  context.fillText(player1.score, boardWidth / 5, 45);
  context.fillText(player2.score, (boardWidth * 4) / 5, 45);
}

function drawBall() {
  context.beginPath();
  context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  context.fillStyle = "#b02c98";
  context.fill();
  context.closePath();
}

function updatePaddleVelocities(player1, player2) {
  // Player 1 movement
  // console.log("Player 1 values:", player1);
  // console.log("Player 2 values:", player2);
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

function resetGame(player1, player2, direction) {
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
  if (isGameOver(player1, player2)) {
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

function isGameOver(player1, player2) {
  if (player1.score >= maxScore || player2.score >= maxScore) {
    displayGameOver(player1, player2);
    displayScores(player1, player2);
    resetScores(player1, player2);
    return true;
  }
  return false;
}

function resetScores(player1, player2) {
  if (player1) {
    if (player1.score === maxScore)
        player1.gamesWon += 1;
    player1.score = 0;
  }
  if (player2) {
    if (player2.score === maxScore)
      player2.gamesWon += 1;
    player2.score = 0;
  }
}

// this display sucks need a better one
function displayGameOver(player1, player2) {
  context.clearRect(0, 0, board.width, board.height);

  context.font = "45px Orbitron";
  context.fillStyle = "84ddfc";
  let winner =
    player1.score >= maxScore ? player1.playerName : player2.playerName;
  context.textAlign = "center"; // Aligns the text horizontally to the center
  context.textBaseline = "middle"; // Aligns the text vertically to the center
  context.fillText(`${winner} Wins!`, boardWidth / 2, boardHeight / 2);

  context.fillText(`${winner} Wins!`, boardWidth / 2, boardHeight / 2);
}

//Draw players
function drawPlayers(player1, player2) {
  if (!player1.cooldownFlag && parryFlag)
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
  if (!player2.cooldownFlag && parryFlag)
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

function startaiGame(player1, player2) {
  aiFlag = true; // Enable AI
  drawFlag = true;

  // make player 2 name as AI
  document.getElementById("player2Name").textContent = "@ AI";
  document.getElementById("player2Name").style.display = "block";

  document.getElementById("player1").classList.remove("d-none");
  document.getElementById("player2").classList.remove("d-none");

  document.getElementById("aiButton").disabled = true;
  document.getElementById("settingButton").disabled = true;

  setInterval(aiView, 100);
  setInterval(() => aiLogic(player2), 50);

  requestAnimationFrame(() => draw(player1, player2));
}

function aiLogic(player2) {
  const tolerance = 5; // Allow a small margin of error
  const currentBallY = ball.y; // Current ball Y position
  const previousBallY = lastballPosition.y; // Last recorded ball Y position
  const direction = currentBallY - previousBallY; // Determine ball movement direction

  // Calculate predicted target position based on the direction and speed of the ball
  const targetY = currentBallY + direction - player2.height / 2;

  if (targetY > player2.y - 40 && targetY < player2.y + 40) {
    // If the AI is close enough to the target Y position, stop moving
    aikeyEvents("stop");
    return;
  }

  if (player2.y + tolerance < targetY) {
    aikeyEvents("down"); // Keep moving down until target is reached
  } else if (player2.y - tolerance > targetY) {
    aikeyEvents("up"); // Keep moving up until target is reached
  }
}

let aiMovingUp = false;
let aiMovingDown = false;

function aikeyEvents(moveDirection) {
  let event;

  // Simulate 'keydown' for up or down based on moveDirection
  if (moveDirection === "up" && !aiMovingUp) {
    event = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      code: "ArrowUp",
      keyCode: 38,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
    aiMovingUp = true; // Track that the key is being held down
  } else if (moveDirection === "down" && !aiMovingDown) {
    event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
      keyCode: 40,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
    aiMovingDown = true; // Track that the key is being held down
  } else if (moveDirection === "stop") {
    // Simulate 'keyup' for stopping movement
    if (aiMovingUp) {
      event = new KeyboardEvent("keyup", {
        key: "ArrowUp",
        code: "ArrowUp",
        keyCode: 38,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
      aiMovingUp = false; // Stop holding up
    }
    if (aiMovingDown) {
      event = new KeyboardEvent("keyup", {
        key: "ArrowDown",
        code: "ArrowDown",
        keyCode: 40,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
      aiMovingDown = false; // Stop holding down
    }
  }
}

// function to check/store balls last position every 1 second.
function aiView() {
  if (aiFlag) {
    console.log("Lastball values:", lastballPosition);
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

loadGame();
// Run check on page load
checkScreenSize();

// Listen for screen resize
window.addEventListener("resize", checkScreenSize);
