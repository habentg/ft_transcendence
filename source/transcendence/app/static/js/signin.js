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

        // saving jwt access and refresh token in local storage
        localStorage.setItem('access_token', responseData.access_token);
        localStorage.setItem('refresh_token', responseData.refresh_token);

        // redirect to the protected page
        history.pushState(null, '', `/${responseData.redirect}`);
        handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}
