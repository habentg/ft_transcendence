document.getElementById("searchIcon").addEventListener("click", (event) => {
  const query = document.getElementById("searchInput").value;
  console.log("This: ", query);
  if (query) {
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
    const response = await fetch(`player_profile/${username}`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    let data = await response.json();
    document.title = `${username} - Profile Page`;
    document.getElementById("content").innerHTML = data.html;
    history.pushState(
      { username: username },
      "",
      `/player_profile/${username}`
    );
  } catch (error) {
    console.error(`Failed to load -- ${username} -- profile content:`, error);
  }
}
