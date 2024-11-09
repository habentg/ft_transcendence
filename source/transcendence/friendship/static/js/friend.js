/* reataching the eventListners for the buttons

  @ spent days figuring out this shit
*/

async function addFriendRequest() {
  console.log("addFriendRequest");

  const toBeFriend = document
    .getElementById("username")
    .getAttribute("data-username");
    console.log("toBeFriend: ", toBeFriend);
  try {
    const response = await fetch(`/friend_request/${toBeFriend}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status); // Log the response status

    if (response.status === 201) {
      await updateUI(`/profile/${toBeFriend}`, false);
      // attachFriendEventListners();
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
  const toBeFriend = document
  .getElementById("username")
  .getAttribute("data-username");
  console.log("toBeFriend: ", toBeFriend);
  try {
    const response = await fetch(`/friend_request/${toBeFriend}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status); // Log the response status

    if (response.status === 200) {
      await updateUI(`/profile/${toBeFriend}`, false);
      // attachFriendEventListners();
      console.log("Cancelled friend request");
      return;
    }

    const data = await response.json();
    console.log("WHAT: ", data);
  } catch (error) {
    console.log("cancelFriendRequest Error: ", error);
  }
}

async function acceptOrDeclineFriendRequest(action, toBeFriend, direct_from_profile=true) {
  console.log("acceptOrDeclineFriendRequest");

  try {
    const response = await fetch(`/friend_request_response/${toBeFriend}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: `${action}`,
      }),
    });

    console.log("Response status:", response.status); // Log the response status

    if (response.status === 200) {
      console.log(" ---- Friend request fulfilled ---- ");
      if (direct_from_profile) {
        await updateUI(`/profile/${toBeFriend}/`, false);
        // attachFriendEventListners(); // reattach event listeners after updating the UI
      }
      else {
        console.log(" friend request " + action + "ed from the friend requests list");
        // const friend_requests_response_btns = document.getElementsByClassName("friend_requests_response_btns");
        // friend_requests_response_btns.removeChild(friend_requests_response_btns.childNodes[0]);
        // friend_requests_response_btns.removeChild(friend_requests_response_btns.childNodes[1]);
        // friend_requests_response_btns.appendChild(document.createTextNode("Friend request " + action + "ed"));

      }
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
  const toBeFriend = document
  .getElementById("username")
  .getAttribute("data-username");
  try {
    const response = await fetch(`/friend_request/${toBeFriend}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status); // Log the response status

    if (response.status === 200) {
      console.log(" ---- removed a friend  ---- ");
      await updateUI(`/profile/${toBeFriend}`, false);
      attachFriendEventListners();
      return;
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log("removeFriend Error: ", error);
  }
}


function attachFriendEventListners() {
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
      const toBeFriend = document
      .getElementById("username")
      .getAttribute("data-username");
      acceptOrDeclineFriendRequest("accept", toBeFriend, true);
    });
  }
  const declineFriendBtn = document.getElementById("decline_request_btn");
  if (declineFriendBtn) {
    declineFriendBtn.addEventListener("click", () => {
      console.log("decline friend request");
      const toBeFriend = document
      .getElementById("username")
      .getAttribute("data-username");
      acceptOrDeclineFriendRequest("decline", toBeFriend, true);
    });
  }
  const removeFriendBtn = document.getElementById("unfriend_btn");
  if (removeFriendBtn) {
    removeFriendBtn.addEventListener("click", removeFriend);
  }
}

// instead of calling friend() directly, we wait for the DOM to load
document.addEventListener("DOMContentLoaded", attachFriendEventListners);
