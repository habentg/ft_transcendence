function signin(username, password) {
    fetch('/signin/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            // Display error message
            displayError(data.error);
        } else {
            // Login successful
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            displaySuccess(data.message);
            // Redirect or update UI as needed
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayError('An unexpected error occurred');
    });
}

function displayError(message) {
    // This function would update your UI to show the error message
    // For example:
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function displaySuccess(message) {
    // This function would update your UI to show the success message
    // For example:
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}