// All routes that are not in the list below will be redirected to the 404 page
const routes = [
    '',
    'home',
    'signup',
    'signin',
    'signout',
    'profile',
    '404',
    'password_reset',
    'password_reset_confirm',
];

// protect the routes
const protectedRoutes = [
    'home',
]

// actual function to change the content of the page
handleLocationChange = async () => {
    let path = (window.location.pathname.slice(1));
    if (path !== '' && path !== 'password_reset_confirm') {
        await loadPageSpecificResources(path);
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
    history.pushState(null, '', path);
    handleLocationChange();
};

// Add the route function to the window object -- this makes it globally accessible
window.route = route;

// Handle initial load and browser back/forward buttons
window.addEventListener('popstate', handleLocationChange);
window.addEventListener('load', handleLocationChange);

// Load the content of the page
async function loadContent(route) {
    try {
        if (protectedRoutes.includes(route)) {
            if (!isAuthenticated() && route === 'home') { // if not authenticated and trying to access home page -- redirect to landing page
                history.pushState(null, '', '/');
                handleLocationChange();
                return;
            }
            else if (!isAuthenticated()) {
                history.pushState(null, '', 'signin');
                handleLocationChange();
                return;
            }
            await loadProtectedPage(route);
            return;
        }
        else if (route === '' && isAuthenticated()) { // if authenticated and trying to access the 'landing' page -- redirect to home page
            history.pushState(null, '', 'home');
            await loadProtectedPage('/home');
            return ;
        }
        else if (route === 'signout') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            history.pushState(null, '', '/');
            handleLocationChange();
            return;
        }
        const response = await fetch(`${route}/`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        let data = await response.json();

        document.title = data.title;
        document.getElementById('content').innerHTML = data.html;
    } catch (error) {
        console.error(`Failed to load -- ${route} -- page content:`, error);
    }
}

// getting user details after login or auth
async function loadProtectedPage(route) {
    try {
        const response = await fetch(`${route}/`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error in protected route function');
        }
        
        const data = await response.json();
        document.title = data.title;
        document.getElementById('content').innerHTML = data.html;
    } catch (error) {
        console.error(error);
    }
}

// 42 Oauth2.0
/* setting up and initiating an OAuth 2.0 authorization flow with the 42 intranet API. */
/* Initiating an OAuth 2.0 authorization flow with the 42 intranet API. */
async function handle42Login() {
    try {
        const response = await fetch('/auth_info/');
        const responseData = await response.json();
        const clientId = responseData.client_id;
        const redirectUri = responseData.redirect_uri;

        const authorizationEndpoint = 'https://api.intra.42.fr/oauth/authorize';
        const responseType = 'code';
        const scope = 'public';

        const authUrl = `${authorizationEndpoint}?response_type=${responseType}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

        // Open the authorization URL in a new tab
        window.open(authUrl, '_blank');

    } catch (error) {
        console.error('Error in handle42Login:', error);
    }
}

// Add an event listener to handle the OAuth callback
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const redirect = urlParams.get('redirect');

    if (accessToken && refreshToken && redirect) {
        // Store JWT tokens in local storage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Redirect to the home page
        history.pushState(null, '', `/${redirect}`);
        handleLocationChange();
    }
});