console.log("signup.js loaded");

// Handle the signup form submission
async function handleSignupSubmit(e) {
    e.preventDefault();

    const formData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        two_factor_enabled: sessionStorage.getItem('2fa-enabled')
    };

    try {
        const m_csrf_token = await getCSRFToken();
        const response = await fetch('/signup/', {
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
        
        // saving jwt access and refresh token in cookies
        document.cookie = `access_token=${responseData.access_token}; Path=/; SameSite=Lax`;
        document.cookie = `refresh_token=${responseData.refresh_token}; Path=/; SameSite=Lax`;
        // redirect to the protected page
        history.pushState(null, '', `/${responseData.redirect}`);
        handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}

function handleToggleButtonClick(event) {
    // Handle the toggle button's change event
    const enabled = event.target.checked;
    sessionStorage.setItem('2fa-enabled', enabled.toString());
    if (enabled) {
        console.log("2FA Enabled");
        // document.getElementById('2fa-toggle-label').textContent = '2FA Enabled';
    } else {
        console.log("2FA Disabled");
        // document.getElementById('2fa-toggle-label').textContent = '2FA Disabled';
    }
}
