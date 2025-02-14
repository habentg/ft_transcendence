// Handle the form submission
async function handleOTPSubmit(event) {
  event.preventDefault();

  const formData = {
    otp: document.getElementById("otp").value,
    email: document.getElementById("2fa_player_email").textContent,
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
    updateNavBar(true, responseData.username, responseData.pfp);
    await updateUI(`/`);
  } catch (error) {
    createToast({
      title: "Error",
      message: "Failed to authenticate",
      type: "error",
    });
  }
}
