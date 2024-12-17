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
      console.error("Failed to fetch CSRF token:", error);
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
  console.log("error_msg:", error_msg);
  document.getElementById("error-msg").innerText = error_msg;
  document.getElementById("error-msg").style.display = "block";
}

// 42 Oauth2.0
/* setting up and initiating an OAuth 2.0 authorization flow with the 42 intranet API. */
/* Initiating an OAuth 2.0 authorization flow with the 42 intranet API. */
async function handle42Login() {
  try {
    const response = await fetch("/auth_42/", {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    const resposeData = await response.json();

    const authUrl = resposeData.authorization_url;

    console.log("authUrl:", authUrl);
    window.location.href = authUrl;
  } catch (error) {
    console.error("Error in handle42Login:", error);
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
  // get all syles and scripts
  let allStyles = document.getElementsByTagName("link");
  let allScripts = document.getElementsByTagName("script");

  // remove existing
  for (let i = 0; i < allStyles.length; i++) {
    if (allStyles[i].id.includes("/static/")) {
      console.log("removing:", allStyles[i].id);
      allStyles[i].remove();
    }
  }
  for (let i = 0; i < allScripts.length; i++) {
    if (allScripts[i].id.includes("/static/")) {
      console.log("removing:", allScripts[i].id);
      allScripts[i].remove();
    }
  }
  // if (currentResourcesName.css !== null) {
  //   const prev_css = document.getElementById(`/static/${currentResourcesName.css}-id`);
  //   if (prev_css) {
  //     prev_css.remove();
  //   }
  //   currentResourcesName.css = null;
  // }
  // if (currentResourcesName.js !== null) {
  //   const prev_js = document.getElementById(`/static/${currentResourcesName.js}-id`);
  //   if (prev_js) {
  //     prev_js.remove();
  //   }
  //   currentResourcesName.js = null;
  // }
};

const loadCssandJS = (data, remove_prev_resources) => {
  // object deconstruction
  // fancy way of:
  /* 
        cont css_file_path = data.css
        cont js_file_path = data.js
    */
  const { js: js_file_path, css: css_file_path } = data;

  // Remove previous CSS & js
  if (remove_prev_resources) {
    console.log("removing previous resources");
    removeResource();
  }
  // loading new css
  if (css_file_path) {
    if (document.getElementById(`/static/${css_file_path}-id`)) return;
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = `/static/${css_file_path}`;
    link.id = `/static/${css_file_path}-id`;
    document.head.appendChild(link);
    // currentResourcesName.css = css_file_path; // hold it for delete
  }
  // loading new js
  if (js_file_path) {
    if (document.getElementById(`/static/${js_file_path}-id`)) return;
    let script = document.createElement("script");
    script.src = `/static/${js_file_path}`;
    script.id = `/static/${js_file_path}-id`;
    script.defer = true;
    document.head.appendChild(script);
    // currentResourcesName.js = js_file_path;
  }
};

// update the Navbar for authenticated users && for signout and deleted users
async function updateNavBar(isAuthenticated) {
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

    console.log("profilePic:", profilePic);
    console.log("username:", username);
    navbar.innerHTML = `
    <ul class="navbar-nav ms-auto align-items-center">
      <li class="nav-item">
        <a href="#" class="nav-link"><i class="fas fa-trophy me-2"></i>Leaderboard</a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link"><i class="fas fa-users me-2"></i>Friends</a>
      </li>
      <li class="nav-item">
        <a href="/chat" class="nav-link" onclick="appRouter()"><i class="fas fa-comments me-2"></i>Chat</a>
      </li>
      <li class="nav-item ms-lg-2 dropdown">
        <a
          class="nav-link position-relative notification-badge"
          href="#"
          role="button"
          id="notificationDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="fas fa-bell"></i>
        </a>
        <ul
          class="dropdown-menu dropdown-menu-end"
          aria-labelledby="notificationDropdown"
          style="width: 300px;" 
        >
          <!-- Notifications -->
          <li style="border-bottom: 1px solid #ffffff; padding-bottom: 0.3rem; margin-bottom: 0.3rem;">
            <a class="dropdown-item" href="#"><i class="fas fa-user me-3"></i>Friend Request <i class="fas fa-user-plus ms-3"></i></a>
            <div class="small test-mute ms-3" style="color: antiquewhite;"> John Doe has sent you a friend request</div>
          </li>
          <li style="border-bottom: 1px solid #ffffff; padding-bottom: 0.3rem; margin-bottom: 0.3rem;">
            <a class="dropdown-item" href="#"><i class="fas fa-user me-3"></i>Friend Request <i class="fas fa-user-plus ms-3"></i></a>
            <div class="small test-mute ms-3" style="color: antiquewhite;"> John Doe has sent you a friend request</div>
          </li>
          <li style="border-bottom: 1px solid #ffffff; padding-bottom: 0.3rem; margin-bottom: 0.3rem;">
            <a class="dropdown-item" href="#"><i class="fas fa-user me-3"></i> New message <i class="fas fa-envelope ms-3"></i></a>
            <div class="small test ms-3" style="color: antiquewhite;"> John Doe has sent you a message</div>
          </li>
          <!-- See more option that leads to the notification page -->
          <li>
            <a class="dropdown-item" href="#"><i class="fas fa-ellipsis-h me-3"></i>See More</a>
          </li>

        </ul>
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
        <a href="#" class="nav-link"><i class="fas fa-gamepad me-2"></i>Quick game</a>
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
      console.log("Signed out successfully ------ from utils");
      removeResource();
      updateNavBar(false);
      await updateUI("", false);
    } else {
      throw new Error("Failed to sign out");
    }
  } catch (error) {
    console.error("Error:", error);
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
  //check if its expanded - if its simply return
  // Fetch notifications
  const response = await fetch("/notifications/", {
    method: "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      action: `${action}`,
    },
  });

  const notification_ul = document.getElementById("notification_ul");
  if (response.status === 404) {
    notification_ul.innerHTML = `
      <p class="text-center text-muted my-2">No notifications</p>
    `;
    return console.log("No notifications");
  }
  if (response.ok) {
    const data = await response.json();
    notification_ul.innerHTML = data.html;
    console.log("data.html:", data.html);
  } else {
    console.error("Failed to fetch notifications:", response.statusText);
  }
}

// Creates a toast notification that show a message passed as an argument
// function showToast(type, title, message) {
//   const toast = document.getElementById("toast");
//   const toastHeader = document.getElementById("toast-header");
//   const toastBody = document.getElementById("toast-body");
//   const toastIcon = document.getElementById("toast-icon");
//   const toastTitle = document.getElementById("toast-title");

//   if (!toast || !toastHeader || !toastBody || !toastIcon || !toastTitle) {
//     console.error("Toast elements not found!");
//     return;
//   }

//   toastBody.textContent = message;

//   toastTitle.textContent = title;

//   if (type === "error") {
//     toastHeader.classList.remove("bg-primary", "text-light");
//     toastHeader.classList.add("bg-danger", "text-white");
//     toastIcon.className = "fas fa-exclamation-circle text-warning";
//   } else if (type === "chat") {
//     toastHeader.classList.remove("bg-danger", "text-white");
//     toastHeader.classList.add("bg-primary", "text-light");
//     toastIcon.className = "fas fa-comment-dots text-info";
//   } else {
//     console.warn("Unknown toast type, defaulting to chat.");
//     toastHeader.classList.remove("bg-danger", "text-white");
//     toastHeader.classList.add("bg-secondary", "text-light");
//     toastIcon.className = "fas fa-info-circle";
//   }

//   const bsToast = new bootstrap.Toast(toast);
//   bsToast.show();
// }

// Create a function to create a toast div and append it to the body
function createToast(type, title, message) {
  const toast = document.createElement("div");
  toast.id = "toast";
  toast.classList.add("toast");
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

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

  toastBody.textContent = message;
  toastTitle.textContent = title;

  if (type === "error") {
    toastHeader.classList.remove("bg-primary", "text-light");
    toastHeader.classList.add("bg-danger", "text-white");
    toastIcon.className = "fas fa-exclamation-circle text-warning";
  } else if (type === "chat") {
    toastHeader.classList.remove("bg-danger", "text-white");
    toastHeader.classList.add("bg-primary", "text-light");
    toastIcon.className = "fas fa-comment-dots text-info";
  } else {
    console.warn("Unknown toast type, defaulting to chat.");
    toastHeader.classList.remove("bg-danger", "text-white");
    toastHeader.classList.add("bg-secondary", "text-light");
    toastIcon.className = "fas fa-info-circle";
  }

  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}
