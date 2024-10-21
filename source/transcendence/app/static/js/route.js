
/* Me is trying to prevent double request */
let isInitialLoad = true;

// actual function to change the content of the page
async function handleLocationChange() {
    let path = (window.location.pathname.slice(1));
    
    if (isInitialLoad) {
        isInitialLoad = false;
        return ;
    }
    await loadContent(path);
};

// routing function -- without reloading the page
function route(event) {
    event = event || window.event;
    event.preventDefault();
    
    let href = event.target.href;
    let path = new URL(href).pathname;
    if (path === window.location.pathname)
        return;
    history.pushState(null, '', path);
    handleLocationChange();
};

// let account_routes = ['signin', 'signup', 'signout', 'forgot-password', 'reset-password'];
// let game_routes = ['game', 'leaderboard', 'game-history', 'game-detail'];
// let user_routes = ['profile', 'change-password', 'delete-account'];
// let friend_routes = ['friends', 'friend-request'];
// let other_routes = ['home', 'about', 'contact', '404', 'tos', 'privacy'];

// function determineRoute(route) {
//     if (route === '' || route === '/')
//         route = 'home';
//     if (account_routes.includes(route))
//         route = 'account/' + route;
//     else if (game_routes.includes(route))
//         route = 'game/' + route;
//     else if (user_routes.includes(route))
//         route = 'user/' + route;
//     else if (friend_routes.includes(route))
//         route = 'friend/' + route;
//     else if (other_routes.includes(route))
//         route = 'other/' + route;
//     else
//         route = 'other/404';
//     return route;
// }
// Load the content of the page
async function loadContent(route) {
    // // bunch of ifs to correcly route to the correct "App" in django
    // const route = determineRoute(route);
    try {
        const response = await fetch(`${route}/`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        
        // signout is a special case
        if (route == 'signout') {
            // removing any css js if there is any
            removeResource();
            history.pushState(null, '', '/');
            handleLocationChange();
            return;
        }
        console.log("Loading content for:", route, "Response:", response);
        if (!response.ok) {
            // may be we will handle other error codes later
            // if the response is a redirect, then redirect the user to the new location
            if (response.status === 302) {
                const data = await response.json();
                console.log("Redirecting to:", data['redirect']);
                history.pushState(null, '', data['redirect']);
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
        document.getElementById('content').innerHTML = data.html;
    } catch (error) {
        console.error(`Failed to load -- ${route} -- page content:`, error);
    }
}

async function initApp() {
    
    // Handle initial load and browser back/forward buttons
    window.addEventListener('popstate', handleLocationChange);
    
    // Handle initial load
    window.addEventListener('load', async () => {
        isInitialLoad = true;
        await handleLocationChange()
    });
};

initApp();