# Step-by-Step Flow
## User Navigates to a Profile:
```
The user (let's call them User A) navigates to the profile of another user (let's call them User B).
The frontend displays User B's profile, showing their username, profile information, and an "Add Friend" button.
```

## User A Clicks "Add Friend":
```
When User A clicks the "Add Friend" button, a request is sent to the backend to create a friend request.
This can be done using an AJAX call or a form submission, depending on how the frontend is implemented.
Sending the Friend Request:

The frontend sends a POST request to a specific endpoint (e.g., /send_friend_request/) with data that includes User A's ID (as the sender) and User B's ID (as the receiver).
The backend receives this request and processes it in a view function.

```
## Backend Handling:
```
In the backend view, the system checks if there is already an existing friend request between User A and User B. If not, it creates a new FriendRequest instance.
The FriendRequest model's sender is set to User A, receiver is set to User B, and the status is set to 'PENDING'.
The system may also check if User A and User B are already friends (by checking their FriendList), and if they are, it can return an appropriate response indicating that they are already friends.
If the friend request is successfully created, the backend responds to the frontend with a success message.

```
## User B Receives the Friend Request:
```
User B can see the friend request when they log in or refresh their profile page. The frontend may have a section (like a notifications dropdown) that displays pending friend requests.
User B can choose to accept or decline the request.

```
## Accepting the Friend Request:
```
If User B clicks on "Accept" for the friend request, the frontend sends a POST request to an endpoint (e.g., /accept_friend_request/) with the ID of the FriendRequest instance.
The backend view for accepting a friend request retrieves the FriendRequest object using the provided ID.

```
## The accept method of the FriendRequest model is called:
```It checks if the status is 'PENDING'. If it is, the status is updated to 'ACCEPTED'.
It retrieves or creates the FriendList instances for both User A and User B.
Both users are added to each other's friend lists using the add_friend method in the FriendList model.
The backend responds to the frontend with a success message indicating that the friendship has been established.

```
## Declining the Friend Request:
```
If User B clicks on "Decline," the frontend sends a POST request to an endpoint (e.g., /decline_friend_request/) with the ID of the FriendRequest.
The backend retrieves the FriendRequest object and calls the decline method, which updates the status to 'DECLINED'.
The backend responds to the frontend with a message indicating that the friend request has been declined.

```
## Frontend Updates:
```
After the friend request is accepted or declined, the frontend updates the UI to reflect the new state.
If accepted, User A and User B’s profiles may show that they are now friends. If declined, the friend request can be removed from User B's notifications.
```
# Summary of the Flow
```
-> User A navigates to User B's profile and clicks "Add Friend."
-> A friend request is created in the backend (status: PENDING).
-> User B sees the pending request and can choose to accept or decline it.
-> If User B accepts, the friend request status is updated, and both users are added to each other's friend lists.
-> If User B declines, the friend request status is updated to DECLINED.
-> The frontend updates to reflect the changes in the friendship status.
-> Conclusion
-> This flow illustrates how the frontend and backend interact to manage friend requests and friendships in your Django application. The use of models like FriendList and FriendRequest allows for efficient handling of friendships, ensuring that adding and removing friends is bidirectional and consistent across both users' profiles.
```