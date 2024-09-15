console.log("signin.js loaded");

async function handleSignInSubmit(e) {
    e.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    try {
        const m_csrf_token = await getCSRFToken();
        console.log("CSRF Token:", m_csrf_token);
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
        // saving jwt access and refresh token in local storage
        // localStorage.setItem('access_token', responseData.access_token);
        // localStorage.setItem('refresh_token', responseData.refresh_token);

        // // Set JWT tokens in cookies
        document.cookie = `access_token=${responseData.access_token}; Path=/; SameSite=Lax`;
        document.cookie = `refresh_token=${responseData.refresh_token}; Path=/; SameSite=Lax`;
        // // Set JWT tokens in cookies
        // document.cookie = `access_token=${responseData.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`;
        // document.cookie = `refresh_token=${responseData.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax`;

        if (responseData.tfa_code === true) {
            // user has 2FA enabled -- successfully email send
            if (responseData.tfa_code_sent === 'success') {
                // Redirect to the two factor authentication page
                history.pushState(null, '', `/2fa`);
                handleLocationChange();
                return;
            }
            else {
                displayError(responseData);
                return;
            }
        }
        // redirect to the protected page
        history.pushState(null, '', `/${responseData.redirect}`);
        handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}
