// Initiate the password reset process
async function handlePassResetSubmit(e) {
  e.preventDefault();

  const formData = {
    email: document.getElementById("email").value,
  };
  showLoadingAnimation();
  try {
    const m_csrf_token = await getCSRFToken();
    const response = await fetch("/password_reset/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": m_csrf_token,
      },
      body: JSON.stringify(formData),
    });

    const responseData = await response.json();
    hideLoadingAnimation();
    if (!response.ok) {
      displayError(responseData);
      return;
    }

    // Get the uidb64 and token from the response data
    const uidb64 = responseData.uidb64;
    const token = responseData.token;

    // Store the uidb64 and token in the local storage
    localStorage.setItem('uidb64', uidb64);
    localStorage.setItem('token', token);


    const otpModal = resetPasswordConfirmModal();
    document.body.appendChild(otpModal);
    document.body.classList.add('modal-open');

    otpModal.querySelector("#close-otp-modal").addEventListener("click", () => {
      closeModal("reset-password-confirm-modal");
    });
    
    otpModal.addEventListener("click", (e) => {
      if (e.target === otpModal) {
        closeModal("reset-password-confirm-modal");
      }
    });

    document.querySelector('#returnToSignIn').addEventListener('click', async () => {
      closeModal("reset-password-confirm-modal");
      updateUI(`/signin`);
    });

  } catch (error) {
    createToast({ type: "error", title: "Error", error_message: "An error occurred. Please try again later"});
  }
}

// Handle the password change
async function handlePassChangeSubmit(e) {
  e.preventDefault();

  const uidb64 = localStorage.getItem("uidb64");
  const token = localStorage.getItem("token");

  new_password = document.getElementById("new_password").value
  confirm_new_pass = document.getElementById("confirm_pass").value

  if (new_password !== confirm_new_pass) {
    displayError({ error_msg: "Passwords do not match" });
    return;
  }
  if (new_password.length > 150 || new_password.length < 3) {
    displayError({ error_msg: "Password should be between 3 and 150 characters long" });
    return;
  }

  try {
    const m_csrf_token = await getCSRFToken();
    const response = await fetch(`/password_reset_newpass/${uidb64}/${token}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': m_csrf_token
      },
      body: JSON.stringify({ new_password: new_password })
    });
    const responseData = await response.json();
    if (!response.ok) {
      displayError(responseData);
      createToast({ type: "error", title: "Error", error_message: `${responseData.error_msg}`});
      return;
    }

    await showSuccessMessage("Password reset successfully");
    updateUI(`/signin`);

    // Clear the local storage
    localStorage.removeItem('uidb64');
    localStorage.removeItem('token');
  }
  catch (error) {
    createToast({ type: "error", title: "Error", error_message: "An error occurred. Please try again later."});
  }
}


// Add password toggle functionality
document.querySelectorAll(".toggle-password").forEach((button) => {
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
