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

        
        console.log("response:", response);
        if (!response.ok) {
            const responseData = await response.json();
            displayError(responseData);
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

