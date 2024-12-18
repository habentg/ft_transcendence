createWebSockets();

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

    const response = await fetch('/update_profile/', {
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
    const responseData = await response.json();
    // closeUsernameModal();
    closeModal('username-modal');
    await updateUI(`/profile/${responseData.username}`, false);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Profile Picture Modal
function updateProfilePic() {
  const existingModal = document.getElementById("profile-pic-modal");
  if (existingModal) existingModal.remove();

  const updatePfpModal = updateProfilePictureModal();
  document.body.appendChild(updatePfpModal);
  document.body.classList.add("modal-open");

  // Event Listeners
  updatePfpModal
    .querySelector("#close-modal")
    .addEventListener("click", () => closeModal("profile-pic-modal"));
  updatePfpModal
    .querySelector("#close-modal-btn")
    .addEventListener("click", () => closeModal("profile-pic-modal"));
  updatePfpModal
    .querySelector("#update-profile-pic-btn")
    .addEventListener("click", handleUpload);

  updatePfpModal.addEventListener("click", (e) => {
    if (e.target === updatePfpModal) closeModal("profile-pic-modal");
  });
}

async function handleUpload() {
  try {
    const profilePicFile = document.getElementById("profile-pic").files[0];
    const errorMsg = document.getElementById("error-msg");

    if (!profilePicFile) {
      errorMsg.textContent = "No file selected";
      errorMsg.style.display = "block";
      return;
    }

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (profilePicFile.size > maxSize) {
      errorMsg.textContent = "File size exceeds 10MB";
      errorMsg.style.display = "block";
      return;
    }

    // Validate file type (only JPEG, JPG, PNG, GIF)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(profilePicFile.type)) {
      errorMsg.textContent =
        "Unsupported file format. Only JPEG, JPG, PNG, and GIF are allowed";
      errorMsg.style.display = "block";
      return;
    }

    // Hide error message if validation passes
    errorMsg.style.display = "none";

    // using FormData to send the file - browser will set the correct headers
    const formData = new FormData();
    formData.append('profile_picture', profilePicFile);
    const response = await fetch('/update_profile/', {
      method: 'PATCH',
      headers: {
        "X-CSRFToken": await getCSRFToken(),
      },
      // sending body directly as FormData - no need to stringify
      body: formData,
    });

    if (response.ok) {
      console.log("Profile pic updated");
      closeModal("profile-pic-modal");
      // update the user info in the DOM
      const responseData = await response.json();
      await updateUI(`/profile/${responseData.username}`, false);
      closeModal();
      updateNavBar(true);
    } else {
      throw new Error("Failed to update profile pic");
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMsg = document.getElementById('error-msg');
    errorMsg.textContent = 'Image is too large or invalid format';
    errorMsg.style.display = 'block';
  }
}

function closeModal() {
  const modal = document.getElementById("profile-pic-modal");
  if (modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
  }
}

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

// Update User Info Modal
function updateProfileInfo() {
  const existingModal = document.getElementById("username-modal");
  if (existingModal) existingModal.remove();

  const modal = updateProfileModal();
  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  // Event Listeners
  modal
    .querySelector("#close-username-modal")
    .addEventListener("click", () => closeModal("username-modal"));
  modal
    .querySelector("#close-username-modal-btn")
    .addEventListener("click", () => closeModal("username-modal"));
  modal
    .querySelector("#update-username-btn")
    .addEventListener("click", UpdateUserInfo);

  // On click Enter key, update user info
  modal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") UpdateUserInfo();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal("username-modal");
  });
}

/* for queried user */
/* reataching the eventListners for the buttons

  @ spent days figuring out this shit
*/

async function addFriendRequest() {
  console.log("addFriendRequest");

  const toBeFriend = document
    .getElementById("username")
    .getAttribute("data-username");
  console.log("toBeFriend: ", toBeFriend);
  try {
    const response = await fetch(`/friend_request/${toBeFriend}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status); // Log the response status

    if (response.status === 201) {
      // await updateUI(`/profile/${toBeFriend}`, false);
      // attachFriendEventListners();
      const sendFriendRequestBtn = document.getElementById("add_friend_btn");
      sendFriendRequestBtn.remove();

      const cancelFRBtn = createButton('Cancel Request', ['btn', 'btn-danger', 'friendship_btn'], 'cancel_request_btn', 'cancelFriendRequest()')
      const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
      profile_info_container.appendChild(cancelFRBtn);
      return;
    }

    throw new Error("Failed to send friend request");
  } catch (error) {
    console.log("addFriendRequest Error: ", error);
  }
}

async function cancelFriendRequest() {
  console.log("we here to cancel friend request");
  const toBeFriend = document
    .getElementById("username")
    .getAttribute("data-username");
  console.log("toBeFriend: ", toBeFriend);
  try {
    const response = await fetch(`/friend_request/${toBeFriend}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status); // Log the response status

    if (response.status === 200) {
      // await updateUI(`/profile/${toBeFriend}`, false);
      // attachFriendEventListners();
      // console.log("Cancelled friend request");
      const cancelFRBtn = document.getElementById("cancel_request_btn");
      cancelFRBtn.remove();

      const sendFriendRequestBtn = createButton('Send Request', ['btn', 'btn-primary', 'friendship_btn'], 'add_friend_btn', 'addFriendRequest()');
      const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
      profile_info_container.appendChild(sendFriendRequestBtn);
      return;
    }

    throw new Error("Failed to cancel friend request");
  } catch (error) {
    console.log("cancelFriendRequest Error: ", error);
  }
}

async function acceptOrDeclineFriendRequest(
  action,
  toBeFriend,
) {
  console.log("acceptOrDeclineFriendRequest");

  try {
    const response = await fetch(`/friend_request_response/${toBeFriend}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: `${action}`,
      }),
    });

    if (response.status === 200) {
      const accept_request_btn = document.getElementById("accept_request_btn");
      const decline_request_btn = document.getElementById("decline_request_btn");

      accept_request_btn.remove();
      decline_request_btn.remove();
      if (action === 'accept') {
        const unfriendBtn = createButton('Unfriend', ['btn', 'btn-danger', 'friendship_btn', 'me-1', 'mb-2'], 'unfriend_btn', 'removeFriend()');
        const chatBtn = createButton('Chat', ['btn', 'btn-dark', 'friendship_btn', 'mb-2'], 'chat_btn', `create_chatroom('${toBeFriend}')`);

        const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
        profile_info_container.appendChild(unfriendBtn);
        profile_info_container.appendChild(chatBtn);
      }
      else {
        const sendFriendRequestBtn = createButton('Send Request', ['btn', 'btn-primary', 'friendship_btn'], 'add_friend_btn', 'addFriendRequest()');
        const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
        profile_info_container.appendChild(sendFriendRequestBtn);
      }
      return;
    }
    throw new Error("Failed to accept/decline friend request");
  } catch (error) {
    console.log("Error: ", error);
    // alert("Failed to accept/decline friend request");
  }
}

async function removeFriend() {
  console.log("removeFriend");
  const toBeFriend = document
    .getElementById("username")
    .getAttribute("data-username");
  try {
    const response = await fetch(`/friend_request/${toBeFriend}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status); // Log the response status

    if (response.status === 200) {
      const unfriendBtn = document.getElementById("unfriend_btn");
      const chatBtn = document.getElementById("chat_btn");
      unfriendBtn.remove();
      chatBtn.remove();

      const sendFriendRequestBtn = createButton('Send Request', ['btn', 'btn-primary', 'friendship_btn'], 'add_friend_btn', 'addFriendRequest()');
      const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
      profile_info_container.appendChild(sendFriendRequestBtn);
      return;
    }

    throw new Error("Failed to remove friend");
  } catch (error) {
    console.log("Error: ", error);
  }
}

// Function to initialize the profile page and add event listeners
function initProfilePage() {
  const updateProfilePicBtn = document.getElementById("change-profile-pic");
  if (updateProfilePicBtn) {
    updateProfilePicBtn.addEventListener("click", updateProfilePic);
  }

  const updateUserInfoBtn = document.getElementById("update-user-info");

  if (updateUserInfoBtn) {
    updateUserInfoBtn.addEventListener("click", () => {
      console.log("Update user info");
      updateProfileInfo();
    });
  }
}

/* sending request to create chat room between current user and a friend */
async function create_chatroom(friend_username) {
  console.log("Creating chatroom with {", friend_username, "}");
  try {
    const response = await fetch(`/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": await getCSRFToken(),
      },
      body: JSON.stringify({ 'recipient': friend_username }),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log("Chatroom created: ", responseData);
      await updateUI(`/chat`, false);
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }

  } catch (error) {
    console.error("Failed to create chatroom: ", error);
  }
}

// initialize the profile page
initProfilePage();

