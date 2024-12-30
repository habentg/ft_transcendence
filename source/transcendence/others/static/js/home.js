createWebSockets();

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

    if (response.status === 205) {
      updateUI("/home");
      return ;
    }
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
      attachSearchEventListners();
      loadCssandJS(responseData, false);
    }
    else if (response.status === 302) {
      updateUI("/signin");
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

  // const localGameBtn = document.getElementById("localGameBtn");
  // const createTournamentBtn = document.getElementById("createTournamentBtn");

  // if (localGameBtn) {
  //   localGameBtn.addEventListener("click", () => {
  //     createLocalGameModal();
  //   });
  // }

  // if (createTournamentBtn) {
  //   createTournamentBtn.addEventListener("click", () => {
  //     createTournamentModal();
  //   });
  // }
  /* search related eventlistners */
  // createToast("error", "This is a test ", "This is an error toast message");
  // createToast("chat", "This is a test ", "This is an chat toast message");
  const home_friendrequest_search = document.getElementById("friend_requests_btn");
  const home_friends_search = document.getElementById("friends_btn");
  if (home_friendrequest_search) {
    home_friendrequest_search.addEventListener("click", () => {
      search("friend_requests")
    });
  }
  if (home_friends_search) {
    home_friends_search.addEventListener("click", () => {
      search("friends")
    });
  }
  const home_searchIcon = document.getElementById("searchIcon");
  if (home_searchIcon) {
    home_searchIcon.addEventListener("click", () => {
      triggerSearch();
    });
  }
  const home_searchInputField = document.getElementById("searchInput");
  if (home_searchInputField) {

    home_searchInputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        triggerSearch();
      }
    });
  }
  /* pagination next and prev fetchers */
  const pagination_nextBtn = document.getElementById("nextPage");
  if (pagination_nextBtn) {
    pagination_nextBtn.addEventListener("click", async () => {
      const nextPageUrl = document.getElementById("nextPage").getAttribute("data-url");
      await search("", nextPageUrl);
    });
  }
  const pagination_prevBtn = document.getElementById("prevPage");
  if (pagination_prevBtn) {
    pagination_prevBtn.addEventListener("click", async () => {
      const prevPageUrl = document.getElementById("prevPage").getAttribute("data-url");
      await search("", prevPageUrl);
    });
  }

}

function triggerSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    search(query);
  } else {
    createToast({type:"error", title:"Empty search", error_message:"Please enter a search query"});
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
  // const acceptFriendRequestBtn = document.getElementsByClassName("acc_req_btn"); // could be multiple
  // if (acceptFriendRequestBtn) {
  //   for (let i = 0; i < acceptFriendRequestBtn.length; i++) {
  //     acceptFriendRequestBtn[i].addEventListener("click", (event) => {
  //       event.stopPropagation()
  //       const toBeFriend = document
  //         .getElementsByClassName("acc_req_btn")[i]
  //         .getAttribute("data-username");
  //       // console.log("accepting friend request from: ", toBeFriend);
  //       searchedFriendRequestResponce(event, "accept", toBeFriend);
  //       console.log("R: ", toBeFriend);
  //     });
  //   }
  // }
  // const declineFriendRequestBtn = document.getElementsByClassName("rej_req_btn"); // could be multiple
  // if (declineFriendRequestBtn) {
  //   for (let i = 0; i < declineFriendRequestBtn.length; i++) {
  //     declineFriendRequestBtn[i].addEventListener("click", (event) => {
  //       event.stopPropagation();
  //       const toBeFriend = document
  //       .getElementsByClassName("rej_req_btn")[i]
  //       .getAttribute("data-username");
  //       // console.log("declineing friend request from: ", toBeFriend);
  //       searchedFriendRequestResponce(event, "decline", toBeFriend);
  //       // alert(" --- sfa -- asdf -as ")
  //       console.log("R: ", toBeFriend);
  //     });
  //   }
  // }
  const chatFriendBtn = document.getElementsByClassName("chat_btn"); // could be multiple
  if (chatFriendBtn) {
    for (let i = 0; i < chatFriendBtn.length; i++) {
      chatFriendBtn[i].addEventListener("click", async () => {
        const toBeFriend = document
          .getElementsByClassName("chat_btn")[i]
          .getAttribute("data-username");
        console.log("I will send create chatroom request directly from friendlist with: ", toBeFriend);
        // await create_chatroom(toBeFriend);
      });
    }
  }
}



// Create a modal for Local game either with AI or with another player
function createLocalGameModal() {
  // e.preventDefault();
  const existingModal = document.getElementById("localGameModal");
  if (existingModal) {
    existingModal.remove();
  }

  optionLocalGameModal();

  // const modal = optionLocalGameModal();
  // document.body.appendChild(modal);

  // // Event Listeners
  // document.getElementById("aiGameBtn").addEventListener("click", () => {
  //   //  Send to AI game page (1 vs AI)
  //   console.log("Creating AI game");
  //   closeModal("localGameModal");
  //   // For now, page is refreshing. Need to fix.
  //   // window.location.href = "/game/?isAI=true";

  // });
  // document.getElementById("playFriends").addEventListener("click", () => {
  //   // Send to localgame game page (1 vs 1)
  //   console.log("Creating local game");
  //   closeModal("localGameModal");

  //   // For now, page is refreshing. Need to fix.
  //   // updateUI("/game?isAI=false");
  //   // window.location.href = "/game/?isAI=false";
  // });

  // // close the modal when the close button is clicked
  // document.querySelector("#localGameModal .btn-close").addEventListener("click", () => {
  //   closeModal("localGameModal");
  // });

  // // close the modal when the modal is clicked outside
  // modal.addEventListener("click", (event) => {
  //   if (event.target === modal) {
  //     closeModal("localGameModal");
  //   }
  // });

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



/* Game Api tester */
async function gameApiPATCHFunction(endgame_data, game_id) {
  try {
    const response = await fetch(`/game_api/${game_id}/`, {
      method: "PATCH",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": await getCSRFToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(endgame_data),
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      return;
    }
    throw new Error("Failed to load gameApiPATCHFunction");
  } catch (error) {
    console.error("ERROR: ", error);
  }
}
async function gameApiPOSTFunction(startgame_data) {
  try {
    const response = await fetch("/game_api/", {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": await getCSRFToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(startgame_data),
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      return;
    }
    throw new Error("Failed to load gameApiPOSTFunction");
  } catch (error) {
    console.error("ERROR: ", error);
  }
}

async function gameApiDELETEFunction(game_id) {
  try {
    const response = await fetch(`/game_api/${game_id}/`, {
      method: "DELETE",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      return;
    }
    throw new Error("Failed to load gameApiDELETEFunction");
  } catch (error) {
    console.error("ERROR: ", error);
  }
}
async function gameApiGETFunction() {
  try {
    const response = await fetch("/game_api/", {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      return;
    }
    throw new Error("Failed to load gameApiGETFunction");
  } catch (error) {
    console.error("ERROR: ", error);
  }
}

async function GameApiTester() {
  /* Get request - to get all history */
  const data = {
    player_two: "martin",
    type: "TOURNAMENT",
  };
  const endgame_data = {
    outcome: "CANCELLED",
  };

  await gameApiGETFunction();
  
  // await gameApiPOSTFunction(data);
  
  // await gameApiPATCHFunction(endgame_data, 5);

  // await gameApiDELETEFunction(1);
}
