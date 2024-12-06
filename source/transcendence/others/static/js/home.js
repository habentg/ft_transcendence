createNotificationSocket();
// load content of the player profile
async function search(query_parameter, url) {
  let route_url = `/paginated_search?q=${query_parameter}`;
  // url = 'http://localhost/paginated_search?page=4&q=k';
  if (url !== undefined) {
    const fullUrl = new URL(url);
    route_url = fullUrl.pathname + fullUrl.search; // Extract the relative path and query string
  }
  console.log("route_url: ", route_url);
  try {
    const response = await fetch(route_url.slice(1), {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (response.status === 205)
      updateUI("/home", false);
    if (response.ok) {
      // history.pushState({ query_parameter }, "", route_url);
      const responseData = await response.json();
      // console.log(responseData);
      /* activating the div */
      document.getElementById("searchResults").classList.remove("d-none");
      /* filling up the result to the inner div */
      const resultsDiv = document.getElementById("search_list");
      resultsDiv.innerHTML = responseData.html;
      /* updating next and prev butons */

      if (responseData.total_items === 0) {
        document.getElementById("pagination_navigation").classList.add("d-none");
        return;
      }
      document.getElementById("pagination_navigation").classList.remove("d-none");
      const nextPageBtn = document.getElementById("nextPage");
      nextPageBtn.classList.remove("disabled");
      const prevPageBtn = document.getElementById("prevPage")
      prevPageBtn.classList.remove("disabled");
      nextPageBtn.setAttribute("data-url", responseData.next_page_link);
      prevPageBtn.setAttribute("data-url", responseData.previous_page_link);
      /* updating whats in bitween buttons lmao GIGGDY */
      document.getElementById("current_page").textContent = responseData.current_page;
      if (responseData.next_page_link === null) {
        nextPageBtn.classList.add("disabled");
      }
      document.getElementById("total_pages").textContent = responseData.total_pages;
      if (responseData.previous_page_link === null) {
        prevPageBtn.classList.add("disabled");
      }
      loadCssandJS(responseData, false);
      attachSearchEventListners();
      loadCssandJS(responseData, false);
    }
    else if (response.status === 302) {
      updateUI("/signin", false);
    } else {
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
  document.getElementById("searchIcon").addEventListener("click", () => {
    triggerSearch();
  });

  document.getElementById("searchInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      triggerSearch();
    }
  });
  /* pagination next and prev fetchers */
  document.getElementById("nextPage").addEventListener("click", async () => {
    const nextPageUrl = document.getElementById("nextPage").getAttribute("data-url");
    await search("", nextPageUrl);
  });
  document.getElementById("prevPage").addEventListener("click", async () => {
    const prevPageUrl = document.getElementById("prevPage").getAttribute("data-url");
    await search("", prevPageUrl);
  });

}

function triggerSearch() {
  const query = document.getElementById("searchInput").value;
  if (query) {
    search(query.trim());
  } else {
    document.getElementById("searchResults").classList.add("d-none")
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

  
  const modal = optionLocalGameModal();
  document.body.appendChild(modal);

  // Event Listeners
  document.getElementById("aiGameBtn").addEventListener("click", () => {
    //  Send to AI game page (1 vs AI)
    console.log("Creating AI game");
    closeModal("localGameModal");
  });
  document.getElementById("playFriends").addEventListener("click", () => {
    // Send to localgame game page (1 vs 1)
    console.log("Creating local game");
    closeModal("localGameModal");
  });

  // close the modal when the close button is clicked
  document.querySelector("#localGameModal .btn-close").addEventListener("click", () => {
    closeModal("localGameModal");
  });

  // close the modal when the modal is clicked outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal("localGameModal");
    }
  }); 

}

// Create a modal for creating a tournament
function createTournamentModal() {
  const existingModal = document.getElementById("tournamentModal");
  if (existingModal) {
    existingModal.remove();
  }

  
  const modal = getPlayerNumberModal();
  document.body.appendChild(modal);

  // Event Listeners
  document.getElementById("submitPlayerNumBtn").addEventListener("click", () => {
    const playersNumber = document.getElementById("playersNumber").value;
    console.log("Creating tournament with ", playersNumber, " players");
    // createTournament(playersNumber);
    closeModal("tournamentModal");
  });

  // close the modal when the close button is clicked
  document.querySelector("#tournamentModal .btn-close").addEventListener("click", () => {
    closeModal("tournamentModal");
  });

  // close the modal when the modal is clicked outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal("tournamentModal");
    }
  }); 

}

searchingSystem();
