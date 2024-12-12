/* all buttons creator to reduce repetion */
function createButton(text, class_list, id, onclick) {
  const friendshipBtn = document.createElement('button');
  friendshipBtn.type = 'button';
  friendshipBtn.classList.add(...class_list);
  friendshipBtn.id = id;
  friendshipBtn.textContent = text;
  friendshipBtn.setAttribute('onclick', onclick);

  return friendshipBtn;
}

/* ---------------------------------------------- websocket for notifications ---------------------------------------------- */
function handleFriendRequestUnfriend(data) {
  const unfriendBtn = document.getElementById("unfriend_btn");
  if (!unfriendBtn) {
    alert("unfriendBtn not found");
    return;
  }
  const chatBtn = document.getElementById("chat_btn");

  unfriendBtn.remove();
  chatBtn.remove();

  const sendFriendRequestBtn = createButton('Send Request', ['btn', 'btn-primary', 'friendship_btn'], 'add_friend_btn', 'addFriendRequest()');
  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(sendFriendRequestBtn);
}

function handleFriendRequestRecieved(data) {
  const sendFriendRequestBtn = document.getElementById("add_friend_btn");
  if (!sendFriendRequestBtn) {
    alert("sendFriendRequestBtn not found");
    return;
  }
  sendFriendRequestBtn.remove();
  const acceptButton = createButton('Accept', ['btn', 'btn-success', 'friendship_btn', 'me-1', 'mb-2'], 'accept_request_btn', `acceptOrDeclineFriendRequest('accept', '${data.sender}')`);
  const declineButton = createButton('Decline', ['btn', 'btn-danger', 'friendship_btn', 'mb-2'], 'decline_request_btn', `acceptOrDeclineFriendRequest('decline', '${data.sender}')`);
  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(declineButton);
  profile_info_container.appendChild(acceptButton);
}

function handleFriendRequestAccept(data) {
  const cancelFriendRequestBtn = document.getElementById("cancel_request_btn");
  if (!cancelFriendRequestBtn) {
    alert("cancelFriendRequestBtn not found");
    return;
  }
  cancelFriendRequestBtn.remove();

  const unfriendBtn = createButton('Unfriend', ['btn', 'btn-danger', 'friendship_btn', 'me-1', 'mb-2'], 'unfriend_btn', 'removeFriend()');
  const chatBtn = createButton('Chat', ['btn', 'btn-dark', 'friendship_btn', 'mb-2'], 'chat_btn', `create_chatroom('${data.sender}')`);

  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(unfriendBtn);
  profile_info_container.appendChild(chatBtn);
}

function handleFriendRequestDecline(data) {
  const cancelFriendRequestBtn = document.getElementById("cancel_request_btn");
  if (!cancelFriendRequestBtn) {
    alert("cancelFriendRequestBtn not found");
    return;
  }
  cancelFriendRequestBtn.remove();
  const sendFriendRequestBtn = createButton('Send Request', ['btn', 'btn-primary', 'friendship_btn'], 'add_friend_btn', 'addFriendRequest()');
  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(sendFriendRequestBtn);
}

function handleCancelFriendRequest(data) {
  const accept_request_btn = document.getElementById("accept_request_btn");
  if (!accept_request_btn) {
    alert("accept_request_btn not found");
    return;
  }
  const decline_request_btn = document.getElementById("decline_request_btn");

  accept_request_btn.remove();
  decline_request_btn.remove();

  const sendFriendRequestBtn = createButton('Send Request', ['btn', 'btn-primary', 'friendship_btn'], 'add_friend_btn', 'addFriendRequest()');
  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(sendFriendRequestBtn);
}

function initNotificationWebsocket() {
  let wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  wsUrl = `${wsProtocol}://${window.location.host}/ws/notify/`;
  window.ws = new WebSocket(wsUrl);

  window.ws.onopen = () => {
    console.log("Notification WebSocket connected");
  };

  window.ws.onclose = () => {
    console.log("Notification WebSocket disconnected");
  };

  window.ws.onerror = (error) => {
    console.log("wsUrl:", wsUrl);
    console.error("Notification WebSocket error:", error);
  };

  window.ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log("notification received:", data);
    if (data.type === "friend_request") {
      handleFriendRequestRecieved(data);
    }
    else if (data.type === "canceled") {
      handleCancelFriendRequest(data);
    }
    else if (data.type === "accepted") {
      handleFriendRequestAccept(data);
    }
    else if (data.type === "declined") {
      handleFriendRequestDecline(data);
    }
    else if (data.type === "unfriended") {
      handleFriendRequestUnfriend(data);
    }
  }
}


/* ---------------------------------------------- websocket stuff for chat ---------------------------------------------- */
function addMessageToChat(data) {
  const chatPage = document.getElementsByClassName("chatPage");
  if (!chatPage) {
    alert("chatMessages not found -- will notify the user");
    return;
  }
  console.log("chatPage found while I am at: ", window.location.href);
  const chatMessages = document.getElementById("chatMessages");
  const message = document.createElement("div");
  // if we have active chat going on ... just append the message
  const activeChatRoom = document.getElementsByClassName("active")[0];
  message.className = "chat-message";
  if (activeChatRoom) {
    const no_msg_found = document.getElementById("no_msg_found");
    if (no_msg_found) {
      no_msg_found.remove();
    }
    const active_chat_user = activeChatRoom.getElementsByTagName("span")[0].textContent;
    if (data.sender === active_chat_user) {
      console.log("is reciever");
      message.classList.add("reciever");
    }
    else {
      console.log("is sender");
      message.classList.add("sender");
    }
  }
  message.innerHTML = `<div class="message-content">${data.message}</div>`;
  // if not notify the user .... put a red dot or something on the respective chatroom
  // when he clicks on it, we will fetch the messages from the server ... and remove the red dot
  chatMessages.appendChild(message);
}

function deleteChatRoom(data) {
  const chatPage = document.getElementsByClassName("chatPage");
  if (!chatPage) {
    return;
  }
  const chatRoom = document.getElementById(data.room);
  if (chatRoom) {
    chatRoom.remove();
    alert("chatroom deleted: ", data.room);
  }
  else {
    alert("chatroom not found");
  }
}

/* websocket for chat system */
function initChatWebsocket() {
  let wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  wsUrl = `${wsProtocol}://${window.location.host}/ws/chat/`;
  window.ws_chat = new WebSocket(wsUrl);

  window.ws_chat.onopen = () => {
    console.log("Chat WebSocket connected");
  };

  window.ws_chat.onclose = () => {
    console.log("Chat WebSocket disconnected");
  };

  window.ws_chat.onerror = (error) => {
    console.log("wsUrl:", wsUrl);
    console.error("Chat WebSocket error:", error);
  };

  window.ws_chat.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "private_message") {
      console.log("private message received:", data.message, "from:", data.sender);
      addMessageToChat(data);
    }
    else if (data.type === "private_message_error") {
      console.log("private message ERROR", data);
      alert("could not send the message");
    }
    else if (data.type === "room_deleted_notification") {
      // remove the chatroom from the list
      alert("room deleted --- chatroom will be removed");
      deleteChatRoom(data);
    }
    else if (data.type === "room_deleted_notification_error") {
      // remove the chatroom from the list
      alert("could not delete the room");
    }
  }
}

function createWebSockets() {
  if (window.ws === undefined) {
    initNotificationWebsocket();
  }
  if (window.ws_chat === undefined) {
    initChatWebsocket();
  }
}
