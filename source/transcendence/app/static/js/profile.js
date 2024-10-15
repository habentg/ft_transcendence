// delete account
async function deleteAccount() {
    try {
        console.log("Delete account");
        const m_csrf_token = await getCSRFToken();
        const response = await fetch('/profile/', {
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


// editing user info
function makeFieldEditable(fieldId) {
    console.log(`Make ${fieldId} editable`);
    const fieldInput = document.getElementById(fieldId);
    fieldInput.disabled = false;
    fieldInput.focus();
}

// updating user info
async function UpdateUserInfo() {
    try {
        // user input validation here maybe
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value
        }
        console.log(formData);
        const response = await fetch('/profile/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': await getCSRFToken()
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log("User info updated");
            // update the user info in the DOM
            history.pushState(null, '', `/profile`);
            handleLocationChange();
        } else {
            throw new Error('Failed to update user info');
        }
    } catch (error) {
        
    }
};

// a function to initialize the profile page and add event listeners
function initProfilePage() {
    const deleteAccountBtn = document.getElementById('delete-acc-btn');
    const enableDisable2FABtn = document.getElementById('enable-disable-2fa');
    const editUsernameIcon = document.getElementById('edit-username-icon');
    const editEmailIcon = document.getElementById('edit-email-icon');
    const updateUserInfoBtn = document.getElementById('update-user-info-btn');

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }

    if (enableDisable2FABtn) {
        enableDisable2FABtn.addEventListener('click', handleEnableDisable2FA);
    }

    if (editUsernameIcon) {
        editUsernameIcon.addEventListener('click', () => makeFieldEditable('username'));
    }

    if (editEmailIcon) {
        editEmailIcon.addEventListener('click', () => makeFieldEditable('email'));
    }

    if (updateUserInfoBtn) {
        updateUserInfoBtn.addEventListener('click', UpdateUserInfo);
    }
}

initProfilePage();