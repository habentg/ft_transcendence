
// Function to handle password visibility toggle
function showPasswordToggle() {
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');

            // Toggle password visibility
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
};

showPasswordToggle();

async function handleSignInSubmit(e) {
    e.preventDefault();

    const formData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
    };
    if (!inputValidator(formData.username) || formData.username.length < 4 || formData.username.length > 100) {
        displayError({ invalid_chars: "Invalid Username: Only AlphNumericals and underscore at least 4 characters long!" });
        return;
    }
    if (formData.password.length < 3 || formData.password.length > 150) {
        displayError({ invalid_chars: "Password length should be greater than 3 and less than 150!" });
        return;
    }
    showLoadingAnimation();
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
        if (!response.ok) {
            const responseData = await response.json();
            if (response.status === 302) {
                await getTwoFactorAuth(`${formData.username}`);
            }
            else
                displayError(responseData);
            hideLoadingAnimation();
            return;
        }
        // redirect to the protected page
        history.replaceState({}, "", `/home`);
        await updateUI(`/home`);
        updateNavBar(true); // update the navbar for authenticated users
        /* websocket - for real-time updates and chat*/
        createWebSockets();
    } catch (error) {
        createToast({ type: 'error', title: 'Error', error_message: 'Failed to authenticate' });
    }
}

async function getTwoFactorAuth(username) {
    try {
        const response = await fetch(`/2fa?username=${username}`, {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        });
        if (response.ok) {
            let data = await response.json();
            loadCssandJS(data, false);
            document.title = `${data.title} | PONG`;
            document.getElementById("content").innerHTML = data.html;
            return;
        }
        throw new Error("Failed to load 2FA page content");
    }
    catch (error) {
        createToast({ type: 'error', error_message: 'Failed to load 2FA page content', title: 'Error' });
    }
}