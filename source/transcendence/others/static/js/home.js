
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
    if (response.status === 205)
      updateUI("/home", false);
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

  const localGameBtn = document.getElementById("localGameBtn");
  const createTournamentBtn = document.getElementById("createTournamentBtn");

  if (localGameBtn) {
    localGameBtn.addEventListener("click", () => {
      createLocalGameModal();
    });
  }

  if (createTournamentBtn) {
    createTournamentBtn.addEventListener("click", () => {
      createTournamentModal();
    });
  }

  document.getElementById("friend_requests_btn").addEventListener("click", () => {
    search("friend_requests")
  }
  );
  document.getElementById("friends_btn").addEventListener("click", () => {
    search("friends")
  }
  );
  document.getElementById("searchIcon").addEventListener("click", (event) => {
    triggerSearch();
  });

  document.getElementById("searchInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
          triggerSearch();
      }
  });

}

function triggerSearch() {
  const query = document.getElementById("searchInput").value;
  console.log("uppp This: ", query);
  if (query) {
      console.log("searching for: ", query);
      search(query);
  } else {
      console.log("your search is empty");
  }
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


// Create a modal for Local game either with AI or with another player
function createLocalGameModal() {
  const existingModal = document.getElementById("localGameModal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "localGameModal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.innerHTML = `
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content">
      <div class="modal-header border-0 py-3">
        <h5 class="modal-title">
          <i class="fas fa-gamepad me-2"></i> Local Game
        </h5>
        <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
      </div>
      <div class="modal-body px-3 py-2">
        <div id="local-game-error-msg" class="alert alert-danger small py-2" style="display:none;"></div>
        <p class="text-white mb-0">Choose who you'd like to play:</p>
      </div>
      <div class="modal-footer border-0 py-3 d-flex justify-content-start">
        <button type="button" class="btn btn-primary btn-sm me-2" id="aiGameBtn">
          <i class="fas fa-robot me-2"></i> Play with AI
        </button>
        <button type="button" class="btn btn-outline-light btn-sm" id="localGameBtn">
          Play with a friend
        </button>
      </div>
    </div>
  </div>
  `;

  document.body.appendChild(modal);

  // Event Listeners
  document.getElementById("localGameBtn").addEventListener("click", () => {
    // 
  });
  document.getElementById("aiGameBtn").addEventListener("click", () => {
    //  
  });

  // close the modal when the close button is clicked
  document.querySelector("#localGameModal .btn-close").addEventListener("click", () => {
    closeLocalGameModal();
  });

  // close the modal when the modal is clicked outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeLocalGameModal();
    }
  }); 

}

// Create a modal for creating a tournament
function createTournamentModal() {
  const existingModal = document.getElementById("tournamentModal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "tournamentModal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.innerHTML = `
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content">
      <div class="modal-header border-0 py-3">
        <h5 class="modal-title">
          <i class="fas fa-trophy me-2"></i> Create Tournament
        </h5>
        <button type="button" class="btn-close btn-close-white" data-dismiss="modal"></button>
      </div>
      <div class="modal-body px-3 py-2">
        <div id="local-game-error-msg" class="alert alert-danger small py-2" style="display:none;"></div>
        <p class="text-white mb-0">Enter number of player in tournament</p>
        <input type="int" id="playersNumber" class="form-control my-2" placeholder="Enter number of players" />
        <small class="notice mt-2 d-block">Minimum players: 4 | Max players: 8</small>
      </div>
      <div class="modal-footer border-0 py-3 d-flex justify-content-start">
        <button type="button" class="btn btn-primary btn-sm" id="submitPlayerNumBtn">
          <i class="fas fa-paper-plane me-2"></i> Submit
      </button>
    </div>
    </div>
  </div>
  `;

  document.body.appendChild(modal);

  // Event Listeners
  document.getElementById("submitPlayerNumBtn").addEventListener("click", () => {
    const playersNumber = document.getElementById("playersNumber").value;
    console.log("Creating tournament with ", playersNumber, " players");
    // createTournament(playersNumber);
    closeTournamentModal();
  });

  // close the modal when the close button is clicked
  document.querySelector("#tournamentModal .btn-close").addEventListener("click", () => {
    closeTournamentModal();
  });

  // close the modal when the modal is clicked outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeTournamentModal();
    }
  }); 

}

// close the local game modal
function closeLocalGameModal() {
  const modal = document.getElementById("localGameModal");
  if (modal) {
      modal.remove();
      document.body.classList.remove("modal-open");
  }
}

function closeTournamentModal() {
  const modal = document.getElementById("tournamentModal");
  if (modal) {
      modal.remove();
      document.body.classList.remove("modal-open");
  }
}

searchingSystem();
