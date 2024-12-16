//THIS IS THE GAME LOGIC

//Game settings
let paddleSpeed = 6;
let ballSpeed = 4.5;
let maxScore = 3;
let slowServe = false;
// let	aiFlag = false;

// Board setup
let board;
let boardWidth = 800;
let boardHeight = 500;
let context;
let player1Name;
let player2Name;
let maxPlayerNumbers;

// Player setup
let playerWidth = 15;
let playerHeight = 80;
let playerVelocityY = 0;

let player1 = {
  x: 10,
  y: boardHeight / 2 - playerHeight / 2,
  width: playerWidth,
  height: playerHeight,
  velocityY: playerVelocityY,
};

let player2 = {
  x: boardWidth - 10 - playerWidth,
  y: boardHeight / 2 - playerHeight / 2,
  width: playerWidth,
  height: playerHeight,
  velocityY: playerVelocityY,
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
let matchCount = 0;
let matchHistory = [];

function initializeGame() {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  document.addEventListener("keydown", move);
  document.addEventListener("keyup", stopMovement);
}

function startGame() {
  player1Score = 0;
  player2Score = 0;
  player1LastKey = null;
  player2LastKey = null;
  drawFlag = true;
  document.getElementById("player1Name").textContent = "@ " + player1Name;
  document.getElementById("player1Name").style.display = "block";
  document.getElementById("player2Name").textContent = "@ " + player2Name;
  document.getElementById("player2Name").style.display = "block";
  document.getElementById("player1").classList.remove("d-none");
  document.getElementById("player2").classList.remove("d-none");

  requestAnimationFrame(draw);
}

function draw() {
  if (!drawFlag) {
    return;
  }
  requestAnimationFrame(draw);

  // Clear board
  context.clearRect(0, 0, board.width, board.height);

  // Draw dotted line in the middle
  context.setLineDash([10, 20]); // Pattern: 5px dash, 15px space
  context.strokeStyle = "white"; // Line color
  context.lineWidth = 5; // Line thickness
  context.beginPath();
  context.moveTo(boardWidth / 2, 0); // Start at the top middle
  context.lineTo(boardWidth / 2, boardHeight); // Draw to the bottom middle
  context.stroke();
  context.setLineDash([]); // Reset line dash to solid

  // Update player positions
  if (!oob(player1.y + player1.velocityY)) player1.y += player1.velocityY;
  if (!oob(player2.y + player2.velocityY)) player2.y += player2.velocityY;

  drawCapsulePaddle(
    player1.x,
    player1.y,
    player1.width,
    player1.height,
    player1.width / 2,
    "#84ddfc",
    "black"
  );
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

  // Check ball collision with walls
  if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= boardHeight)
    ball.velocityY *= -1;

  // Check ball collision with players
  if (ballCollision(ball, player1, player1LastKey)) player1LastKey = null;
  if (ballCollision(ball, player2, player2LastKey)) player2LastKey = null;

  // Draw ball as a circle
  context.beginPath();
  context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  context.fillStyle = "#b02c98";
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
  context.fillStyle = "#ffffff";
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
  if (e.code === "KeyW" || e.code === "KeyS") {
    player1.velocityY = 0;
    player1LastKey = e.code;
  }
  if (e.code === "ArrowUp" || e.code === "ArrowDown") {
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
    ball.x - ballRadius < player.x + player.width && // Right side of the ball is past the left side of the player
    ball.x + ballRadius > player.x && // Left side of the ball is past the right side of the player
    ball.y + ballRadius > player.y && // Bottom side of the ball is past the top of the player
    ball.y - ballRadius < player.y + player.height; // Top side of the ball is past the bottom of the player

  if (isCollision) {
    // Reverse horizontal direction
    ball.velocityX *= -1;

    // Calculate the relative hit position
    let paddleCenter = player.y + player.height / 2;
    let hitPosition = (ball.y - paddleCenter) / (player.height / 2); // Normalize between -1 and 1

    // Adjust vertical velocity based on hit position
    // ball.velocityY = hitPosition * 2.5; // Increase ball speed and angle

    // Optional: Slightly increase ball speed for more challenge
    // ball.velocityX *= 1.1; // Increase horizontal speed

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
    console.log("Game Over: SHOULD RETURN SETTINGS MENU");
    if (document.getElementById("startButton")) {
      document.getElementById("startButton").disabled = false;
    }
  }
}

function isGameOver() {
  if (player1Score >= maxScore || player2Score >= maxScore) {
    return true;
  }
  return false;
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

//END OF GAME LOGIC
//TOURNAMENT LOGIC

//ADD THE This is to add players
const players = ["Tofara"];

function getPlayerNumberModal() {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "tournamentModal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.innerHTML = `
	<div class="modal-dialog modal-dialog-centered modal-md">
	  <div class="modal-content">
		<div class="modal-header border-0 py-3">
		  <h5 class="modal-title">
			<i class="fas fa-trophy me-2"></i> Create Tournament
		  </h5>
		  <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
		</div>
		<div class="modal-body px-3 py-2">
		  <div id="local-game-error-msg" class="alert alert-danger small py-2" style="display:none;"></div>
		  <p class="text-white mb-0">Enter number of player in tournament</p>
		  <input type="int" id="playersNumber" class="form-control my-2" placeholder="Enter number of players" />
		  <small class="notice mt-2 d-block">Minimum players: 4 | Max players: 8</small>
		</div>
		<div class="modal-footer border-0 py-3 d-flex justify-content-start">
		  <button type="button" class="btn btn-primary btn-sm" id="submitPlayerNumBtn">
			<i class="fas fa-paper-plane me-2"></i> Submit
		</button>
	  </div>
	  </div>
	</div>
	`;
  return modal;
}

function createTournamentMap() {
  const tournamentWrapper = document.createElement("div");
  tournamentWrapper.className = "tournamentWrapper";

  tournamentWrapper.innerHTML = `
				<h1 class="text-center mb-5">Tournament Map</h1>
				<div class="row d-flex position-relative ">
					<!-- First Round -->
					<div class="col-4 d-flex justify-content-center align-items-end">
						<div class="round first-round mb-5">
							<!-- <h6 class="text-center">First Round</h6> -->
							<div class="vertical-line">
								<!-- Game 1 -->
								<div class="game game1 mb-5">
									<div class="card">
										<div class="card-body-custom">
											<h5 id="game1" class="card-title">Game 1</h5>
											<div class="d-flex justify-content-between align-items-center">
												<div class="team">
													<i class="profileIcon fas fa-user-circle "></i>
													<span class=""></span>
												</div>
												<div class="score">
												<span class="score-value"></span>vs.<span class="score-value "></span>
												</div>
												<div class="team">
													<span></span>
													<i class="profileIcon fas fa-user-circle "></i>
												</div>
											</div>
										</div>
										<div class="connection-line connection-1-5"></div>
									</div>
								</div>
								<!-- Game 2 -->
								<div class="game game2 mb-5">
									<div class="card">
										<div class="card-body-custom">
											<h5 id="game2" class="card-title">Game 2</h5>
											<div class="d-flex justify-content-between align-items-center">
												<div class="team">
													<i class="profileIcon fas fa-user-circle "></i>
													<span class=""></span>
												</div>
												<div class="score">
												<span class="score-value"></span>vs.<span class="score-value "></span>
												</div>
												<div class="team">
													<span ></span>
													<i class="profileIcon fas fa-user-circle "></i>
												</div>
											</div>
										</div>
									</div>
									<div class="connection-line connection-2-5"></div>
								</div>
								<!-- Game 3 -->
								<div class="game game3 mb-5">
									<div class="card">
										<div class="card-body-custom">
											<h5 id="game3" class="card-title">Game 3</h5>
											<div class="d-flex justify-content-between align-items-center">
												<div class="team">
													<i class="profileIcon fas fa-user-circle "></i>
													<span class=""></span>
												</div>
												<div class="score">
												<span class="score-value"></span>vs.<span class="score-value "></span>
												</div>
												<div class="team">
													<span class=""></span>
													<i class="profileIcon fas fa-user-circle "></i>
												</div>
											</div>
										</div>
									</div>
									<div class="connection-line connection-3-6"></div>
								</div>
								<!-- Game 4 -->
								<div class="game game4 mb-5">
									<div class="card">
										<div class="card-body-custom">
											<h5 id="game4" class="card-title">Game 4</h5>
											<div class="d-flex justify-content-between align-items-center">
												<div class="team">
													<i class="profileIcon fas fa-user-circle "></i>
													<span class=""></span>
												</div>
												<div class="score">
												<span class="score-value"></span>vs.<span class="score-value "></span>
												</div>
												<div class="team">
													<span class ></span>
													<i class="profileIcon fas fa-user-circle "></i>
												</div>
											</div>
										</div>
									</div>
									<div class="connection-line connection-4-6"></div>
								</div>
							</div>
						</div>
					</div>

					<!-- Second Round -->
					<div class="col-4 d-flex justify-content-center  ">
						<div class="round second-round mb-5">
							<!-- <h6 class="text-center">Second Round</h6> -->
							<div class="vertical-line ">
								<!-- Game 5 -->
								<div class="game game5 ">
									<div class="card">
										<div class="card-body-custom">
											<h5 id="game5" class="card-title">Game 5</h5>
											<div class="d-flex justify-content-between align-items-center">
												<div class="team">
													<i class="profileIcon fas fa-user-circle "></i>
													<span class=" ">TDB</span>
												</div>
												<div class="score">
													<span class="score-value"></span>vs.<span class="score-value "></span>
												</div>
												<div class="team">
													<span class="">TDB</span>
													<i class="profileIcon fas fa-user-circle "></i>
												</div>
											</div>
										</div>
									</div>
									<div class="connection-line connection-5-7"></div>
								</div>
								<!-- Game 6 -->
								<div class="game game6 mb-5">
									<div class="card">
										<div class="card-body-custom">
											<h5 id="game6" class="card-title">Game 6</h5>
											<div class="d-flex justify-content-between align-items-center">
												<div class="team">
													<i class="profileIcon fas fa-user-circle "></i>
													<span class=" ">TDB</span>
												</div>
												<div class="score">
													<span class="score-value"></span>vs.<span class="score-value"></span>
												</div>
												<div class="team">
													<span>TDB</span>
													<i class="profileIcon fas fa-user-circle "></i>
												</div>
											</div>
										</div>
									</div>
									<div class="connection-line connection-6-7"></div>
								</div>
							</div>
						</div>
					</div>

					<!-- Final Round -->
					<div class="col-4 d-flex justify-content-center">
						<div class="round final-round">
							<!-- <h6 class="text-center">Final Round</h6> -->
							<!-- <div class="vertical-line"> -->
								<!-- Game 7 -->
								<div id="game7" class="game game7 mb-5">
									<div class="card">
										<div class="card-body-custom">
											<h5 class="card-title">Game 7</h5>
											<div class="d-flex justify-content-between align-items-center">
												<div class="team">
													<i class="profileIcon fas fa-user-circle "></i>
													<span class=" ">TDB</span>
												</div>
												<div class="score">
													<span class="score-value"></span>vs.<span class="score-value "></span>
												</div>
												<div class="team">
													<span class="">TDB</span>
													<i class="profileIcon fas fa-user-circle "></i>
												</div>
											</div>
										</div>
									</div>
									<div class="connection-line connection-7-8"></div>
								</div>
							<!-- </div> -->
						</div>
					</div>
				</div>
    `;

  return tournamentWrapper;
}

function gameCanvas() {
  const gameBoard = document.createElement("div");
  gameBoard.id = "tableBoard";
  gameBoard.className = "justify-content-center";

  gameBoard.innerHTML = `
    <div class="gamePlayers d-flex justify-content-between">
        <div id="player1" class="col-12 col-md-6 text-center d-none">
            <h3 id="player1Name" class="playerNames"></h3> 
        </div>
        <div id="player2" class="col-12 col-md-6 text-center d-none">
            <h3 id="player2Name" class="playerNames"></h3>
        </div>
    </div>
    <div class="text-center">
        <canvas id="board" class="mt-2 shadow"></canvas>
    </div>
    `;

  return gameBoard;
}

function closeModal(modalId) {
  console.log("closing modal");
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove(); // Remove the modal from the DOM
    document.body.classList.remove("modal-open"); // Remove the modal-open class from body
  } else {
    console.warn(`Modal with id "${modalId}" not found.`);
  }
}

// Create a modal for creating a tournament
function createTournamentModal() {
  const existingModal = document.getElementById("tournamentModal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = getPlayerNumberModal();
  document.body.appendChild(modal);

  // Event Listeners
  document
    .getElementById("submitPlayerNumBtn")
    .addEventListener("click", () => {
      const playersNumber = document.getElementById("playersNumber").value;
      console.log("Creating tournament with ", playersNumber, " players");
      // createTournament(playersNumber);
      closeModal("tournamentModal");
    });

  // close the modal when the close button is clicked
  document
    .querySelector("#tournamentModal .btn-close")
    .addEventListener("click", () => {
      closeModal("tournamentModal");
    });

  // close the modal when the modal is clicked outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal("tournamentModal");
    }
  });
}

function initMap(tournamentMap) {
  // Array of 8 players

  // Get all team spans and profile icons
  const teamSpans = tournamentMap.querySelectorAll(".team span");

  // Update Game 1
  teamSpans[0].textContent = players[0];
  teamSpans[1].textContent = players[1];

  // Update Game 2
  teamSpans[2].textContent = players[2];
  teamSpans[3].textContent = players[3];

  // Update Game 3
  teamSpans[4].textContent = players[4];
  teamSpans[5].textContent = players[5];

  // Update Game 4
  teamSpans[6].textContent = players[6];
  teamSpans[7].textContent = players[7];

  return tournamentMap;
}

document.addEventListener("DOMContentLoaded", () => {
  // Players array with Tofara Mususa as first element
  // Get DOM elements

  const existingModal = document.getElementById("tournamentModal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = getPlayerNumberModal();
  document.body.appendChild(modal);

  // Event Listeners
  document
    .getElementById("submitPlayerNumBtn")
    .addEventListener("click", () => {
      maxPlayerNumbers = document.getElementById("playersNumber").value;
      if (maxPlayerNumbers < 4 || maxPlayerNumbers > 8) {
        alert("Not between 4 and 8");
      }
      console.log("Creating tournament with ", playersNumber, " players");
      closeModal("tournamentModal");
      setUpPlayerAddition();
    });

  // close the modal when the close button is clicked
  document
    .querySelector("#tournamentModal .btn-close")
    .addEventListener("click", () => {
      closeModal("tournamentModal");
    });

  // close the modal when the modal is clicked outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal("tournamentModal");
    }
  });

  function setUpPlayerAddition() {
    const searchInput = document.getElementById("searchInput");
    const searchIcon = document.getElementById("searchIcon");
    const createTournamentBtn = document.getElementById("createTournamentBtn");
    const startButton = document.getElementById("startButton");

    // Function to add a new player
    function addPlayer(playerName) {
      // Trim and validate player name
      const trimmedName = playerName.trim();
      if (!trimmedName) return;

      // Check if player already exists
      if (players.includes(trimmedName)) {
        alert("Player already added!");
        return;
      }
      if (players.length != maxPlayerNumbers) {
        alert("Not the correct set number of players");
        return;
      }

      // Add player to array
      players.push(trimmedName);

      // Create new player button
      const playerButton = document.createElement("button");
      playerButton.classList.add(
        "menu-item",
        "d-flex",
        "justify-content-center",
        "align-items-center",
        "p-3"
      );
      playerButton.innerHTML = `
            <i class="fas fa-user fa-1x me-2"></i>
            <h6 class="mb-0">${trimmedName}</h6>
        `;

      // Add click event to remove player
      playerButton.addEventListener("click", () => {
        // Prevent removing Tofara Mususa
        if (trimmedName === "Tofara Mususa") {
          alert("Cannot remove Tofara Mususa");
          return;
        }
        // Remove from players array
        const index = players.indexOf(trimmedName);
        if (index > -1) {
          players.splice(index, 1);
        }

        // Remove button from DOM
        playerButton.remove();
      });

      // Add the new player button to the createTournamentBtn div
      createTournamentBtn.appendChild(playerButton);

      // Clear input
      searchInput.value = "";
    }

    // Event listener for search icon click
    searchIcon.addEventListener("click", () => {
      addPlayer(searchInput.value);
    });

    // Event listener for enter key in search input
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addPlayer(searchInput.value);
      }
    });

    startButton.addEventListener("click", async () => {
      if (players.length < 2) {
        alert("Please add at least 2 players to start the tournament!");
        return;
      }
      const friendBoard = document.querySelector(".friendBoard");
      friendBoard.remove();
      const tournament = createPingPongTournament(players);
      try {
        const tournamentContainer = document.getElementById("background");
        tournamentContainer.appendChild(initMap(createTournamentMap()));
        const champion = await tournament.runTournament();
        console.log("Champion:", champion);
        console.log("Match History:", tournament.getMatchHistory());
      } catch (error) {
        console.error("Tournament error:", error);
      }
    });

    // Add initial Tofara Mususa button (if not already present)
    if (!document.querySelector("#createTournamentBtn .menu-item")) {
      const initialPlayerButton = document.createElement("button");
      initialPlayerButton.classList.add(
        "menu-item",
        "d-flex",
        "justify-content-center",
        "align-items-center",
        "p-3"
      );
      initialPlayerButton.innerHTML = `
            <i class="fas fa-trophy fa-1x me-2"></i>
            <h6 class="mb-0">Tofara Mususa</h6>
        `;

      // Add click event to remove player
      initialPlayerButton.addEventListener("click", () => {
        alert("Cannot remove Tofara Mususa");
      });

      createTournamentBtn.appendChild(initialPlayerButton);
    }
  }
});


function updateTournamentMap(match)
{
	matchCount += 1;

	tournamentDiv = document.querySelector("#tournamentWrapper");

	
}
//LOGIC: This is to display initial the tournament logic
function createPingPongTournament(players) {


  async function playMatch(player1, player2) {
    const tournamentContainer = document.getElementById("background");
    const game = gameCanvas();
    tournamentContainer.appendChild(game);

    return new Promise((resolve, reject) => {
      try {
        // Reset game state completely
        player1Score = 0;
        player2Score = 0;
        drawFlag = true;
        player1Name = player1;
        player2Name = player2;

        const gameboard = document.getElementById("tableBoard");
        const canvas = document.getElementById("board");
        gameboard.style.visibility = "visible";
        canvas.style.visibility = "visible";

        initializeGame(); // Ensure clean game initialization
        startGame();

        const checkGameStatus = () => {
          if (!drawFlag) {
            const match = {
              player1: player1,
              player2: player2,
              player1Score: player1Score,
              player2Score: player2Score,
              winner: player1Score >= maxScore ? player1 : player2,
            };

            matchHistory.push(match);
			updateTournamentMap(match);
            // gameboard.style.visibility = 'hidden';
            // canvas.style.visibility = 'hidden';
            game.remove();
            resolve(match.winner);
          } else {
            requestAnimationFrame(checkGameStatus);
          }
        };

        checkGameStatus();
      } catch (error) {
        reject(error);
      }
    });
  }

  async function runTournament() {
    let currentPlayers = [...players];

    // Validate initial number of players
    if (![4, 8].includes(currentPlayers.length)) {
      alert("Tournament supports only 4, 8 players");
    }

    // Quarter Finals (if applicable)
    if (currentPlayers.length === 8) {
      //need to add a div saying that we are the quarter finals
      const quarterFinalWinners = [];
      for (let i = 0; i < currentPlayers.length; i += 2) {
        const winner = await playMatch(
          currentPlayers[i],
          currentPlayers[i + 1]
        );
        quarterFinalWinners.push(winner);
      }
      currentPlayers = quarterFinalWinners;
    }

    // Semi Finals
    const semiFinalWinners = [];
    //need to add a div saying this semifinals
    for (let i = 0; i < currentPlayers.length; i += 2) {
      const winner = await playMatch(currentPlayers[i], currentPlayers[i + 1]);
      semiFinalWinners.push(winner);
    }

    // Final
    // add the finals div here saying there are the players playing
    const champion = await playMatch(semiFinalWinners[0], semiFinalWinners[1]);

    return champion;
  }

  function getMatchHistory() {
    return matchHistory;
  }

  return {
    runTournament,
    getMatchHistory,
  };
}
