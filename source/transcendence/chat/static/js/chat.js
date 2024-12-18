/* establishing ws_chat if its not already */
createWebSockets();
// Global variable to track the current chat recipient
let activeChatRecipient = null;
let activeChatId = null;

// Define a persistent named function for the event listener
function messageInputHandler(event) {
  if (event.key === "Enter") {
    let messageInput = document.getElementById("messageInput");
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
  let messageInput = document.getElementById("messageInput");
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

function activeChatHeaderUpdate(activeChatFullname) {
  // Update chat header
  document.getElementById("chatTitle").textContent = activeChatFullname;

  // chat options update 
  const three_dots = document.getElementById("three_dots");
  three_dots.setAttribute("data-recipient", `three_dots_${activeChatRecipient}`);
  three_dots.classList.remove("d-none");

  // updating view profile option
  const view_profile = document.getElementById("view_profile_option");
  view_profile.setAttribute("href", `/profile/${activeChatRecipient}`);
}

// Open chat for a specific friend
async function openChat(recipeint, chat_id) {
  const clickedChatList = document.getElementById(`${recipeint}`);
  const activeChatFullname = clickedChatList.getAttribute("data-recipent");
  const chatMessages = document.getElementsByClassName("chat-messages")[0];
  chatMessages.id = chat_id;

  // Highlight selected friend
  const prevActiveChat = document.getElementsByClassName("active")[0];
  if (prevActiveChat)
    prevActiveChat.classList.remove("active");
  clickedChatList.classList.add("active");

  // Update the global recipient and chat_id
  activeChatRecipient = recipeint;
  activeChatId = chat_id;

  // Update chat header
  activeChatHeaderUpdate(activeChatFullname);

  // Update messages - I will have fetch messages hopefully usig pagination
  await fetchMessages(activeChatRecipient, chatMessages);
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
    if (no_msg_found)
      no_msg_found.remove();
    const chatMessages = document.getElementById(chat_id);
    messageDiv.appendChild(createMsgDiv(message));
    chatMessages.appendChild(messageDiv);
    let messageInput = document.getElementById("messageInput");
    messageInput.value = "";
    messageInput.focus();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else {
    console.error("WebSocket is not open. Unable to send message.");
    createWebSockets();
  }
}

function chatOptionsModifier(action, delete_user=false) {
  // Get block and unblock buttons
  const blockBtn = document.querySelector('.blockBtn');
  const unblockBtn = document.querySelector('.unblockBtn');

  // Reset button visibility
  if (blockBtn) blockBtn.classList.add('d-none');
  if (unblockBtn) unblockBtn.classList.add('d-none');

  // Show appropriate button based on status
  if (action === 'blocked') {
    if (unblockBtn) {
      unblockBtn.id = `unblock_${activeChatRecipient}`;
      unblockBtn.classList.remove('d-none');
      if (delete_user)
        document.getElementById("three_dots").classList.add("d-none");
    }
  } else if (action === 'not_blocked') {
    if (blockBtn) {
      blockBtn.id = `block_${activeChatRecipient}`;
      blockBtn.classList.remove('d-none');
    }
  }
}

/* fetching message of an active chat */
async function fetchMessages(chatMessages) {
  try {
    const response = await fetch(`/chat_messages?room=${activeChatId}&recipient=${activeChatRecipient}`);
    if (response.ok) {
      const data = await response.json();
      chatMessages.innerHTML = "";
      chatMessages.innerHTML = data.messages;
      chatMessages.scrollTop = chatMessages.scrollHeight;
      let messageInput = document.getElementById("messageInput");
      let sendButton = document.getElementById("chat_send_btn");
      if (data['is_blocked'] === true || activeChatRecipient === 'deleted_player') {
        messageInput.classList.add("d-none");
        sendButton.classList.add("d-none");
        delete_user = false;
        if (activeChatRecipient === 'deleted_player')
          delete_user = true;
        chatOptionsModifier("blocked", delete_user);
        return;
      }
      chatOptionsModifier("not_blocked", false);

      messageInput.classList.remove("d-none");
      sendButton.classList.remove("d-none");

      // Remove existing event listeners
      messageInput.removeEventListener("keyup", messageInputHandler);
      sendButton.removeEventListener("click", handleMessageSend);

      // Add event listeners
      messageInput.addEventListener("keyup", messageInputHandler);
      sendButton.addEventListener("click", handleMessageSend);
      return;
    }
    throw new Error("Error fetching messages");
  } catch (error) {
    alert(`Error fetching messages: ${error}`);
  }
}

/* blocking unblocking player */
function blockPlayer() {
  const ActiveChat = document.getElementsByClassName("active")[0];
  recipient = ActiveChat.id;

  // alert(`Blocking ${recipient}`);
  if (window.ws_chat && window.ws_chat.readyState === WebSocket.OPEN) {
    const chatMessage = {
      type: "block_unblock_player",
      recipient: recipient,
      block_action: "block"
    };
    window.ws_chat.send(JSON.stringify(chatMessage));
  }
}

function unBlockPlayer() {
  const ActiveChat = document.getElementsByClassName("active")[0];
  recipient = ActiveChat.id;

  if (window.ws_chat && window.ws_chat.readyState === WebSocket.OPEN) {
    const chatMessage = {
      type: "block_unblock_player",
      recipient: recipient,
      block_action: "unblock"
    };
    window.ws_chat.send(JSON.stringify(chatMessage));
  }
}
