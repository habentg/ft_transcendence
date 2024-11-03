
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
    }

  } catch (error) {
    console.error(`Failed to load -- ${query_parameter} -- profile content:`, error);
  }
}


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

searchingSystem();
