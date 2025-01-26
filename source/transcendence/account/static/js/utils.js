// get csrf token
function getCookie(tokenName) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, tokenName.length + 1) === `${tokenName}=`) {
        cookieValue = decodeURIComponent(
          cookie.substring(tokenName.length + 1)
        );
        break;
      }
    }
  }
  return cookieValue;
}

async function getCSRFToken() {
  let cookieValue = getCookie("csrftoken");
  if (!cookieValue) {
    try {
      const response = await fetch("/csrf_request/", {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      if (response.status !== 200) {
        throw new Error("Failed to fetch CSRF token");
      }
    } catch (error) {
      createToast({
        type: "error",
        title: "Error",
        error_message: "Failed to fetch CSRF token",
      });
    }
  }
  return cookieValue;
}

// display error in form submission pages
function displayError(response) {
  error_msg = "Some Kind of Error Occurred";
  if (response.error_msg) {
    error_msg = response.error_msg;
  } else if (response.username && response.username[0]) {
    error_msg = response.username[0];
  } else if (response.password && response.password[0]) {
    error_msg = response.password[0];
  } else if (response.email && response.email[0]) {
    error_msg = response.email[0];
  }
  else if (response.invalid_chars) {
    error_msg = response.invalid_chars;
  }
  document.getElementById("error-msg").innerText = error_msg;
  document.getElementById("error-msg").style.display = "block";
}

// 42 Oauth2.0
/* setting up and initiating an OAuth 2.0 authorization flow with the 42 intranet API. */
/* Initiating an OAuth 2.0 authorization flow with the 42 intranet API. */
async function handle42Login() {
  showLoadingAnimation("Signing in with 42...");
  try {
    const response = await fetch("/auth_42/", {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    const resposeData = await response.json();

    hideLoadingAnimation();
    window.location.href = resposeData.authorization_url;

  } catch (error) {
    createToast({
      type: "error",
      title: "Error",
      error_message: "Failed to authenticate",
    });
  }
}

/* CSS and JavaScritp of each page - loading */
// Load page-specific resources -- CSS and JS
// Keep track of currently loaded resources
// let currentResourcesName = {
//   css: null,
//   js: null,
// };

/* removing the object form DOM */
const removeResource = () => {
  // Get all styles and scripts
  let allStyles = document.getElementsByTagName("link");
  let allScripts = document.getElementsByTagName("script");

  // Remove styles in reverse order
  for (let i = allStyles.length - 1; i >= 0; i--) {
    if (allStyles[i].id.includes("/static/")) {
      allStyles[i].remove();
    }
  }

  // Remove scripts in reverse order
  for (let i = allScripts.length - 1; i >= 0; i--) {
    if (allScripts[i].id.includes("/static/")) {
      allScripts[i].remove();
    }
  }
};


const loadCssandJS = (data, remove_prev_resources) => {
  // object deconstruction
  // fancy way of:
  /* 
        cont css_file_path = data.css
        cont js_file_path = data.js
    */
  const { css: css_file_paths, js: js_file_paths } = data;

  // Remove previous CSS & js
  if (remove_prev_resources) {
    removeResource();
  }

  // loading new css
  if (css_file_paths) {
    for (let i = 0; i < css_file_paths.length; i++) {
      if (document.getElementById(`/static/${css_file_paths[i]}-id`))
        return;
      let link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = `/static/${css_file_paths[i]}`;
      link.id = `/static/${css_file_paths[i]}-id`;
      document.head.appendChild(link);
    }
  }
  // loading new js
  if (js_file_paths) {
    for (let i = 0; i < js_file_paths.length; i++) {
      if (document.getElementById(`/static/${js_file_paths[i]}-id`))
        return;
      let script = document.createElement("script");
      script.src = `/static/${js_file_paths[i]}`;
      script.id = `/static/${js_file_paths[i]}-id`;
      script.defer = true;
      document.head.appendChild(script);
    }
  }
};

// update the Navbar for authenticated users && for signout and deleted users
function updateNavBar(isAuthenticated, givenUsername = null, givenProfilePic = null) {
  const navbar = document.getElementById("navbarNavDropdown");
  if (isAuthenticated) {
    let profilePic = "/static/images/default_profile_pic.jpeg";
    let username = "";
    const user_profile_pic =
      document.getElementById("nav_profile_pic") ||
      document.getElementById("pfp_from_profile");
    const profile_btn = document.getElementById("profile_btn");
    // check if profile_btn has data-username
    if (profile_btn) {
      username = profile_btn.dataset.username;
    }
    if (user_profile_pic) {
      profilePic = user_profile_pic.dataset.pfp; // Same as user_profile_pic.getAttribute("data-pfp");
    }
    if (givenUsername)
      username = givenUsername;
    if (givenProfilePic)
      profilePic = givenProfilePic;
    navbar.innerHTML = `
    <ul class="navbar-nav ms-auto align-items-center">
      <li class="nav-item">
        <a onclick="appRouter()" href="/leaderboard" class="nav-link"><i class="fas fa-trophy me-2"></i>Leaderboard</a>
      </li>
      <li class="nav-item">
        <a href="/chat" class="nav-link" onclick="appRouter()"><i class="fas fa-comments me-2"></i>Chat</a>
      </li>
      <li id="notification_dropdown_list" class="nav-item ms-lg-2 dropdown">
        <a onclick="handleNotificationBellClick()" class="nav-link position-relative notification-badge" role="button" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-bell"></i></a>
        <ul id="notification_ul" class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown" style="width: 300px;"></ul>
      </li>
      <li class="nav-item ms-lg-2 dropdown">
        <a class="nav-link profile-link" href="#" role="button" id="profileDropdown" 
           data-bs-toggle="dropdown" aria-expanded="false">
            <img src="${profilePic}" class="rounded-circle" width="30" height="30" alt="profile-pic" id="profile_pic">
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
          <li>
            <a onclick="appRouter()" class="dropdown-item" href="/profile/${username}">
              <i class="fas fa-user-circle me-2"></i>Profile
            </a>
          </li>
          <li>
            <a onclick="appRouter()" class="dropdown-item" href="/settings">
              <i class="fas fa-cog me-2"></i>Settings
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item" href="#" onclick="showSignOutModal()">
              <i class="fas fa-sign-out-alt me-2"></i>Sign Out
            </a>
          </li>
        </ul>
      </li>
    </ul>
    `;
  } else {
    navbar.innerHTML = `
    <ul class="navbar-nav ms-auto align-items-center">

      <li class="nav-item">
        <a  onclick="appRouter()" href="/guest_player" class="nav-link"><i class="fas fa-gamepad me-2"></i>Quick game</a>
      </li>
      <li class="nav-item">
        <a onclick="appRouter()" class="nav-link btn btn-outline-primary ms-lg-2" href="/signin">Sign in</a>
      </li>
      <li class="nav-item">
        <a onclick="appRouter()" class="nav-link btn btn-primary ms-lg-2" href="/signup">Sign up</a>
      </li>
    </ul>
    `;
  }
}

/* signout from navbar */

function closeSignOutModal() {
  const modal = document.getElementById("sign-out-modal");
  if (modal) {
    modal.remove();
    document.body.classList.remove("modal-open");
  }
}

async function handleSignOut() {
  try {
    const response = await fetch("/signout/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": await getCSRFToken(),
      },
    });

    if (response.status === 200) {
      closeSignOutModal();
      removeResource();
      updateNavBar(false);
      if (window.ws_chat)
      window.ws_chat.close() 
      if (window.ws)
      window.ws.close() 
      await updateUI(``);
    } else {
      throw new Error("Failed to sign out");
    }
  } catch (error) {
    displayError({ error_msg: "Failed to sign out" });
  }
}

document.addEventListener("click", function (event) {
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.querySelector(".navbar-collapse");

  if (navbarToggler && navbarCollapse) {
    if (
      !navbarCollapse.contains(event.target) &&
      !navbarToggler.contains(event.target)
    ) {
      if (navbarCollapse.classList.contains("show")) {
        navbarToggler.click();
      }
    }
  }
});

document.querySelectorAll(".navbar-nav .nav-link").forEach(function (navLink) {
  navLink.addEventListener("click", function () {
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    // Don't collapse if Profile from navbar is clicked

    if (
      navbarToggler &&
      navbarCollapse.classList.contains("show") &&
      !navLink.classList.contains("profile-link") &&
      !navLink.classList.contains("notification-badge")
    ) {
      navbarToggler.click();
    }
  });
});

/* notification dropdown */
async function handleNotificationBellClick(action) {
  if (document.getElementById("notificationDropdown").getAttribute("aria-expanded").valueOf() === 'false') {
    return;
  }
  // Fetch notifications
  const response = await fetch("/notifications/", {
    method: "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      action: `${action}`,
    },
  });

  const notification_ul = document.getElementById("notification_ul");
  if (response.ok) {
    const data = await response.json();
    notification_ul.innerHTML = data.html;
    const notification_indicator = document.getElementById("notification-on");
    if (notification_indicator)
      notification_indicator.classList.add("d-none");
  } else {
    createToast({ type: 'error', error_message: 'Failed to Fetch Notifications List', title: "Failed to fetch Notifications!" });
  }

}

// Create a function to create a toast div and append it to the body
function createToast(content) {
  const existingToast = document.getElementById("toast");
  if (existingToast) {
    const existingBsToast = bootstrap.Toast.getInstance(existingToast);
    if (existingBsToast) {
      existingBsToast.dispose();
    }
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.classList.add("toast");
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.setAttribute("onclick", `messageToastClick('${JSON.stringify(content)}')`);

  // Create the toast-header div
  const toastHeader = document.createElement("div");
  toastHeader.id = "toast-header";
  toastHeader.classList.add("toast-header");

  // Create the toast icon span
  const toastIcon = document.createElement("span");
  toastIcon.id = "toast-icon";
  toastIcon.classList.add("me-2");

  // Create the toast title
  const toastTitle = document.createElement("strong");
  toastTitle.id = "toast-title";
  toastTitle.classList.add("ms-2", "me-auto");
  toastTitle.textContent = "Notification";

  // Create the close button
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("btn-close");
  closeButton.setAttribute("data-bs-dismiss", "toast");
  closeButton.setAttribute("aria-label", "Close");

  // Append the elements to the toast-header
  toastHeader.appendChild(toastIcon);
  toastHeader.appendChild(toastTitle);
  toastHeader.appendChild(closeButton);

  // Create the toast-body div
  const toastBody = document.createElement("div");
  toastBody.id = "toast-body";
  toastBody.classList.add("toast-body");

  toast.appendChild(toastHeader);
  toast.appendChild(toastBody);
  document.body.appendChild(toast);


  if (`${content.type}` === "error") {
    toastBody.textContent = `${content.error_message}`;
    toastTitle.textContent = `${content.title} - Error`;
    toastHeader.classList.add("bg-danger", "text-white");
    toastIcon.className = "fas fa-exclamation-circle text-warning";
  } else if (`${content.type}` === "game_invite") {
    toastTitle.textContent = `${content.title}`;
    toastBody.textContent = `${content.message}`;
    toastHeader.classList.add("bg-warning", "text-dark");
    toastIcon.className = "fas fa-gamepad mt-2";
    toastIcon.style.color = "#ff0080";
  } else if (`${content.type}` === "chat_message") {
    toastTitle.textContent = `Message from ${content.sender}`;
    toastBody.textContent = `${content.message}`;
    toastHeader.classList.add("#84ddfc", "text-light");
    toastIcon.className = "fas fa-comment-alt text-info mt-2";
    toastIcon.style.color = "red";
  } else if (`${content.type}` === "friend_request") {
    toastBody.textContent = `${content.message}`;
    toastTitle.textContent = `${content.title}`;
    toastHeader.classList.add("bg-secondary", "text-light");
    toastIcon.className = "fas fa-user-plus";
  } else {
    toastBody.textContent = `Some kind of notification`;
    toastTitle.textContent = `Dont know what this is`;
    toastHeader.classList.add("bg-secondary", "text-light");
    toastIcon.className = "fas fa-info-circle";
  }

  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}

// message toast onclick
async function messageToastClick(contentStr) {
  const content = JSON.parse(contentStr);
  if (`${content.type}` === 'chat_message') {
    if (window.location.href.includes('/chat'))
      return;
    await updateUI('/chat');
  }
  if (`${content.type}` === 'friend_request') {
    if (window.location.href.includes(`/profile/${content.sender}`))
      return;
    await updateUI(`/profile/${content.sender}`);
  }
}

function inputValidator(input) {
  const regex = /^[a-zA-Z0-9_]+$/;
  return regex.test(input);
}