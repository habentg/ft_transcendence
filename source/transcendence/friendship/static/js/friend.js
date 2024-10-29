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

    const removeFriendBtn = document.getElementById("remove_friend_btn");
    if (removeFriendBtn) {
        removeFriendBtn.addEventListener("click", removeFriend);
    }
}

// instead of calling friend() directly, we wait for the DOM to load
document.addEventListener("DOMContentLoaded", friend);