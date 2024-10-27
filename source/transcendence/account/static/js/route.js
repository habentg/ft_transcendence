/* Me is trying to prevent double request */
let isInitialLoad = true;

// function to update the UI
/* 
    updates the URL in the browser based on:
        - if the route is deep or not;
    calls the handleLocationChange function;
*/
function updateUI(path, deep_route) {
  console.log("Routing to:", path);
  if (deep_route) history.pushState(null, "", `${path}`);
  else history.pushState(null, "", `${window.baseUrl}${path}`);
  handleLocationChange();
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
  await loadContent(path);
}

// routing function
/* 
    for click events;
    creates URL obj with the "href" form the <a>;
    path extration from the URL obj;
    if the path is the same as the current path, do nothing - avoiding unnecessary requests;
    then update the UI;
*/
function appRouter(event) {
    event = event || window.event;
    event.preventDefault();
    
    let href = event.target.href;
    let urlObj = new URL(href);
    let path = urlObj.pathname;
    console.log("AppRoute - Routing to:", urlObj);
    if (path === window.location.pathname)
        return;
    console.log("AppRoute - Routing to:", path);
    updateUI(path, false);
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
  // // bunch of ifs to correcly route to the correct "App" in django
  // const route = determineRoute(route);
  
  try {
    const response = await fetch(`${route}/`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    // signout is a special case
    if (route === "signout") {
      // Remove any CSS/JS if necessary
      removeResource();

      
      // Select the navbar element
      const navbar = document.getElementById("navbarNavDropdown");
      
      // Update the navbar for unauthenticated users
      navbar.innerHTML = `
      <ul class="navbar-nav ms-auto">
      <li class="nav-item">
      <a onclick="appRouter()" class="nav-link mx-2" href="home">Home</a>
      </li>
      <li class="nav-item">
      <a onclick="appRouter()" class="nav-link mx-2" href="signin">Sign in</a>
      </li>
      <li class="nav-item">
      <a onclick="appRouter()" class="nav-link mx-2" href="signup">Sign up</a>
      </li>
      </ul>
      `;
      // Handle any additional logic for location change
      // Update the history state
      updateUI("/", false);
      return;
    }

    console.log("Loading content for:", route, "Response:", response);
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
    loadCssandJS(data);
    document.title = data.title;
    document.getElementById("content").innerHTML = data.html;
  } catch (error) {
    console.error(`Failed to load -- ${route} -- page content:`, error);
  }
}

async function initApp() {
  // Handle initial load and browser back/forward buttons
  window.addEventListener("popstate", handleLocationChange);

  // Handle initial load
  window.addEventListener("load", async () => {
    isInitialLoad = true;
    await handleLocationChange();
  });
  window.baseUrl = "http://localhost";
}

initApp();
