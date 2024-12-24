// ----------------- Modals from the profile page ----------------- //

// update profile picture modal
function updateProfilePictureModal() {
  const modal = document.createElement("div");
  modal.id = "profile-pic-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="content modal-content p-4">
        <div class="modal-header border-0">
          <h5 class="modal-title">Update Profile Picture</h5>
          <button type="button" class="btn-close btn-close-white" id="close-modal"></button>
        </div>
        <div class="modal-body py-4">
          <div class="file-upload-wrapper">
            <input type="file" id="profile-pic" accept="image/*" class="form-control bg-transparent text-white">
            <small class="text-muted mt-2 d-block">Supported formats: JPEG ,JPG, PNG, GIF (Max size: 10MB)</small>
            <div id="error-msg" class="alert alert-danger mt-2" style="display:none;"></div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button id="update-profile-pic-btn" class="btn btn-primary">
            <i class="fas fa-upload me-2"></i>Upload
          </button>
          <button id="close-modal-btn" class="btn btn-outline-light">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;
  return modal;
}

// update userprofile modal
function updateProfileModal() {
  // Get the text content from spans inside the profile details
  const full_name = document
    .querySelector(".profile-info h3")
    .textContent.trim();
  const username = document
    .querySelector(".profile-info p:first-of-type")
    .textContent.replace("@", "")
    .trim();
  const email = document
    .querySelector(".profile-info p:last-of-type")
    .textContent.trim();

  const modal = document.createElement("div");
  modal.id = "username-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="content modal-content p-4">
        <div class="modal-header border-0">
          <h5 class="modal-title">Update Profile Information</h5>
          <button type="button" class="btn-close btn-close-white" id="close-username-modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="new-fullname" class="form-label">Full Name</label>
            <input type="text" id="new-fullname" class="form-control bg-transparent text-white" value="${full_name}">
          </div>
          <div class="mb-3">
            <label for="new-username" class="form-label">Username</label>
            <input type="text" id="new-username" class="form-control bg-transparent text-white" value="${username}">
          </div>
          <div class="mb-3">
            <label for="new-email" class="form-label">Email</label>
            <input type="email" id="new-email" class="form-control bg-transparent text-white" value="${email}">
          </div>
          <div id="error-msg" class="alert alert-danger" style="display:none;"></div>
        </div>
        <div class="modal-footer border-0">
          <button id="update-username-btn" class="btn btn-primary">
            <i class="fas fa-save me-2"></i>Save Changes
          </button>
          <button id="close-username-modal-btn" class="btn btn-outline-light">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;
  return modal;
}

// ----------------- Modals from the settings page ----------------- //
// Change password modal
function changePasswordModal() {
  const modal = document.createElement("div");
  modal.id = "password-change-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
	  <div class="modal-dialog modal-dialog-centered modal-sm">
		<div class="content modal-content">
		  <div class="modal-header border-0 py-3">
			<h5 class="modal-title fs-6">
			  <i class="fas fa-key me-2"></i>Change Password
			</h5>
			<button type="button" class="btn-close btn-close-white" id="close-password-modal"></button>
		  </div>
		  
		  <div class="modal-body px-3 py-2">
			<div id="error-msg" class="alert alert-danger small py-2" style="display:none;"></div>
			
			<div class="mb-2">
			  <label for="curr-password" class="form-label small">Current Password</label>
			  <div class="input-group input-group-sm">
				<input type="password" class="form-control form-control-sm bg-transparent text-white" 
				  id="curr-password" placeholder="Enter current password">
				<button class="btn btn-outline-light btn-sm toggle-password" type="button" data-target="curr-password">
				  <i class="fas fa-eye"></i>
				</button>
			  </div>
			</div>
  
			<div class="mb-2">
			  <label for="new-password" class="form-label small">New Password</label>
			  <div class="input-group input-group-sm">
				<input type="password" class="form-control form-control-sm bg-transparent text-white" 
				  id="new-password" placeholder="Enter new password">
				<button class="btn btn-outline-light btn-sm toggle-password" type="button" data-target="new-password">
				  <i class="fas fa-eye"></i>
				</button>
			  </div>
			</div>
  
			<div class="mb-2">
			  <label for="confirm-password" class="form-label small">Confirm Password</label>
			  <div class="input-group input-group-sm">
				<input type="password" class="form-control form-control-sm bg-transparent text-white" 
				  id="confirm-password" placeholder="Confirm new password">
				<button class="btn btn-outline-light btn-sm toggle-password" type="button" data-target="confirm-password">
				  <i class="fas fa-eye"></i>
				</button>
			  </div>
			</div>
		  </div>
  
		  <div class="modal-footer border-0 py-3">
			<button type="button" id="update-pass-btn" class="btn btn-primary btn-sm">
			  <i class="fas fa-save me-2"></i>Update
			</button>
			<button type="button" id="close-password-modal-btn" class="btn btn-outline-light btn-sm">
			  Cancel
			</button>
		  </div>
		</div>
	  </div>
	`;
  return modal;
}

// Enable/disable 2FA modal
function twoFactorModal(button) {
  const is2FAEnabled = button.id === "disable-2fa";
  const modalTitle = is2FAEnabled ? "Disable 2FA" : "Enable 2FA";
  const modalIcon = "fa-shield-alt";
  const actionBtnClass = is2FAEnabled ? "btn-warning" : "btn-success";
  const actionText = is2FAEnabled ? "Disable" : "Enable";
  const modalMessage = is2FAEnabled
    ? "Are you sure you want to disable Two-Factor Authentication? This will make your account less secure."
    : "Enable Two-Factor Authentication to add an extra layer of security to your account. You'll need to enter a verification code each time you sign in.";

  const modal = document.createElement("div");
  modal.id = "2fa-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="content modal-content">
                <div class="modal-header border-0 py-3">
                    <h5 class="modal-title">
                        <i class="fas ${modalIcon} me-2"></i>${modalTitle}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
                </div>
                <div class="modal-body px-3 py-2">
                    <div id="2fa-error-msg" class="alert alert-danger small py-2" style="display:none;"></div>
                    <p class="text-white mb-0">${modalMessage}</p>
                </div>
                <div class="modal-footer border-0 py-3">
                    <button type="button" class="btn ${actionBtnClass} btn-sm" id="confirm-2fa">
                        <i class="fas ${modalIcon} me-2"></i>${actionText} 2FA
                    </button>
                    <button type="button" class="btn btn-outline-light btn-sm" data-dismiss="modal">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
  return modal;
}

/* anon modal */
function anonymizeModal() {
  const anon_confirmation_modal = document.createElement("div");
  anon_confirmation_modal.id = "anon-account-modal";
  anon_confirmation_modal.className = "modal fade show";
  anon_confirmation_modal.style.display = "block";
  anon_confirmation_modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  anon_confirmation_modal.innerHTML = `
	  <div class="modal-dialog modal-dialog-centered modal-sm">
		<div class="content modal-content">
		  <div class="modal-header border-0 py-3">
			<h5 class="modal-title text-danger">
			  <i class="fas fa-exclamation-triangle me-2"></i>Anonymize Account
			</h5>
			<button type="button" class="btn-close btn-close-white" id="close-anon-modal"></button>
		  </div>
		  <div class="modal-body
		  px-3 py-2">
			<p class="text-white mb-0">This action will log you out and switch to a temporary account. Are you sure you want to proceed? </p>
		  </div>
		  <div class="modal-footer border-0 py-3">
			<button id="anon-acc-confirm" class="btn btn-danger btn-sm">
			  <i class="fas fa-user-secret me-2"></i>Anonymize
			</button>
			<button id="anon-acc-cancel" class="btn btn-outline-light btn-sm">
			  Cancel
			</button>
		  </div>
		</div>
	  </div>
	`;
  return anon_confirmation_modal;
}

// Sign Out Modal
function showSignOutModal(event) {
  event = event || window.event;
  event.preventDefault();
  const existingModal = document.getElementById("sign-out-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "sign-out-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="content modal-content">
        <div class="modal-header border-0 py-3">
          <h5 class="modal-title text-info">
            <i class="fas fa-sign-out-alt me-2"></i>Sign Out
          </h5>
          <button type="button" class="btn-close btn-close-white" id="close-signout-modal"></button>
        </div>
        <div class="modal-body px-3 py-2">
          <p class="text-white mb-0">Are you sure you want to sign out?</p>
        </div>
        <div class="modal-footer border-0 py-3">
          <button id="signout-confirm" class="btn btn-info btn-sm">
            <i class="fas fa-sign-out-alt me-2"></i>Sign Out
          </button>
          <button id="signout-cancel" class="btn btn-outline-light btn-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  // Event Listeners
  modal
    .querySelector("#close-signout-modal")
    .addEventListener("click", closeSignOutModal);
  modal
    .querySelector("#signout-cancel")
    .addEventListener("click", closeSignOutModal);
  modal
    .querySelector("#signout-confirm")
    .addEventListener("click", handleSignOut);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeSignOutModal();
  });
}

// Delete account modal
function deleteAccountModal() {
  const modal = document.createElement("div");
  modal.id = "delete-account-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
	  <div class="modal-dialog modal-dialog-centered modal-sm">
		<div class="content modal-content">
		  <div class="modal-header border-0 py-3">
			<h5 class="modal-title text-danger">
			  <i class="fas fa-exclamation-triangle me-2"></i>Delete Account
			</h5>
			<button type="button" class="btn-close btn-close-white" id="close-delete-modal"></button>
		  </div>
		  <div class="modal-body px-3 py-2">
			<p class="text-white mb-0">Are you sure you want to delete your account? This action cannot be undone.</p>
		  </div>
		  <div class="modal-footer border-0 py-3">
			<button id="delete-acc-confirm" class="btn btn-danger btn-sm">
			  <i class="fas fa-trash-alt me-2"></i>Delete
			</button>
			<button id="delete-acc-cancel" class="btn btn-outline-light btn-sm">
			  Cancel
			</button>
		  </div>
		</div>
	  </div>
	`;
  return modal;
}

// ----------------- Modals from password reset page ----------------- //

// Reset password confirmation modal
function resetPasswordConfirmModal() {
  // Show the reset password confirmation modal
  const otpModal = document.createElement("div");
  otpModal.className = "modal fade show";
  otpModal.id = "reset-password-confirm-modal";
  otpModal.style.display = "block";
  otpModal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  otpModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="content modal-content">
          <div class="modal-header border-0 py-3">
            <h5 class="modal-title">
              <i class="fas fa-key me-2"></i>Reset link sent
            </h5>
            <button type="button" class="btn-close btn-close-white" id="close-otp-modal" data-dismiss="modal"></button>
          </div>
          <div class="modal-body px-3 py-2">
            <p class="text-white mb-3 small">
             Reset link has been sent to your email. Rest your password by clicking the link sent to your email.
            </p>
          </div>
          <div class="modal-footer border-0 py-3">
            <button type="button" class="btn btn-primary btn-sm" id="returnToSignIn">
              <i class="fas fa-check me-2"></i>Return to Sign In
            </button>
          </div>
        </div>
      </div>
    `;
  return otpModal;
}

// ----------------- Modals for Game related ----------------- //

// Get Number of player for tournament
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

// Modal for AI or localgame selection
function optionLocalGameModal() {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "localGameModal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.innerHTML = `
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content">
      <div class="modal-header border-0 py-3">
        <h5 class="modal-title">
          <i class="fas fa-gamepad me-2"></i> Local Game
        </h5>
        <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
      </div>
      <div class="modal-body px-3 py-2">
        <div id="local-game-error-msg" class="alert alert-danger small py-2" style="display:none;"></div>
        <p class="text-white mb-0">Choose who you'd like to play:</p>
      </div>
      <div class="modal-footer border-0 py-3 d-flex justify-content-start">
        <a class="btn btn-primary btn-sm me-2" id="aiGameBtn" onclick="appRouter()" href="/game?isAI=true">
          <i class="fas fa-robot me-2"></i> Play with AI
        </a>
        <a class="btn btn-outline-light btn-sm me-2" id="playFriends" onclick="appRouter()" href="/game?isAI=false">
          <i class="fas fa-user-friends me-2"></i> Play with a friend
        </a>
      </div>
    </div>
  </div>
  `;
  // return modal;

  document.body.appendChild(modal);

  // Event Listeners
  document.getElementById("aiGameBtn").addEventListener("click", () => {
    //  Send to AI game page (1 vs AI)
    console.log("Creating AI game");
    closeModal("localGameModal");
    // For now, page is refreshing. Need to fix.
    // window.location.href = "/game/?isAI=true";

  });
  document.getElementById("playFriends").addEventListener("click", () => {
    // Send to localgame game page (1 vs 1)
    console.log("Creating local game");
    closeModal("localGameModal");
  });

  // close the modal when the close button is clicked
  document.querySelector("#localGameModal .btn-close").addEventListener("click", () => {
    closeModal("localGameModal");
  });

  // close the modal when the modal is clicked outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal("localGameModal");
    }
  });
}

// functin to ask for second player name before starting the game
function secondPlayerNameModal() {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "secondPlayerNameModal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 py-3">
          <h5 class="modal-title">
            <i class="fas fa-user-friends me-2"></i> Local Game
          </h5>
          <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
        </div>
        <div class="modal-body px-3 py-2">
          <div id="local-game-error-msg" class="alert alert-danger small py-2" style="display:none;"></div>
          <p class="text-white mb-0">Enter the name of the second player:</p>
          <input type="text" id="secondPlayerName" class="form-control my-2" style="color=white;" placeholder="Enter username" value="player_2" />
        </div>
        <div class="modal-footer border-0 py-3 d-flex justify-content-start">
          <button type="button" class="btn btn-primary btn-sm" id="submitSecondPlayerNameBtn">
            <i class="fas fa-paper-plane me-2"></i> Submit Name
          </button>
        </div>
      </div>
    </div>
  `;

  return modal;
}

// game settings modal for game settings
function gameSettingsModal() {
  console.log("##################1");
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "gameSettingsModal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 py-3">
          <h5 class="modal-title">
            <i class="fas fa-cog me-2"></i> Game Settings
          </h5>
          <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
        </div>
        <div class="modal-body px-3 py-2">
          <form>
            <div class="mb-3">
                <label for="paddleSpeed" class="form-label text-light">Paddle Speed:</label>
                <input type="number" class="form-control" id="paddleSpeed" min="1" value="6">
            </div>
            <div class="mb-3">
                <label for="ballSpeed" class="form-label text-light">Ball Speed:</label>
                <input type="number" class="form-control" id="ballSpeed" min="1" value="4.5">
            </div>
            <div class="mb-3">
                <label for="maxScore" class="form-label text-light">Score to Win:</label>
                <input type="number" class="form-control" id="maxScore" min="1" value="3">
            </div>
            <div class="form-check mb-3">
                <input type="checkbox" class="form-check-input" id="slowServe">
                <label class="form-check-label text-light" for="slowServe">Slow Serves</label>
            </div>
            <div class="form-check mb-3">
                <input type="checkbox" class="form-check-input" id="parryMode">
                <label class="form-check-label text-light" for="parryMode">Parry Mode</label>
            </div>
            <div id="errorMessages" class="text-danger mb-3"></div>
            <button id="applyButton" type="button" class="btn btn-primary w-100">Apply Settings</button>
          </form>
        </div>
      </div>
    </div>
  `;

  // show the modal
  document.body.appendChild(modal);
  document.body.classList.add("modal-open");
  
  // Event Listeners
  modal
    .querySelector("#applyButton")
    .addEventListener("click", changeSetting);

  modal.addEventListener("keydown", (e) => {
      if (e.key === "Enter") changeSetting();
    });
  
  modal // close the modal
    .querySelector(".btn-close")
    .addEventListener("click", () => closeModal("gameSettingsModal"));
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal("gameSettingsModal");
  });
}

// ----------------- Modals for general purpose ----------------- //

// A generic modal for closing modals passed as an arguments
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

// ShowSuccessMessage Function
async function showSuccessMessage(message, timeout = 3000, successHeader=`Success`) {
  // create and show success modal
  const existingModal = document.getElementById("success-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "success-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="content modal-content">
        <div class="modal-header border-0 py-3">
          <h5 class="modal-title text-success">
            <i class="fas fa-check-circle me-2"></i>${successHeader}
          </h5>
          <button type="button" class="btn-close btn-close-white" id="close-success-modal"></button>
        </div>
        <div class="modal-body
        px-3 py-2">
          <p class="text-white mb-0">${message}</p>
        </div>
        <div class="modal-footer border-0 py-3">
          <button id="success-modal-close" class="btn btn-success btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  // Event Listeners
  modal
    .querySelector("#close-success-modal")
    .addEventListener("click", () => closeModal("success-modal"));
  modal
    .querySelector("#success-modal-close")
    .addEventListener("click", () => closeModal("success-modal"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal("success-modal");
  });

  // Close modal after 3 seconds
  setTimeout(() => {
    closeModal("success-modal");
  }, timeout);
  await new Promise((resolve) => setTimeout(resolve, timeout + 100));
}

// Create a modal for displaying error messages
function showErrorMessage(message, timeout = 3000, errorHeader=`Error`) {
  // create and show error modal
  const existingModal = document.getElementById("error-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "error-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="content modal-content">
        <div class="modal-header border-0 py-3">
          <h5 class="modal-title text-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>${errorHeader}
          </h5>
          <button type="button" class="btn-close btn-close-white" id="close-error-modal"></button>
        </div>
        <div class="modal-body
        px-3 py-2">
          <p class="text-white mb-0">${message}</p>
        </div>
        <div class="modal-footer border-0 py-3">
          <button id="error-modal-close" class="btn btn-danger btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  // Event Listeners
  modal
    .querySelector("#close-error-modal")
    .addEventListener("click", () => closeModal("error-modal"));
  modal
    .querySelector("#error-modal-close")
    .addEventListener("click", () => closeModal("error-modal"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal("error-modal");
  }
  );
  // Close modal after 3 seconds
  setTimeout(() => {
    closeModal("error-modal");
  }, timeout);
}

// call the function to show the error message: TEST
// showErrorMessage("This is an error message");