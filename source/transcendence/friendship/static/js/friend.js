/* sending friend Request  - to add him as friends*/
async function addFriendRequest() {
    const toBeFriend = document.getElementById("username").value;
    try {
        const response = await fetch(`/friend_request/${toBeFriend}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.status == 201) {
            document.getElementById("add_friend_btn").id = "cancel_friend_btn";
            document.getElementById("cancel_friend_btn").innerText = "Cancel Request";
            return ;
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log("addFriendRequest Eroor: ", error);
    }
}
/* sending cancel friend Request - to cancel a friend request previously sent (were not friends yet) */
/* sending remove friend Request - to remove a friend from the friend list */

function friend() {
    const addFriendBtn = document.getElementById("add_friend_btn");
    if (addFriendBtn)
        addFriendBtn.addEventListener("click", addFriendRequest);
    const cancelFriendRequestBtn = document.getElementById("cancel_friend_btn");
    if (cancelFriendRequestBtn)
        cancelFriendRequestBtn.addEventListener("click", cancelFriendRequest);
    const removeFriendBtn = document.getElementById("remove_friend_btn");
    if (removeFriendBtn)
        removeFriendBtn.addEventListener("click", removeFriend);
}

friend();