/* establishing ws_chat if its not already */
createWebSockets();
// Global variable to track the current chat recipient
let activeChatRecipient = null;
let activeChatId = null;
let is_blocked = false;
let messageInput = document.getElementById("messageInput");
let sendButton = document.getElementById("chat_send_btn");

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

async function handleOpenChatCloseOptions() {
  console.log("Opening chat options for recipient:", activeChatRecipient);
  
  try {
    const response = await fetch(`/is_blocked?recipient=${activeChatRecipient}`);
    
    if (!response.ok) {
      console.error("Error fetching chat options");
      return;
    }
    
    const responseData = await response.json();
    
    // Get block and unblock buttons
    const blockBtn = document.querySelector('.blockBtn');
    const unblockBtn = document.querySelector('.unblockBtn');
    
    // Reset button visibility
    if (blockBtn) blockBtn.classList.add('d-none');
    if (unblockBtn) unblockBtn.classList.add('d-none');
    if (messageInput) messageInput.classList.add('d-none');
    if (sendButton) sendButton.classList.add('d-none');
    
    // Show appropriate button based on status
    if (responseData.status === 'blocked') {
      is_blocked = true;
      if (unblockBtn) {
        unblockBtn.id = `unblock_${activeChatRecipient}`;
        unblockBtn.classList.remove('d-none');
        messageInput.classList.add("d-none");
        sendButton.classList.add("d-none");
      }
    } else if (responseData.status === 'not_blocked') {
      is_blocked = false;
      if (blockBtn) {
        blockBtn.id = `block_${activeChatRecipient}`;
        blockBtn.classList.remove('d-none');
        messageInput.classList.remove("d-none");
        sendButton.classList.remove("d-none");
      }
    }
    
    console.log("Chat options opened, status is:", responseData.status);
  } catch (error) {
    console.error("Error in handling chat options:", error);
  }
}

// Open chat for a specific friend
async function openChat(recipeint, chat_id) {

  const clickedChatList = document.getElementById(`${recipeint}`);
  const getFullName = clickedChatList.getAttribute("data-recipent");
  const chatMessages = document.getElementsByClassName("chat-messages")[0];
  chatMessages.id = chat_id;
  
  // Update the global recipient and chat_id
  activeChatRecipient = recipeint;
  activeChatId = chat_id;

  // Highlight selected friend
  const prevActiveChat = document.getElementsByClassName("active")[0];
  if (prevActiveChat) {
    prevActiveChat.classList.remove("active");
  }
  clickedChatList.classList.add("active");

  // Update chat header
  document.getElementById("chatTitle").textContent = getFullName;
  
  // displaying input and send button
  messageInput.classList.remove("d-none");
  sendButton.classList.remove("d-none");

  // chat options update 
  const three_dots = document.getElementById("three_dots");
  three_dots.setAttribute("data-recipient", `three_dots_${recipeint}`);
  three_dots.classList.remove("d-none");
  three_dots.removeEventListener("click", handleOpenChatCloseOptions);
  three_dots.addEventListener("click", handleOpenChatCloseOptions);

  // Update messages - I will have fetch messages hopefully usig pagination
  await fetchMessages(chat_id, chatMessages);

  // if player is deleted we not give him the option to send message
  if (clickedChatList.id === 'deleted_player') {
    messageInput.classList.add("d-none");
    sendButton.classList.add("d-none");
    return;
  }

  // Remove existing event listeners
  messageInput.removeEventListener("keyup", messageInputHandler);
  sendButton.removeEventListener("click", handleMessageSend);

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
    /* change the button to unblock */
    const three_dots = document.getElementById("ul_display_option");
    three_dots.removeChild(document.getElementById(`block_list_item`));
    three_dots.appendChild(displayOptionsList("unblockBtn", "Unblock"));
    // blockBtn = document.getElementById("blockBtn");
    // blockBtn.classList.add("d-none");
    // /* hide the sending input and button */
    // messageInput.classList.add("d-none");
    // sendButton.classList.add("d-none");
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
    /* change the button to block */
    const three_dots = document.getElementById("ul_display_option");
    three_dots.removeChild(document.getElementById(`unblock_list_item`));
    three_dots.appendChild(displayOptionsList("blockBtn", "Block"));
    // blockBtn = document.getElementById("blockBtn");
    // blockBtn.classList.remove("d-none");
    /* show the sending input and button */
    // messageInput.classList.remove("d-none");
    // sendButton.classList.remove("d-none");
  }
}

function displayOptionsList(class_name, btn_name) {
  let optionList = document.createElement("li");
  optionList.innerHTML = `<button id="" class="dropdown-item ${class_name}" type="button">${btn_name}</button>`
  return optionList;
}