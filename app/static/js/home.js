// function isAuthenticated() {
//     return localStorage.getItem('access_token') !== null;
// }

// document.addEventListener('DOMContentLoaded', function() {
//     if (!isAuthenticated()) {
//         // Redirect to login page if not authenticated
//         window.location.href = '/login/';
//         return;
//     }

//     // Load homepage content
//     loadHomepage();
// });

// async function loadHomepage() {
//     try {
//         const response = await fetch('/home/', {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//             }
//         });

//         if (response.status === 401) {
//             // Token expired or invalid, try refreshing
//             await refreshToken();
//             loadHomepage(); // Retry loading homepage
//             return;
//         }

//         if (!response.ok) {
//             throw new Error('Failed to load homepage');
//         }

//         const content = await response.text();
//         document.body.innerHTML = content;
//     } catch (error) {
//         console.error('Error loading homepage:', error);
//         // Handle error (e.g., redirect to login page)
//         window.location.href = '/login/';
//     }
// }

// async function refreshToken() {
//     const refreshToken = localStorage.getItem('refresh_token');
//     if (!refreshToken) {
//         throw new Error('No refresh token available');
//     }

//     try {
//         const response = await fetch('/api/token/refresh/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ refresh: refreshToken }),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to refresh token');
//         }

//         const data = await response.json();
//         localStorage.setItem('access_token', data.access);
//     } catch (error) {
//         console.error('Error refreshing token:', error);
//         // Handle error (e.g., redirect to login page)
//         window.location.href = '/login/';
//     }
// }