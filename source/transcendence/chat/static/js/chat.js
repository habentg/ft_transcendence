/* establishing ws_chat if its not already */
createWebSockets();

function getActiveChatIdandRecipient() {
  let active_recipient_list = document.getElementsByClassName("active")[0];
  if (!active_recipient_list) {
    return [null, null];
  }
  const chatMessages = document.getElementsByClassName("chat-messages")[0];
  if (!chatMessages) {
    return [null, null];
  }
  const active_chat_recipient = active_recipient_list.id;
  const active_chat_id = chatMessages.id;
  if (!active_chat_recipient || !active_chat_id) {
    return [null, null];
  }
  return [active_chat_recipient, active_chat_id];
}

// Define a persistent named function for the event listener
function messageInputHandler(event) {
  const [active_chat_recipient, active_chat_id] = getActiveChatIdandRecipient();
  if (!active_chat_recipient || !active_chat_id) {
    return;
  }
  if (event.key === "Enter") {
    let messageInput = document.getElementById("messageInput");
    if (!messageInput) {
      return;
    }
    const message = messageInput.value.trim();
    if (!message) {
      return;
    }
    sendMessage(message, active_chat_recipient, active_chat_id);
    messageInput.value = ''; // Clear input after sending
    messageInput.focus();
  }
}

function handleMessageSend() {
  const [active_chat_recipient, active_chat_id] = getActiveChatIdandRecipient();
  if (!active_chat_recipient || !active_chat_id) {
    return;
  }
  let messageInput = document.getElementById("messageInput");
  if (!messageInput) {
    return;
  }
  const message = messageInput.value.trim();
  if (!message) {
    return;
  }
  if (!active_chat_recipient || !active_chat_id) {
    return;
  }
  sendMessage(message, active_chat_recipient, active_chat_id);
  messageInput.value = '';
  messageInput.focus();
}

function activeChatHeaderUpdate(recipeint_username, activeChatFullname) {
  // Update chat header
  document.getElementById("chatTitle").textContent = activeChatFullname.length > 10 ? `${activeChatFullname.slice(0, 10)}...` : activeChatFullname;

  // chat options update 
  const three_dots = document.getElementById("three_dots");
  three_dots.setAttribute("data-recipient", `three_dots_${recipeint_username}`);
  three_dots.classList.remove("d-none");

  // updating view profile option
  const view_profile = document.getElementById("view_profile_option");
  view_profile.setAttribute("href", `/profile/${recipeint_username}`);

  // update profile image - for the header one
  const header_profile_image = document.getElementById("chatHeaderPFP");
  const liElement = document.getElementById(recipeint_username);
  const imgElement = liElement.querySelector('img');
  if (imgElement) {
    header_profile_image.src = imgElement.src;
    // hide the icon and display the image
    header_profile_image.classList.remove("d-none");
    const headerpfpIcon = document.getElementById("chatHeaderICON");
    if (headerpfpIcon)
      headerpfpIcon.classList.add("d-none");
  }
}

// Open chat for a specific friend
async function openChat(recipeint_username, chat_id) {
  const clickedChatList = document.getElementById(`${recipeint_username}`);
  const activeChatFullname = clickedChatList.getAttribute("data-recipent");
  const chatMessages = document.getElementsByClassName("chat-messages")[0];
  chatMessages.id = chat_id;

  // Highlight selected friend
  const prevActiveChat = document.getElementsByClassName("active")[0];
  // trying to not load if already active
  if (prevActiveChat && prevActiveChat.id === recipeint_username) {
    return;
  }
  if (prevActiveChat)
    prevActiveChat.classList.remove("active");
  clickedChatList.classList.add("active");

  // Update chat header
  activeChatHeaderUpdate(recipeint_username, activeChatFullname);

  // Update messages - I will have fetch messages hopefully usig pagination
  await fetchMessages(recipeint_username, chatMessages);
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
    createToast({ type: 'error', error_message: 'WebSocket is not open. Unable to send message.', title: 'Websocket Not Open!' });
  }
}

function chatOptionsModifier(action, delete_user = false) {
  // Get block and unblock buttons
  const blockBtn = document.querySelector('.blockBtn');
  const unblockBtn = document.querySelector('.unblockBtn');
  let blocked_msg = document.getElementById('blocked_msg');
  const [active_chat_recipient, active_chat_id] = getActiveChatIdandRecipient();
  if (!active_chat_recipient || !active_chat_id) {
    return;
  }
  // Reset button visibility
  if (blockBtn) blockBtn.classList.add('d-none');
  if (unblockBtn) unblockBtn.classList.add('d-none');
  if (blocked_msg) blocked_msg.classList.add('d-none');

  // Show appropriate button based on status
  if (action === 'blocked') {
    if (unblockBtn) {
      unblockBtn.id = `unblock_${active_chat_recipient}`;
      unblockBtn.classList.remove('d-none');
      blocked_msg.classList.remove("d-none");
      if (delete_user)
        document.getElementById("three_dots").classList.add("d-none");
    }
  } else if (action === 'not_blocked') {
    if (blockBtn) {
      blockBtn.id = `block_${active_chat_recipient}`;
      blockBtn.classList.remove('d-none');
    }
  }
}

/* fetching message of an active chat */
async function fetchMessages(activeChatRecipient, chatMessages) {
  try {
    const response = await fetch(`/chat_messages?room=${chatMessages.id}&recipient=${activeChatRecipient}`);
    if (!response.ok) {
      throw new Error("Error fetching messages");
    }
    const data = await response.json();
    let messageInput = document.getElementById("messageInput");
    let sendButton = document.getElementById("chat_send_btn");
    chatMessages.innerHTML = "";
    chatMessages.innerHTML = data['messages'];
    chatMessages.scrollTop = chatMessages.scrollHeight;
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

  } catch (error) {
    createToast({ type: "error", title: "Chat Error", error_message: `${error}` });
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

/* block, unblock and delete chat features */
async function clearConvo() {
  const [chatroom_name, chat_id] = getActiveChatIdandRecipient();
  if (!chatroom_name || !chat_id) {
    return;
  }
  if (window.ws_chat && window.ws_chat.readyState === WebSocket.OPEN) {
    const chatMessage = {
      type: "clear_chat",
      room: chat_id,
    };
    window.ws_chat.send(JSON.stringify(chatMessage));
  }
  else {
    createToast({ type: 'error', error_message: 'WebSocket is not open. Unable to delete chatroom.', title: 'Websocket Not Open!' });
  }
}

function inviteToGame() {
  const [active_chat_recipient, chat_id] = getActiveChatIdandRecipient();
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    window.ws.send(JSON.stringify({
      type: "invite_to_game",
      recipient: active_chat_recipient,
    }));
  }
}