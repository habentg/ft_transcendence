/* establishing ws_chat if its not already */
createWebSockets();

// Open chat for a specific friend
async function openChat(recipeint) {

  console.log("Opening chat for:", recipeint);
  const clickedChatList = document.getElementById(recipeint);
  const getFUllName = clickedChatList.getAttribute("data-recipent");

  // Update chat header
  document.getElementById("chatTitle").textContent = getFUllName;
  document.getElementById("three_dots").classList.remove("d-none");
  document.getElementById("deleteChatRoomBtn").setAttribute("data-usernmae", recipeint);
  document.getElementById("blockBtn").setAttribute("data-usernmae", recipeint);
  document.getElementById("unblockBtn").setAttribute("data-usernmae", recipeint);


  // Update messages - I will have fetch messages hopefully usig pagination
  await fetchMessages(recipeint);

  // Highlight selected friend
  const prevActiveChat = document.getElementsByClassName("active")[0];
  if (prevActiveChat) {
    prevActiveChat.classList.remove("active");
  }
  clickedChatList.classList.add("active");

  // Send message on Enter
  const messageInput = document.getElementById("messageInput");
  messageInput.classList.remove("d-none");
  messageInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      console.log("sending to user:", recipeint);
      sendMessage(recipeint);
    }
  });

  // send message on button click
  const send_btn = document.getElementById("chat_send_btn");
  if (send_btn) {
    send_btn.classList.remove("d-none");
    send_btn.addEventListener("click", () => {
      sendMessage(recipeint);
    });
  }
}

function sendMessage(recipient) {
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
    // const recipent = document.getElementsByClassName("active")[0].dataset.recipent;
    console.log("recipent:", recipient);
    const chatMessage = {
      type: "private_message",
      message: message,
      recipient: recipient,
    };
    window.ws_chat.send(JSON.stringify(chatMessage));
    /* add the message to the dom */
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";
    messageDiv.classList.add("sender");

    const no_msg_found = document.getElementById("no_msg_found");
    if (no_msg_found) {
      no_msg_found.remove();
    }
    // Scroll to bottom
    const chatMessages = document.getElementById("chatMessages");
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
    chatMessages.appendChild(messageDiv);
    messageInput.value = "";
    messageInput.focus();
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
}
/* fetching message of an active chat */
async function fetchMessages(recipeint) {
  const chatMessages = document.getElementById("chatMessages");
  console.log("Fetching messages for:", recipeint);
  try {
    const response = await fetch(`/chat_messages?recipeint=${recipeint}`);
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