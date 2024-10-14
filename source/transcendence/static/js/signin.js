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
        
        console.log("response:", response);
        if (!response.ok) {
            if (response.status === 302) {
                // Redirect to the two factor authentication page
                document.cookie = `is_auth=true`
                history.pushState(null, '', `/2fa`);
                handleLocationChange();
            }
            else
            {
                const responseData = await response.json();
                displayError(responseData);
            }
            return;
        }
        // redirect to the protected page
        document.cookie = `is_auth=true`
        history.pushState(null, '', `/home`);
        handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}
