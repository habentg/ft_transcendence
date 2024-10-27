console.log("signup.js loaded");

// Handle the signup form submission
async function handleSignupSubmit(e) {
  e.preventDefault();

  const formData = {
    // first_name: document.getElementById('firstName').value,
    // last_name: document.getElementById('lastName').value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    full_name:
      document.getElementById("firstName").value +
      " " +
      document.getElementById("lastName").value,
    confirm_password: document.getElementById("confirm-password").value,
  };

  console.log("formData:", formData);
  // Validate the form data
  if (formData.confirm_password !== formData.password) {
    console.log("Passwords do not match");
    displayError({ error_msg: "Passwords do not match" });
    return;
  }
  try {
    const m_csrf_token = await getCSRFToken();
    const response = await fetch("/signup/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": m_csrf_token,
      },
      body: JSON.stringify(formData),
    });

        console.log("response:", response);
        if (!response.ok) {
            const responseData = await response.json();
            console.log("responseData:", responseData);
            displayError({error_msg: responseData[0]});
            return;
        }
        // redirect to the protected page
        updateUI(`/home`, false);
        // history.pushState(null, '', `/home`);
        // handleLocationChange();
    } catch (error) {
        console.error('Error:', error);
    }
}
