1. after login in with 2fa (OTP), the navbar is not being updated in home page.
2. signout button in the profile icon dropdown is not working properly.
3. changing password reset to OTP instead of a link .... or just add an OTP on top of existing method
4. loading screen
5. About Us, contact Us, Terms & conditions, and privacy policy pages ... gonna be static files.
6. websocket and chat app.


NEW
1. Long in with intra is not working. It gives error below
{
  "error": "Failed to obtain access token"
}


Thursday night:
-> fix 404 and the static pages loading problem with the nav bar
-> user anonymization
-> eventlistner attachment to the friendship buttons

(ALL DONE)



Saturday cases - NOT FIXED YET
1, Home css & js files not removed from base html( header)
2, Friend search issue ( not working when browser back btn is clicked )
3, static pages (e.g about us) page when reloaded/refreshed profile picture on navbar is goind to default pic.
  -> NOTE: request is not going through [JWTCookieAuthentication] ... so couldnt get the profile picture






Friday cases - Unsolved Cases
1, All css & js files are deleted, except the during signout from friend search (needs revision).

