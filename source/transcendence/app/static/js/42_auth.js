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
        window.location.href = authUrl;

    } catch (error) {
        console.error('Error in handle42Login:', error);
    }
}

// // Add an event listener to handle the OAuth callback
// window.addEventListener('load', () => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const accessToken = urlParams.get('access_token');
//     const refreshToken = urlParams.get('refresh_token');
//     const redirect = urlParams.get('redirect');

//     if (accessToken && refreshToken && redirect) {
//         // Store JWT tokens in local storage
//         localStorage.setItem('access_token', accessToken);
//         localStorage.setItem('refresh_token', refreshToken);

//         // Redirect to the home page
//         console.log("Are we actually here? => ", redirect); 
//         history.pushState(null, '', `/home`);
//         handleLocationChange();
//     }
// });