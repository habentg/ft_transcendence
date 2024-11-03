document.getElementById("searchIcon").addEventListener("click", (event) => {
  const query = document.getElementById("searchInput").value;
  console.log("uppp This: ", query);
  if (query) {
    console.log("searching for: ", query);
    loadProfile(query);
  } else console.log("your search is empty");
});

// load content of the player profile
async function loadProfile(username) {
  if (!username) {
    console.error("No username provided");
    return;
  }
  try {
    const response = await fetch(`search?username=${username}`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        'action': 'all_players'
      },
      // body: JSON.stringify({'action': 'all_players'}),  // Browser said it wont send 'body' in GET request, so I put it in headers
    });
    if (response.ok) {
      history.pushState({ username }, "", `/search?username=${username}`);
      const responseData = await response.json();
      const resultsDiv = document.getElementById("searchResults");
      resultsDiv.innerHTML = responseData.html;
    }

  } catch (error) {
    console.error(`Failed to load -- ${username} -- profile content:`, error);
  }
}
