
async function searchedFriendRequestResponce(event, action, toBeFriend) {
  event.stopPropagation(); // Prevent the click event from bubbling up to the anchor tag

  if (action === 'accept') {
    console.log('Accept button clicked');
    // Add your accept request functionality here
  } else if (action === 'reject') {
    console.log('Reject button clicked');
    // Add your reject request functionality here
  }
  console.log("Rahhhhhh: ", toBeFriend);
  // try {
  //   const response = await fetch(`/friend_request_response/${toBeFriend}/`, {
  //     method: "PATCH",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       action: `${action}`,
  //     }),
  //   });

  //   if (response.status === 200) {
  //     alert(`Friend request ${action}ed`);
  //     return;
  //   }
  //   throw new Error("Failed to accept friend request");
  // } catch (error) {
  //   console.log("Error: ", error);
  // }
}
