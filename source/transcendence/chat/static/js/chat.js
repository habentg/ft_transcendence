/* establishing ws_chat if its not already */
createWebSockets();

// Open chat for a specific friend
async function openChat(chatroom_name) {

  console.log("Opening chat for:", chatroom_name);
  const activeChat = document.getElementById(chatroom_name);
  const getFUllName = activeChat.getAttribute("data-recipent");

  // Update chat header
  document.getElementById("chatTitle").textContent = getFUllName;
  document.getElementById("three_dots").classList.remove("d-none");
  document.getElementById("deleteChatRoomBtn").setAttribute("data-roomname", chatroom_name);
  document.getElementById("blockBtn").setAttribute("data-roomname", chatroom_name);
  document.getElementById("unblockBtn").setAttribute("data-roomname", chatroom_name);


  // Update messages - I will have fetch messages hopefully usig pagination
  await fetchMessages(chatroom_name);

  // Highlight selected friend
  const prevActiveChat = document.getElementsByClassName("active")[0];
  if (prevActiveChat) {
    prevActiveChat.classList.remove("active");
  }
  activeChat.classList.add("active");

  // Send message on Enter
  const messageInput = document.getElementById("messageInput");
  messageInput.classList.remove("d-none");
  messageInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      console.log("sending to user:", chatroom_name);
      sendMessage(chatroom_name);
    }
  });

  // send message on button click
  const send_btn = document.getElementById("chat_send_btn");
  if (send_btn) {
    send_btn.classList.remove("d-none");
    send_btn.addEventListener("click", () => {
      sendMessage(chatroom_name);
    });
  }
}

function sendMessage(chatroom_name) {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();
  console.log("message:", message);

  // Validate message
  if (!message) {
    console.error("Message cannot be empty.");
    return;
  }
  // check on how long the message is - too long dont send it

  if (window.ws_chat && window.ws_chat.readyState === WebSocket.OPEN) {
    console.log("Sending message:", message, "to:", chatroom_name);
    const chatMessage = {
      type: "private_message",
      message: message,
      room: chatroom_name,
    };
    window.ws_chat.send(JSON.stringify(chatMessage));
    messageInput.value = '';
    messageInput.focus();
  } else {
    console.error("WebSocket is not open. Unable to send message.");
    createWebSockets();
  }
}

/* block, unblock and delete chat features */
async function deleteChatRoom(chatroom_name) {
  console.log("Deleting chatroom:", chatroom_name);
  if (window.ws_chat && window.ws_chat.readyState === WebSocket.OPEN) {
    const chatMessage = {
      type: "delete_chatroom",
      room: chatroom_name,
    };
    window.ws_chat.send(JSON.stringify(chatMessage));
  }
  // try {
  //   const response = await fetch(`/chat`, {
  //     method: "DELETE",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ room: chatroom_name }),
  //   });

  //   if (response.ok) {
  //     await updateUI('/chat', false);
  //     return;
  //   }
  //   throw new Error("Error deleting chatroom");
  // } catch (error) {
  //   console.error(error);
  // }
}
/* fetching message of an active chat */
async function fetchMessages(chatroom_name) {
  const chatMessages = document.getElementById("chatMessages");
  try {
    const response = await fetch(`/chat_messages?room=${chatroom_name}`);
    if (response.ok) {
      const data = await response.json();
      chatMessages.innerHTML = "";
      chatMessages.innerHTML = data.messages;
      console.log("Msgs fetched: ", data.messages);
      return;
    }
    throw new Error("Error fetching messages");
  } catch (error) {
    console.error(error);

  }
}

/* init all enventlistners in chat page */
function initChatEventListeners() {
  // Delete chatroom
  const deleteChatRoomBtn = document.getElementById("deleteChatRoomBtn");
  if (deleteChatRoomBtn) {
    deleteChatRoomBtn.addEventListener("click", () => {
      const chatroom_name = document.getElementById("chatTitle").textContent;
      deleteChatRoom(deleteChatRoomBtn.getAttribute("data-roomname"));
    });
  }
}

initChatEventListeners();