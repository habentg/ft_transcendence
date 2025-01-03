
// Function to handle password visibility toggle
function showPasswordToggle() {
  const togglePassword = document.querySelector('.toggle-password');
  const toggleConfirmPassword = document.querySelector('.toggle-confirm-password');
  if (togglePassword) {
    togglePassword.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const passwordInput = document.getElementById(targetId);
      const icon = this.querySelector('i');

      // Toggle password visibility
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }
  if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const confirmPasswordInput = document.getElementById(targetId);
      const icon = this.querySelector('i');

      // Toggle confirm password visibility
      if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        confirmPasswordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }
};

showPasswordToggle();

// Handle the signup form submission
async function handleSignupSubmit(e) {
  e.preventDefault();

  const formData = {
    // first_name: document.getElementById('firstName').value,
    // last_name: document.getElementById('lastName').value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    full_name:
      document.getElementById("firstName").value +
      " " +
      document.getElementById("lastName").value,
    confirm_password: document.getElementById("confirm-password").value,
  };

  // Validate the form data
  if (formData.confirm_password !== formData.password) {
    displayError({ error_msg: "Passwords do not match" });
    return;
  }
  try {
    const m_csrf_token = await getCSRFToken();
    const response = await fetch("/signup/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": m_csrf_token,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const responseData = await response.json();
      displayError(responseData);
      return;
    }
    // redirect to the protected page
    await updateUI(`/home`);
    // update the navbar
    updateNavBar(true);
    createWebSockets();
  } catch (error) {
    console.error('Error:', error);
  }
}
