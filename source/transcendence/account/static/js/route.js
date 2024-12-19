/* Me is trying to prevent double request */
window.isInitialLoad = true;

// function to update the UI
/* 
    updates the URL in the browser based on:
        - prevent double request;
        - if the route is deep or not;
        - calls a function to load the content of the page;
*/

async function updateUI(path) {
  if (isInitialLoad) {
    isInitialLoad = false;
    return;
  }
  if (!path.includes(`${window.location.origin}`))
    path = `${window.location.origin}${path}`;
  history.pushState(null, "", `${path}`);
  await loadContent(`${path}`);
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

  const href = event.target.closest('a').href;
  if (href === window.location.href)
    return;
  await updateUI(href);
};

// Load the content of the page
async function loadContent(route) {
  try {
    const response = await fetch(`${route}`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

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
    // history.replaceState(null, "", response.url);
    let data = await response.json();
    loadCssandJS(data, true); // load the css and js of the page - remove the previous ones(true)
    document.title = data.title;
    document.getElementById("content").innerHTML = data.html;
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

async function initApp() {
  // browser back/forward buttons
  window.addEventListener("popstate", async () => {
    const route = window.location.pathname;
    console.log("Handling popstate for route:", route);
    await loadContent(route);
  });
  
  // Handling initial load
  window.addEventListener("load", async () => {
    isInitialLoad = true;
    const route = window.location.pathname;
    console.log("Handling onload for route:", route);
    await loadContent(route);
  });
  

  window.baseUrl = "http://localhost";
}

initApp();
