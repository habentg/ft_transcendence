
function isAuthenticated() {
    const token = getToken('access_token');
    if (!token) {
        return false;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    if (Date.now() >= expirationTime) {
        deleteCookie('access_token');
        return false;
    }
    return true;
}

// get csrf token
function getToken(tokenName) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, tokenName.length + 1) === `${tokenName}=`) {
                cookieValue = decodeURIComponent(cookie.substring(tokenName.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function getCSRFToken() {
    let cookieValue = getToken('csrftoken');
    if (!cookieValue) {
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
            document.cookie = `csrftoken=${cookieValue}`;
        }
        catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
    }
    return cookieValue;
}

// // request crsf token
// async function requestCSRFToken() {
//     try {
//         const response = await fetch('/csrf_request/', {
//             headers: {
//                 'X-Requested-With': 'XMLHttpRequest'
//             }
//         });
//         if (response.status !== 200) {
//             throw new Error("Failed to fetch CSRF token");
//         }
//         const data = await response.json();
//         document.cookie = `csrftoken=${cookieValue}`;
//         return data.csrf_token;
//     }
//     catch (error) {
//         console.error('Failed to fetch CSRF token:', error);
//     }
// }

// display error in form submission pages
function displayError(response) {
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
    document.getElementById('error-msg').innerText = error_msg;
    document.getElementById('error-msg').style.display = 'block';
}



// Load page-specific resources -- CSS and JS
const loadedResources = new Set();

async function loadPageSpecificResources(route) {
    // Remove all resources that are not needed
    // all stylesheets

    // all scripts
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


function deleteCookie(name) {
    const cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = cookie;
  }
