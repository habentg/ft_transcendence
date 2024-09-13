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

        // accessing the cookies:
        const cookies = getJWTcookies();
        console.log("MY cookies RETRIEVED:", cookies);
        // redirect to the protected page
        history.pushState(null, '', `/${responseData.redirect}`);
        handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}


function getJWTcookies() {
    console.log("getJWTcookies called");
    const cookies = document.cookie.split(';');
    let access_token = null;
    let refresh_token = null;
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, 13) === 'access_token=') {
            access_token = cookie.substring(13);
        }
        else if (cookie.substring(0, 14) === 'refresh_token=') {
            refresh_token = cookie.substring(14);
        }
    }
    
    return {access_token, refresh_token};
}
