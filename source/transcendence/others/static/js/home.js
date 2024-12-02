createNotificationSocket();
// load content of the player profile
async function search(query_parameter, page = 1, url = None) {
  try {
    let response;
    if (url)
      response = await fetch(url);
    else
      response = await fetch(`search?q=${query_parameter}&page=${page}`);
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
  /* pagination next and prev getter */
  document.getElementById("nextPage").addEventListener("click", async () => {
    const nextPageUrl = document.getElementById("nextPage").getAttribute("data-url");
    await paginated_search(nextPageUrl);
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


async function paginated_search(url = None) {
  const query_parameter = 'a'; // Example search query
  try {
    // if (url)
    const response = await fetch(`paginated_search?q=${query_parameter}`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    // Handle the 205 Reset Content response
    if (response.status === 205) {
      updateUI("/home", false);
      return; // Exit the function after handling this case
    }

    // Check if the response is OK (status 200-299)
    if (response.ok) {
      history.pushState({ query_parameter }, "", `/paginated_search?q=${query_parameter}`);
      const responseData = await response.json();
      console.log(responseData);

      const resultsDiv = document.getElementById("search_list");
      resultsDiv.innerHTML = ''; // Clear previous results

      // Loop through the results and create player cards
      responseData.results.forEach(player => {
        const new_player = `
          <div class="player-card content mb-3">
            <a onclick="appRouter()" href="/profile/${player.username}" class="w-100 text-decoration-none">
              <div class="d-flex align-items-center p-3">
                <div class="player-avatar">
                  <img src="${player.profile_picture ? player.profile_picture.url : '/static/images/default_profile_pic.jpeg'}" alt="Profile Picture" class="rounded-circle" style="width: 60px; height: 60px;" />
                </div>
                <div class="player-info ms-3 flex-grow-1">
                  <h5 class="mb-1" style="color: #84ddfc;">${player.username}</h5>
                  <p class="mb-0">${player.full_name}</p>
                </div>
              </div>
            </a>
          </div>`;
        resultsDiv.insertAdjacentHTML('beforeend', new_player); // Use insertAdjacentHTML to append the new player card
      });

    } else if (response.status === 302) {
      updateUI("/signin", false);
    } else {
      console.error("Failed to load -- ", query_parameter, "-- search content");
    }

  } catch (error) {
    console.error(`Failed to load -- ${query_parameter} -- profile content:`, error);
  }
}

searchingSystem();
