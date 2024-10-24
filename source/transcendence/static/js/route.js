
/* Me is trying to prevent double request */
let isInitialLoad = true;

// actual function to change the content of the page
handleLocationChange = async () => {
    let path = (window.location.pathname.slice(1));
    
    if (isInitialLoad) {
        isInitialLoad = false;
        return ;
    }
    await loadContent(path);
};

// routing function -- without reloading the page
const route = (event) => {
    event = event || window.event;
    event.preventDefault();

    let href = event.target.href;
    let path = new URL(href).pathname;
    if (path === window.location.pathname)
        return;
    // if initial load -- do nothing
    if (isInitialLoad)
        return ;
    history.pushState(null, '', path);
    handleLocationChange();
};

// Add the route function to the window object -- this makes it globally accessible
window.route = route;

// Handle initial load and browser back/forward buttons
window.addEventListener('popstate', handleLocationChange);

// Handle initial load
window.addEventListener('load', async () => {
    isInitialLoad = true;
    await handleLocationChange()
});

// Load the content of the page
async function loadContent(route) {
    try {
        const response = await fetch(`${route}/`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
            redirect: 'manual' // This tells fetch to not automatically follow redirects
        });
        console.log("In Load Content: ", response);
        if (route == 'signout') {
            // document.cookie = `is_auth=false`
            // removing any css js if there is any
            removeResource();
            history.pushState(null, '', '/');
            handleLocationChange();
            return;
        }
        if (!response.ok) {
            // may be we will handle other error codes later
            // if the response is a redirect, then redirect the user to the new location
            if (response.status === 401) {
                const data = await response.json();
                history.pushState(null, '', data['redirect']);
                handleLocationChange();
                return;
            }
            throw new Error("HTTP " + response.status);
        }
        console.log("Route: ", route,"load-content response:", response);
        let data = await response.json();
        loadCssandJS(data);
        document.title = data.title;
        document.getElementById('content').innerHTML = data.html;
    } catch (error) {
        console.error(`Failed to load -- ${route} -- page content:`, error);
    }
}
