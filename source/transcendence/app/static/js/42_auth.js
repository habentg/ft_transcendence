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

        window.location.href = authUrl;

    } catch (error) {
        console.error('Error in handle42Login:', error);
    }
}
