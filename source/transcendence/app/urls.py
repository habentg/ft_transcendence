from django.urls import path, re_path
from .views import *
# from django.urls import URLResolver, URLPattern
# from django.urls.resolvers import get_resolver
# from .views import Index, SignUpView, HomeView, SignInView, CsrfRequest, OauthCallback, Catch_All, PasswordReset, PassResetNewPass, PassResetConfirm, TwoFactorAuth, Auth_42, SignOutView, HealthCheck


# class TrailingSlashURLResolver(URLResolver):
#     def resolve(self, path):
#         if path.endswith('/'):
#             path = path.rstrip('/')
#         return super().resolve(path)

# def get_trailing_slash_resolver():
#     return TrailingSlashURLResolver(get_resolver(None))

urlpatterns = [
    path('', Index.as_view(), name='landing'),
    re_path(r'^home/?$', HomeView.as_view(), name='home_page'),
    re_path(r'^signup/?$', SignUpView.as_view(), name='signup_page'),
    re_path(r'^signin/?$', SignInView.as_view(), name='signin_page'),
    re_path(r'^signout/?$', SignOutView.as_view(), name='signout_page'),
    re_path(r'^csrf_request/?$', CsrfRequest.as_view(), name='crf_request'),
    re_path(r'^auth_42/?$', Auth_42.as_view(), name='auth_42'),
    re_path(r'^oauth/?$', OauthCallback.as_view(), name='oauth'),
    re_path(r'^password_reset/?$', PasswordReset.as_view(), name='password_reset'),
    re_path(r'^password_reset_newpass/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z\-]+)/?$', PassResetNewPass.as_view(), name='password_reset_newpass'),
    re_path(r'^password_reset_confirm/?$', PassResetConfirm.as_view(), name='password_reset_newpass'),
    re_path(r'^2fa/?$', TwoFactorAuth.as_view(), name='password_reset_newpass'),
    re_path(r'^health/?$', HealthCheck.as_view(), name='health_check'),
    re_path(r'^profile/?$', ProfileView.as_view(), name='profile'),
    re_path(r'^.*$', Catch_All.as_view(), name='catch_all'),
]

""" 

    SELECT id, username, first_name, last_name, email, password, tfa, secret, verified, is_superuser, is_staff, is_active, date_joined, last_login FROM app_player;

 """



""" 


Thank you for providing your SPA router code. I can see that you've implemented a custom routing solution. To optimize this router and prevent duplicate requests on initial page load, we can make a few modifications. Here's an updated version of your code with the optimization:

javascript

Verify

Open In Editor
Edit
Copy code
// ... (keep your routes and protectedRoutes as they are)

// Add this at the top of your file
let isInitialLoad = true;

// Modify handleLocationChange function
handleLocationChange = async () => {
    let path = window.location.pathname.slice(1);
    path = path.replace(/\/$/, ''); // Remove trailing slash if present
    
    if (isInitialLoad) {
        isInitialLoad = false;
        // On initial load, the server has already sent the content,
        // so we don't need to fetch it again
        return;
    }
    
    await loadContent(path);
};

// ... (keep your route function as it is)

// Modify your event listeners
window.addEventListener('popstate', handleLocationChange);
window.addEventListener('load', () => {
    // On initial load, we still want to set up the page,
    // but we don't want to make a duplicate request
    isInitialLoad = true;
    handleLocationChange();
});

// Modify loadContent function
async function loadContent(route) {
    try {
        if (protectedRoutes.includes(route)) {
            if (!isAuthenticated() && route === 'home') {
                history.pushState(null, '', '/');
                handleLocationChange();
                return;
            }
            else if (!isAuthenticated()) {
                history.pushState(null, '', '/signin');
                handleLocationChange();
                return;
            }
            await loadProtectedPage(route);
            return;
        }
        else if (route === '' && isAuthenticated()) {
            history.pushState(null, '', '/home');
            await loadProtectedPage('/home');
            return;
        }
        
        console.log("route:", route);
        
        // Only make the fetch request if it's not the initial load
        if (!isInitialLoad) {
            const response = await fetch(`${route}/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            // ... (rest of your loadContent function remains the same)
        }
    } catch (error) {
        console.error(`Failed to load -- ${route} -- page content:`, error);
    }
}

// ... (keep the rest of your functions as they are)
Key changes:

We've added an isInitialLoad flag at the top of the file.
In the handleLocationChange function, we check if it's the initial load. If it is, we set the flag to false and return early, preventing a duplicate request.
In the load event listener, we set isInitialLoad to true before calling handleLocationChange.
In the loadContent function, we only make the fetch request if it's not the initial load.
These changes should prevent the duplicate request on initial page load while maintaining the functionality for subsequent navigation within your SPA.

Remember to test this thoroughly, especially for different scenarios like direct URL access, navigation within the SPA, and using browser back/forward buttons.

 """