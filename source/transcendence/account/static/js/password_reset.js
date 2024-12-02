// Initiate the password reset process
async function handlePassResetSubmit(e) {
  e.preventDefault();
  loadSpinner();

  // make spinner show until the page is loaded
  const formData = {
    email: document.getElementById("email").value,
  };

  try {
    const m_csrf_token = await getCSRFToken();
    console.log("CSRF Token:", m_csrf_token);
    const response = await fetch("/password_reset/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": m_csrf_token,
      },
      body: JSON.stringify(formData),
    });

    const responseData = await response.json();

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

    // Show the reset password confirmation modal
    const otpModal = document.createElement('div');
    otpModal.className = 'modal fade show';
    otpModal.id = 'resetPasswordConfirmModal';
    otpModal.style.display = 'block';
    otpModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    otpModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="content modal-content">
          <div class="modal-header border-0 py-3">
            <h5 class="modal-title">
              <i class="fas fa-key me-2"></i>Reset link sent
            </h5>
            <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
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

    document.body.appendChild(otpModal);
    document.body.classList.add('modal-open');

    // Add event listeners for closing modal
    const closeModal = () => {
      const modal = document.getElementById('resetPasswordConfirmModal');
      if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
      }
    };

    otpModal.querySelectorAll('[data-dismiss="modal"]').forEach(button => {
      button.addEventListener('click', async function() {
        closeModal();
        updateUI(`/signin`, false);
      });
    });

    otpModal.addEventListener('click', (e) => {
      if (e.target === otpModal) {
        closeModal();
        updateUI(`/signin`, false);
      }
    });

    document.getElementById('returnToSignIn').addEventListener('click', async function() {
      closeModal();
      updateUI(`/signin`, false);
    });

  } catch (error) {
    console.error('Error:', error);
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
      alert("Password couldn't reset: " + responseData.error_msg);
      return;
    }

    // show the password reset success modal  
    const otpModal = document.createElement('div');
    otpModal.className = 'modal fade show';
    otpModal.id = 'resetPasswordsuccessModal';
    otpModal.style.display = 'block';
    otpModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    otpModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="content modal-content">
          <div class="modal-header border-0 py-3">
            <h5 class="modal-title">
              <i class="fas fa-key me-2"></i>Password Reset Successfully
            </h5>
            <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
          </div>
          <div class="modal-body px-3 py-2">
            <p class="text-white mb-3 small">
              Password reset successfully! Please sign in with your new password.
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

    document.body.appendChild(otpModal);
    document.body.classList.add('modal-open');

    // close modal and redirect to signin page after 3 seconds
    setTimeout(() => {
      const modal = document.getElementById('resetPasswordsuccessModal');
      if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
        updateUI(`/signin`, false);
      }
    }, 3000);

    // Clear the local storage
    localStorage.removeItem('uidb64');
    localStorage.removeItem('token');
  }
  catch (error) {
    console.error('Error:', error);
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

function loadSpinner() {
  const spinner = document.getElementById("load-spinner");

  if (spinner) {
    spinner.style.display = "block";
  }
  // Show spinner for 2 seconds
  setTimeout(() => {
    if (spinner) {
      spinner.style.display = "none";
    }
  }, 2000);
}