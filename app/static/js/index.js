document.addEventListener('DOMContentLoaded', () => {
    // Listen for clicks on navigation links
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('nav-link')) {
            event.preventDefault();
            const route = event.target.getAttribute('href').slice(1);  // Remove the '#'
            navigateTo(route);
        }
    });
    
    // Initial content load
    const initialRoute = window.location.hash.slice(1);
    navigateTo(initialRoute);

	// Add event listener for popstate event
	window.addEventListener('popstate', (event) => {
		const route = window.location.hash.slice(1);
		loadContent(route);
	});
});

function navigateTo(route) {
    // Update the URL
    history.pushState(null, '', `#${route}`);
    if (route === '') {
        route = 'home';
        console.log("route is empty, setting to home");
    }
    loadContent(route);
}

const loadedScripts = new Set();
const loadedStyles = new Set();

async function loadPageSpecificStyles(route) {
    // Remove all existing page-specific styles
    loadedStyles.forEach(id => {
        const css_link = document.getElementById(`${id}-css`);
        const script_link = document.getElementById(`${id}-script`);
        if (css_link && id !== route) {
            css_link.remove();
        }
        if (script_link && id !== route) {
            script_link.remove();
        }
    });

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = `${route}-css`;
    link.href = `/static/css/${route}.css`;
    
    const script = document.createElement('script');
    script.src = `/static/js/${route}.js`;
    script.id = `${route}-script`;
    script.defer = true;
    // If this route's styles haven't been loaded yet, load them
    if (!loadedStyles.has(route)) {
        console.log("loading css content for route: " + route);
        // Wait for the CSS to load before continuing
        await new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
            document.head.appendChild(script);
        });
        
        loadedStyles.add(`${route}`);
    }
}

async function loadContent(route) {

	const response = await fetch(`/api/${route}/`)
        .then(response => response.json())
        .then(data => {
            // laoding the page specific css
            loadPageSpecificStyles(route);

            // loading the page specific js
            document.getElementById('content').innerHTML = data.html;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('content').innerHTML = '<h1>Error loading content</h1>';
        });
}


// Function to get JWT token from local storage and return it in the format required for the Authorization header
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}