const deleteAccount = async () => {
    try {
        console.log("Delete account");
        const m_csrf_token = await getCSRFToken();
        const response = await fetch('/delete_account/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': m_csrf_token
            }
        });

        console.log("Delete account response: ", response);
        
        if (response.ok) {
            const data = await response.json();
            
            history.pushState(null, '', `/home`);
            handleLocationChange();
        } else {
            console.error('Failed to delete account');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};