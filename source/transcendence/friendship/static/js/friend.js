async function addFriendRequest() {
    console.log("addFriendRequest");
    const toBeFriend = document.getElementById("username").value;
    try {
        const response = await fetch(`/friend_request/${toBeFriend}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log("Response status:", response.status); // Log the response status

        if (response.status === 201) {
            const addFriendBtn = document.getElementById("add_friend_btn");
            if (addFriendBtn) {
                addFriendBtn.id = "cancel_request_btn";
                addFriendBtn.innerText = "Cancel Friend Request";
            }
            return;
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log("addFriendRequest Error: ", error);
    }
}

async function cancelFriendRequest() {
    console.log("we here to cancel friend request");
    const toBeFriend = document.getElementById("username").value;
    try {
        const response = await fetch(`/friend_request/${toBeFriend}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log("Response status:", response.status); // Log the response status

        if (response.status === 200) { // successfully cancelled the friend request
            const cancelFriendRequestBtn = document.getElementById("cancel_request_btn");
            if (cancelFriendRequestBtn) {
                console.log("we editing the cancel request button");
                cancelFriendRequestBtn.id = "add_friend_btn";
                cancelFriendRequestBtn.innerText = "Send Friend Request";
            }
            console.log("Cancelled friend request");
            return;
        }

        const data = await response.json();
        console.log("WHAT: ", data);
    } catch (error) {
        console.log("cancelFriendRequest Error: ", error);
    }
}

async function acceptOrDeclineFriendRequest(action) {
    console.log("acceptOrDeclineFriendRequest");
    const toBeFriend = document.getElementById("username").value;
    try {
        const response = await fetch(`/friend_request_response/${toBeFriend}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: `${action}`
            }),
        });

        console.log("Response status:", response.status); // Log the response status

        if (response.status === 200) {
            console.log(" ---- Friend request fulfilled ---- ");
            // updateUI(`/profile/${toBeFriend}/`, false)
            return;
        }
        
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log("acceptFriendRequest Error: ", error);
    }
}

async function removeFriend() {
    console.log("removeFriend");
    const toBeFriend = document.getElementById("username").value;
    try {
        const response = await fetch(`/friend_request/${toBeFriend}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log("Response status:", response.status); // Log the response status
        
        if (response.status === 200) {
            
            console.log(" ---- removed a friend  ---- ");
            // updateUI(`/profile/${toBeFriend}`, false)
            return;
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log("removeFriend Error: ", error);
    }
}

function friend() {
    const addFriendBtn = document.getElementById("add_friend_btn");
    if (addFriendBtn) {
        console.log("addFriend - addEventListener");
        addFriendBtn.addEventListener("click", addFriendRequest);
    }

    const cancelFriendRequestBtn = document.getElementById("cancel_request_btn");
    if (cancelFriendRequestBtn) {
        console.log("cancelFriendRequest - addEventListener");
        cancelFriendRequestBtn.addEventListener("click", cancelFriendRequest);
    }

    const acceptFriendBtn = document.getElementById("accept_request_btn");
    if (acceptFriendBtn) {
        acceptFriendBtn.addEventListener("click", () => {
            console.log("accept friend request");
            acceptOrDeclineFriendRequest("accept");
        });
    }
    const declineFriendBtn = document.getElementById("decline_request_btn");
    if (declineFriendBtn) {
        declineFriendBtn.addEventListener("click", () => {
            console.log("decline friend request");
            acceptOrDeclineFriendRequest("decline");
        });
    }
    const removeFriendBtn = document.getElementById("unfriend_btn");
    if (removeFriendBtn) {
        removeFriendBtn.addEventListener("click", removeFriend);
    }
}

// instead of calling friend() directly, we wait for the DOM to load
document.addEventListener("DOMContentLoaded", friend);
