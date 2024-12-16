// function getPlayerNumberModal() {
// 	const modal = document.createElement("div");
// 	modal.classList.add("modal");
// 	modal.id = "tournamentModal";
// 	modal.className = "modal fade show";
// 	modal.style.display = "block";
// 	modal.innerHTML = `
// 	<div class="modal-dialog modal-dialog-centered modal-md">
// 	  <div class="modal-content">
// 		<div class="modal-header border-0 py-3">
// 		  <h5 class="modal-title">
// 			<i class="fas fa-trophy me-2"></i> Create Tournament
// 		  </h5>
// 		  <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
// 		</div>
// 		<div class="modal-body px-3 py-2">
// 		  <div id="local-game-error-msg" class="alert alert-danger small py-2" style="display:none;"></div>
// 		  <p class="text-white mb-0">Enter number of player in tournament</p>
// 		  <input type="int" id="playersNumber" class="form-control my-2" placeholder="Enter number of players" />
// 		  <small class="notice mt-2 d-block">Minimum players: 4 | Max players: 8</small>
// 		</div>
// 		<div class="modal-footer border-0 py-3 d-flex justify-content-start">
// 		  <button type="button" class="btn btn-primary btn-sm" id="submitPlayerNumBtn">
// 			<i class="fas fa-paper-plane me-2"></i> Submit
// 		</button>
// 	  </div>
// 	  </div>
// 	</div>
// 	`;
// 	return modal;
//   }

//   function closeModal(modalId) {
// 	console.log("closing modal");
// 	const modal = document.getElementById(modalId);
// 	if (modal) {
// 	  modal.remove(); // Remove the modal from the DOM
// 	  document.body.classList.remove("modal-open"); // Remove the modal-open class from body
// 	} else {
// 	  console.warn(`Modal with id "${modalId}" not found.`);
// 	}
//   }
  
//   // Create a modal for creating a tournament
// function createTournamentModal() {
// 	const existingModal = document.getElementById("tournamentModal");
// 	if (existingModal) {
// 	  existingModal.remove();
// 	}
  
	
// 	const modal = getPlayerNumberModal();
// 	document.body.appendChild(modal);
  
// 	// Event Listeners
// 	document.getElementById("submitPlayerNumBtn").addEventListener("click", () => {
// 	  const playersNumber = document.getElementById("playersNumber").value;
// 	  console.log("Creating tournament with ", playersNumber, " players");
// 	  // createTournament(playersNumber);
// 	  closeModal("tournamentModal");
// 	});
  
// 	// close the modal when the close button is clicked
// 	document.querySelector("#tournamentModal .btn-close").addEventListener("click", () => {
// 	  closeModal("tournamentModal");
// 	});
  
// 	// close the modal when the modal is clicked outside
// 	modal.addEventListener("click", (event) => {
// 	  if (event.target === modal) {
// 		closeModal("tournamentModal");
// 	  }
// 	});
//   }


function addAndSetNewPlayers() {
    const container = document.createElement('div');
    container.className = 'row justify-content-center mb-4';
    
    container.innerHTML = `
    <div class="col-lg-8">
      <div class="content p-4">
        <div class="row g-3">
          <!-- Search Bar -->
          <div style="
            display: flex;
            align-items: center;
            margin: auto;
            margin-top: 36px;
            margin-bottom: 36px;
          ">
            <div class="input-group">
              <input
                type="text"
                id="searchInput"
                class="form-control"
                placeholder="Add new player..."
              />
              <button id="searchIcon" class="btn btn-primary">
                <i class="fa-solid fa-search"></i>
              </button>
            </div>
          </div>
        </div>
        <div
          id="createTournamentBtn"
          class="col-md-6 button-holder d-flex"
          style="margin-bottom: 36px; gap: 12px; flex-direction: column"
        >
          <button
            class="menu-item d-flex justify-content-center align-items-center p-3"
          >
            <i class="fas fa-user fa-1x me-2"></i>
            <h6 class="mb-0">Tofara Mususa</h6>
          </button>
        </div>
        <button
          id="startButton"
          class="btn btn-success btn-md"
          style="display: flex; align-items: center"
        >
          Start Tournament
        </button>
      </div>
    </div>
    `;
    return container;
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

function tournamentMap() {
    const tournamentWrapper = document.createElement('div');
    tournamentWrapper.className = 'tournamentWrapper container';
    
    tournamentWrapper.innerHTML = `
    <div class="container my-5">
        <h1 class="text-center mb-5">Tournament Map</h1>

        <div class="row d-flex align-items-center">
            <!-- First Round -->
            <div class="col-4 d-flex flex-column align-items-end">
                <div class="round first-round mb-5">
                    <h2 class="text-center">First Round</h2>
                    <div class="vertical-line">
                        <!-- Game 1 -->
                        <div class="game mb-5" id="game1">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Game 1</h5>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="team">
                                            <i class="fas fa-user-circle me-2"></i>
                                            <span class="me-2">Miguel</span>
                                        </div>
                                        <div class="score">
                                            <span class="score-value">5</span> : <span class="score-value ms-2">1</span>
                                        </div>
                                        <div class="team">
                                            <span class="ms-2">Tom</span>
                                            <i class="fas fa-user-circle ms-2"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Game 2 -->
                        <div class="game mb-5" id="game2">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Game 2</h5>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="team">
                                            <i class="fas fa-user-circle me-2"></i>
                                            <span class="me-2">Haben</span>
                                        </div>
                                        <div class="score">
                                            <span class="score-value">5</span> : <span class="score-value ms-2">3</span>
                                        </div>
                                        <div class="team">
                                            <span class="ms-2">Nick</span>
                                            <i class="fas fa-user-circle ms-2"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Game 3 -->
                        <div class="game mb-5" id="game3">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Game 3</h5>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="team">
                                            <i class="fas fa-user-circle me-2"></i>
                                            <span class="me-2">Santos</span>
                                        </div>
                                        <div class="score">
                                            <span class="score-value">2</span> : <span class="score-value ms-2">5</span>
                                        </div>
                                        <div class="team">
                                            <span class="ms-2">Martin</span>
                                            <i class="fas fa-user-circle ms-2"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Game 4 -->
                        <div class="game mb-5" id="game4">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Game 4</h5>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="team">
                                            <i class="fas fa-user-circle me-2"></i>
                                            <span class="me-2">Alex</span>
                                        </div>
                                        <div class="score">
                                            <span class="score-value">4</span> : <span class="score-value ms-2">5</span>
                                        </div>
                                        <div class="team">
                                            <span class="ms-2">Tofara</span>
                                            <i class="fas fa-user-circle ms-2"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Second Round -->
            <div class="col-4 d-flex flex-column align-items-center">
                <div class="round second-round mb-5">
                    <h2 class="text-center">Second Round</h2>
                    <div class="vertical-line">
                        <!-- Game 5 -->
                        <div class="game mb-5" id="game5">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Game 5</h5>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="team">
                                            <i class="fas fa-user-circle ms-2"></i>
                                            <span class="ms-2 me-2">Miguel</span>
                                        </div>
                                        <div class="score">
                                            <span class="score-value">5</span> : <span class="score-value ms-2">4</span>
                                        </div>
                                        <div class="team">
                                            <span class="ms-2">Haben</span>
                                            <i class="fas fa-user-circle ms-2"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Game 6 -->
                        <div class="game mb-5" id="game6">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Game 6</h5>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="team">
                                            <i class="fas fa-user-circle ms-2"></i>
                                            <span class="ms-2 me-2">Martin</span>
                                        </div>
                                        <div class="score">
                                            <span class="score-value">5</span> : <span class="score-value ms-2">4</span>
                                        </div>
                                        <div class="team">
                                            <span class="ms-2">Tofara</span>
                                            <i class="fas fa-user-circle ms-2"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Final Round -->
            <div class="col-4 d-flex flex-column align-items-start">
                <div class="round final-round">
                    <h2 class="text-center">Final Round</h2>
                    <div class="vertical-line">
                        <!-- Game 7 -->
                        <div class="game mb-5" id="game7">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Game 7</h5>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="team">
                                            <i class="fas fa-user-circle ms-2"></i>
                                            <span class="ms-2 me-2">Miguel</span>
                                        </div>
                                        <div class="score">
                                            <span class="score-value">5</span> : <span class="score-value ms-2">0</span>
                                        </div>
                                        <div class="team">
                                            <span class="ms-2">Martin</span>
                                            <i class="fas fa-user-circle ms-2"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    return tournamentWrapper;
}