
# ****=============================================************ TODO lists ***********=======================================*******

## ******************************* UI related TODO list **************************
1. chat notification - toast : ................................................................................DONE!
2. show error - toast........................................................................................................... ............DONE!
3. chat UI (three dot & small-screens ) .....................................................................................................DONE!
4. loading screen..........................................................................................-> DONE!
5. styling 'no chat found' in chat page ..................................................................-> DONE!
6. game history rows styling...................................................................................................................-> DONE!
7. leaderboard page......................................................................-> DONE!

## ******************************* UX related TODO list **************************
1. UX: after password change, prompt user to 'login again' ............................................................DONE!
2. add icons to all friendship buttons --------------- DONE

## ******************************* Game related TODO list **************************
1. player names should be displayed before clicking start............................................................-> DONE!
2. modals issues --------------- HIGH PRIORITY!!!!!!!!!!!!!!!

## ******************************* Real-Time (chat, notification, friendship) TODO list **************************
1. blocking/unblocking, game invitation through chat .................................................................DONE!
2. duplication of notifications - ex: sending friendship notification - cancel it - send request again. there will be two notifications,
    -> will think about it if its okay like that or just remove the older one or update the date of friend request or some.... ----- DONE!

## ******************************* Everything Backend related TODO list **************************
1. token revocation after user after password change and forget password ............................................................................................DONE!
2. utilizing refresh token............................................................................................DONE
3. When url is altered for user profiles (i.e http://localhost/profile/mhaile9), Page instead of returning 404, it is showing empty profile. --------- FIXED

## ******************************* SPA related TODO list ************************** NOT FIXED YET
1. accepting multiple js/css files from one endpoint............................................................DONE!
2. when token expired, clicked on the profile (in dropdown)... singin loaded but the URL was still /profile/'player'. .................FIXED
3. after login/signup and redirected to homepage, if you click on the browser back button, it will take you to sign in page (eventhogh he is authenticated)!
  -> partial fix: now he is bieng redirected back to the home page, but the url is still /signin
  #? another issue - browser back/forward is resulting 404 for nested routes like /profile/haben............................................->
4. When a localgame is selected (either 1 v 1 or AI), then home is clicked and then again localgame is selected, Error is happening for both AI and 1 V 1 : Error=> global variable has already been declared---- FIXED
5. When modals are being displayed and the back | forward page of the browser is clicked. MUST resolve.


# ****=============================================************ Testing case ***********=======================================*******
1. input length limiting in ALL input fields ------------------------- NOT TESTED!
2. Uplading pfp is not working (Front-end Issue)--------------------------------------NOT FIXED!


<!-- NEW -->
1. Sometimes last game is not sent to the game history tournament modal. Only 6 games are being sent to the profile page. ( I think the case is when, the logged in player is knocked out in the first round. Note sure though).  Screenshot image for the case is the Resources folder named "temp.png".
2. When a tournament is not completed (i.e. refresh before the tournament ends), there is an error when trying to display on the game history tournament modal.
3. When sending player names for the tournament modal for the game history dashboard, limit username to be from 3-6 chars. If more, list the first 4 letters and put .. (for reponsiveness).
4. If possible, the tournament.css sent to the profile page when the tournament history is clicked should be removed when the tournament modal is closed bc It is creating some visual issues.
5. Time (hour to be specific) is not UAE timezone.
6. Round up the decimal value for the WIN PERCENTAGE field on the Leaderboard page.

