console.log("signup.js loaded");

// Handle the signup form submission
async function handleSignupSubmit(e) {
    e.preventDefault();

    const formData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
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
        localStorage.setItem('access_token', responseData.access_token);
        localStorage.setItem('refresh_token', responseData.refresh_token);

        // redirect to the protected page
        history.pushState(null, '', `/${responseData.redirect}`);
        handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}


