/* Me is trying to prevent double request */
let isInitialLoad = true;

// function to update the UI
/* 
    updates the URL in the browser based on:
        - prevent double request;
        - if the route is deep or not;
        - calls a function to load the content of the page;
*/

async function updateUI(path, deep_route) {
  if (isInitialLoad) {
    isInitialLoad = false;
    return;
  }
  console.log("updateUI() of:", path);
  if (deep_route)
    history.pushState(null, "", `${path}`);
  else
    history.pushState(null, "", `${window.baseUrl}${path}`);
  await loadContent(`${window.baseUrl}${path}`);
}

// routing function
/* 
    for click events;
    creates URL obj with the "href" form the <a>;
    path extration from the URL obj;
    if the path is the same as the current path, do nothing - avoiding unnecessary requests;
    then update the UI;
*/
async function appRouter(event) {
    event = event || window.event;
    event.preventDefault();
    
    // let href = event.target.href;
    // Now you can use the href or other logic to route internally
    const href = event.target.closest('a').href;
    let urlObj = new URL(href);
    let path = urlObj.pathname;
    if (path === window.location.pathname)
        return;
    await updateUI(path, false);
};


let account_routes = [
  "signin",
  "signup",
  "signout",
  "forgot-password",
  "reset-password",
  "setting",
];
let game_routes = ["game", "leaderboard", "game-history", "game-detail"];
let user_routes = ["profile", "setting", "change-password", "delete-account"];
let friend_routes = ["friends", "friend-request"];
let other_routes = ["home", "about", "contact", "404", "tos", "privacy"];

function determineRoute(route) {
  if (route === "" || route === "/") route = "home";
  if (account_routes.includes(route)) route = "account/" + route;
  // accountRouter(route);
  else if (game_routes.includes(route)) route = "game/" + route;
  else if (user_routes.includes(route)) route = "user/" + route;
  else if (friend_routes.includes(route)) route = "friend/" + route;
  else if (other_routes.includes(route)) route = route;
  //    othersRouter(route);
  else route = "other/404";
  return route;
}

// Load the content of the page
async function loadContent(route) {
  try {
    const response = await fetch(`${route}/`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    // signout is a special case
    if (route === `${window.baseUrl}/signout`) {
      // Remove any CSS/JS if necessary
      removeResource();
      // Update the navbar
      updateNavBar(true);
      // Update the history state
      console.log("Signing out");
      await updateUI("/", false);
      return;
    }

    if (!response.ok) {
      // may be we will handle other error codes later
      // if the response is a redirect, then redirect the user to the new location
      if (response.status === 302) {
        const data = await response.json();
        console.log("Redirecting to:", data["redirect"]);
        history.pushState(null, "", data["redirect"]);
        handleLocationChange();
        return;
      }
      if (response.status === 401) {
        // removing any css js if there is any
        console.log("Unauthorized, asdf asdf asfd");
        return;
      }
      throw new Error("HTTP " + response.status);
    }
    let data = await response.json();
    loadCssandJS(data, true); // load the css and js of the page - remove the previous ones(true)
    document.title = data.title;
    document.getElementById("content").innerHTML = data.html;
    // if (route === "profile") {
    //   console.log("attachFriendEventListners for profile");
    //   attachFriendEventListners();
    // }
  } catch (error) {
    console.error(`Failed to load -- ${route} -- page content:`, error);
  }
}

// actual function to change the content of the page
/*
    extract the path from the browser URL;
    load the content of the page;
    NOTE: this will be used almost everywhere in this SPA;
*/
async function handleLocationChange() {
  let path = window.location.pathname.slice(1);

  if (isInitialLoad) {
    isInitialLoad = false;
    return;
  }
  console.log("handleLocationChange() of:", path);
  await loadContent(path);
}

async function initApp() {
  // Handle initial load and browser back/forward buttons
  window.addEventListener("popstate", async () => {
    await handleLocationChange();
  });

  // Handle initial load
  window.addEventListener("load", async () => {
    isInitialLoad = true;
    await handleLocationChange();
  });
  window.baseUrl = "http://localhost";
}

initApp();
