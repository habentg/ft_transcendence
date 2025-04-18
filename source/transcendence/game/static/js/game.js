async function createGameInDB(game) {
  const startgame_data = {
    player_one: game.players[0].playerName,
    player_two: game.players[1].playerName,
    type: game.aiFlag ? "AI" : "VERSUS",
  };
  if (game.tournamentFlag) {
    startgame_data["type"] = "TOURNAMENT";
    startgame_data["tournament_id"] = `${game.tournament_id}`;
  }
  try {
    const response = await fetch("/game/", {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": await getCSRFToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(startgame_data),
    });
    if (response.ok) {
      const responseData = await response.json();
      game.game_id = responseData.game_id;
      if (game.aiFlag) startaiGame(game);
      else if (game.tournamentFlag) return "start_tournament";
      else startGame(game);
      return;
    }
    throw new Error("Failed to load gameApiPOSTFunction");
  } catch (error) {
    createToast({
      type: "error",
      error_message: "Failed to create game",
      title: "Game Creating Error!",
    });
    return false;
  }
}

async function updateGameInDB(endgame_data, game_id) {
  try {
    const response = await fetch(`/game?game_id=${game_id}`, {
      method: "PATCH",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": await getCSRFToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(endgame_data),
    });
    const responseData = await response.json();
    if (response.ok) {
      return;
    }
    throw new Error(
      `Failed to update game with id: ${game_id} : ${response.status} : ${response.error}`
    );
  } catch (error) {
    createToast({
      type: "error",
      error_message: error,
      title: "Game Updating Error!",
    });
  }
}

function showGameRules() {
  const modal = gameRulesModal();
  document.body.appendChild(modal);

  modal.querySelector(".btn-close").addEventListener("click", () => {
    modal.remove();
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
  modal.querySelector(".closeButton").addEventListener("click", () => {
    modal.remove();
  });
}

async function loadGame() {
  //starting the game by getting game settings and intializingthe struct.
  // make game obj.
  if (!isInDesktop()) {
    const warningMessage = document.getElementById("warningMessage");
    const gameContent = document.getElementById("gameContent");
    warningMessage.classList.remove("d-none");
    gameContent.classList.add("d-none");
    return;
  }
  const game = new Game();
  window.addEventListener("resize", () => checkScreenSize(game));
  game.initializeBoard("board"); //initialize the board
  setgameMode(game); // set flags for which game mode
  initPlayers(game);

  if (document.getElementById("settingButton")) {
    document.getElementById("settingButton").addEventListener("click", () => {
      changeSetting(game);
    });
  }

  if (document.getElementById("startButton")) {
    document
      .getElementById("startButton")
      .addEventListener("click", async () => {
        game.loadSettings(game.players[0].playerName);
        game.resetValues();
        await createGameInDB(game);
      });
  }

  if (document.getElementById("aiButton")) {
    document.getElementById("aiButton").addEventListener("click", async () => {
      game.loadSettings(game.players[0].playerName);
      game.resetValues();
      await createGameInDB(game);
    });
  }
}

function startGame(game) {
  game.drawFlag = true;
  window.isGameRunning = true;

  game.setupeventListeners();
  document.getElementById("startButton").disabled = true;
  document.getElementById("settingButton").disabled = true;
  document.getElementById("gameRulesButton").disabled = true;

  // requestAnimationFrame(() => gameLoop(game));
  requestAnimationFrame((timestamp) => gameLoop(game, timestamp));
}

function gameLoop(game, timestamp) {
  if (!window.isGameRunning) return;

  const fps = 60;
  const interval = 1000 / fps; // Target time between frames in milliseconds
  game.lastTime = game.lastTime || timestamp;

  // Calculate time elapsed
  const deltaTime = timestamp - game.lastTime;

  if (deltaTime >= interval) {
    // Update the game state and redraw
    game.lastTime = timestamp - (deltaTime % interval); // Reset lastTime to account for missed frames
    updategameValues(game.players[0], game.players[1], game);
    draw(game.players[0], game.players[1], game);
  }

  // Request the next frame
  requestAnimationFrame((newTimestamp) => gameLoop(game, newTimestamp));
}

function updategameValues(player1, player2, game) {
  //checks if player movement is inside the board then moves it.
  if (!game.drawFlag) return;
  oob(player1, game);
  oob(player2, game);

  updatePaddleVelocities(player1, player2, game);

  ballMovement(game);

  //check for scores
  if (game.ball.x - game.ball.ballRadius < 0) {
    player2.score++;
    game.sound.play("score");
    resetGame(player1, player2, 1, game);
  } else if (game.ball.x + game.ball.ballRadius > game.boardWidth) {
    player1.score++;
    game.sound.play("score");
    resetGame(player1, player2, -1, game);
  }

  // checks if the cooldown is done and activates it.
  if (game.parryFlag) {
    parryRefresh(player1);
    parryRefresh(player2);
  }
}

function draw(player1, player2, game) {
  if (!game.drawFlag) return;

  // Clear board
  game.context.clearRect(0, 0, game.board.width, game.board.height);
  drawLine(game); //draw line in the middle
  drawBall(game); // draw the ball obviously
  drawPlayers(player1, player2, game); //draw players
  displayScores(player1, player2, game);
}

function drawPlayers(player1, player2, game) {
  if (!player1.cooldownFlag && game.parryFlag)
    drawCapsulePaddle(
      player1.x,
      player1.y,
      player1.width,
      player1.height,
      player1.width / 2,
      "#84ddfc",
      "green",
      game
    );
  else
    drawCapsulePaddle(
      player1.x,
      player1.y,
      player1.width,
      player1.height,
      player1.width / 2,
      "#84ddfc",
      "white",
      game
    );
  if (!player2.cooldownFlag && game.parryFlag)
    drawCapsulePaddle(
      player2.x,
      player2.y,
      player2.width,
      player2.height,
      player2.width / 2,
      "#84ddfc",
      "green",
      game
    );
  else
    drawCapsulePaddle(
      player2.x,
      player2.y,
      player2.width,
      player2.height,
      player2.width / 2,
      "#84ddfc",
      "white",
      game
    );
}

function drawCapsulePaddle(
  x,
  y,
  width,
  height,
  radius,
  fillColor,
  borderColor,
  game
) {
  game.context.beginPath();
  game.context.arc(x + width / 2, y + radius, radius, Math.PI, 0); // Top cap
  game.context.lineTo(x + width, y + height - radius); // Right edge
  game.context.arc(x + width / 2, y + height - radius, radius, 0, Math.PI); // Bottom cap
  game.context.lineTo(x, y + radius); // Left edge
  game.context.closePath();

  game.context.fillStyle = fillColor; // Fill color
  game.context.fill();
  if (borderColor) {
    game.context.strokeStyle = borderColor; // Border color
    game.context.stroke();
  }
}

function drawBall(game) {
  game.context.beginPath();
  game.context.arc(
    game.ball.x,
    game.ball.y,
    game.ball.ballRadius,
    0,
    Math.PI * 2
  );
  game.context.fillStyle = "#b02c98";
  game.context.fill();
  game.context.closePath();
}

function displayScores(player1, player2, game) {
  game.context.fillStyle = "#ffffff";
  game.context.font = "40px Orbitron";
  game.context.fillText(player1.score, game.boardWidth / 5, 45);
  game.context.fillText(player2.score, (game.boardWidth * 4) / 5, 45);
}

/// sets flag based on the button clicked
function setgameMode(game) {
  if (document.getElementById("aiButton")) {
    game.aiFlag = true;
    game.versusFlag = false;
    game.tournamentFlag = false;
  } else if (document.getElementById("startButton")) {
    game.aiFlag = false;
    game.versusFlag = true;
    game.tournamentFlag = false;
  }
}

function initPlayers(game) {
  game.defp1Name = document.getElementById("player1Name").textContent;
  game.defp2Name = document.getElementById("player2Name").textContent;
  game.createPlayer(game.defp1Name.slice(2), "left");
  if (game.aiFlag) {
    game.createPlayer("AI Bot", "right");
    document.getElementById("player2Name").textContent = "@ AI";
    document.getElementById("player2Name").style.display = "block";
  } else if (game.versusFlag) {
    initializeModal(game);
  }
}

// modal to get 2nd player name, need for versus(1v1) game mode.
function initializeModal(game) {
  const modal = secondPlayerNameModal();

  document.body.appendChild(modal);
  modal
    .querySelector("#submitSecondPlayerNameBtn")
    .addEventListener("click", () => {
      const secondPlayerName = modal.querySelector("#secondPlayerName").value;
      if (secondPlayerName === "" || secondPlayerName.length > 20) {
        const errorMsg = document.getElementById("local-game-error-msg");
        errorMsg.textContent =
          "Player name should be greate between 1 and 20 Characters.";
        errorMsg.style.display = "block";
      } else {
        game.defp2Name = secondPlayerName;
        document.getElementById(
          "player2Name"
        ).textContent = `@ ${secondPlayerName}`;
        document.getElementById("player2Name").style.display = "block";
        game.createPlayer(secondPlayerName, "right");
        modal.remove();
      }
    });

  modal
    .querySelector("#secondPlayerName")
    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        modal.querySelector("#submitSecondPlayerNameBtn").click();
      }
    });

  modal.querySelector(".btn-close").addEventListener("click", () => {
    modal.querySelector("#submitSecondPlayerNameBtn").click();
  });
}

function updatePaddleVelocities(player1, player2, game) {
  if (game.activeKeys["KeyW"]) {
    player1.velocityY = -game.paddleSpeed;
  } else if (game.activeKeys["KeyS"]) {
    player1.velocityY = game.paddleSpeed;
  } else {
    player1.velocityY = 0;
  }

  // Player 2 movement
  if (game.activeKeys["ArrowUp"]) {
    player2.velocityY = -game.paddleSpeed;
  } else if (game.activeKeys["ArrowDown"]) {
    player2.velocityY = game.paddleSpeed;
  } else {
    player2.velocityY = 0;
  }

  if (game.parryFlag) {
    if (game.activeKeys["Space"] && !player1.cooldownFlag) {
      if (isParry(player1, game) && game.ball.velocityX < 0) {
        game.ball.velocityX *= -1.5;
        game.ball.velocityY *= -1;
        game.ball.x = player1.x + player1.width + game.ball.ballRadius + 2;
      }
      game.sound.play("parry");
      parryCoolDown(player1, game);
    }
    if (game.activeKeys["Numpad0"] && !player2.cooldownFlag) {
      if (isParry(player2, game) && game.ball.velocityX > 0) {
        game.ball.velocityX *= -1.5;
        game.ball.velocityY *= -1;
        game.ball.x = player2.x - player2.width + game.ball.ballRadius - 2;
      }
      game.sound.play("parry");
      parryCoolDown(player2, game);
    }
  }
}

// Checks if the ball is good to parry
function isParry(player, game) {
  const parryRange = 40; // Adjustable proximity range for parry

  // Determine parry conditions based on player's side
  const ballNearPlayer = player.x < game.boardWidth / 2
    ? game.ball.x - game.ball.ballRadius <= player.x + player.width + parryRange
    : game.ball.x + game.ball.ballRadius >= player.x - parryRange;

  const withinVerticalRange = 
  game.ball.y + game.ball.ballRadius > player.y &&
  game.ball.y - game.ball.ballRadius < player.y + player.height;

  return ballNearPlayer && withinVerticalRange;
}

// Sets cooldown to false enabling the player to parry again
function parryRefresh(player) {
  if (player.cooldownFlag && Date.now() > player.parryCooldown)
    player.cooldownFlag = false;
}

//Sets the parry on Cooldown
function parryCoolDown(player, game) {
  player.cooldownFlag = true;
  player.parryCooldown = Date.now() + game.cooldownTime;
}

function topoob(yPosition) {
  return yPosition < 0 + 7.5;
}

function botoob(yPosition, game) {
  return yPosition + game.playerHeight > game.boardHeight - 7.5;
}

// Checks if the player is out of bounds the board and adjusts its position
function oob(player, game) {
  const newYPosition = player.y + player.velocityY;

  if (player.velocityY < 0) {
    if (topoob(newYPosition)) {
      player.y = 0 + 7.5;
    } else {
      player.y = newYPosition;
    }
  } else if (player.velocityY > 0) {
    if (botoob(newYPosition, game)) {
      player.y = game.boardHeight - game.playerHeight - 7.5;
    } else {
      player.y = newYPosition;
    }
  }
}

function ballMovement(game) {
  const Ball = game.ball;
  const left = game.players[0];
  const right = game.players[1];

  // Predict the ball's next position
  let nextX = Ball.x + Ball.velocityX;
  let nextY = Ball.y + Ball.velocityY;

  // Wall collisions
  if (nextY - Ball.ballRadius <= 0) {
    // Place the ball just inside the top boundary
    Ball.y = Ball.ballRadius;
    if (Ball.velocityY < 0) Ball.velocityY *= -1;
    game.sound.play("wallhit");
    return;
  } else if (nextY + Ball.ballRadius >= game.boardHeight) {
    // Place the ball just inside the bottom boundary
    Ball.y = game.boardHeight - Ball.ballRadius;
    if (Ball.velocityY > 0) Ball.velocityY *= -1;
    game.sound.play("wallhit");
    return;
  }

  // Check for paddle collisions
  if (checkPaddleCollision(Ball, left, nextX, nextY))
    handlePaddleCollision(Ball, left, game, true);
  else if (checkPaddleCollision(Ball, right, nextX, nextY))
    handlePaddleCollision(Ball, right, game, false);

  // Move the balls location to its next expected location
  Ball.x = nextX;
  Ball.y = nextY;
}

function handlePaddleCollision(ball, paddle, game, isLeftPaddle) {
  const MAX_SPEED_X = 10;
  const MIN_SPEED_X = 6;
  const MAX_SPEED_Y = 10;
  const MIN_SPEED_Y = 8;

  // Calculate hit position relative to paddle center (-1 to 1)
  const hitPosition =
    (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);

  // Determine if the ball hit near the edge (top or bottom 25% of paddle)
  const isEdgeHit = Math.abs(hitPosition) > 0.75;

  // Add paddle velocity to ball velocity (assuming paddle has velocityY property)
  const paddleVelocityImpact = paddle.velocityY ? paddle.velocityY * 0.7 : 0;

  // Calculate new velocities with edge adjustments
  let newVelocityX;
  let newVelocityY;

  if (isEdgeHit) {
    // For edge hits, prioritize vertical movement over horizontal repositioning
    const baseSpeedX = Math.abs(ball.velocityX) * 0.7;
    newVelocityX = Math.max(baseSpeedX, MIN_SPEED_X) * (isLeftPaddle ? 1 : -1);
    // Add paddle velocity impact to the vertical component
    newVelocityY = hitPosition * 5.5 + paddleVelocityImpact;

    // Enhanced overlap detection considering paddle movement
    const overlap = isLeftPaddle
      ? paddle.x + paddle.width - (ball.x - ball.ballRadius)
      : ball.x + ball.ballRadius - paddle.x;

    if (overlap > ball.ballRadius * 0.5) {
      const correctionFactor = paddle.velocityY ? 1.2 : 0.5;
      if (isLeftPaddle) {
        ball.x = paddle.x + paddle.width + ball.ballRadius * correctionFactor;
      } else {
        ball.x = paddle.x - ball.ballRadius * correctionFactor;
      }
    }
  } else {
    // Normal hit behavior with paddle velocity influence
    newVelocityX =
      Math.max(Math.abs(ball.velocityX), MIN_SPEED_X) * (isLeftPaddle ? 1 : -1);
    newVelocityY = hitPosition * 4.12 + paddleVelocityImpact;

    // Immediate position correction for center hits
    if (isLeftPaddle) {
      ball.x = paddle.x + paddle.width + ball.ballRadius;
    } else {
      ball.x = paddle.x - ball.ballRadius;
    }
  }

  // Ensure minimum vertical velocity for edge hits
  if (isEdgeHit) {
    const minVerticalSpeed = Math.max(Math.abs(newVelocityY), MIN_SPEED_Y);
    newVelocityY = newVelocityY < 0 ? -minVerticalSpeed : minVerticalSpeed;
  }

  // Apply new velocities with speed limits
  ball.velocityX = Math.min(Math.max(newVelocityX, -MAX_SPEED_X), MAX_SPEED_X);
  ball.velocityY = Math.min(Math.max(newVelocityY, -MAX_SPEED_Y), MAX_SPEED_Y);

  // Calculate total speed and adjust if too slow
  const totalSpeed = Math.sqrt(
    ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY
  );
  const MIN_TOTAL_SPEED = 7;

  if (totalSpeed < MIN_TOTAL_SPEED) {
    const scaleFactor = MIN_TOTAL_SPEED / totalSpeed;
    ball.velocityX *= scaleFactor;
    ball.velocityY *= scaleFactor;
  }

  game.sound.play("paddlehit");
}

function checkPaddleCollision(ball, paddle, nextX, nextY) {
  // Calculate the closest point on the paddle to the ball's center
  const closestX = Math.max(paddle.x, Math.min(nextX, paddle.x + paddle.width));
  const closestY = Math.max(
    paddle.y,
    Math.min(nextY, paddle.y + paddle.height)
  );

  // Calculate the distance between the closest point and the ball's center
  const distanceX = nextX - closestX;
  const distanceY = nextY - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  // Check if the distance is less than the ball's radius
  return distanceSquared <= ball.ballRadius * ball.ballRadius;
}

async function resetGame(player1, player2, direction, game) {
  //bring back ball to the middle
  game.resetBall(direction);
  //resets cooldown of the parry
  if (game.parryFlag) {
    player1.cooldownFlag = false;
    player2.cooldownFlag = false;
    player1.parryCooldown = 0;
    player2.parryCooldown = 0;
  }

  if (isGameOver(player1, player2, game)) {
    game.stopeventListeners();
    game.drawFlag = false;
    window.isGameRunning = false;
    const endgame_stuff = {
      player1_username: player1.playerName,
      player2_username: player2.playerName,
      player1_score: player1.finalScore,
      player2_score: player2.finalScore,
    };
    await updateGameInDB(endgame_stuff, game.game_id);

    if (document.getElementById("aiButton")) {
      document.getElementById("aiButton").disabled = false;
    } else if (document.getElementById("startButton")) {
      document.getElementById("startButton").disabled = false;
    }
    if (document.getElementById("settingButton")) {
      document.getElementById("settingButton").disabled = false;
    }
    if (document.getElementById("gameRulesButton")) {
      document.getElementById("gameRulesButton").disabled = false;
    }
  }
}

function isGameOver(player1, player2, game) {
  if (player1.score >= game.maxScore || player2.score >= game.maxScore) {
    displayGameOver(player1, player2, game);
    displayScores(player1, player2, game);
    player1.finalScore = player1.score;
    player2.finalScore = player2.score;
    resetScores(player1, player2, game);
    return true;
  }
  return false;
}

function resetScores(player1, player2, game) {
  if (player1) {
    if (player1.score === game.maxScore) player1.gamesWon += 1;
    player1.score = 0;
  }
  if (player2) {
    if (player2.score === game.maxScore) player2.gamesWon += 1;
    player2.score = 0;
  }
}

function displayGameOver(player1, player2, game) {
  game.context.clearRect(0, 0, game.board.width, game.board.height);

  game.context.font = "45px Orbitron";
  game.context.fillStyle = "84ddfc";
  let winner =
    player1.score >= game.maxScore ? player1.playerName : player2.playerName;
  game.context.textAlign = "center"; // Aligns the text horizontally to the center
  game.context.textBaseline = "middle"; // Aligns the text vertically to the center
  game.context.fillText(
    `${winner} Wins!`,
    game.boardWidth / 2,
    game.boardHeight / 2
  );

  game.context.fillText(
    `${winner} Wins!`,
    game.boardWidth / 2,
    game.boardHeight / 2
  );
}

// Draw dotted line in the middle
function drawLine(game) {
  game.context.setLineDash([10, 20]); // Pattern: 5px dash, 15px space
  game.context.strokeStyle = "white"; // Line color
  game.context.lineWidth = 5; // Line thickness
  game.context.beginPath();
  game.context.moveTo(game.boardWidth / 2, 0); // Start at the top middle
  game.context.lineTo(game.boardWidth / 2, game.boardHeight); // Draw to the bottom middle
  game.context.stroke();
  game.context.setLineDash([]); // Reset line dash to solid
}

//Start of AI

function startaiGame(game) {
  game.setupeventListeners();

  // Make player 2 name as AI
  document.getElementById("player2Name").textContent = "@ AI";
  document.getElementById("player2Name").style.display = "block";

  // Disable buttons
  document.getElementById("aiButton").disabled = true;
  document.getElementById("settingButton").disabled = true;
  document.getElementById("gameRulesButton").disabled = true;

  let aiHelper = {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    aiX: 0,
    aiY: 0,
    aiParry: false,
    playerParry: false,
    scoreDeficit: 0,
    tolInc: 0,
    lastscoreDef: 0,
    aiMovingDown: false,
    aiMovingUp: false,
    lastTime: 0, // Initialize time for AI timing logic
  };

  game.drawFlag = true;
  window.isGameRunning = true;
  
  aikeyEvents("stop", aiHelper);
  let lastAiViewTime = performance.now(); // Timestamp for AI viewing logic
  let lastlogicTime = performance.now();

  // Start the AI loop
  function aiLoop(timestamp) {
    if (!window.isGameRunning) return; // Stop if the game is no longer running
  
    const fpsTarget = 60;
    const interval = 1000 / fpsTarget; // Interval for AI logic (16.67 ms for 60 FPS)
  
    const aiViewInterval = 1000; // 1 second (1000 ms)
  
    // Calculate elapsed time for AI viewing logic
    const deltaAiView = timestamp - lastAiViewTime;
    if (deltaAiView >= aiViewInterval) {
      aiView(game, aiHelper);
      lastAiViewTime = timestamp; // Reset `lastAiViewTime`
    }
  
    // Calculate elapsed time for AI logic
    const deltaLogic = timestamp - lastlogicTime;
    if (deltaLogic >= interval) {
      aiLogic(game.players[1], game, aiHelper);
      lastlogicTime = timestamp; // Reset `lastlogicTime`
    }

    // Continue the AI loop
    requestAnimationFrame(aiLoop); 
  }
  // Start the AI loop
  requestAnimationFrame((timestamp) => aiLoop(timestamp));

  requestAnimationFrame((timestamp) => gameLoop(game, timestamp));
}


function aiLogic(player2, game, aiHelper) {
  if (!game.drawFlag) return;

  if (aiHelper.velocityX < 0 && aiHelper.scoreDeficit < 0) {
    aiMiddle(aiHelper, game, player2);
    return ;
  }

  // calculate time when x would reach ai.x
  let time = Math.abs((aiHelper.aiX - aiHelper.x) / aiHelper.velocityX);
  if (aiHelper.scoreDeficit < 0)
    time = aiHelper.velocityX > 0 ? (aiHelper.aiX - aiHelper.x) / aiHelper.velocityX : Math.abs((aiHelper.x - aiHelper.playerX) + (aiHelper.playerX + aiHelper.aiX - 16) / aiHelper.velocityX);
    

  // Handle parry logic
  if (game.parryFlag && !aiHelper.aiParry && aiHelper.velocityX > 0) {
      aiParry(aiHelper, game);
    // aiparryChance(aiHelper, time, 60);
  }

  // Movement and targeting logic
  let tolerance = 45 + aiHelper.tolInc / 10; //tolerance is added 
  tolerance += aiHelper.scoreDeficit * 10;
  tolerance = Math.max(0, Math.min(100, tolerance));
  let yHit = adjustYhit(aiHelper, time, game.boardHeight);

  let target = Math.abs(yHit - player2.height / 2);
  if (target > player2.y - tolerance && target < player2.y + tolerance) {
    aikeyEvents("stop", aiHelper);
    return;
  }
  if (player2.y < target) {
    aikeyEvents("down", aiHelper);
  } else if (player2.y > target) {
    aikeyEvents("up", aiHelper);
  }
}

//adjusts predicted yhit back inside the board
function adjustYhit(aiHelper, time, boardHeight) {
  let yChange = aiHelper.velocityY * time;
  let yHit = aiHelper.y + yChange;

  // calculates all the wall bounces until the target pos goes back inside the board
  while (yHit < 0 || yHit > boardHeight) {
    if (yHit < 0) {
      yHit = -yHit; // Bounce off top wall
    } else if (yHit > boardHeight) {
      yHit = boardHeight - (yHit - boardHeight); // Bounce off bottom wall
    }
  }

  return yHit;
}

/* function to put the ai back to the middle.
 Whenever he's not expecting a ball coming to him and if the ai is losing */
function aiMiddle(aiHelper, game, player2) {
  const middlePos = game.boardHeight / 2;
  const paddleCenter = player2.y + player2.height / 2;
  if (
    paddleCenter > middlePos - game.paddleSpeed * 2 &&
    paddleCenter < middlePos + game.paddleSpeed * 2
  ) {
    aikeyEvents("stop", aiHelper);
    return;
  }
  if (paddleCenter < middlePos + game.paddleSpeed) {
    aikeyEvents("down", aiHelper);
  } else if (paddleCenter > middlePos - game.paddleSpeed) {
    aikeyEvents("up", aiHelper);
  } else aikeyEvents("stop", aiHelper);
  return;
}

function aiParry(aiHelper, game) {
  // Check if parry has already been predicted
  if (!game.drawFlag) return;

  const currentTime = performance.now();
  const timeSinceLastUpdate = currentTime - aiHelper.lastTime;
  const elapsedFrames = Math.floor((timeSinceLastUpdate / 1000) * 60);

  const predictedX = aiHelper.x + aiHelper.velocityX * elapsedFrames;
  let time = (aiHelper.aiX - predictedX - 32) / aiHelper.velocityX;

  aiparryChance(aiHelper, time, 59);
}

function aiparryChance(aiHelper, time, fps) {
  const deficit = Math.max(0, aiHelper.scoreDeficit);
  let aiparryChance = 0.8; // 80% base chance to parry

  // Reduce parry chance based on score deficit
  aiparryChance -= deficit * 0.1;

  // Calculate ideal parry timing
  const idealParryTime = Math.floor(time * fps);
  if (Math.random() < aiparryChance) {
    // if (aiHelper.velocityX > 0)
      setTimeout(() => {
        aikeyEvents("parry", aiHelper);
      }, idealParryTime);
  } else {
    // for imitating missed parry
    if (aiHelper.velocityX > 0) {
      const missDelay = 100 + Math.random() * 100; // 100-200ms too late
      setTimeout(() => {
        aikeyEvents("parry", aiHelper);
      }, idealParryTime + missDelay);
    }
  }
}

// function to check/store balls last position every 1 second.
function aiView(game, aiHelper) {
  if (game.drawFlag) {
    const Ball = game.ball;
    const player = game.players[0];
    const ai = game.players[1];

    aiHelper.lastTime = performance.now();
    aiHelper.x = Ball.x;
    aiHelper.y = Ball.y;
    aiHelper.aiX = ai.x;
    aiHelper.aiY = ai.y;
    aiHelper.playerX = player.x;
    aiHelper.velocityX = Ball.velocityX;
    aiHelper.velocityY = Ball.velocityY;
    aiHelper.aiParry = ai.cooldownFlag;
    aiHelper.playerParry = player.cooldownFlag;
    // if the player is losing increase scoredificit
    aiHelper.scoreDeficit =
      player.score < ai.score
        ? ai.score - player.score
        : ai.score - player.score;
    //if statement for resetting tolInc(variable for ai making mistakes)
    if (aiHelper.lastscoreDef != aiHelper.scoreDeficit) {
      aiHelper.tolInc = 0;
      aiHelper.lastscoreDef = aiHelper.scoreDeficit;
    }
    aiHelper.tolInc++;
  }
}

function isaiKey(event) {
  const keys = ["ArrowUp", "ArrowDown", "Numpad0"];
  return keys.includes(event.key);
}

function aikeyEvents(moveDirection, aiHelper) {
  let event;

  const createAIKeyEvent = (type, key, code, keyCode) => {
    return new KeyboardEvent(type, {
      key: key,
      code: code,
      keyCode: keyCode,
      bubbles: true,
      cancelable: true,
    });
  };

  // Handle 'up' movement
  if (moveDirection === "up" && !aiHelper.aiMovingUp) {
    if (aiHelper.aiMovingDown) {
      event = createAIKeyEvent("keyup", "ArrowDown", "ArrowDown", 40);
      event.isAI = true; // Mark this event as AI-generated
      document.dispatchEvent(event);
      aiHelper.aiMovingDown = false;
    }
    event = createAIKeyEvent("keydown", "ArrowUp", "ArrowUp", 38);
    event.isAI = true;
    document.dispatchEvent(event);
    aiHelper.aiMovingUp = true;
  }

  // Handle 'down' movement
  else if (moveDirection === "down" && !aiHelper.aiMovingDown) {
    if (aiHelper.aiMovingUp) {
      event = createAIKeyEvent("keyup", "ArrowUp", "ArrowUp", 38);
      event.isAI = true;
      document.dispatchEvent(event);
      aiHelper.aiMovingUp = false;
    }
    event = createAIKeyEvent("keydown", "ArrowDown", "ArrowDown", 40);
    event.isAI = true;
    document.dispatchEvent(event);
    aiHelper.aiMovingDown = true;
  }

  // Handle stopping movement
  else if (moveDirection === "stop") {
    if (aiHelper.aiMovingUp) {
      event = createAIKeyEvent("keyup", "ArrowUp", "ArrowUp", 38);
      event.isAI = true;
      document.dispatchEvent(event);
      aiHelper.aiMovingUp = false;
    }
    if (aiHelper.aiMovingDown) {
      event = createAIKeyEvent("keyup", "ArrowDown", "ArrowDown", 40);
      event.isAI = true;
      document.dispatchEvent(event);
      aiHelper.aiMovingDown = false;
    }
  }

  // Handle 'parry' action
  else if (moveDirection === "parry") {
    event = createAIKeyEvent("keydown", "Numpad0", "Numpad0", 96);
    event.isAI = true;
    document.dispatchEvent(event);
    setTimeout(() => {
      const releaseEvent = createAIKeyEvent("keyup", "Numpad0", "Numpad0", 96);
      releaseEvent.isAI = true;
      document.dispatchEvent(releaseEvent);
    }, 10);
  }
}

function checkScreenSize(game = null) {
  const MIN_WINDOW_WIDTH = 820;
  const MIN_WINDOW_HEIGHT = 725;

  const warningMessage = document.getElementById("warningMessage");
  const gameContent = document.getElementById("gameContent");
  const playerListContainer = document.querySelector(".playerListContainer");
  const tournamentwrapper = document.querySelector(".tournamentWrapper");

  let pauseTime = 0;

  if (
    window.innerWidth < MIN_WINDOW_WIDTH ||
    window.innerHeight < MIN_WINDOW_HEIGHT
  ) {
    if (warningMessage) warningMessage.classList.remove("d-none");
    if (gameContent) gameContent.classList.add("d-none");
    if (playerListContainer) playerListContainer.classList.add("d-none");
    if (tournamentwrapper) tournamentwrapper.classList.add("d-none");
    if (game.parryFlag) pauseTime = new Date();
    game.drawFlag = false;
  } else {
    if (warningMessage) {
      warningMessage.classList.add("d-none");
    }
    if (gameContent) {
      gameContent.classList.remove("d-none");
    }
    if (playerListContainer) {
      playerListContainer.classList.remove("d-none");
    }
    if (tournamentwrapper) {
      tournamentwrapper.classList.remove("d-none");
    }
    if (game.parryFlag) {
      game.players[0].parryCooldown += pauseTime + Date.now();
      game.players[1].parryCooldown += pauseTime + Date.now();
    }
    game.drawFlag = true;
  }
}

// settings
function changeSetting(game) {
  const modal = gameSettingsModal();

  document.body.appendChild(modal);

  // Event Listeners
  modal.querySelector("#applyButton").addEventListener("click", () => {
    if (applySetting(game) === 0) {
      closeModal("gameSettingsModal");
    }
  });

  modal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (applySetting(game) === 0) {
        closeModal("gameSettingsModal");
      }
    }
  });

  modal // close the modal
    .querySelector(".btn-close")
    .addEventListener("click", () => {
      closeModal("gameSettingsModal");
    });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal("gameSettingsModal");
  });
}

function applySetting(game) {
  const MIN_PADDLE_SPEED = 6,
    MAX_PADDLE_SPEED = 10;
  const MIN_MAX_SCORE = 3,
    MAX_MAX_SCORE = 10;

  const paddleSpeedInput = parseInt(
    document.getElementById("paddleSpeed").value
  );
  const maxScoreInput = parseInt(document.getElementById("maxScore").value);
  const slowServeInput = document.getElementById("slowServe").checked;
  const parryInput = document.getElementById("parryMode").checked;

  if (
    paddleSpeedInput < MIN_PADDLE_SPEED ||
    paddleSpeedInput > MAX_PADDLE_SPEED ||
    !paddleSpeedInput
  ) {
    displayError({
      error_msg: `Paddle Speed must be between ${MIN_PADDLE_SPEED} and ${MAX_PADDLE_SPEED}.`,
    });
    return 1;
  }
  if (
    maxScoreInput < MIN_MAX_SCORE ||
    maxScoreInput > MAX_MAX_SCORE ||
    !maxScoreInput
  ) {
    displayError({
      error_msg: `Winning Score must be between ${MIN_MAX_SCORE} and ${MAX_MAX_SCORE}.`,
    });
    return 1;
  }

  game.paddleSpeed = paddleSpeedInput;
  game.maxScore = maxScoreInput;
  game.slowServe = slowServeInput;
  game.parryFlag = parryInput;

  game.saveSettings(game.players[0].playerName);
  return 0;
}

if (window.location.href.includes("/game")) {
  loadGame();
}
