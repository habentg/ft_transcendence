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
    // const response = await fetch(`profile/${username}`, {
    //   method: "GET",
    //   headers: {
    //     "X-Requested-With": "XMLHttpRequest",
    //   },
    // });
    // if (!response.ok) {
    //   // user not found
    //   if (response.status === 404) {
    //     updateUI(`/`, false);
    //     return;
    //   }
    //   throw new Error("HTTP " + response.status);
    // }
    // let data = await response.json();
    // document.getElementById("content").innerHTML = data.html;
    // history.pushState(
    //   { username: username },
    //   "",
    //   `/profile/${username}`
    // );
    document.title = `${username} - Profile Page`;
    updateUI(`/profile/${username}`, true);
    // history.pushState("", "", `/profile/${username}`);
    // handleLocationChange();

  } catch (error) {
    console.error(`Failed to load -- ${username} -- profile content:`, error);
  }
}
