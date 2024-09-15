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
