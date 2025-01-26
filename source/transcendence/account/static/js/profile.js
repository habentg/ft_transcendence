createWebSockets();

// updating user info
async function UpdateUserInfo() {
  try {
    const formData = {
      full_name: document.getElementById("new-fullname").value.trim(),
      email: document.getElementById("new-email").value.trim(),
    };

    // Basic validation
    if (!formData.full_name || !formData.email) {
      displayError({ error_msg: "All fields are required" });
      return;
    }

    if (formData.full_name.length > 150) {
      displayError({ error_msg: "Fullname too Long. It should be less than 150 Chars" });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email) || formData.email.length > 150) {
      displayError({ error_msg: "Please enter a valid email address" });
      return;
    }

    const response = await fetch("/update_profile/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": await getCSRFToken(),
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      displayError(errorData);
      return;
    }
    closeModal("username-modal");
    document.getElementById("full_name").textContent = formData.full_name.slice(0, 20);
    document.getElementById("player_email").textContent = formData.email.slice(0, 20);
    await showSuccessMessage("Profile Information updated successfully");
  } catch (error) {
    createToast({type:'error',error_message:'Failed to update profile info',title:'Error!'})
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
    .addEventListener("click", () => handleUpload());

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
    formData.append("profile_picture", profilePicFile);
    const response = await fetch("/update_profile/", { 
      method: "PATCH",
      headers: {
        "X-CSRFToken": await getCSRFToken(),
      },
      // sending body directly as FormData - no need to stringify
      body: formData,
    });

    if (response.ok) {
      closeModal("profile-pic-modal");
      // update the user info in the DOM
      const responseData = await response.json();
      await updateUI(`/profile/${responseData.username}`, false);
      updateNavBar(true);
      await showSuccessMessage("Profile Picture updated successfully");
    } else {
      throw new Error("Failed to update profile pic");
    }
  } catch (error) {
    const errorMsg = document.getElementById("error-msg");
    errorMsg.textContent = "Image is too large or invalid format";
    errorMsg.style.display = "block";
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
  const toBeFriend = document
    .getElementById("player_username")
    .getAttribute("data-username");
  try {
    const response = await fetch(`/friend_request/${toBeFriend}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 201) {
      const sendFriendRequestBtn = document.getElementById("add_friend_btn");
      sendFriendRequestBtn.remove();

      const cancelFRBtn = createButton(
        "Cancel Request",
        ["btn", "btn-danger", "friendship_btn"],
        "cancel_request_btn",
        "cancelFriendRequest()",
        ['fa-user-times', 'me-2']
      );
      const profile_info_container = document.getElementsByClassName(
        "profile_info_container"
      )[0];
      profile_info_container.appendChild(cancelFRBtn);
      return;
    }
    throw new Error("Failed to send friend request");
  } catch (error) {
    createToast({type:'error',error_message:`couldnt send friend request to "${toBeFriend}"`,title:'Failed To Send Friend-Request!'})
  }
}

async function cancelFriendRequest() {
  const toBeFriend = document
    .getElementById("player_username")
    .getAttribute("data-username");
  try {
    const response = await fetch(`/friend_request/${toBeFriend}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      const cancelFRBtn = document.getElementById("cancel_request_btn");
      cancelFRBtn.remove();

      const sendFriendRequestBtn = createButton(
        "Send Request",
        ["btn", "btn-primary", "friendship_btn"],
        "add_friend_btn",
        "addFriendRequest()",
        ['fa-user-plus', 'me-2']
      );
      const profile_info_container = document.getElementsByClassName(
        "profile_info_container"
      )[0];
      profile_info_container.appendChild(sendFriendRequestBtn);
      return;
    }
    throw new Error("Failed to cancel friend request");
  } catch (error) {
    createToast({type:'error',error_message:`couldnt cancel friend request to "${toBeFriend}"`,title:'Failed To Cancel Friend-Request!'})
  }
}

async function acceptOrDeclineFriendRequest(action, toBeFriend) {

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
      const decline_request_btn = document.getElementById(
        "decline_request_btn"
      );

      accept_request_btn.remove();
      decline_request_btn.remove();
      if (action === "accept") {
        const unfriendBtn = createButton(
          "Unfriend",
          ["btn", "btn-danger", "friendship_btn", "me-1", "mb-2"],
          "unfriend_btn",
          "removeFriend()",
          ['fa-user-minus', 'me-2']
        );
        const chatBtn = createButton(
          "Chat",
          ["btn", "btn-dark", "friendship_btn", "mb-2"],
          "chat_btn",
          `create_chatroom('${toBeFriend}')`,
          ['fa-comment-alt', 'me-2']
        );

        const profile_info_container = document.getElementsByClassName(
          "profile_info_container"
        )[0];
        profile_info_container.appendChild(unfriendBtn);
        profile_info_container.appendChild(chatBtn);
        // updating friend count
        const friendCount = document.getElementById("nums_of_friends");
        friendCount.textContent = parseInt(friendCount.textContent) + 1;
      } else {
        const sendFriendRequestBtn = createButton(
          "Send Request",
          ["btn", "btn-primary", "friendship_btn"],
          "add_friend_btn",
          "addFriendRequest()",
          ['fa-user-plus', 'me-2']
        );
        const profile_info_container = document.getElementsByClassName(
          "profile_info_container"
        )[0];
        profile_info_container.appendChild(sendFriendRequestBtn);
      }
      return;
    }
    throw new Error("Failed to accept/decline friend request");
  } catch (error) {
    createToast({type:'error',error_message:`couldnt '${action}' friend request from "${toBeFriend}"`,title:`Failed To ${action} Friend-Request!`})
  }
}

async function removeFriend() {
  const toBeFriend = document
    .getElementById("player_username")
    .getAttribute("data-username");
  try {
    const response = await fetch(`/friend_request/${toBeFriend}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const unfriendBtn = document.getElementById("unfriend_btn");
      const chatBtn = document.getElementById("chat_btn");
      unfriendBtn.remove();
      chatBtn.remove();

      const sendFriendRequestBtn = createButton(
        "Send Request",
        ["btn", "btn-primary", "friendship_btn"],
        "add_friend_btn",
        "addFriendRequest()",
        ['fa-user-plus', 'me-2']
      );
      const profile_info_container = document.getElementsByClassName(
        "profile_info_container"
      )[0];
      profile_info_container.appendChild(sendFriendRequestBtn);
      // updating friend count
      const friendCount = document.getElementById("nums_of_friends");
      friendCount.textContent = parseInt(friendCount.textContent) - 1;
      return;
    }

    throw new Error("Failed to remove friend");
  } catch (error) {
    createToast({type:'error',error_message:`couldnt unfriend friend "${toBeFriend}"`,title:'Failed To Remove Friend!'})
  }
}

/* sending request to create chat room between current user and a friend */
async function create_chatroom(friend_username) {
  try {
    const response = await fetch(`/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": await getCSRFToken(),
      },
      body: JSON.stringify({ recipient: friend_username }),
    });
    if (response.ok)
      await updateUI(`/chat`);
    else
      throw new Error('Error!')
  } catch (error) {
    createToast({type:'error',error_message:`couldnt create chatroom with "${toBeFriend}"`,title:'Failed To Create ChatRoom!'})
  }
}

async function getUserGameHistory(page_number) {
  try {
    const visited_player_username = document.getElementById("player_username").getAttribute("data-username");
    const response = await fetch(`/game_history?player=${visited_player_username}&page=${page_number}`);
    if (response.ok) {
      const data = await response.json();
      document.getElementsByClassName("no-games-message")[0].classList.add("d-none");
      document.getElementById("game_history").classList.remove("d-none");
      document.getElementById("game_history").innerHTML = data.history;
      return
    }
    throw new Error("Failed to get game history");
  } catch (error) {
    createToast({type:'error',error_message:`couldnt get game history`,title:'Error'});
  }
}


async function drawPieChart() {
  if (!document.getElementById("win_lose_stats")) {
    return;
  }
  // Hit the histrory API to get the data
  await getUserGameHistory(1);
  const gamesPlayed = parseInt(document.getElementById("win_lose_stats").getAttribute("data-numsOfGames")) || 0;
  const wins = parseInt(document.getElementById("win_lose_stats").getAttribute("data-numsOfWins")) || 0;
  const losses = parseInt(document.getElementById("win_lose_stats").getAttribute("data-numsOfLoses")) || 0;
  const cancelled = gamesPlayed - (wins + losses);

  // Pie Chart - Percentage of Wins and Losses
  const pieCtx = document.getElementById("game-stats-pie-chart").getContext("2d");
  new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Wins", "Losses", "Cancelled"],
      datasets: [
        {
          data: [wins, losses, cancelled],
          backgroundColor: ["green", "red", "yellow"], // Green for wins, red for losses, yellow for cancelled
          borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)", "rgba(255, 205, 86, 1)"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true, // Ensure proper scaling
      aspectRatio: 1.2, // Adjust aspect ratio for smaller height
      plugins: {
        legend: {
          position: "bottom", // Position the legend at the bottom
          labels: {
            usePointStyle: true, // Use small circles instead of squares for labels
            boxWidth: 10, // Adjust the size of the point style
            padding: 15, // Add spacing between labels
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = wins + losses + cancelled;
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: ${percentage}% (${context.raw})`;
            },
          },
        },
      },
      layout: {
        padding: {
          bottom: 20, // Add padding between the chart and the legend
        },
      },
    },
  });
}


// bargraph for game catagory stats for AI, 1v1, and tournament
function drawBarGraph() {
  if (!document.getElementById("game_type_stat")) {
    return;
  }

  const ai = parseInt(document.getElementById("game_type_stat").getAttribute("data-numsOfAIGames")) || 0;
  const one_vs_one = parseInt(document.getElementById("game_type_stat").getAttribute("data-numsOf1v1Games")) || 0;
  const tournament = parseInt(document.getElementById("game_type_stat").getAttribute("data-numsOfTournament")) || 0;

  // Bar Chart - Game Type Stats
  const barCtx = document.getElementById("game-type-bar-chart").getContext("2d");

  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["AI", "1v1", "Tournament"],
      datasets: [
        {
          label: "Games Played",
          data: [ai, one_vs_one, tournament],
          backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
          borderColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Games Played",
            color: "#84ddfc",
            font: {
              size: 16,
            },
          },
          ticks: {
            color: "#ffffff",
            stepSize: 1,
          },
          grid: {
            display: false,
          },
        },
        x: {
          title: {
            display: true,
            text: "Game Type",
            color: "#84ddfc",
            font: {
              size: 16,
            },
          },
          ticks: {
            color: "#ffffff",
          },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}



// Stat charts
drawPieChart();
drawBarGraph();
