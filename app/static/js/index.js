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
    // if (!routes.includes(path)) {
    //     path = '404';
    //     // history.replaceState(null, '', '/404.html');
    // }
    if (path !== '' && path !== 'password_reset_confirm') {
        await loadPageSpecificResources(path);
    }
    console.log('loading content for path:', path);
    await loadContent(path);
    // await requestCSRFToken();
};

// routing function -- without reloading the page
const route = (event) => {
    event = event || window.event;
    event.preventDefault();

    let href = event.target.href;
    let path = new URL(href).pathname;
    console.log('clicked href:', path);
    console.log('target href:', window.location.pathname.slice(1));
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


// Load page-specific resources -- CSS and JS
const loadedResources = new Set();

async function loadPageSpecificResources(route) {
    loadedResources.forEach(id => {
        if (id !== route) {
            const css = document.getElementById(`${id}-css`);
            const script = document.getElementById(`${id}-script`);
            if (css)
                css.remove();
            if (script)
                script.remove();
            loadedResources.delete(id);
        }
    });

    // Check if the resources for this route are already loaded
    if (!loadedResources.has(route)) {
        // Create a new link element for the page-specific CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = `${route}-css`;
        link.href = `/static/css/${route}.css`;

        // Create a new script element for the page-specific JS
        const script = document.createElement('script');
        script.src = `/static/js/${route}.js`;
        script.id = `${route}-script`;
        script.defer = true;

        // Wait for both CSS and JS to load before continuing
        await Promise.all([
            new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            }),
            new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            })
        ]);

        loadedResources.add(route);
    }
}

// Load the content of the page
async function loadContent(route) {
    header = { 'X-Requested-With': 'XMLHttpRequest' };
    try {
        if (protectedRoutes.includes(route)) {
            if (!isAuthenticated() && route === 'home') {
                history.pushState(null, '', '/');
                handleLocationChange();
                return;
            }
            if (!isAuthenticated()) {
                history.pushState(null, '', 'signin');
                handleLocationChange();
                return;
            }
            await loadProtectedPage(route);
            return;
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
            headers: header
        });
        if (response.status !== 200) {
            throw new Error("HTTP " + response.status);
        }
        let data = await response.json();
        document.title = data.title;
        document.getElementById('content').innerHTML = data.html;
    } catch (error) {
        console.error(`Failed to load -- ${route} -- page content:`, error);
    }
}



function isAuthenticated() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return false;
    }

    // Optional: Check if the token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    if (Date.now() >= expirationTime) {
        return false;
    }

    return true;
}

async function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    console.log("cookie value:", cookieValue);
    if (!cookieValue) {
        cookieValue = await requestCSRFToken();
    }
    return cookieValue;
}

// request crsf token
async function requestCSRFToken() {
    console.error('CSRF token not found in cookies');
    try {
        const response = await fetch('/csrf_request/', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        if (response.status !== 200) {
            throw new Error("Failed to fetch CSRF token");
        }
        const data = await response.json();
        console.log('CSRF token:', data.csrf_token);
        // // Set the CSRF token in the cookie
        // document.cookie = `csrftoken=${cookieValue}`;
        return data.csrf_token;
    }
    catch (error) {
        console.error('Failed to fetch CSRF token:', error);
    }
}
// getting user details after login or auth
async function loadProtectedPage(route) {
    console.log('we in loadProtectedPage() ====== protected');
    try {
        const response = await fetch(`${route}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const data = await response.json();

        // Display additional user details
        console.log('data:', data);
        document.title = data.title;
        document.getElementById('content').innerHTML = data.html;
        console.log('we in loadHomePage() ====== home');
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}

// display error in form submission pages
function displayError(response) {
    console.log('response:', response);
    error_msg = 'Invalid credentials';
    if (response.error_msg) {
        error_msg = response.error_msg;
    }
    else if (response.username && response.username[0]) {
        error_msg = response.username[0];
    }
    else if (response.password && response.password[0]) {
        error_msg = response.password[0];
    }
    else if (response.email && response.email[0]) {
        error_msg = response.email[0];
    }
    console.log('error_msg:', error_msg, 'status:');
    document.getElementById('error-msg').innerText = error_msg;
    document.getElementById('error-msg').style.display = 'block';
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

        //https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7ac3a64d97f3088e86786177044308facfb8da98cb5325e56049fbad72dfa0a1&redirect_uri=https%3A%2F%2Flocalhost%3A8001%2Fauth%2F&response_type=code

        // Open the authorization URL in a new tab
        window.open(authUrl, '_blank');

        console.log('what happens after this?');
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