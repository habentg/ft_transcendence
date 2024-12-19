// Handle the form submission
async function handleOTPSubmit(event) {
  event.preventDefault();

  const formData = {
    otp: document.getElementById("otp").value,
  };

  try {
    const m_csrf_token = await getCSRFToken();
    const response = await fetch("/2fa/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": m_csrf_token,
      },
      body: JSON.stringify(formData),
    });

    const responseData = await response.json();
    if (!response.ok) {
      displayError(responseData);
      return;
    }

    // Update navbar to show authenticated user
    updateNavBar(true);
    
    // redirect to the protected page
    await updateUI(`/${responseData.redirect}`);
  } catch (error) {
    console.error("Error:", error);
  }
}
