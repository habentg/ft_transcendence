console.log("signin.js loaded");

// Function to handle password visibility toggle
function showPasswordToggle() {
        const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
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

    try {
        const m_csrf_token = await getCSRFToken();
        console.log("CSRF Token:", m_csrf_token);
        const response = await fetch('/signin/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': m_csrf_token
            },
            body: JSON.stringify(formData)
        });
        
        console.log("response:", response);
        if (!response.ok) {
            if (response.status === 302) {
                // Redirect to the two factor authentication page
                await updateUI(`/2fa`, false);
                // history.pushState(null, '', `/2fa`);
                // handleLocationChange();
            }
            else
            {
                const responseData = await response.json();
                console.error('Error:', responseData);
                displayError(responseData);
            }
            return;
        }
        // redirect to the protected page

        await updateUI(`/home`, false);
        updateNavBar(true); // update the navbar for authenticated users
        /* websocket - for real-time updates and chat*/
        createWebSockets();
    } catch (error) {
        console.error('Error:', error);
    }
}
