console.log("signup.js loaded");

document.getElementById('signupForm').addEventListener('submit', registerNewUser);

async function registerNewUser(e) {
    e.preventDefault();
	try {
		const formData = {
			first_name: document.getElementById('firstName').value,
			last_name: document.getElementById('lastName').value,
			username: document.getElementById('username').value,
			email: document.getElementById('email').value,
			password: document.getElementById('password').value
		};
	
		const response = await fetch('/api/signup/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCsrfToken()
			},
			body: JSON.stringify(formData),
			credentials: 'include'  // This is needed to include cookies in the request
		});
	
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(JSON.stringify(errorData));
		}

		console.log("Signup successful");
		const data = await response.json();
		// save the token in local storage
		localStorage.setItem('accessToken', data.access);

		// Redirect to home page
		navigateTo('home');
		
	}
	catch (error) {
		console.error('Error:', error);
	}

};

function getCsrfToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue;
}
