// delete account
async function deleteAccount() {
  try {
    console.log("Delete account");
    const m_csrf_token = await getCSRFToken();
    const response = await fetch("/profile/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": m_csrf_token,
      },
    });
    /* Reason for 200 status response:
		  when a browser receives a 302 redirect in response to a DELETE request,
		  it typically sends the subsequent request to the redirect location using 
		  the same HTTP method (will result an error - coz landing page endpoint expects get only)
		  */
    if (response.status === 200) {
      // const data = await response.json();
      console.log("Account deleted successfully");
      const navbar = document.getElementById("navbarNavDropdown");
      navbar.innerHTML = `
		<ul class="navbar-nav ms-auto">
		<li class="nav-item">
		<a onclick="appRouter()" class="nav-link mx-2" href="/home">Home</a>
		</li>
		<li class="nav-item">
		<a onclick="appRouter()" class="nav-link mx-2" href="/signin">Sign in</a>
		</li>
		<li class="nav-item">
		<a onclick="appRouter()" class="nav-link mx-2" href="/signup">Sign up</a>
		</li>
		</ul>
		`;
      await updateUI("/", false);
      closeDeleteAccountModal();
      return;
    }
    throw new Error("Failed to delete account");
  } catch (error) {
    console.error("Error:", error);
  }
}

// enabling 2fa
/* 
    1. button click:
        - modal opens (with a button to continue) to inform user about 2fa

        */
async function handleEnableDisable2FA() {
  try {
    const response = await fetch("/2fa/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": await getCSRFToken(),
      },
    });
    if (response.ok) {
      console.log("2FA status updated");
      if (this.textContent.trim() === "Enable 2FA") {
        this.className = "btn btn-danger";
        this.textContent = "Disable 2FA";
      }
      else {
        this.textContent = "Enable 2FA"
        this.className = "btn btn-success";
      }
    } else {
      throw new Error("Failed to update 2FA status");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// update user password
async function updatePlayerPassword() {
  try {
    const formData = {
      current_password: document.getElementById("curr-password").value,
      new_password: document.getElementById("new-password").value,
      confirm_password: document.getElementById("confirm-password").value,
    };
    console.log("Update password form data: ", formData);
    const response = await fetch("/update_password/", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "X-CSRFToken": await getCSRFToken(),
      },
      body: JSON.stringify(formData),
    });

    console.log("Password update response: ", response);
    if (!response.ok) {
      const responseData = await response.json();
      console.log("Json response: ", responseData);
      displayError(responseData);
      return;
    }
    console.log("Password updated");
    await updateUI("/profile", false);
    // history.pushState(null, '', `/profile`);
    // handleLocationChange();
    // close the modal
    closePasswordModal();
    // after modal is closed, display password update success message / modal
  } catch (error) {
    console.error("Error:", error);
  }
}

function createAndShowPasswordModal() {
  // Remove any existing modal
  const existingModal = document.getElementById("password-change-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create the modal
  const modal = document.createElement("div");
  modal.id = "password-change-modal";
  modal.className = "password-change-modal";

  // Create the modal content
  const modalContent = document.createElement("div");
  modalContent.className = "password-modal-content";

  modalContent.innerHTML = `
		  <h2 class="modal-title">Change Password</h2>
		  <div class="password-error-msg" id="error-msg" sytle="display:none;"></div>
		  <form id="update-pass-form">
			  <div class="password-form-group">
				  <label for="curr-password">Current Password</label>
				  <input type="password" id="curr-password" placeholder="Enter current password">
			  </div>
			  <div class="password-form-group">
				  <label for="new-password">New Password</label>
				  <input type="password" id="new-password" placeholder="Enter new password">
			  </div>
			  <div class="password-form-group">
				  <label for="confirm-password">Confirm New Password</label>
				  <input type="password" id="confirm-password" placeholder="Confirm new password">
			  </div>
			  <button type="button" id="update-pass-btn" class="modal-button modal-upload-btn">Update Password</button>
			  <button type="button" id="close-password-modal" class="modal-button modal-close-btn">Cancel</button>
		  </form>
	  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Show the modal
  modal.style.display = "block";

  // Add event listener to the update password button
  const updatePassBtn = document.getElementById("update-pass-btn");
  updatePassBtn.addEventListener("click", updatePlayerPassword);

  // Add event listener to close the modal
  const closeBtn = document.getElementById("close-password-modal");
  closeBtn.addEventListener("click", closePasswordModal);

  // Close the modal if user clicks outside of it
  window.addEventListener("click", handlePasswordOutsideClick);
}

function closePasswordModal() {
  const modal = document.getElementById("password-change-modal");
  if (modal) {
    modal.style.display = "none";
    modal.remove(); // Remove the modal from the DOM
  }
}

function handlePasswordOutsideClick(event) {
  const modal = document.getElementById("password-change-modal");
  if (event.target === modal) {
    closePasswordModal();
  }
}

// create modal are you sure you want to delete account
// if yes, delete account
// if no, close modal

function deleteAccountCheck() {
  // Remove any existing modal
  const existingModal = document.getElementById("password-change-modal");
  if (existingModal) {
    existingModal.remove();
  }
  const modal = document.createElement("div");
  modal.id = "delete-account-modal";
  modal.className = "delete-account-modal";

  // Create the modal content

  const modalContent = document.createElement("div");
  modalContent.className = "delete-account-modal-content";
  modalContent.innerHTML = `
    <h2 class="modal-title">Are you sure you want to delete your account?</h2>
    <div class="delete-account-btns">
      <button id="delete-acc-confirm" class="modal-button modal-close-btn">Yes</button>
      <button id="delete-acc-cancel" class="modal-button modal-upload-btn ">No</button>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  modal.style.display = "block";

  const deleteAccConfirm = document.getElementById("delete-acc-confirm");
  deleteAccConfirm.addEventListener("click", deleteAccount);

  const deleteAccCancel = document.getElementById("delete-acc-cancel");
  deleteAccCancel.addEventListener("click", closeDeleteAccountModal);

  window.addEventListener("click", CloseDeleteAccountModalOutsideClick);
}

function closeDeleteAccountModal() {
  const modal = document.getElementById("delete-account-modal");
  if (modal) {
    modal.style.display = "none";
    modal.remove();
  }
}

function CloseDeleteAccountModalOutsideClick(event) {
  const modal = document.getElementById("delete-account-modal");
  if (event.target === modal) {
    closeDeleteAccountModal();
  }
}

function initSettings() {
  const changePassIcon = document.getElementById("change-password-btn");
  const deleteAccountBtn = document.getElementById("delete-acc-btn");
  const enableDisable2FABtn = document.getElementById("enable-disable-2fa");
  if (changePassIcon) {
    changePassIcon.addEventListener("click", createAndShowPasswordModal);
  }
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", deleteAccountCheck);
  }

  if (enableDisable2FABtn) {
    enableDisable2FABtn.addEventListener("click", handleEnableDisable2FA);
  }
}

initSettings();
