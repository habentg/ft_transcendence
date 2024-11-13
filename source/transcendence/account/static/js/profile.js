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
      <li class="nav-item">
        <a href="#" class="nav-link"><i class="fas fa-gamepad me-2"></i>Quick game</a>
      </li>
      <li class="nav-item">
        <a onclick="appRouter()" class="nav-link btn btn-outline-primary ms-lg-2" href="/signin">Sign in</a>
      </li>
      <li class="nav-item">
        <a onclick="appRouter()" class="nav-link btn btn-primary ms-lg-2" href="/signup">Sign up</a>
      </li>
      `;
      updateUI('/', false);
      return;
    }
    throw new Error("Failed to delete account");
  } catch (error) {
    console.error("Error:", error);
  }
}

// editing user info
function makeFieldEditable(fieldId) {
  console.log(`Make ${fieldId} editable`);
  const fieldInput = document.getElementById(fieldId);
  fieldInput.disabled = false;
  fieldInput.focus();
}

// updating user info
async function UpdateUserInfo() {
    try {
        const formData = {
            full_name: document.getElementById('new-fullname').value.trim(),
            username: document.getElementById('new-username').value.trim(),
            email: document.getElementById('new-email').value.trim(),
        };

        // Basic validation
        if (!formData.full_name || !formData.username || !formData.email) {
            displayError({ error_msg: "All fields are required" });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            displayError({ error_msg: "Please enter a valid email address" });
            return;
        }

        const response = await fetch('/profile/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': await getCSRFToken()
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            displayError(errorData);
            return;
        }

        // Success - close modal and update UI
        closeUsernameModal();
        updateUI('/profile', false);
    } catch (error) {
        console.error('Error:', error);
    }
}

// upload profile picture
async function UploadNewProfilePic() {
    try {
        // user input validation here maybe
        const profilePicFile = document.getElementById('profile-pic').files[0];
        console.log("Profile pic file:", profilePicFile);
        if (profilePicFile === undefined) 
            throw new Error('No file selected');
        // using FormData to send the file - browser will set the correct headers
        const formData = new FormData();
        formData.append('profile_picture', profilePicFile);
        const response = await fetch('/profile/', {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': await getCSRFToken()
            },
            // sending body directly as FormData - no need to stringify
            body: formData
        });

        if (response.ok) {
            console.log("Profile pic updated");
            // update the user info in the DOM
            await updateUI('/profile', false);
        } else {
            throw new Error('Failed to update profile pic');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}



// function displayError(error) {
//     const errorMsg = document.getElementById('password-error-msg');
//     errorMsg.textContent = error;
//     errorMsg.style.display = 'block';
// }

// update user password
async function updatePlayerPassword () {
    try {
        const formData = {
            current_password: document.getElementById('curr-password').value,
            new_password: document.getElementById('new-password').value,
            confirm_password: document.getElementById('confirm-password').value
        }
        console.log("Update password form data: ", formData);
        const response = await fetch('/update_password/', {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json',
                'X-CSRFToken': await getCSRFToken()
            },
            body: JSON.stringify(formData)
        });
    
        console.log("Password update response: ", response);
        if (!response.ok) {
            const responseData = await response.json();
            console.log("Json response: ", responseData);
            displayError(responseData);
            return;
        }
        console.log("Password updated");
        await updateUI('/profile', false);
        // close the modal
        closePasswordModal();
        // after modal is closed, display password update success message / modal
    } catch (error) {
        console.error('Error:', error);
    }
}

// Profile Picture Modal
function createAndShowModal() {
  const existingModal = document.getElementById("profile-pic-modal");
  if (existingModal) existingModal.remove();

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
            <small class="text-muted mt-2 d-block">Supported formats: JPG, PNG, GIF (Max size: 5MB)</small>
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

  document.body.appendChild(modal);
  document.body.classList.add('modal-open');

  // Event Listeners
  modal.querySelector('#close-modal').addEventListener('click', closeModal);
  modal.querySelector('#close-modal-btn').addEventListener('click', closeModal);
  modal.querySelector('#update-profile-pic-btn').addEventListener('click', handleUpload);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function handleUpload() {
  UploadNewProfilePic();
  closeModal();
}

function closeModal() {
  const modal = document.getElementById("profile-pic-modal");
  if (modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
  }
}

// Update User Info Modal
function updateUsernameModal() {
  const existingModal = document.getElementById("username-modal");
  if (existingModal) existingModal.remove();

  // Get the text content from spans inside the profile details
  const full_name = document.querySelector('.profile-info h3').textContent.trim();
  const username = document.querySelector('.profile-info p:first-of-type').textContent.replace('@', '').trim();
  const email = document.querySelector('.profile-info p:last-of-type').textContent.trim();

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

  document.body.appendChild(modal);
  document.body.classList.add('modal-open');

  // Event Listeners
  modal.querySelector('#close-username-modal').addEventListener('click', closeUsernameModal);
  modal.querySelector('#close-username-modal-btn').addEventListener('click', closeUsernameModal);
  modal.querySelector('#update-username-btn').addEventListener('click', UpdateUserInfo);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeUsernameModal();
  });
}

// Close Modal Functions
function closeUsernameModal() {
  const modal = document.getElementById("username-modal");
  if (modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
  }
}

// a function to initialize the profile page and add event listeners
function initProfilePage() {
  
  const updateProfilePicBtn = document.getElementById("change-profile-pic");
  if (updateProfilePicBtn) {
    updateProfilePicBtn.addEventListener("click", createAndShowModal);
  }
  
  const updateUserInfoBtn = document.getElementById("update-user-info");

  if (updateUserInfoBtn) {
    updateUserInfoBtn.addEventListener("click", () => {
      console.log("Update user info");
      updateUsernameModal();
    });
  }
}

// Display error message in modal
function displayError(errorData) {
    const errorMsg = document.getElementById('error-msg');
    if (errorMsg) {
        errorMsg.textContent = errorData.error_msg || "An error occurred";
        errorMsg.style.display = 'block';
        
        // Hide error message after 3 seconds
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 3000);
    }
}

// initialize the profile page
initProfilePage();