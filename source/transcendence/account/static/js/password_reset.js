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

    // Show OTP verification modal
    const otpModal = document.createElement('div');
    otpModal.className = 'modal fade show';
    otpModal.id = 'otpVerificationModal';
    otpModal.style.display = 'block';
    otpModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    otpModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="content modal-content">
          <div class="modal-header border-0 py-3">
            <h5 class="modal-title">
              <i class="fas fa-key me-2"></i>OTP Verification
            </h5>
            <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
          </div>
          <div class="modal-body px-3 py-2">
            <div id="otp-error-msg" class="alert alert-danger small py-2" style="display: none"></div>
            
            <p class="text-white mb-3 small">
              Please enter the verification code sent to your email
            </p>
            
            <div class="form-group">
              <div class="input-group">
                <input 
                  type="text" 
                  id="otpInput" 
                  class="form-control bg-transparent text-white" 
                  placeholder="Enter OTP code"
                  maxlength="5"
                />
                <span class="input-group-text bg-transparent text-white border-start-0">
                  <i class="fas fa-shield-alt"></i>
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 py-3">
            <button type="button" class="btn btn-primary btn-sm" id="verifyOtpBtn">
              <i class="fas fa-check me-2"></i>Verify OTP
            </button>
            <button type="button" class="btn btn-outline-light btn-sm" data-dismiss="modal">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(otpModal);
    document.body.classList.add('modal-open');

    // Add event listeners for closing modal
    const closeModal = () => {
      const modal = document.getElementById('otpVerificationModal');
      if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
      }
    };

    // Close modal when clicking close buttons
    otpModal.querySelectorAll('[data-dismiss="modal"]').forEach(button => {
      button.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside
    otpModal.addEventListener('click', (e) => {
      if (e.target === otpModal) {
        closeModal();
      }
    });

    // Handle OTP verification
    document.getElementById('verifyOtpBtn').addEventListener('click', async function() {
      const otpInput = document.getElementById('otpInput').value;
      const errorDiv = document.getElementById('otp-error-msg');
      
      if (otpInput === '12345') {
        closeModal();
        await updateUI(`/password_reset_confirm`, false);
      } else {
        errorDiv.textContent = 'Invalid OTP code. Please try again.';
        errorDiv.style.display = 'block';
      }
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
    alert("Password reset successfully! Please sign in with your new password.");
    // Redirect to the signin page
    await updateUI(`/signin`, false);
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