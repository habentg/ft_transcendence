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

    if (formData.current_password.length > 150 ||
      formData.new_password.length > 150 ||
      formData.confirm_password.length > 150) {
      displayError({ error_msg: "Password must be betwen 3 and 150 characters long!" });
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
      if (response.status === 429) {
        closeModal("password-change-modal");
        const error_content = {
          type: "error",
          error_message: `${responseData.error_msg}. Please try again later.`,
          title: "Failed To Change Password",
        }
        createToast(error_content);
        return;
      }
      displayError(responseData);
      return;
    }
    closeModal("password-change-modal");
    try {
      const data = await response.json();
      if (data.success)
        await showSuccessMessage("Password updated successfully. Please log in again with your new password.", 3000);
      else
        await showSuccessMessage("Something Happened!!! Redirecting to signin", 3000, 'Error');
      }catch(e) {
        await showSuccessMessage("Something Happened!!! Redirecting to signin", 3000, 'Error');
    }
    await updateUI(`/signin`);
    updateNavBar(false);
  } catch (error) {
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
    const response = await fetch("/2fa_toggle/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": await getCSRFToken(),
      },
    });

    closeModal("2fa-modal");
    if (response.ok) {
      const button =
        document.getElementById("enable-2fa") ||
        document.getElementById("disable-2fa");

      if (button.id === "enable-2fa") {
        button.id = "disable-2fa";
        button.className = "btn btn-light w-100";
        button.innerHTML = `<i class="fas fa-shield-alt me-2"></i>Disable 2FA`;
        await showSuccessMessage("Two-Factor Authentication enabled successfully!");
      } else {
        button.id = "enable-2fa";
        button.className = "btn btn-success w-100";
        button.innerHTML = `<i class="fas fa-shield-alt me-2"></i>Enable 2FA`;
        await showSuccessMessage("Two-Factor Authentication disabled successfully!");
      }
    } else {
      if (response.status === 429) {
        const error_content = {
          type: "error",
          error_message: "Too many requests. Please try again later.",
          title: "Failed to update 2FA status",
        }
        createToast(error_content);
        return;
      }
      createToast({ title: "Unknown ERROR" });
      throw new Error("error happed while updating 2fa");
    }
  } catch (error) {
    createToast({ title: "Error", error_message: "Failed to update 2FA status", type: "error" });
  }
}

// Password Change Modal
function createAndShowPasswordModal() {
  const existingModal = document.getElementById("password-change-modal");
  if (existingModal) existingModal.remove();

  const changePassModal = changePasswordModal();
  document.body.appendChild(changePassModal);
  document.body.classList.add("modal-open");

  // Event Listeners
  changePassModal
    .querySelector("#close-password-modal")
    .addEventListener("click", () => closeModal("password-change-modal"));
  changePassModal
    .querySelector("#close-password-modal-btn")
    .addEventListener("click", () => closeModal("password-change-modal"));
  changePassModal
    .querySelector("#update-pass-btn")
    .addEventListener("click", updatePlayerPassword);

  // on key press enter
  changePassModal.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      updatePlayerPassword();
    }
  });
  // Add toggle password visibility functionality
  changePassModal.querySelectorAll(".toggle-password").forEach((button) => {
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

  // Close modal when clicking outside
  changePassModal.addEventListener("click", (e) => {
    if (e.target === changePassModal) {
      closeModal("password-change-modal");
    }
  });
}

// Delete Account Modal
function deleteAccountCheck() {
  const existingModal = document.getElementById("delete-account-modal");
  if (existingModal) existingModal.remove();

  const deleteModal = deleteAccountModal();
  document.body.appendChild(deleteModal);
  document.body.classList.add("modal-open");

  // Event Listeners
  deleteModal
    .querySelector("#close-delete-modal")
    .addEventListener("click", () => closeModal("delete-account-modal"));
  deleteModal
    .querySelector("#delete-acc-cancel")
    .addEventListener("click", () => closeModal("delete-account-modal"));
  deleteModal
    .querySelector("#delete-acc-confirm")
    .addEventListener("click", deleteAccount);

  // Close modal when clicking outside
  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) closeModal("delete-account-modal");
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
      closeModal("delete-account-modal");
      await updateUI("/");
    } else {
      throw new Error("Failed to delete account");
    }
  } catch (error) {
    displayError({ error_msg: "Failed to delete account" });
  }
}


// Function to create and show the 2FA modal
function show2FAModal() {
  const existingModal = document.getElementById("2fa-modal");
  if (existingModal) existingModal.remove();

  const button =
    document.getElementById("enable-2fa") ||
    document.getElementById("disable-2fa");

  const modal = twoFactorModal(button);
  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  // Event Listeners
  const closeButtons = modal.querySelectorAll('[data-dismiss="modal"]');
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => closeModal("2fa-modal"));
  });

  const confirmButton = modal.querySelector("#confirm-2fa");
  if (confirmButton) {
    confirmButton.addEventListener("click", handleEnableDisable2FA);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal("2fa-modal");
  });
}

// Anonymize Account Modal
async function anonAccountModal() {
  const existingModal = document.getElementById("anon-account-modal");
  if (existingModal) existingModal.remove();

  let anon_confirmaion_modal = null;
  const anonTextBtn = document.getElementById("anon_text");
  
  anon_action = anonTextBtn.textContent === "De-anonymize Account" ? "deanon" : "anon";
  if (anon_action === "anon") {
    anon_confirmaion_modal = anonymizeModal('Anonymize', 'Are you sure you want to anonymize your account?');
  }
  else {
    anon_confirmaion_modal = anonymizeModal('De-anonymize', 'Are you sure you want to De-anonymize your account?');
  }
  document.body.appendChild(anon_confirmaion_modal);
  document.body.classList.add("modal-open");

  // Event Listeners
  anon_confirmaion_modal
    .querySelector("#close-anon-modal")
    .addEventListener("click", () => closeModal("anon-account-modal"));
  anon_confirmaion_modal
    .querySelector("#anon-acc-cancel")
    .addEventListener("click", () => closeModal("anon-account-modal"));
  anon_confirmaion_modal
    .querySelector("#anon-acc-confirm")
    .addEventListener("click", async() => {await anonAccount()});

  // Close modal when clicking outside
  anon_confirmaion_modal.addEventListener("click", (e) => {
    if (e.target === anon_confirmaion_modal)
      closeModal("anon-account-modal");
  });
}

/* Anonymize Account */
async function anonAccount() {
  // Close the modal
  closeModal("anon-account-modal");

  const anonTextBtn = document.getElementById("anon_text");
  anon_action = anonTextBtn.textContent === 'Anonymize Account' ? "anon" : "deanon";
  try {
    const response = await fetch(`/anonymize?anon_action=${anon_action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': await getCSRFToken(),
      }
    });

    if (!response.ok) {
      throw new Error("Failed to Anonymize Account");
    }
    if (anon_action === "anon") {
      anonTextBtn.textContent = "De-anonymize Account";
      document.getElementsByClassName("anon_i")[0].classList.remove('fa-user-secret');
      document.getElementsByClassName("anon_i")[0].classList.add('fa-user');
      await showSuccessMessage("Account anonymized successfully!", 2000);
    }
    else {
      anonTextBtn.textContent = "Anonymize Account";
      document.getElementsByClassName("anon_i")[0].classList.remove('fa-user');
      document.getElementsByClassName("anon_i")[0].classList.add('fa-user-secret');
      await showSuccessMessage("Account De-anonymized successfully!", 2000);
    }
  } catch (error) {
    createToast({ type: "error", title: "Error", error_message: "Failed to Anonymize Account" });
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

// Setup all event listeners
initSettings();