

## ******************************* UI related TODO list **************************
1. chat notification - toast : ................................................................................DONE!
2. show error - toast..........................................................................................DONE!
3. chat UI .....................................................................................................DONE!
4. loading screen..........................................................................................->

## ******************************* UX related TODO list **************************
1. UX: after password change, prompt user to 'login again' ............................................................->

## ******************************* Game related TODO list **************************
1. 

## ******************************* Real-Time (chat, notification, friendship) TODO list **************************
1. blocking/unblocking, game invitation through chat .......................................................................->
2. duplication of notifications - ex: sending friendship notification - cancel it - send request again. there will be two notifications,
    -> will think about it if its okay like that or just remove the older one or update the date of friend request or some....

## ******************************* Everything Backend related TODO list **************************
1. token revocation after user after password change and forget password ............................................................................................DONE!
2. utilizing refresh token............................................................................................->

## ******************************* SPA related TODO list ************************** NOT FIXED YET
1. accepting multiple js/css files from one endpoint..............................................................................DONE!
2. when token expired, clicked on the profile (in dropdown)... singin loaded but the URL was still /profile/'player'. .................->
3. after login/signup and redirected to homepage, if you click on the browser back button, it will take you to sign in page (eventhogh he is authenticated)!
  -> partial fix: now he is bieng redirected back to the home page, but the url is still /signin
  #? another issue - browser back/forward is resulting 404 for nested routes like /profile/haben............................................->
