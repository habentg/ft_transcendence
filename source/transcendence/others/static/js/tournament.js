//THIS IS THE GAME LOGIC
let matchCount = 0;
let matchHistory = [];

let tournamentElement;

function initializeGame() {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  document.addEventListener("keydown", move);
  document.addEventListener("keyup", stopMovement);
}

function startGame(player1, player2) {
  drawFlag = true;
  document.getElementById("player1Name").textContent = "@ " + player1Name;
  document.getElementById("player1Name").style.display = "block";
  document.getElementById("player2Name").textContent = "@ " + player2Name;
  document.getElementById("player2Name").style.display = "block";
  document.getElementById("player1").classList.remove("d-none");
  document.getElementById("player2").classList.remove("d-none");
  requestAnimationFrame(() => draw(player1, player2))
}

function prepTournament4() {
	var game3 = tournamentElement.getElementsByClassName("game3");
	var game4 = tournamentElement.getElementsByClassName("game4");
	var game6 = tournamentElement.getElementsByClassName("game6");
	var game7 = tournamentElement.getElementsByClassName("game7");
  
	for (var i = 0; i < game3.length; i++) {
	  game3[i].style.display = "none";
	}
	for (var i = 0; i < game4.length; i++) {
	  game4[i].style.display = "none";
	}
	for (var i = 0; i < game6.length; i++) {
	  game6[i].style.display = "none";
	}
	for (var i = 0; i < game7.length; i++) {
	  game7[i].style.display = "none";
	}
  
	// Also delete pseudo elements that start from game 5. class .connection-5-7
	var connection57 = tournamentElement.getElementsByClassName("connection-5-7");
	for (var i = 0; i < connection57.length; i++) {
	  connection57[i].style.display = "none";
	}
  
	// Adjust the position of the game 5
	var game5 = tournamentElement.getElementsByClassName("game5");
	game5[0].style.top = "85%";
	game5[0].style.left = "45%";
	game5[0].style.transform = "translate(-50%, -50%)";
	// game5[0].style.width = "100%";
  }

//END OF GAME LOGIC
//TOURNAMENT LOGIC

//ADD THE This is to add players
const players = ["Tofara Mususa"];

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
  tournamentWrapper.id = "tournamentWrapper";

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
											<h5 id="game1" class="card-title game-1">Game 1</h5>
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
											<h5 id="game2" class="card-title game-2">Game 2</h5>
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
											<h5 id="game3" class="card-title game-3">Game 3</h5>
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
											<h5 id="game4" class="card-title game-4">Game 4</h5>
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
											<h5 id="game5" class="card-title game-5">Game 5</h5>
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
											<h5 id="game6" class="card-title game-6">Game 6</h5>
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
								<div class="game game7 mb-5">
									<div class="card">
										<div class="card-body-custom">
											<h5 id="game7" class="card-title game-7">Game 7</h5>
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

 if(players.length == 8)
 {
	 teamSpans[4].textContent = players[4];
	 teamSpans[5].textContent = players[5];
   
	 // Update Game 4
	 teamSpans[6].textContent = players[6];
	 teamSpans[7].textContent = players[7];
 }
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
      console.log("Creating tournament with ", maxPlayerNumbers, " players");
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
      if (players.length == maxPlayerNumbers) {
        alert("Max Players reached");
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

function updateTournamentMap(match) {
  matchCount += 1;

  // Determine which game to update based on matchCount
  const gameToUpdate = tournamentElement.querySelector(`#game${matchCount}`);

  if (gameToUpdate) {
    // Update team names
    const teamElements = gameToUpdate
      .closest(".game")
      .querySelectorAll(".team span");
    teamElements[0].textContent = match.player1;
    teamElements[1].textContent = match.player2;

    // Update scores
    // Get the parent score element
    const scoreElement = gameToUpdate.closest(".game").querySelector(".score");

    // Clear existing content and update with spans
    scoreElement.innerHTML = `<span class="score-value">${match.player1Score}</span> :
    <span class="score-value">${match.player2Score}</span>`;

    // Route winner to next round based on tournament progression
    routeWinnerToNextRound(matchCount, match.winner);
  }
}

function routeWinnerToNextRound(currentGameNumber, winner) {
  // Mapping of game progression
  const gameProgressionMap = players.length == 8 ? {
    1: { nextGame: 5, teamPosition: 0 },
    2: { nextGame: 5, teamPosition: 1 },
    3: { nextGame: 6, teamPosition: 0 },
    4: { nextGame: 6, teamPosition: 1 },
    5: { nextGame: 7, teamPosition: 0 },
    6: { nextGame: 7, teamPosition: 1 },
  } : 
  {
    1: { nextGame: 5, teamPosition: 0 },
    2: { nextGame: 5, teamPosition: 1 },
  }
;

  // Check if this game has a next round
  const progression = gameProgressionMap[currentGameNumber];
  if (progression) {
    const nextGameElement = tournamentElement.querySelector(
      `#game${progression.nextGame}`
    );
    if (nextGameElement) {
      const teamElements = nextGameElement.closest(".game").querySelectorAll(".team span");
      teamElements[progression.teamPosition].textContent = winner;
    }
  }
}

//LOGIC: This is to display initial the tournament logic
function createPingPongTournament(players) {
  async function playMatch(player1, player2) {
    // Delay the execution of the code below
    await new Promise((resolve) => setTimeout(resolve, 1500));

    tournamentDiv = document.querySelector("#tournamentWrapper");
    tournamentDiv.remove();
    const pageContainer = document.getElementById("background");
    const game = gameCanvas();
    pageContainer.appendChild(game);

    return new Promise((resolve, reject) => {
      try {
        // Reset game state completely
        player1Score = 0;
        player2Score = 0;
        drawFlag = true;
        player1Obj = new Player(player1, "left");;
        player2Obj = new Player(player2, "right");;
		
        player2Name = player2;

        const gameboard = document.getElementById("tableBoard");
        const canvas = document.getElementById("board");
        gameboard.style.visibility = "visible";
        canvas.style.visibility = "visible";

        initializeGame(); // Ensure clean game initialization
        startGame(player1Obj, player2Obj);

        const checkGameStatus = () => {
          if (!drawFlag) {
            const match = {
              player1: player1Obj.playerName,
              player2: player2Obj.playerName,
              player1Score: player1Obj.score,
              player2Score: player2Obj.score,
              winner: player1Obj.score >= maxScore ? player1Obj.playerName : player2Obj.playerName,
            };

            matchHistory.push(match);
            updateTournamentMap(match);
            game.remove();
            pageContainer.appendChild(tournamentElement);
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
    const tournamentContainer = document.getElementById("background");
    tournamentElement = initMap(createTournamentMap());
	if(players.length == 4)
	{
		prepTournament4();
	}
    tournamentContainer.appendChild(tournamentElement);

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
