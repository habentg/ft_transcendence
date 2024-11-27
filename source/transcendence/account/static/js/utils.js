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
let currentResourcesName = {
  css: null,
  js: null,
};

/* removing the object form DOM */
const removeResource = () => {
  if (currentResourcesName.css !== null) {
    const prev_css = document.getElementById(`${currentResourcesName.css}-id`);
    if (prev_css) {
      prev_css.remove();
    }
    currentResourcesName.css = null;
  }
  if (currentResourcesName.js !== null) {
    const prev_js = document.getElementById(`${currentResourcesName.js}-id`);
    if (prev_js) {
      prev_js.remove();
    }
    currentResourcesName.js = null;
  }
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
    removeResource();
  }
  // loading new css
  if (css_file_path) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = `/static/${css_file_path}`;
    link.id = `${css_file_path}-id`;
    document.head.appendChild(link);
    currentResourcesName.css = css_file_path; // hold it for delete
  }
  // loading new js
  if (js_file_path) {
    let script = document.createElement("script");
    script.src = `/static/${js_file_path}`;
    script.id = `${js_file_path}-id`;
    script.defer = true;
    document.head.appendChild(script);
    currentResourcesName.js = js_file_path;
  }
};


// update the Navbar for authenticated users && for signout and deleted users
async function updateNavBar(isAuthenticated) {
  const navbar = document.getElementById("navbarNavDropdown");
  if (isAuthenticated) {
    let profilePic = "/static/images/default_profile_pic.jpeg";
    let username = "";
    const user_profile_pic = document.getElementById("nav_profile_pic");
    const profile_btn = document.getElementById("profile_btn");
    username = profile_btn.dataset.username;
    if (user_profile_pic) {
      profilePic = user_profile_pic.dataset.pfp;  // Same as user_profile_pic.getAttribute("data-pfp");
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
        <a href="#" class="nav-link"><i class="fas fa-comments me-2"></i>Chat</a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link position-relative notification-badge"><i class="fas fa-bell"></i></a>
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

// Sign Out Modal
function showSignOutModal(event) {
  event = event || window.event;
  event.preventDefault();
  const existingModal = document.getElementById("sign-out-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "sign-out-modal";
  modal.className = "modal fade show";
  modal.style.display = "block";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="content modal-content">
        <div class="modal-header border-0 py-3">
          <h5 class="modal-title text-info">
            <i class="fas fa-sign-out-alt me-2"></i>Sign Out
          </h5>
          <button type="button" class="btn-close btn-close-white" id="close-signout-modal"></button>
        </div>
        <div class="modal-body px-3 py-2">
          <p class="text-white mb-0">Are you sure you want to sign out?</p>
        </div>
        <div class="modal-footer border-0 py-3">
          <button id="signout-confirm" class="btn btn-info btn-sm">
            <i class="fas fa-sign-out-alt me-2"></i>Sign Out
          </button>
          <button id="signout-cancel" class="btn btn-outline-light btn-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  // Event Listeners
  modal
    .querySelector("#close-signout-modal")
    .addEventListener("click", closeSignOutModal);
  modal
    .querySelector("#signout-cancel")
    .addEventListener("click", closeSignOutModal);
  modal
    .querySelector("#signout-confirm")
    .addEventListener("click", handleSignOut);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeSignOutModal();
  });
}

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
      updateNavBar(false);
      await updateUI("/", false);
    } else {
      throw new Error("Failed to sign out");
    }
  } catch (error) {
    console.error("Error:", error);
    displayError({ error_msg: "Failed to sign out" });
  }
}

document.addEventListener('click', function(event) {
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');

  if (navbarToggler && navbarCollapse) {
    if (!navbarCollapse.contains(event.target) && !navbarToggler.contains(event.target)) {
      if (navbarCollapse.classList.contains('show')) {
        navbarToggler.click();
      }
    }
  }
});

document.querySelectorAll('.navbar-nav .nav-link').forEach(function(navLink) {
  navLink.addEventListener('click', function() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
  
    // Don't collapse if Profile from navbar is clicked

    if ((navbarToggler && navbarCollapse.classList.contains('show') && !navLink.classList.contains('profile-link'))) {
      navbarToggler.click();
    }
  });
});