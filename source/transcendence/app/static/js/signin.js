console.log("signin.js loaded");

// Handle the signin form submission
async function handleSignInSubmit(e) {
    e.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    try {
        const m_csrf_token = await getCSRFToken();
        const response = await fetch('/signin/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': m_csrf_token
            },
            body: JSON.stringify(formData)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            displayError(responseData);
            return;
        }
        console.log('******+++>>>>Response data:', responseData);
        // saving jwt access and refresh token in local storage
        localStorage.setItem('access_token', responseData.access_token);
        localStorage.setItem('refresh_token', responseData.refresh_token);

        if (responseData.tfa_code === true) {
            // user has 2FA enabled -- successfully email send
            if (responseData.tfa_code_sent === 'success') {
                // Redirect to the two factor authentication page
                console.log('2FA code sent ---- so we go to 2FA page');
                history.pushState(null, '', `/2fa`);
                handleLocationChange();
                return;
            }
            else {
                displayError(responseData);
                return;
            }
            // user has 2FA enabled -- failed to email send
        }

        // redirect to the protected page
        // history.pushState(null, '', `/${responseData.redirect}`);
        // handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}
