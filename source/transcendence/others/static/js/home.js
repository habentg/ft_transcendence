
// load content of the player profile
async function search(query_parameter) {
  if (!query_parameter) {
    console.error("No query_parameter provided");
    return;
  }
  try {
    const response = await fetch(`search?q=${query_parameter}`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
      // body: JSON.stringify({'action': 'all_players'}),  // Browser said it wont send 'body' in GET request, so I put it in headers
    });
    if (response.ok) {
      history.pushState({ query_parameter }, "", `/search?q=${query_parameter}`);
      const responseData = await response.json();
      const resultsDiv = document.getElementById("searchResults");
      resultsDiv.innerHTML = responseData.html;
      loadCssandJS(responseData, false);
      attachSearchEventListners();
    }
    else if (response.status === 302) {
      updateUI("/signin", false);
    }else {
      console.error("Failed to load -- ", query_parameter, "-- search content");
    }
    

  } catch (error) {
    console.error(`Failed to load -- ${query_parameter} -- profile content:`, error);
  }
}

/* 
for searched profiles, we need to attach event listeners to the buttons
*/



function searchingSystem() {

  document.getElementById("friend_requests_btn").addEventListener("click", () => {
    search("friend_requests")
  }
  );
  document.getElementById("friends_btn").addEventListener("click", () => {
    search("friends")
  }
  );
  document.getElementById("searchIcon").addEventListener("click", (event) => {
    const query = document.getElementById("searchInput").value;
    console.log("uppp This: ", query);
    if (query) {
      console.log("searching for: ", query);
      search(query);
    } else console.log("your search is empty");
  });

}

function attachSearchEventListners() {
  
  /* after search result is added */
  /* 
    @ acceptFriendRequestBtn: 
    - attaching event listeners to the acceptFriendRequest buttons
    - when clicked, it will send a request to the server to accept the friend request
    - the 'false' paramenter is just boolean to indicate that the request is not from the friend profile page
  */
    const acceptFriendRequestBtn = document.getElementsByClassName("acc_req_btn"); // could be multiple
    if (acceptFriendRequestBtn) {
      for (let i = 0; i < acceptFriendRequestBtn.length; i++) {
        acceptFriendRequestBtn[i].addEventListener("click", () => {
          const toBeFriend = document
          .getElementsByClassName("acc_req_btn")[i]
          .getAttribute("data-username");
          console.log("accepting friend request from: ", toBeFriend);
          acceptOrDeclineFriendRequest("accept", toBeFriend, false);
        });
      }
    }
    const declineFriendRequestBtn = document.getElementsByClassName("rej_req_btn"); // could be multiple
    if (declineFriendRequestBtn) {
      for (let i = 0; i < declineFriendRequestBtn.length; i++) {
        declineFriendRequestBtn[i].addEventListener("click", () => {
          const toBeFriend = document
          .getElementsByClassName("rej_req_btn")[i]
          .getAttribute("data-username");
          console.log("declineing friend request from: ", toBeFriend);
          acceptOrDeclineFriendRequest("decline", toBeFriend, false);
        });
      }
    }
}


// Sign Out Modal
function showSignOutModal() {
  const existingModal = document.getElementById("sign-out-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "sign-out-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="content modal-content">
        <div class="modal-header border-0 py-3">
          <h5 class="modal-title text-info">
            <i class="fas fa-sign-out-alt me-2"></i>Sign Out
          </h5>
          <button type="button" class="btn-close btn-close-white" id="close-signout-modal"></button>
        </div>
        <div class="modal-body px-3 py-2">
          <p class="text-white mb-0">Are you sure you want to sign out?</p>
        </div>
        <div class="modal-footer border-0 py-3">
          <button id="signout-confirm" class="btn btn-info btn-sm">
            <i class="fas fa-sign-out-alt me-2"></i>Sign Out
          </button>
          <button id="signout-cancel" class="btn btn-outline-light btn-sm">
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
    .querySelector("#close-signout-modal")
    .addEventListener("click", closeSignOutModal);
  modal
    .querySelector("#signout-cancel")
    .addEventListener("click", closeSignOutModal);
  modal
    .querySelector("#signout-confirm")
    .addEventListener("click", handleSignOut);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeSignOutModal();
  });
}

function closeSignOutModal() {
  const modal = document.getElementById("sign-out-modal");
  if (modal) {
    modal.remove();
    document.body.classList.remove("modal-open");
  }
}

async function handleSignOut() {
  try {
    const response = await fetch("/signout/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": await getCSRFToken(),
      },
    });

    if (response.status === 200) {
      closeSignOutModal();
      updateNavBar(false); 
      await updateUI("/", false);
    } else {
      throw new Error("Failed to sign out");
    }
  } catch (error) {
    console.error("Error:", error);
    displayError({ error_msg: "Failed to sign out" });
  }
}

searchingSystem();
