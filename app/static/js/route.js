
// possible routes
const routes = [
    '/',
    '/home',
    '/signup',
    '/signin',
    '/signout',
    '/profile',
    '/404',
];

// This function is used to change the URL of the browser without reloading the page
const route = (event) => {
    event.preventDefault();

    history.pushState(null, '', event.target.href);
    console.log(event.target.href);
    // call the function to change the content of the page

    // changeContent(event.target.href);
}

window.route = route;
