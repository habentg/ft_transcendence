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

  // Select the div with the class 'col-4 d-flex justify-content-center last'
  const divToDelete = document.querySelector(
    ".col-4.d-flex.justify-content-center.last"
  );
  if (divToDelete) {
    divToDelete.remove();
  }

  // Select the first round div to update the class
  const divToUpdate = document.querySelector(
    ".col-4.d-flex.justify-content-center.align-items-end"
  );
  if (divToUpdate) {
    divToUpdate.classList.replace("col-4", "col-6");
  }

  // Select the second round div to update the class
  const divToUpdate2 = document.querySelector(
    ".col-4.d-flex.justify-content-center.align-items-start"
  );
  if (divToUpdate2) {
    divToUpdate2.classList.replace("col-4", "col-6");
  }

  // make the connection between game 1 and game 5 width to 80px
  var connection15 = document.getElementsByClassName("connection-1-5");
  for (var i = 0; i < connection15.length; i++) {
    connection15[i].style.width = "80px";
  }

  // make the connection between game 2 and game 5 width to 80px
  var connection25 = document.getElementsByClassName("connection-2-5");
  for (var i = 0; i < connection25.length; i++) {
    connection25[i].style.width = "80px";
  }

  // make final4 class name div's from justify-content-center to start
  var final4 = document.getElementsByClassName("final4");
  for (var i = 0; i < final4.length; i++) {
    final4[i].classList.replace(
      "justify-content-center",
      "justify-content-start"
    );
  }
}

// Function for Tournament of 4 players
prepTournament4();

// Congratualtory modal with the winner's name and celebration gif
function tournamentClosingModal() {
  // Create the modal structure
  const modalHTML = `
    <div class="modal fade" id="congratsModal" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="card modal-card position-relative">
                <button type="button" 
                        class="btn-close btn-close-white position-absolute top-0 end-0 m-2" 
                        onclick="closeModal('congratsModal')" 
                        aria-label="Close"></button>
                <div class="card-body text-center"> 
                    <h2 class="modal-title" id="modalTitle">🎉 Congratulations Miguel! 🎉</h2>
                    <img src="https://img.icons8.com/bubbles/200/000000/trophy.png" alt="Trophy" class="modal-trophy">
                    <p class="modal-text">The winner of the tournament is <strong>Miguel Santos</strong>. 🏆🏆🏆</p>
                    <p class="modal-text">2nd place goes to <strong>John Doe</strong>. 🥈🥈🥈</p>
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
			<div class="card modal-card shadow-lg position-relative">
				<button type="button" 
                        class="btn-close btn-close-white position-absolute top-0 end-0 m-2" 
                        onclick="closeModal('gameClosing')" 
                        aria-label="Close"></button>
				<div class="card-body text-center"> 
					<h3 class="modal-title" id="modalTitle2"> Miguel wins the game! </h3>
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

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("gameClosing"));
  modal.show();
}

// Call this function after every game is over
// gameClosingModal();

// Function to display the Player name for the next match
function nextMatchModal() {
  // Create the modal structure
  const modalHTML = `
  <div class="modal fade" id="nextMatch" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-md" role="document">
      <div class="card modal-card shadow-lg  position-relative">
        <button type="button" class="btn-close btn-close-white close-btn" onclick="closeModal('nextMatch')" aria-label="Close"></button>
        <div class="card-body text-center"> 
          <h3 class="modal-title " id="modalTitle2"> Next Match </h3>
          <p class="modal-text winner-text mt-3"> Miguel vs John Doe </p>
          <button class="btn btn-secondary btn-sm modal-continue mt-4" onclick="closeModal('nextMatch')">CONTINUE</button>
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

  const modal = new bootstrap.Modal(document.getElementById("nextMatch"));
  modal.show();
}

// Call this function before every match to display the player names
// nextMatchModal();
