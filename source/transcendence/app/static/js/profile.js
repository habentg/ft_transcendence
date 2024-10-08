async function deleteAccount() {
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


// enabling 2fa
/* 
    1. button click:
        - modal opens (with a button to continue) to inform user about 2fa
        - button click -> sessionStorage.setItem('2fa-enabled', true)

        */
async function handleEnableDisable2FA() {
        try {
        const response = await fetch('/2fa/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': await getCSRFToken()
            },
        });
        if (response.ok) {
            console.log("2FA status updated");
            if (this.textContent.trim() === "Enable 2FA")
                this.textContent = "Disable 2FA";
            else 
                this.textContent = "Enable 2FA";
        }
        else {
            throw new Error('Failed to update 2FA status');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}
const enableDisable2FABtn = document.getElementById('enable-disable-2fa');
if (enableDisable2FABtn) {
    enableDisable2FABtn.addEventListener('click', handleEnableDisable2FA);
}
const deleteAccountBtn = document.getElementById('delete-acc-btn');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', deleteAccount);
}

