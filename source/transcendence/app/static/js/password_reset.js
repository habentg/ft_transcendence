// Initiate the password reset process
async function handlePassResetSubmit(e) {
    e.preventDefault();

    const formData = {
        email: document.getElementById('email').value
    };

    try {
        const m_csrf_token = await getCSRFToken();
        console.log("CSRF Token:", m_csrf_token);
        const response = await fetch('/password_reset/', {
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

        // Get the uidb64 and token from the response data
        const uidb64 = responseData.uidb64;
        const token = responseData.token;

        // Store the uidb64 and token in the local storage
        localStorage.setItem('uidb64', uidb64);
        localStorage.setItem('token', token);
    
        // Redirect to the password reset new password page
        history.pushState(null, '', `/password_reset_confirm`);
        handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Handle the password change
async function handlePassChangeSubmit(e) {
    e.preventDefault();

    const uidb64 = localStorage.getItem('uidb64');
    const token = localStorage.getItem('token');
    
    const formData = {
        new_password: document.getElementById('new_password').value,
    };

    if (formData.new_password !== document.getElementById('confirm_pass').value) {
        alert("Passwords do not match");
        return;
    }

    try {
        const m_csrf_token = await getCSRFToken();
        const response = await fetch(`/password_reset_newpass/${uidb64}/${token}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': m_csrf_token
            },
            body: JSON.stringify(formData)
        });
        const responseData = await response.json();
        if (!response.ok) {
            alert("Password couldn't reset: " + responseData.error_msg);
            return;
        }
        alert("Password reset successfully! Please sign in with your new password.");
        // Redirect to the signin page
        history.pushState(null, '', `/signin`);
        handleLocationChange();
        // Clear the local storage
        localStorage.removeItem('uidb64');
        localStorage.removeItem('token');
    }
    catch (error) {
        console.error('Error:', error);
    }
}