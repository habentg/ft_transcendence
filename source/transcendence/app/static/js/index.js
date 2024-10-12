
function isAuthenticated() {
    const token = getCookie('is_auth');
    if (token === 'true') {
        return true;
    }
    return false;
}

// get csrf token
function getCookie(tokenName) {
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
    let cookieValue = getCookie('csrftoken');
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
        }
        catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
    }
    return cookieValue;
}

// display error in form submission pages
function displayError(response) {
    error_msg = 'Some Kind of Error Occurred';
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

// 42 Oauth2.0
/* setting up and initiating an OAuth 2.0 authorization flow with the 42 intranet API. */
/* Initiating an OAuth 2.0 authorization flow with the 42 intranet API. */
async function handle42Login() {
    try {
        const response = await fetch('/auth_42/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        const resposeData = await response.json();

        const authUrl = resposeData.authorization_url;

        console.log('authUrl:', authUrl);
        window.location.href = authUrl;

    } catch (error) {
        console.error('Error in handle42Login:', error);
    }
}


/* CSS and JavaScritp of each page - loading */
// Load page-specific resources -- CSS and JS
// Keep track of currently loaded resources
let currentResourcesName = {
    css: null,
    js: null
};

/* removing the object form DOM */
const removeResource = () => {
    if (currentResourcesName.css !== null) {
        const prev_css = document.getElementById(`${currentResourcesName.css}-id`);
        if (prev_css) {
            prev_css.remove();
        }
        currentResourcesName.css = null;
    }
    if (currentResourcesName.js !== null) {
        const prev_js = document.getElementById(`${currentResourcesName.js}-id`);
        if (prev_js) {
            prev_js.remove();
        }
        currentResourcesName.js = null;
    }
};

const loadCssandJS = (data) => {
    // object deconstruction
    // fancy way of:
    /* 
        cont css_file_path = data.css
        cont js_file_path = data.js
    */
    const { js: js_file_path, css: css_file_path } = data;

    // Remove previous CSS & js
    removeResource();
    // loading new css
    if (css_file_path) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `/static/${css_file_path}`;
        link.id = `${css_file_path}-id`;
        document.head.appendChild(link);
        currentResourcesName.css = css_file_path; // hold it for delete
        
    }
    // loading new js
    if (js_file_path) {
        let script = document.createElement('script');
        script.src = `/static/${js_file_path}`;
        script.id = `${js_file_path}-id`;
        script.defer = true;
        document.head.appendChild(script);
        currentResourcesName.js = js_file_path;
    }
};