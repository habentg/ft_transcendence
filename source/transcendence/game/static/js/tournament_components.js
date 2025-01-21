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
						<div class="col-4 d-flex flex-start ">
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
						<div class="col-4 d-flex flex-start">
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
						<button id="gameRulesButton" type="button" class="btn btn-info me-4" onclick="showGameRules()" >
							<i class="fas fa-book me-2"></i>
							How to play
						</button>
						<button id="startButton" class="btn btn-primary continueButton btn-md  ms-2 me-4" style="display: flex; align-items: center">
							<i class="fa-solid fa-play me-2"></i>
							Continue
						</button>
				  	</div>
		`;

	return tournamentWrapper;
}

function createGameCanvas() {
	const gameBoard = document.createElement("div");
	gameBoard.id = "gameContent";
	gameBoard.className = " py-5 flex-direction: column";
	gameBoard.innerHTML = `
		<div class="justify-content-center mb-5">
		</div>
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

function nextMatchModal(player1, player2) {
	const modalHTML = `
		<div class="modal fade" id="nextMatch" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered modal-md" role="document">
				<div class="card modal-card shadow-lg position-relative nextgame">
					<div class="card-body text-center nextgame">
						<div class="modal-background mb-3">
							<i class="fas fa-trophy fa-3x text-warning"></i> 
						</div>
						<h6 class="modal-title mb-2" id="modalTitle2">Next Match</h6>
						<h2 class="modal-text winner-text mt-3"> ${player1} vs ${player2} </h2>
					</div>
				</div>
			</div>
		</div>
	`;

	// Append the modal to the body
	//   const body = document.querySelector("body");
	const modalContainer = document.createElement("div");
	modalContainer.innerHTML = modalHTML;
	modalContainer.id = "nextMatch_modal";
	document.body.appendChild(modalContainer);
	const modal = new bootstrap.Modal(document.getElementById("nextMatch"));
	modal.show();
}

function gameWinnerModal(playerName) {
	const existingModal = document.getElementById("gameClosing");
	if (existingModal) existingModal.remove();
	const modalHTML = `
	  <div class="modal fade" id="gameClosing" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
		  <div class="modal-dialog modal-dialog-centered modal-md" role="document">
			  <div class="card modal-card shadow-lg position-relative">
				  <div class="card-body text-center"> 
						<div class="modal-background mb-3">
							<i class="fas fa-trophy fa-3x text-warning"></i> 
			  			</div>
					  <h6 class="modal-title" id="modalTitle2"> ${playerName} wins the game! </h6>
					  <h2 class="modal-text winner-text mt-3"> ${playerName} passes to the next round </h2>
				  </div>
			  </div>
		  </div>
	  </div>
	  `;

	const body = document.querySelector("body");
	const modalContainer = document.createElement("div");
	modalContainer.id = "gameClosing_modal";
	modalContainer.innerHTML = modalHTML;
	if (body) body.appendChild(modalContainer);
	const modal = new bootstrap.Modal(document.getElementById("gameClosing"));
	modal.show();

}

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
					  <h2 class="modal-title1" id="modalTitle">🎉 Congratulations ${winner}! 🎉</h2>
					  <img src="https://img.icons8.com/bubbles/200/000000/trophy.png" alt="Trophy" class="modal-trophy">
					  <p class="modal-text">The winner of the tournament is <strong>${winner}</strong>. 🏆🏆🏆</p>
					  <p class="modal-text">2nd place goes to <strong>${secondplace}</strong>. 🥈🥈🥈</p>
					  <p class="modal-text">Thank you for participating in the tournament. 🎉🎉🎉</p> 
					  <button class="btn btn-secondary btn-sm modal-continue" onclick="closeModal('congratsModal')">CONTINUE</button>
				  </div>
			  </div>
		  </div>
	  </div>`;

	const body = document.querySelector("body");
	const modalContainer = document.createElement("div");
	modalContainer.innerHTML = modalHTML;
	if (body) body.appendChild(modalContainer);
	const modal = new bootstrap.Modal(document.getElementById("congratsModal"));
	modal.show();
}

function updateTournamentMapAfterFinal(tournamentContainer, tournamentElement) {
	const continueButton = tournamentElement.querySelector(".continueButton");
	continueButton.innerHTML = `<i class="fas fa-home me-2"></i>Return Home`;
	continueButton.addEventListener("click", () => updateUI("/home"));
	const restartButton = continueButton.cloneNode(true);
	restartButton.innerHTML = `<i class="fas fa-trophy me-1"></i>New Tournament`;
	restartButton.classList.remove("continueButton");
	restartButton.classList.remove("btn-primary");
	restartButton.classList.add("restartButton");
	restartButton.style.marginLeft = "10px";
	restartButton.style.backgroundColor = "#A1F037";
	restartButton.addEventListener("click", () => updateUI("/tournament"));
	continueButton.insertAdjacentElement("afterend", restartButton);
	continueButton.insertAdjacentElement("afterend", restartButton);
	if (tournamentContainer) tournamentContainer.appendChild(tournamentElement);
}


function addPlayerTitles(player1Name, player2Name) {
	const player1NameElement = document.getElementById("player1Name");
	if (player1NameElement) {
		player1NameElement.textContent = "@ " + player1Name;
		player1NameElement.style.display = "block";
	}
	const player2NameElement = document.getElementById("player2Name");
	if (player2NameElement) {
		player2NameElement.textContent = "@ " + player2Name;
		player2NameElement.style.display = "block";
	}
	const player1Element = document.getElementById("player1");
	if (player1Element) {
		player1Element.classList.remove("d-none");
	}
	const player2Element = document.getElementById("player2");
	if (player2Element) {
		player2Element.classList.remove("d-none");
	}
}


function addWarningMessage() {
	const warningMessage = document.createElement("div");
	warningMessage.id = "warningMessage";
	warningMessage.className = "d-none text-center text-light p-2";

	const heading = document.createElement("h3");
	heading.className = "mb-4 mt-2";
	heading.textContent = "Screen too small to play";

	const subheading = document.createElement("h5");
	subheading.textContent =
		"Please switch to a laptop or desktop with a larger screen for the best experience.";

	warningMessage.appendChild(heading);
	warningMessage.appendChild(subheading);

	return warningMessage;
}

