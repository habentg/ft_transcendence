/* establishing ws_chat if its not already */
createWebSockets();
// Global variable to track the current chat recipient
let activeChatRecipient = null;
let activeChatId = null;

// Define a persistent named function for the event listener
function messageInputHandler(event) {
  if (event.key === "Enter") {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    if (!message) {
      console.error("Message is empty.");
      return;
    }
    if (!activeChatRecipient || !activeChatId) {
      console.error("No active chat recipient.");
      return;
    }
    sendMessage(message, activeChatRecipient, activeChatId);
    messageInput.value = ''; // Clear input after sending
  }
}

function handleMessageSend() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();
  if (!message) {
    console.error("Message is empty.");
    return;
  }
  if (!activeChatRecipient || !activeChatId) {
    console.error("No active chat recipient.");
    return;
  }
  console.log(`Sending message to ${activeChatRecipient}`);
  sendMessage(message, activeChatRecipient, activeChatId);
  messageInput.value = ''; // Clear the input field
}

// Open chat for a specific friend
async function openChat(recipeint, chat_id) {

  const clickedChatList = document.getElementById(`${recipeint}`);
  const getFullName = clickedChatList.getAttribute("data-recipent");
  const chatMessages = document.getElementsByClassName("chat-messages")[0];
  chatMessages.id = chat_id;


  // Update chat header
  document.getElementById("chatTitle").textContent = getFullName;


  // Update messages - I will have fetch messages hopefully usig pagination
  await fetchMessages(chat_id, chatMessages);

  // Highlight selected friend
  const prevActiveChat = document.getElementsByClassName("active")[0];
  if (prevActiveChat) {
    prevActiveChat.classList.remove("active");
  }
  clickedChatList.classList.add("active");

  // if player is deleted we not give him the option to send message
  // Send message on Enter
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("chat_send_btn");
  if (clickedChatList.id === 'deleted_player') {
    messageInput.classList.add("d-none");
    sendButton.classList.add("d-none");
    return;
  }
  // Send message on Enter
  messageInput.classList.remove("d-none");
  sendButton.classList.remove("d-none");

  document.getElementById("three_dots").classList.remove("d-none");
  document.getElementById("deleteChatRoomBtn").setAttribute("data-usernmae", recipeint);
  document.getElementById("blockBtn").setAttribute("data-usernmae", recipeint);
  document.getElementById("unblockBtn").setAttribute("data-usernmae", recipeint);

  // Remove existing event listeners
  messageInput.removeEventListener("keyup", messageInputHandler);
  sendButton.removeEventListener("click", handleMessageSend);

  // Update the global recipient and chat_id
  activeChatRecipient = recipeint;
  activeChatId = chat_id;

  // Add event listeners
  messageInput.addEventListener("keyup", messageInputHandler);
  sendButton.addEventListener("click", handleMessageSend);
}

function sendMessage(message, recipient, chat_id) {
  if (window.ws_chat && window.ws_chat.readyState === WebSocket.OPEN) {
    // const recipent = document.getElementsByClassName("active")[0].dataset.recipent;
    const msg_to_send = {
      type: "private_message",
      message: `${message}`,
      recipient: recipient,
    };
    window.ws_chat.send(JSON.stringify(msg_to_send));
    /* add the message to the dom */
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";
    messageDiv.classList.add("sender");

    const no_msg_found = document.getElementById("no_msg_found");
    if (no_msg_found) {
      no_msg_found.remove();
    }
    const chatMessages = document.getElementById(chat_id);
    messageDiv.appendChild(createMsgDiv(message));
    chatMessages.appendChild(messageDiv);
    messageInput.value = "";
    messageInput.focus();
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else {
    console.error("WebSocket is not open. Unable to send message.");
    createWebSockets();
  }
}


/* block, unblock and delete chat features */
async function deleteChatRoom(chatroom_name) {
  if (window.ws_chat && window.ws_chat.readyState === WebSocket.OPEN) {
    const chatMessage = {
      type: "delete_chatroom",
      room: chatroom_name,
    };
    window.ws_chat.send(JSON.stringify(chatMessage));
  }
}
/* fetching message of an active chat */
async function fetchMessages(room, chatMessages) {
  try {
    const response = await fetch(`/chat_messages?room=${room}`);
    if (response.ok) {
      const data = await response.json();
      chatMessages.innerHTML = "";
      chatMessages.innerHTML = data.messages;
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return;
    }
    throw new Error("Error fetching messages");
  } catch (error) {
    alert(`Error fetching messages: ${error}`);

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