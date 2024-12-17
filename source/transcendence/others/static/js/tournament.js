// Drop game 3, 4, 6, and 7 with class names game3, game4, game6, and game7
function prepTournament4() {
  var game3 = document.getElementsByClassName("game3");
  var game4 = document.getElementsByClassName("game4");
  var game6 = document.getElementsByClassName("game6");
  var game7 = document.getElementsByClassName("game7");

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
  var connection57 = document.getElementsByClassName("connection-5-7");
  for (var i = 0; i < connection57.length; i++) {
    connection57[i].style.display = "none";
  }

  // Adjust the position of the game 5
  var game5 = document.getElementsByClassName("game5");
  game5[0].style.top = "85%";
  game5[0].style.left = "45%";
  game5[0].style.transform = "translate(-50%, -50%)";
  // game5[0].style.width = "100%";
}

// Function for Tournament of 4 players
// prepTournament4();

// Congratualtory modal with the winner's name and celebration gif
function tournamentClosingModal() {
  // Create the modal structure
  const modalHTML = `
    <div class="modal fade" id="congratsModal" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="card modal-card">
				<button type="button" class="btn-close btn-close-white" id="close-username-modal"></button>
                <div class="card-body text-center"> 
					<h2 class="modal-title" id="modalTitle">🎉 CONGRATULATIONS Miguel! 🎉</h2>
                    <img src="https://img.icons8.com/bubbles/200/000000/trophy.png" alt="Trophy" class="modal-trophy">
                    <p class="modal-text">The winner of the tournament is <strong>Miguel Santos</strong>.🏆🏆🏆</p>
					<p class="modal-text">2nd place goes to <strong>John Doe</strong> </strong>. 🥈🥈🥈</p>
					<p class="modal-text">Thank you for participating in the tournament. 🎉🎉🎉</p> 
                    <button class="btn btn-secondary btn-sm modal-continue" onclick="closeModal("congratsModal")">CONTINUE</button>
                </div>
            </div>
        </div>
    </div>`;

  // Append the modal to the body
  const body = document.querySelector("body");
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  body.appendChild(modalContainer);

  // Show the modal (requires Bootstrap JS to work)
  const modal = new bootstrap.Modal(document.getElementById("congratsModal"));
  modal.show();
}

// Call this after the tournament is over
// tournamentClosingModal();

// Function to create a modal after every game to show the winner
function gameClosingModal() {
  // Create the modal structure
  const modalHTML = `
	<div class="modal fade" id="gameClosing" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered modal-md" role="document">
			<div class="card modal-card shadow-lg  position-relative">
				<button type="button" class="btn-close btn-close-white close-btn" onclick="closeModal('gameClosing')" aria-label="Close"></button>
				<div class="card-body text-center"> 
					<h3 class="modal-title " id="modalTitle"> Miguel wins the game! </h3>
					<p class="modal-text winner-text mt-3"> Miguel passes to the next round </p>
					<button class="btn btn-secondary btn-sm modal-continue mt-4" onclick="closeModal('gameClosing')">CONTINUE</button>
				</div>
			</div>
		</div>
	</div>
	`;

  // Append the modal to the body
  const body = document.querySelector("body");
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  body.appendChild(modalContainer);

  const modal = new bootstrap.Modal(document.getElementById("gameClosing"));
  modal.show();
}

// Call this function after every game is over
gameClosingModal();
