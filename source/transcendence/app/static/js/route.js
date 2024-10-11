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
    'auth_42',
];

// protect the routes
const protectedRoutes = [
    'home',
    'profile',
    'signout',
    '2fa'
]

// actual function to change the content of the page
handleLocationChange = async () => {
    let path = (window.location.pathname.slice(1));
    // Thnking of a way to remove trailing slashes and all
    
    // if (path !== '' && path !== 'password_reset_newpass' && path !== 'password_reset_confirm'  && path !== 'oauth' && path !== 'oauth/callback' && path !== 'auth_42' && path !== 'signout'  && path !== 'profile') {
    //     await loadPageSpecificResources(path);
    // }
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
    // create a cookie for the current path
    history.pushState(null, '', path);
    handleLocationChange();
};

// Add the route function to the window object -- this makes it globally accessible
window.route = route;
// await getCSRFToken();
// Handle initial load and browser back/forward buttons
window.addEventListener('popstate', handleLocationChange);
window.addEventListener('load', handleLocationChange);

// Load the content of the page
async function loadContent(route) {
    // const access_token = document.cookie.split('; ').find(row => row.startsWith('access_token')).split('=')[1];
    try {
        if (protectedRoutes.includes(route)) {
            if (!isAuthenticated() && route === 'home') { // if not authenticated and trying to access home page -- redirect to landing page
                history.pushState(null, '', '/');
                handleLocationChange();
                return;
            }
            else if (!isAuthenticated()) {
                history.pushState(null, '', '/signin');
                handleLocationChange();
                return;
            }
            await loadProtectedPage(route);
            return;
        }
        else if (route === '' && isAuthenticated()) { // if authenticated and trying to access the 'landing' page -- redirect to home page
            history.pushState(null, '', '/home');
            await loadProtectedPage('/home');
            return ;
        }
        console.log("route:", route);
        // else - send a request to the server to get the page content
        const response = await fetch(`${route}/`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                document.cookie = `is_auth=false`
                console.log("redirecting to Landing Page coz you tried to access a protected page");
                history.pushState(null, '', '/home');
                handleLocationChange();
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

// getting user details after login or auth
async function loadProtectedPage(route) {
    try {
        const response = await fetch(`${route}/`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        
        console.log("response:", response);
        if (!response.ok) {
            if (response.status === 401) {
                document.cookie = `is_auth=false`
                console.log("redirecting to Landing Page coz you tried to access a protected page");
                history.pushState(null, '', '/home');
                handleLocationChange();
                return;
            }
            throw new Error('Error in protected route function');
        }
        const data = await response.json();
        if (route === 'signout') {
            document.cookie = `is_auth=false`
            history.pushState(null, '', '/');
            handleLocationChange();
            return;
        }
        loadCssandJS(data);
        document.title = data.title;
        document.getElementById('content').innerHTML = data.html;
    } catch (error) {
        console.error(error);
    }
}

loadCssandJS = (data) => {
    src = data.js;
    href = data.css;

    console.log("src:", src);
    console.log("href:", href);
    if (href) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `/static/${href}`;
        document.head.appendChild(link);
    }
    if (src) {
        let script = document.createElement('script');
        script.src = `/static/${src}`;
        script.defer = true;
        document.head.appendChild(script);
    }
};