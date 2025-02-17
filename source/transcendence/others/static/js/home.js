createWebSockets();

// load content of the player profile
async function search(query_parameter, url) {
  let route_url = `/paginated_search?q=${query_parameter}`;
  // url = 'http://localhost/paginated_search?page=4&q=k';
  if (url !== undefined) {
    const fullUrl = new URL(url);
    route_url = fullUrl.pathname + fullUrl.search; // Extract the relative path and query string
  }
  try {
    const response = await fetch(route_url.slice(1), {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (response.status === 205) {
      updateUI("/home");
      return;
    }
    if (response.ok) {
      const responseData = await response.json();
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
      createToast({ type: "error", title: "Error", error_message: "Failed to load search content" });
    }

  } catch (error) {
    createToast({ type: "error", title: "Error", error_message: "Failed to load profile content" });
  }
}

/* 
for searched profiles, we need to attach event listeners to the buttons
*/



function searchingSystem() {

  // const home_friendrequest_search = document.getElementById("friend_requests_btn");
  // const home_friends_search = document.getElementById("friends_btn");
  // if (home_friendrequest_search) {
  //   home_friendrequest_search.addEventListener("click", () => {
  //     search("friend_requests")
  //   });
  // }
  // if (home_friends_search) {
  //   home_friends_search.addEventListener("click", () => {
  //     search("friends")
  //   });
  // }
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
  if (!query || query.length > 100) {
    createToast({ type: "error", title: "Invalid Search", error_message: "Search parameter should be > 0 and < 150 chars" });
    document.getElementById("searchResults").classList.add("d-none")
  } else {
    search(query);
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
  const chatFriendBtn = document.getElementsByClassName("chat_btn"); // could be multiple
  if (chatFriendBtn) {
    for (let i = 0; i < chatFriendBtn.length; i++) {
      chatFriendBtn[i].addEventListener("click", async () => {
        const toBeFriend = document
          .getElementsByClassName("chat_btn")[i]
          .getAttribute("data-username");
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
}

function initHome() {
  searchingSystem();
  const createtournamentBtn = document.getElementById("createTournamentBtn");

  if (createtournamentBtn) {
    createtournamentBtn.addEventListener("click", async () => {
      if (!isInDesktop()) {
        createToast({ type: "error", title: "Mobile not supported!!!!", error_message: "Please use a desktop to create a tournament!" });
        return;
      }
      await updateUI("/tournament");
    });
  }

  const localGameBtn = document.getElementById("localGameBtn");

  if (localGameBtn) {
    localGameBtn.addEventListener("click", async () => {
      if (!isInDesktop()) {
        createToast({ type: "error", title: "Mobile not supported!!!!", error_message: "Please use a desktop to play a game!" });
        return;
      }
      createLocalGameModal();
    });
  }

  const nav_profile_pic = document.getElementById("nav_profile_pic");
  if (nav_profile_pic) {
    localStorage.setItem("profile_pic", `${nav_profile_pic.dataset.pfp}`);
    localStorage.setItem("username", `${nav_profile_pic.dataset.username}`);
  }
  const anon_pfp = document.getElementById("anon_pic");
  if (anon_pfp) {
    localStorage.setItem("profile_pic", `${anon_pfp.dataset.pfp}`);
    localStorage.setItem("username", `${anon_pfp.dataset.username}`);
    updateNavBar(true);
  }
}

initHome();
