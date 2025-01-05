async function createGameInDB(game) {
  console.log("Inside createGameInDB");
  console.log("Game Data: ", game);
  const startgame_data = {
    player_one: game.players[0].playerName,
    player_two: game.players[1].playerName,
    type: game.aiFlag ? "AI" : "VERSUS"
  };
  if (game.tournamentFlag) {
    startgame_data["type"] = "TOURNAMENT";
    startgame_data["tournament_id"] = `${game.tournament_id}`;
  }
  console.log("------- start ---- Game Data -------");
  console.table(startgame_data);
  console.log("------- start ---- Game Data -------");
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
      console.log("response.ok");
      const responseData = await response.json();
      game.game_id = responseData.game_id;
      console.log("New Game ID: ", game.game_id);
      if (game.aiFlag)
        startaiGame(game);
      else if (game.tournamentFlag)
        return 'start_tournament';
      else 
        startGame(game);
      return;
    }
    throw new Error("Failed to load gameApiPOSTFunction");
  } catch (error) {
    createToast({type: 'error', error_message: 'Failed to create game', title: 'Game Creating Error!'});
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
    throw new Error(`Failed to update game with id: ${game_id} : ${response.status} : ${response.error}`);
  } catch (error) {
    createToast({type: 'error', error_message: error, title: 'Game Updating Error!'});
    console.error(error);
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
  // window.game = new Game();
  // const game = window.game;
  const game = new Game();
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
        console.log("Start Button clicked");
        await createGameInDB(game);
      });
    }
    
    if (document.getElementById("aiButton")) {
      document.getElementById("aiButton").addEventListener("click", async () => {
      console.log("Start Button clicked");
      await createGameInDB(game);
      // console.table(game);
      // startaiGame(game);
    });
  }
}

function startGame(game) {
  game.drawFlag = true;

  game.setupeventListeners();
  document.getElementById("startButton").disabled = true;
  document.getElementById("settingButton").disabled = true;
  document.getElementById("gameRulesButton").disabled = true;

  requestAnimationFrame((timestamp) => gameLoop(game, timestamp));
}

function gameLoop(game, timestamp) {
  const fps = 60;
  const interval = 1000 / fps;
  // console.log("GameLoop playerHeight", game.playerHeight);
  if (timestamp - game.lastTime >= interval) {
    game.lastTime = timestamp;
    // Update game values
    updategameValues(game.players[0], game.players[1], game);
    // Draw the game
    draw(game.players[0], game.players[1], game);
  }

  // Continue the loop if drawFlag is true
  if (game.drawFlag) {
    requestAnimationFrame((newTimestamp) => {
    //   checkScreenSize();
      gameLoop(game, newTimestamp);
    });
  }
}

function updategameValues(player1, player2, game) {
  if (!oob(player1.y + player1.velocityY)) player1.y += player1.velocityY;
  if (!oob(player2.y + player2.velocityY)) player2.y += player2.velocityY;

  updatePaddleVelocities(player1, player2, game);

  // Update ball position
  game.ball.x += game.ball.velocityX;
  game.ball.y += game.ball.velocityY;

  // makes the ball bounce from the walls
  if (
    game.ball.y - game.ball.ballRadius <= 0 ||
    game.ball.y + game.ball.ballRadius >= game.boardHeight
  )
    game.ball.velocityY *= -1;

  // Check ball collision with players
  ballCollision(game.ball, player1, "left", game);
  ballCollision(game.ball, player2, "right", game);

  if (game.ball.x - game.ball.ballRadius < 0) {
    player2.score++;
    resetGame(player1, player2, 1, game);
  } else if (game.ball.x + game.ball.ballRadius > game.boardWidth) {
    player1.score++;
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
  drawPlayers(player1, player2, game); //draw players
  drawBall(game); // draw the ball obviously
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
      "black",
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
      "black",
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
      if (secondPlayerName) {
        game.defp2Name = secondPlayerName;
        document.getElementById(
          "player2Name"
        ).textContent = `@ ${secondPlayerName}`;
        document.getElementById("player2Name").style.display = "block";
        game.createPlayer(secondPlayerName, "right");
        modal.remove();
      } else {
        const errorMsg = document.getElementById("local-game-error-msg");
        errorMsg.textContent = "Please enter the name of the second player.";
        errorMsg.style.display = "block";
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

  // modal.addEventListener("click", (event) => {
  //   if (event.target === modal) {
  //     modal.querySelector("#submitSecondPlayerNameBtn").click();
  //   }
  // });
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
    if (game.activeKeys["KeyA"] && !player1.cooldownFlag) {
      if (isParry(player1, game)) {
        game.ball.velocityX *= 2;
        game.ball.velocityY = 0;
        console.log("Good Parry");
      } else console.log("Wrong parry");
      parryCoolDown(player1, game);
    }
    if (game.activeKeys["Numpad0"] && !player2.cooldownFlag) {
      if (isParry(player2, game)) {
        ball.velocityX *= -2;
        ball.velocityY = 0;
        console.log("Good Parry");
      } else console.log("Wrong parry");
      parryCoolDown(player2, game);
    }
  }
}

function isParry(player, game) {
  const parryRange = 30; // Adjust as needed
  const ballNearPlayer =
    player.x < game.boardWidth / 2 // Check which side the player is on
      ? game.ball.x - game.ball.ballRadius <=
        player.x + player.width + parryRange // Near Player 1
      : game.ball.x + game.ball.ballRadius >= player.x - parryRange; // Near Player 2
  const withinVerticalRange =
    game.ball.y + game.ball.ballRadius > player.y &&
    game.ball.y - game.ball.ballRadius < player.y + player.height;
  return ballNearPlayer && withinVerticalRange;
}

function parryRefresh(player) {
  if (player.cooldownFlag && Date.now() > player.parryCooldown) {
    player.cooldownFlag = false;
  }
}

function parryCoolDown(player, game) {
  player.cooldownFlag = true;
  player.parryCooldown = Date.now() + game.cooldownTime;
}

function oob(yPosition) {
  return yPosition < 0 || yPosition + 80 > 500;
}

function ballCollision(ball, player, position) {
  // Define the maximum speed for the ball
  const MAX_SPEED_X = 8; // Maximum horizontal speed (velocityX)
  const MAX_SPEED_Y = 10; // Maximum vertical speed (velocityY)

  // Predict the ball's previous position
  const prevX = ball.x - ball.velocityX;
  const prevY = ball.y - ball.velocityY;

  // Check for a collision using both the current and previous positions
  let isCollision =
    ball.x - ball.ballRadius < player.x + player.width && // Current position: Right side of the ball is past the left side of the player
    ball.x + ball.ballRadius > player.x && // Current position: Left side of the ball is past the right side of the player
    ball.y + ball.ballRadius > player.y && // Current position: Bottom side of the ball is past the top of the player
    ball.y - ball.ballRadius < player.y + player.height; // Current position: Top side of the ball is past the bottom of the player

  let wasCollision =
    prevX - ball.ballRadius < player.x + player.width && // Previous position: Right side of the ball is past the left side of the player
    prevX + ball.ballRadius > player.x && // Previous position: Left side of the ball is past the right side of the player
    prevY + ball.ballRadius > player.y && // Previous position: Bottom side of the ball is past the top of the player
    prevY - ball.ballRadius < player.y + player.height; // Previous position: Top side of the ball is past the bottom of the player

  // If either current or previous position indicates a collision, handle it
  if (isCollision || wasCollision) {
    let hitPosition = (ball.y - player.y) / player.height; // Normalize hit position between 0 and 1
    let section = Math.floor(hitPosition * 4); // Section index (0, 1, 2, 3)

    if (position === "left") {
      // Ball hit the left player's paddle
      ball.velocityX = Math.abs(ball.velocityX); // Ensure velocityX is positive (moving right)
    } else if (position === "right") {
      // Ball hit the right player's paddle
      ball.velocityX = -Math.abs(ball.velocityX); // Ensure velocityX is negative (moving left)
    }

    // Adjust vertical velocity based on the section of the paddle hit
    switch (section) {
      case 0:
        ball.velocityY = -1.5; // Strong upwards angle
        break;
      case 1:
        ball.velocityY = -1.0; // Slightly upwards
        break;
      case 2:
        ball.velocityY = 1.0; // Slightly downwards
        break;
      case 3:
        ball.velocityY = 1.5; // Strong downward angle
        break;
    }

    // Resolve collision by moving the ball outside the paddle
    if (position === "left") {
      ball.x = player.x + player.width + ball.ballRadius;
    } else if (position === "right") {
      ball.x = player.x - ball.ballRadius;
    }

    // Clamp velocities to the maximum allowed speeds
    ball.velocityX = Math.min(
      Math.max(ball.velocityX, -MAX_SPEED_X),
      MAX_SPEED_X
    );
    ball.velocityY = Math.min(
      Math.max(ball.velocityY, -MAX_SPEED_Y),
      MAX_SPEED_Y
    );
  }
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

  if (game.slowServe) {
    // Apply reduced speed if slow serve is enabled
    game.ball.velocityX = direction * Math.abs(game.defballSpeed) * 0.5;
    game.ball.velocityY = 2 * (Math.random() > 0.5 ? 1 : -1) * 0.5;
  } else {
    // Use normal initial speed
    game.ball.velocityX = direction * Math.abs(game.defballSpeed);
    game.ball.velocityY = 2 * (Math.random() > 0.5 ? 1 : -1);
  }

  if (isGameOver(player1, player2, game)) {
    game.drawFlag = false;
    // game.aiFlag = false;
    const endgame_stuff = {
      player1_username: player1.playerName,
      player2_username: player2.playerName,
      player1_score: player1.finalScore,
      player2_score: player2.finalScore,
    };
    await updateGameInDB(endgame_stuff, game.game_id);
    console.log(`Game Between ${player1.playerName} Vs. ${player2.playerName} Over! Scores: ${player1.finalScore} - ${player2.finalScore}`);

    if (document.getElementById("aiButton")) {
      document.getElementById("aiButton").disabled = false;
    }
    else if (document.getElementById("startButton")) {
      console.log("Start Button enabled");
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

function drawLine(game) {
  // Draw dotted line in the middle
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
  game.aiFlag = true; // Enable AI
  game.drawFlag = true;

  game.setupeventListeners();
  // make player 2 name as AI
  document.getElementById("player2Name").textContent = "@ AI";
  document.getElementById("player2Name").style.display = "block";

  // document.getElementById("player1").classList.remove("d-none");
  // document.getElementById("player2").classList.remove("d-none");

  document.getElementById("aiButton").disabled = true;
  document.getElementById("settingButton").disabled = true;
  document.getElementById("gameRulesButton").disabled = true;

  let aiHelper = {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    aiMovingUp: false,
    aiMovingDown: false,
  };

  setInterval(() => aiView(game, aiHelper), 1000);
  setInterval(() => aiLogic(game.players[1], game, aiHelper), 50);
  // aiLogic(player2);

  requestAnimationFrame((timestamp) => {
    gameLoop(game, timestamp);
  });
}

function aiLogic(player2, game, aiHelper) {
  if (!game.aiFlag)
    return;
  const tolerance = 10; // Allow a small margin of error

  const time = (player2.x - game.ball.x - player2.width) / game.ball.velocityX;
  const yChange = game.ball.velocityY * time;
  let yHit = game.ball.y + yChange;

  if (game.parryFlag && aiHelper.velocityX > 0 && player2.cooldownFlag) {
    setTimeout(() => {
      aikeyEvents("parry", aiHelper);
    }, time * 60);
  }

  if (yHit < 0) {
    yHit *= -1;
  } else if (yHit > 500) {
    yHit -= 500;
  }

  let target = Math.abs(yHit - player2.height / 2);
  if (target > player2.y - tolerance && target < player2.y + 40) {
    // If the AI is close enough to the target Y position, stop moving
    aikeyEvents("stop", aiHelper);
    return;
  }
  if (player2.y + tolerance < target) {
    aikeyEvents("down", aiHelper); // Keep moving down until target is reached
  } else if (player2.y - tolerance > target) {
    aikeyEvents("up", aiHelper); // Keep moving up until target is reached
  }
}

// function to check/store balls last position every 1 second.
function aiView(game, aiHelper) {
  if (game.aiFlag) {
    aiHelper.x = game.ball.x;
    aiHelper.y = game.ball.y;
    aiHelper.velocityX = game.ball.velocityX;
    aiHelper.velocityY = game.ball.velocityY;
  }
}

function aikeyEvents(moveDirection, aiHelper) {
  let event;

  // Simulate 'keydown' for up, down, or parry based on moveDirection
  if (moveDirection === "up" && !aiHelper.aiMovingUp) {
    event = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      code: "ArrowUp",
      keyCode: 38,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
    aiHelper.aiMovingUp = true; // Track that the key is being held down
  } else if (moveDirection === "down" && !aiHelper.aiMovingDown) {
    event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
      keyCode: 40,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
    aiHelper.aiMovingDown = true; // Track that the key is being held down
  } else if (moveDirection === "stop") {
    // Simulate 'keyup' for stopping movement
    if (aiHelper.aiMovingUp) {
      event = new KeyboardEvent("keyup", {
        key: "ArrowUp",
        code: "ArrowUp",
        keyCode: 38,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
      aiHelper.aiMovingUp = false; // Stop holding up
    }
    if (aiHelper.aiMovingDown) {
      event = new KeyboardEvent("keyup", {
        key: "ArrowDown",
        code: "ArrowDown",
        keyCode: 40,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
      aiHelper.aiMovingDown = false; // Stop holding down
    }
  } else if (moveDirection === "parry") {
    // Simulate 'keydown' for the Numpad 0 key
    event = new KeyboardEvent("keydown", {
      key: "Numpad0",
      code: "Numpad0",
      keyCode: 96,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    // Simulate 'keyup' immediately after for a quick press
    setTimeout(() => {
      const releaseEvent = new KeyboardEvent("keyup", {
        key: "Numpad0",
        code: "Numpad0",
        keyCode: 96,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(releaseEvent);
    }, 50); // Small delay to simulate a quick tap
  }
}

// settings

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
    if (warningMessage) {
      warningMessage.classList.add("d-none");
    }
    if (gameContent) {
      gameContent.classList.remove("d-none");
    }
  }
}

function changeSetting(game) {
  const modal = gameSettingsModal();

  if (document.body.appendChild(modal))
    console.log("Child appended");

  console.log("Modal values", modal);

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

  // document.body.appendChild(modal);
  // document.body.classList.add("modal-open");
  // document.body.appendChild(modal);
  // document.body.classList.add("modal-open");

  console.log("Game values: ", game);

  // const paddleSpeedInput = parseInt(document.getElementById("paddleSpeed").value);

  // document.getElementById("settingsMenu").style.display = "none";
  // console.log("Settings Applied: ", {
  //   paddleSpeed,
  //   defballSpeed,
  //   maxScore,
  //   slowServe,
  //   parryFlag,
  // });

  // document.getElementById("settingsMenu").style.display = "none";
  // console.log("Settings Applied: ", { this:paddleSpeed, this:defballSpeed, this:maxScore });
  // closeModal("gameSettingsModal");
}

function applySetting(game) {
  console.log("Game values inside apply Setting", game);
  const MIN_PADDLE_SPEED = 1,
    MAX_PADDLE_SPEED = 10;
  const MIN_MAX_SCORE = 1,
    MAX_MAX_SCORE = 20;

  const paddleSpeedInput = parseInt(
    document.getElementById("paddleSpeed").value
  );
  const maxScoreInput = parseInt(document.getElementById("maxScore").value);
  const slowServeInput = document.getElementById("slowServe").checked;
  const parryInput = document.getElementById("parryMode").checked;

  // let errors = [];
  // const errorContainer = document.getElementById("errorMessages");
  // errorContainer.innerHTML = ""; // Clear existing messages

  console.log("PaddleSpeedInput values from parseINT", paddleSpeedInput);
  if (
    paddleSpeedInput < MIN_PADDLE_SPEED ||
    paddleSpeedInput > MAX_PADDLE_SPEED
  ) {
    displayError({
      error_msg: `Paddle Speed must be between ${MIN_PADDLE_SPEED} and ${MAX_PADDLE_SPEED}.`,
    });
    // errorContainer.innerHTML = 'Invalid Values ....';
    return 1;
    // console.log("Inside the if statement of paddleSpeed error");
    // errors.push(
    //   `Paddle Speed must be between ${MIN_PADDLE_SPEED} and ${MAX_PADDLE_SPEED}.`);
  }
  if (maxScoreInput < MIN_MAX_SCORE || maxScoreInput > MAX_MAX_SCORE) {
    displayError({
      error_msg: `Winning Score must be between ${MIN_MAX_SCORE} and ${MAX_MAX_SCORE}.`,
    });
    // errorContainer.innerHTML = 'Invalid Values ....';
    return 1;
    // errors.push(
    //   `Winning Score must be between ${MIN_MAX_SCORE} and ${MAX_MAX_SCORE}.`
    // );
  }
  // if (errors.length > 0) {
  //   console.log("Inside if statement errors");
  //   errors.forEach((error) => {
  //     const errorElement = document.createElement("p");
  //     errorElement.textContent = error;
  //     errorElement.style.color = "red";
  //     errorContainer.appendChild(errorElement);
  //   });
  // }
  game.paddleSpeed = paddleSpeedInput;
  game.maxScore = maxScoreInput;
  game.slowServe = slowServeInput;
  game.parryFlag = parryInput;

  console.log("Game values after update", game);
  return 0;
}

if (window.location.href.includes("/game")) {
  loadGame();
  window.addEventListener("resize", checkScreenSize);
}

// checkScreenSize();
