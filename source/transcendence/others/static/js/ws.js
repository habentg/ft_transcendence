/* ---------------------------------------------- websocket for notifications ---------------------------------------------- */
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
    if (data.type === "friend_request") {
      alert(`${data.message}`);
      console.log("friend request received", data.message);
    }
    else if (data.type === "chat_message") {
      alert(`${data.message}: from ${data.sender}`);
      console.log("chat msg recived!!!", data.message);
    };
  }
}


/* ---------------------------------------------- websocket stuff for chat ---------------------------------------------- */
function addMessageToChat(data) {
  const chatMessages = document.getElementById("chatMessages");
  const message = document.createElement("div");
  // if we have active chat going on ... just append the message
  const activeChatRoom = document.getElementsByClassName("active")[0];
  message.className = "chat-message";
  if (activeChatRoom) {
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
      addMessageToChat(data);
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
