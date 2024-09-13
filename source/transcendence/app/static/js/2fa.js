async function handleOTPSubmit(event) {
    event.preventDefault();

    const formData = {
        otp: document.getElementById('otp').value,
    };

    try {
        const m_csrf_token = await getCSRFToken();
        const access_token = document.cookie.split('; ').find(row => row.startsWith('access_token')).split('=')[1];
        const response = await fetch('/2fa/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${access_token}`,
                'X-CSRFToken': m_csrf_token
            },
            body: JSON.stringify(formData)
        });
        
        const responseData = await response.json();
        
        console.log("responseData:", responseData);
        if (!response.ok) {
            displayError(responseData);
            return;
        }

        // redirect to the protected page
        history.pushState(null, '', `/${responseData.redirect}`);
        handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}