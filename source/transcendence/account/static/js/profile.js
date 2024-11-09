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
      await updateUI('/', false);
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
        // user input validation here maybe
        const formData = {
            // can add firstname and lastname here
            full_name: document.getElementById('new-fullname').value,
            username: document.getElementById('new-username').value,
            email: document.getElementById('new-email').value,
        }
        console.log(formData.full_name);
        const response = await fetch('/profile/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': await getCSRFToken()
            },
            body: JSON.stringify(formData)
        });
        // print full name
        
        if (response.ok) {
            console.log("Full name: ", formData.full_name);
            console.log("User info updated");
            // update the user info in the DOM
            await updateUI('/profile', false);
            closeUsernameModal();
        } else {
            throw new Error('Failed to update user info');
        }
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

//  Helper function for updating profile picture modal
function createAndShowModal() {
  // Remove any existing modal
  const existingModal = document.getElementById("profile-pic-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create the modal
  const modal = document.createElement("div");
  modal.id = "profile-pic-modal";
  modal.className = "profile-pic-modal";

  // Create the modal content
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  modalContent.innerHTML = `
        <h2 class="modal-title">Update Profile Picture</h2>
        <input type="file" id="profile-pic" accept="image/*" class="modal-input">
        <button id="update-profile-pic-btn" class="modal-button modal-upload-btn">Upload New Profile Picture</button>
        <button id="close-modal" class="modal-button modal-close-btn">Cancel</button>
    `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Show the modal
  modal.style.display = "block";

  // Add event listener to the upload button
  const uploadBtn = document.getElementById("update-profile-pic-btn");
  uploadBtn.addEventListener("click", handleUpload);

  // Add event listener to close the modal
  const closeBtn = document.getElementById("close-modal");
  closeBtn.addEventListener("click", closeModal);

  // Close the modal if user clicks outside of it
  window.addEventListener("click", handleOutsideClick);
}

function handleUpload() {
  UploadNewProfilePic();
  closeModal();
}

function closeModal() {
  const modal = document.getElementById("profile-pic-modal");
  if (modal) {
    modal.style.display = "none";
    modal.remove(); // Remove the modal from the DOM
  }
}

function handleOutsideClick(event) {
  const modal = document.getElementById("profile-pic-modal");
  if (event.target === modal) {
    closeModal();
  }
}

// update username modal
function updateUsernameModal() {
  console.log("Update username modal");
  const existingModal = document.getElementById("username-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create the modal
  const modal = document.createElement("div");
  modal.id = "username-modal";
  modal.className = "username-modal";

  // Create the modal content
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const full_name = document.getElementById("full_name").textContent;
  const username = document.getElementById("username").textContent;
  const email = document.getElementById("email").textContent;
  
  console.log("Fullname", `${full_name}`);

  modalContent.innerHTML = `
        <h2 class="modal-title">Update Profile</h2>
        <input type="text" id="new-fullname" class="modal-input" value="${full_name}" />
        <input type="text" id="new-username" class="modal-input" value="${username}" />
        <input type="email" id="new-email" class="modal-input" value="${email}" />
        <div id="error-msg" class="username-error-msg" style="display:none;"></div>
        <button id="update-username-btn" class="modal-button modal-upload-btn">Update Profile</button>
        <button id="close-username-modal" class="modal-button modal-close-btn">Cancel</button>
    `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Show the modal
  modal.style.display = "block";

  // Add event listener to the update username button
  const updateUsernameBtn = document.getElementById("update-username-btn");
  updateUsernameBtn.addEventListener("click", UpdateUserInfo);
  console.log(document.getElementById("username").value);

  // Add event listener to close the modal
  const closeBtn = document.getElementById("close-username-modal");
  closeBtn.addEventListener("click", closeUsernameModal);

  // Close the modal if user clicks outside of it
  window.addEventListener("click", handleUsernameOutsideClick);
}

// close the username modal
function closeUsernameModal() {
  const modal = document.getElementById("username-modal");
  if (modal) {
    modal.style.display = "none";
    modal.remove(); // Remove the modal from the DOM
  }
}

// close the username modal if user clicks outside of it
function handleUsernameOutsideClick(event) {
  const modal = document.getElementById("username-modal");
  if (event.target === modal) {
    closeUsernameModal();
  }
}

// a function to initialize the profile page and add event listeners
function initProfilePage() {
  
  const updateProfilePicBtn = document.getElementById("change-profile-pic");
  if (updateProfilePicBtn) {
    updateProfilePicBtn.addEventListener("click", createAndShowModal);
  }
  
  // const deleteAccountBtn = document.getElementById("delete-acc-btn");
  // const enableDisable2FABtn = document.getElementById("enable-disable-2fa");
  // const changePassIcon = document.getElementById("change-password-btn");
  // if (changePassIcon) {
  //   changePassIcon.addEventListener("click", createAndShowPasswordModal);
  // }
  // if (deleteAccountBtn) {
  //   deleteAccountBtn.addEventListener("click", deleteAccount);
  // }

  // if (enableDisable2FABtn) {
  //   enableDisable2FABtn.addEventListener("click", handleEnableDisable2FA);
  // }

  const updateUserInfoBtn = document.getElementById("update-user-info");

  if (updateUserInfoBtn) {
    updateUserInfoBtn.addEventListener("click", () => {
      console.log("Update user info");
      updateUsernameModal();
    });
  }
}

// initialize the profile page
initProfilePage();
