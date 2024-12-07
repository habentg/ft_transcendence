// Update Password Function
async function updatePlayerPassword() {
  try {
    const formData = {
      current_password: document.getElementById("curr-password").value,
      new_password: document.getElementById("new-password").value,
      confirm_password: document.getElementById("confirm-password").value,
    };

    // Basic validation
    if (
      !formData.current_password ||
      !formData.new_password ||
      !formData.confirm_password
    ) {
      displayError({ error_msg: "All fields are required" });
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      displayError({ error_msg: "New passwords do not match" });
      return;
    }

    const response = await fetch("/update_profile/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": await getCSRFToken(),
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const responseData = await response.json();
      displayError(responseData);
      return;
    }

    // Success - close modal and show success message
    closePasswordModal();
    // showSuccessMessage("Password updated successfully!");
    // alert("Password updated successfully!");
    // updateUI("/settings", false);
  } catch (error) {
    console.error("Error:", error);
    displayError({ error_msg: "An error occurred while updating password" });
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
      const button = document.getElementById('enable-2fa') ||
        document.getElementById('disable-2fa');

      if (button.id === 'enable-2fa') {
        button.id = 'disable-2fa';
        button.className = 'btn btn-warning w-100';
        button.textContent = 'Disable 2FA';
      } else {
        button.id = 'enable-2fa';
        button.className = 'btn btn-success w-100';
        button.textContent = 'Enable 2FA';
      }
      close2FAModal();
    } else {
      throw new Error("Failed to update 2FA status");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Password Change Modal
function createAndShowPasswordModal() {
  const existingModal = document.getElementById("password-change-modal");
  if (existingModal) existingModal.remove();

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

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  // Event Listeners
  modal
    .querySelector("#close-password-modal")
    .addEventListener("click", closePasswordModal);
  modal
    .querySelector("#close-password-modal-btn")
    .addEventListener("click", closePasswordModal);
  modal
    .querySelector("#update-pass-btn")
    .addEventListener("click", updatePlayerPassword);

  // Add toggle password visibility functionality
  modal.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const icon = this.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePasswordModal();
  });
}

// Helper Functions
function closePasswordModal() {
  const modal = document.getElementById("password-change-modal");
  if (modal) {
    modal.remove();
    document.body.classList.remove("modal-open");
  }
}

function displayError(errorData) {
  const errorMsg = document.getElementById("error-msg");
  if (errorMsg) {
    errorMsg.textContent = errorData.error_msg || "An error occurred";
    errorMsg.style.display = "block";

    setTimeout(() => {
      errorMsg.style.display = "none";
    }, 3000);
  }
}


// Initialize Settings
function initSettings() {
  const changePassBtn = document.getElementById("change-password-btn");
  const deleteAccountBtn = document.getElementById("delete-acc-btn");
  const enable2FABtn = document.getElementById("enable-2fa");
  const disable2FABtn = document.getElementById("disable-2fa");
  const anonymizeBtn = document.getElementById("player-anon");
  const signOutBtn = document.getElementById("sign-out-btn");

  if (changePassBtn) {
    changePassBtn.addEventListener("click", createAndShowPasswordModal);
  }
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", deleteAccountCheck);
  }
  if (enable2FABtn) {
    enable2FABtn.addEventListener("click", show2FAModal);
  }
  if (anonymizeBtn) {
    anonymizeBtn.addEventListener("click", async () => {
      // confirmation modal here - to make sure user know the implications of anonymizing their account
      await anonAccountModal();
    });
  }
  if (disable2FABtn) {
    disable2FABtn.addEventListener("click", show2FAModal);
  }
  if (signOutBtn) {
    signOutBtn.addEventListener("click", showSignOutModal);
  }
}

initSettings();

// Delete Account Modal
function deleteAccountCheck() {
  const existingModal = document.getElementById("delete-account-modal");
  if (existingModal) existingModal.remove();

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

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  // Event Listeners
  modal
    .querySelector("#close-delete-modal")
    .addEventListener("click", closeDeleteAccountModal);
  modal
    .querySelector("#delete-acc-cancel")
    .addEventListener("click", closeDeleteAccountModal);
  modal
    .querySelector("#delete-acc-confirm")
    .addEventListener("click", deleteAccount);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeDeleteAccountModal();
  });
}

// Delete Account Function
async function deleteAccount() {
  try {
    const response = await fetch("/update_profile/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": await getCSRFToken(),
      },
    });

    if (response.status === 200) {
      closeDeleteAccountModal();
      updateNavBar(false);
      updateUI("", false);
    } else {
      throw new Error("Failed to delete account");
    }
  } catch (error) {
    console.error("Error:", error);
    displayError({ error_msg: "Failed to delete account" });
  }
}

function closeDeleteAccountModal() {
  const modal = document.getElementById("delete-account-modal");
  if (modal) {
    modal.remove();
    document.body.classList.remove("modal-open");
  }
}

// Function to create and show the 2FA modal
function show2FAModal() {
  const existingModal = document.getElementById('2fa-modal');
  if (existingModal) existingModal.remove();

  const button = document.getElementById('enable-2fa') ||
    document.getElementById('disable-2fa');
  const is2FAEnabled = button.id === 'disable-2fa';

  const modalTitle = is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA';
  const modalIcon = 'fa-shield-alt';
  const actionBtnClass = is2FAEnabled ? 'btn-warning' : 'btn-success';
  const actionText = is2FAEnabled ? 'Disable' : 'Enable';
  const modalMessage = is2FAEnabled
    ? 'Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.'
    : 'Enable Two-Factor Authentication to add an extra layer of security to your account. You\'ll need to enter a verification code each time you sign in.';

  const modal = document.createElement('div');
  modal.id = '2fa-modal';
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

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

  document.body.appendChild(modal);
  document.body.classList.add('modal-open');

  // Event Listeners
  const closeButtons = modal.querySelectorAll('[data-dismiss="modal"]');
  closeButtons.forEach(button => {
    button.addEventListener('click', close2FAModal);
  });

  const confirmButton = modal.querySelector('#confirm-2fa');
  if (confirmButton) {
    confirmButton.addEventListener('click', handleEnableDisable2FA);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close2FAModal();
  });
}

function close2FAModal() {
  const modal = document.getElementById('2fa-modal');
  if (modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
  }
}

// Anonymize Account Modal
async function anonAccountModal() {
  const existingModal = document.getElementById('anon-account-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'anon-account-modal';
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

  modal.innerHTML = `
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
  document.body.appendChild(modal);
  document.body.classList.add('modal-open');

  // Event Listeners
  modal.querySelector('#close-anon-modal').addEventListener('click', closeAnonAccountModal);
  modal.querySelector('#anon-acc-cancel').addEventListener('click', closeAnonAccountModal);
  modal.querySelector('#anon-acc-confirm').addEventListener('click', anonAccount);

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAnonAccountModal();
  });

}

function closeAnonAccountModal() {
  const modal = document.getElementById('anon-account-modal');
  if (modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
  }
}


/* anonymize account */
async function anonAccount() {
  // Close the modal
  const modal = document.getElementById('anon-account-modal');
  if (modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
  }

  try {
    const response = await fetch('/anonymize/');

    if (!response.ok) {
      throw new Error('Failed to anonymize account');
    }
    console.log("Account anonymized response: ", response);
    const responseData = await response.json();
    updateUI(`${responseData.redirect}`, false);
  } catch (error) {
    console.error('Error:', error);
  }
}