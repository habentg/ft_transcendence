
console.log("password_reset.js loaded");
async function handlePasswordRestSubmit(e) {

    e.preventDefault();

    const formData = {
        email: document.getElementById('email').value
    };

    console.log("Handling password reset form submission");
    try {
        let m_csrf_token = await getCSRFToken();
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
            displayError(responseData, response.status);
            return;
        }

        console.log('redirecting to:', responseData.redirect);
        // redirect to the protected page
        // history.pushState(null, '', `/${responseData.redirect}`);
        // handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
    
}