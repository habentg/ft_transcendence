createNotificationSocket();
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



searchingSystem();
