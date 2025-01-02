//Returns a tournament map html
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
														<span class=" ">TBD</span>
													</div>
													<div class="score">
														<span class="score-value"></span>vs.<span class="score-value "></span>
													</div>
													<div class="team">
														<span class="">TBD</span>
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
														<span class=" ">TBD</span>
													</div>
													<div class="score">
														<span class="score-value"></span>vs.<span class="score-value"></span>
													</div>
													<div class="team">
														<span>TBD</span>
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
												<h5 id="game7" class="card-title game-7">Final</h5>
												<div class="d-flex justify-content-between align-items-center">
													<div class="team">
														<i class="profileIcon fas fa-user-circle "></i>
														<span class=" ">TBD</span>
													</div>
													<div class="score">
														<span class="score-value"></span>vs.<span class="score-value "></span>
													</div>
													<div class="team">
														<span class="">TBD</span>
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
					<div class="d-flex justify-content-center">
					<button
					  id="startButton"
					  class="btn btn-success continueButton btn-md"
					  style="display: flex; align-items: center"
					>
					  Continue
					</button>
				  </div>
		`;

  return tournamentWrapper;
}

//this returns canvas for the ping-pong game
function createGameCanvas() {
  const gameBoard = document.createElement("div");
  gameBoard.id = "tournamentGameBoard";
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

//Displays modal displaying who is going to play next in upcoming match
function nextMatchModal(player1, player2) {
  console.log(player1, player2);
  const existingModal = document.getElementById("nextMatch");
  if (existingModal) existingModal.remove();
  const modalHTML = `
	  <div class="modal fade" id="nextMatch" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered modal-md" role="document">
		  <div class="card modal-card shadow-lg  position-relative">
			<button type="button" class="btn-close btn-close-white close-btn position-absolute top-0 end-0 m-2" onclick="closeModal('nextMatch')" aria-label="Close"></button>
			<div class="card-body text-center"> 
			  <h3 class="modal-title " id="modalTitle2"> Next Match </h3>
			  <p class="modal-text winner-text mt-3"> ${player1} vs ${player2} </p>
			  <button class="btn btn-secondary btn-sm modal-continue mt-4" onclick="closeModal('nextMatch')">CONTINUE</button>
			</div>
		  </div>
		</div>
	  </div>
	  `;
  // Append the modal to the body
//   const body = document.querySelector("body");
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer);
  const modal = new bootstrap.Modal(document.getElementById("nextMatch"));
  modal.show();
}

//displays after every game to show who won and who moves on the next round
function gameWinnerModal(playerName) {
  // Create the modal structure
  console.log(playerName);
  const existingModal = document.getElementById("gameClosing");
  if (existingModal) existingModal.remove();
  const modalHTML = `
	  <div class="modal fade" id="gameClosing" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
		  <div class="modal-dialog modal-dialog-centered modal-md" role="document">
			  <div class="card modal-card shadow-lg position-relative">
				  <div class="card-body text-center"> 
					  <h3 class="modal-title" id="modalTitle2"> ${playerName} wins the game! </h3>
					  <p class="modal-text winner-text mt-3"> ${playerName} passes to the next round </p>
				  </div>
			  </div>
		  </div>
	  </div>
	  `;

  // Append the modal to the body
  const body = document.querySelector("body");
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  if (body) body.appendChild(modalContainer);
  const modal = new bootstrap.Modal(document.getElementById("gameClosing"));
  modal.show();

}

//This is for the final end of the tournament to display the winner and second place
function tournamentClosingModal(winner, secondplace) {
  const existingModal = document.getElementById("congratsModal");
  if (existingModal) existingModal.remove();
  const modalHTML = `
	  <div class="modal fade" id="congratsModal" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
		  <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
			  <div class="card modal-card position-relative">
				  <button type="button" 
						  class="btn-close btn-close-white position-absolute top-0 end-0 m-2" 
						  onclick="closeModal('congratsModal')" 
						  aria-label="Close"></button>
				  <div class="card-body text-center"> 
					  <h2 class="modal-title" id="modalTitle">🎉 Congratulations ${winner}! 🎉</h2>
					  <img src="https://img.icons8.com/bubbles/200/000000/trophy.png" alt="Trophy" class="modal-trophy">
					  <p class="modal-text">The winner of the tournament is <strong>${winner}</strong>. 🏆🏆🏆</p>
					  <p class="modal-text">2nd place goes to <strong>${secondplace}</strong>. 🥈🥈🥈</p>
					  <p class="modal-text">Thank you for participating in the tournament. 🎉🎉🎉</p> 
					  <button class="btn btn-secondary btn-sm modal-continue" onclick="closeModal('congratsModal')">CONTINUE</button>
				  </div>
			  </div>
		  </div>
	  </div>`;

  // Append the modal to the body
  const body = document.querySelector("body");
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  if (body) body.appendChild(modalContainer);

  // Show the modal (requires Bootstrap JS to work)
  const modal = new bootstrap.Modal(document.getElementById("congratsModal"));
  modal.show();
}

function updateTournamentMapAfterFinal(tournamentContainer, tournamentElement) {
  const continueButton = tournamentElement.querySelector(".continueButton");
  continueButton.textContent = "Go to Home Page";
  continueButton.addEventListener("click", () => updateUI("/home"));
  // Clone the continue button
  const restartButton = continueButton.cloneNode(true);
  restartButton.textContent = "Restart Tournament";
  restartButton.classList.remove("continueButton");
  restartButton.classList.add("restartButton");
  restartButton.style.marginLeft = "10px"; // Add space between buttons
  restartButton.style.backgroundColor = "#007bff"; // Add blue color
  restartButton.addEventListener("click", () => updateUI("/tournament"));
  // Insert restart button after continue button
  continueButton.insertAdjacentElement("afterend", restartButton);
  // Insert restart button after continue button
  continueButton.insertAdjacentElement("afterend", restartButton);
  if (tournamentContainer) tournamentContainer.appendChild(tournamentElement);
}

// function tournamentGameScreenSize() {
// 	const MIN_WINDOW_WIDTH = 820;
// 	const MIN_WINDOW_HEIGHT = 700;
  
// 	const warningMessage = document.getElementById("warningMessageIntournament");
// 	const gameContent = document.getElementById("tournamentGameBoard");

// 	<div id="warningMessageIntournament" class="d-none text-center text-light bg-danger p-2">
// 	<h3>Screen too small to play</h3>
// 	<p>
// 		Please switch to a laptop or desktop with a larger screen for the best
// 		experience.
// 	</p>
// 	</div>
  
// 	if (
// 	  window.innerWidth < MIN_WINDOW_WIDTH ||
// 	  window.innerHeight < MIN_WINDOW_HEIGHT
// 	) {
// 	  warningMessage.classList.remove("d-none");
// 	  if (gameContent) gameContent.classList.add("d-none");
// 	} else {
// 	  if (warningMessage) {
// 		warningMessage.classList.add("d-none");
// 	  }
// 	  if (gameContent) {
// 		gameContent.classList.remove("d-none");
// 	  }
// 	}
//   }

function tournamentGameScreenSize() {
    const MIN_WINDOW_WIDTH = 820;
    const MIN_WINDOW_HEIGHT = 700;

    const backgroundDiv = document.querySelector("div[name='background']");

    if (
        window.innerWidth < MIN_WINDOW_WIDTH ||
        window.innerHeight < MIN_WINDOW_HEIGHT
    ) {
        // Hide the background div's content
        if (backgroundDiv) backgroundDiv.style.visibility = 'hidden';

        // Create and insert the warning message div as an overlay
        const warningMessageDiv = document.createElement('div');
        warningMessageDiv.id = 'warningOverlay';
        warningMessageDiv.innerHTML = `
            <h3>Screen too small to play</h3>
            <p>Please switch to a laptop or desktop with a larger screen for the best experience.</p>
        `;
        document.body.appendChild(warningMessageDiv);
    } else {
        // Show the background div's content and remove the warning overlay
        if (backgroundDiv) backgroundDiv.style.visibility = 'visible';
        const warningOverlay = document.getElementById('warningOverlay');
        if (warningOverlay) warningOverlay.remove();
    }
}