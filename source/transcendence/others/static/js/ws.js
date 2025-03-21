/* all buttons creator to reduce repetion */
function createButton(text, class_list, id, onclick, iconClassList = null) {
  const friendshipBtn = document.createElement('button');
  friendshipBtn.type = 'button';
  friendshipBtn.classList.add(...class_list);
  friendshipBtn.id = id;
  friendshipBtn.setAttribute('onclick', onclick);
  if (iconClassList !== null) {
    const iconElement = document.createElement('i');
    iconElement.classList.add('fas', ...iconClassList);
    friendshipBtn.appendChild(iconElement);
  }
  const textContent = document.createElement('span');
  textContent.textContent = text;
  friendshipBtn.appendChild(textContent);

  return friendshipBtn;
}

function createMsgDiv(msg) {
  const msgElement = document.createElement('div');
  msgElement.classList.add('message-content');
  msgElement.textContent = `${msg}`;

  return msgElement;
}

/* ---------------------------------------------- websocket for notifications ---------------------------------------------- */
function handleFriendRequestUnfriend(data) {
  const unfriendBtn = document.getElementById("unfriend_btn");
  if (!unfriendBtn)
    return;
  const chatBtn = document.getElementById("chat_btn");

  unfriendBtn.remove();
  chatBtn.remove();

  const sendFriendRequestBtn = createButton('Send Request', ['btn', 'btn-primary', 'friendship_btn'], 'add_friend_btn', 'addFriendRequest()', ['fa-user-plus', 'me-2']);
  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(sendFriendRequestBtn);
  // updating friend count
  const friendCount = document.getElementById("nums_of_friends");
  friendCount.textContent = parseInt(friendCount.textContent) - 1;
}

function handleFriendRequestRecieved(data) {
  const sendFriendRequestBtn = document.getElementById("add_friend_btn");
  if (!sendFriendRequestBtn) {
    const content = {
      type: 'friend_request',
      title: 'Friend Request',
      message: `You have a friend request from ${data.sender}`,
      sender: data.sender,
    }
    createToast(content);
    const notification_indicator = document.getElementById("notification-on");
    if (notification_indicator)
      notification_indicator.classList.remove("d-none");
    return;
  }
  sendFriendRequestBtn.remove();
  const acceptButton = createButton('Accept', ['btn', 'btn-success', 'friendship_btn', 'me-1', 'mb-2'], 'accept_request_btn', `acceptOrDeclineFriendRequest('accept', '${data.sender}')`, ['fa-check', 'me-2']);
  const declineButton = createButton('Decline', ['btn', 'btn-danger', 'friendship_btn', 'mb-2'], 'decline_request_btn', `acceptOrDeclineFriendRequest('decline', '${data.sender}')`, ['fa-times', 'me-2']);
  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(acceptButton);
  profile_info_container.appendChild(declineButton);
}

function handleFriendRequestAccept(data) {
  const cancelFriendRequestBtn = document.getElementById("cancel_request_btn");
  if (!cancelFriendRequestBtn)
    return;
  cancelFriendRequestBtn.remove();

  const unfriendBtn = createButton('Unfriend', ['btn', 'btn-danger', 'friendship_btn', 'me-1', 'mb-2'], 'unfriend_btn', 'removeFriend()', ['fa-user-minus', 'me-2']);
  const chatBtn = createButton('Chat', ['btn', 'btn-dark', 'friendship_btn', 'mb-2'], 'chat_btn', `create_chatroom('${data.sender}')`, ['fa-comment-alt', 'me-2']);

  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(unfriendBtn);
  profile_info_container.appendChild(chatBtn);
  // updating friend count
  const friendCount = document.getElementById("nums_of_friends");
  friendCount.textContent = parseInt(friendCount.textContent) + 1;
}

function handleFriendRequestDecline(data) {
  const cancelFriendRequestBtn = document.getElementById("cancel_request_btn");
  if (!cancelFriendRequestBtn)
    return;
  cancelFriendRequestBtn.remove();
  const sendFriendRequestBtn = createButton('Send Request', ['btn', 'btn-primary', 'friendship_btn'], 'add_friend_btn', 'addFriendRequest()', ['fa-user-plus', 'me-2']);
  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(sendFriendRequestBtn);
}

function handleCancelFriendRequest(data) {
  const accept_request_btn = document.getElementById("accept_request_btn");
  if (!accept_request_btn)
    return;
  const decline_request_btn = document.getElementById("decline_request_btn");

  accept_request_btn.remove();
  decline_request_btn.remove();

  const sendFriendRequestBtn = createButton('Send Request', ['btn', 'btn-primary', 'friendship_btn'], 'add_friend_btn', 'addFriendRequest()', ['fa-user-plus', 'me-2']);
  const profile_info_container = document.getElementsByClassName("profile_info_container")[0];
  profile_info_container.appendChild(sendFriendRequestBtn);
}

function initNotificationWebsocket() {
  let wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  wsUrl = `${wsProtocol}://${window.location.host}/ws/notify/`;
  window.ws = new WebSocket(wsUrl);

  window.ws.onopen = () => {
  };

  window.ws.onclose = () => {
  };

  window.ws.onerror = (error) => {
    createToast({ type: "error", title: "Error", error_message: "Notification WebSocket error" });
  };

  window.ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
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
    else if (data.type === "game_invitation") {
      createToast({ type: "game_invite", title: `Game Invitation - ${data.sender}`, message: data.message });
    }
  }
}

/* ---------------------------------------------- websocket stuff for chat ---------------------------------------------- */
async function addMessageToChat(data) {
  const chatMessages = document.getElementById(`${data.chat_id}`);
  if (!chatMessages) {
    recipient_chatroom = document.getElementById(`${data.sender}`);
    if (recipient_chatroom) {
      // recipient_chatroom.classList.add("unread");
      const msg_indicator = document.createElement("span");
      msg_indicator.classList.add("text-danger");
      msg_indicator.textContent = "!";
      recipient_chatroom.appendChild(msg_indicator);
    }
    else
      createToast(data);

    return;
  }
  const message = document.createElement("div");
  message.className = "chat-message";
  // if we have active chat going on ... just append the message
  const activeChatRoom = document.getElementsByClassName("active")[0];
  if (activeChatRoom) {
    const no_msg_found = document.getElementById("no_msg_found");
    if (no_msg_found) {
      no_msg_found.remove();
    }
  }
  message.classList.add("reciever");
  message.appendChild(createMsgDiv(data.message));
  // if not notify the user .... put a red dot or something on the respective chatroom
  // when he clicks on it, we will fetch the messages from the server ... and remove the red dot
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function clearConvoHandler(data) {
  const chatPage = document.getElementsByClassName("chatPage");
  if (!chatPage) {
    return;
  }
  // await updateUI('/chat');
  const chatRoom = document.getElementById(data.room);
  if (chatRoom) {
    // chatRoom.remove();
    chatRoom.innerHTML = `	<div id="no_msg_found" class="d-flex flex-column justify-content-center align-items-center py-5 mt-5">
		<h5>No messages to display yet.</h5>
		<p>Start a conversation to see messages here.</p>
	</div>`;
  }
}

/* websocket for chat system */
function initChatWebsocket() {
  let wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  wsUrl = `${wsProtocol}://${window.location.host}/ws/chat/`;
  window.ws_chat = new WebSocket(wsUrl);

  window.ws_chat.onopen = () => {
  };

  window.ws_chat.onclose = () => {
  };

  window.ws_chat.onerror = (error) => {
    createToast({ type: "error", title: "Error", error_message: "Chat WebSocket error" });
  };

  window.ws_chat.onmessage = async (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "chat_message") {
      addMessageToChat(data);
    }
    else if (data.type === "chat_message_error") {
      createToast({ type: "error", title: "Error", error_message: data.message });
    }
    else if (data.type === "block_unblock_player") {
      chatOptionsModifier(data.action, false);
      let messageInput = document.getElementById("messageInput");
      let sendButton = document.getElementById("chat_send_btn");
      if (data.action === 'blocked') {
        if (messageInput) {
          messageInput.classList.add("d-none");
          messageInput.removeEventListener("keyup", messageInputHandler);
          messageInput.addEventListener("keyup", messageInputHandler);
        }
        if (sendButton) {
          sendButton.classList.add("d-none");
          sendButton.removeEventListener("click", handleMessageSend);
          sendButton.addEventListener("click", handleMessageSend);
        }
        showErrorMessage(`You have blocked ${data['recipient']}!`, 3000, "Blocked!");
      }
      else {
        if (messageInput)
          messageInput.classList.remove("d-none");
        if (sendButton)
          sendButton.classList.remove("d-none");
        await showSuccessMessage(`You have unblocked ${data['recipient']}!`, 2000, "Unblocked!");
      }
    }
    else if (data.type === "room_deleted_notification") {
      clearConvoHandler(data);
    }
  }
}

function createWebSockets() {
  if (window.location.href.includes("guest_player")) {
    updateNavBar(true, null, '/static/images/anon.jpeg');
  }
  else {
    if (window.ws === undefined) {
      initNotificationWebsocket();
    }
    if (window.ws_chat === undefined) {
      initChatWebsocket();
    }
  }
}
