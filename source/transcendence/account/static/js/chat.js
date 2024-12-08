/* establishing ws if its not already */
createNotificationSocket();

const chatMessages = document.getElementById("chatMessages");
const friendList = document.getElementById("friendList");
const chatTitle = document.getElementById("chatTitle");
const messageInput = document.getElementById("messageInput");

const friends = [
  { user: "root", name: "Admin User", messages: [{ user: "user1", content: "Hey Miguel!, this is John"}, { user: "user2", content: "Hola John" }  ] },
];

let currentFriendId = null;

// Load friend list
function loadFriendList() {
  friends.forEach((friend) => {
    const friendItem = document.createElement("li");
    friendItem.className = "friend-item d-flex align-items-center";
    friendItem.id = `chat-${friend.username}`;

    // Add the profile icon. Later we will replace this with the actual profile picture
    const profileIcon = document.createElement("i");
    profileIcon.className = "fas fa-user me-2 profile-icon"; 

    const friendName = document.createElement("span");
    friendName.textContent = friend.name;

    friendItem.appendChild(profileIcon);
    friendItem.appendChild(friendName);

    friendItem.onclick = () => openChat(friend.username);
    friendList.appendChild(friendItem);
  });

  // Send message on Enter
  messageInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
}


// Open chat for a specific friend
function openChat(username) {
  currentFriendUsername = username;
  const friend = friends.find((f) => f.username === username);

  // Update chat header
  chatTitle.textContent = friend.name;

  // Update messages
  chatMessages.innerHTML = "";
  friend.messages.forEach((msg) => {
    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${msg.user}`;
    messageElement.innerHTML = `<div class="message-content">${msg.content}</div>`;
    chatMessages.appendChild(messageElement);
  });

  // Highlight selected friend
  document.querySelectorAll(".friend-item").forEach((item) => item.classList.remove("active"));
  document.getElementById(`chat-${friend.username}`).classList.add("active");
}



function sendMessage() {
  const message = messageInput.value.trim();
  console.log("message:", message);

  // Validate message
  if (!message) {
      console.error("Message cannot be empty.");
      return;
  }

  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
      console.log("Sending message:", message);
      const chatMessage = {
          type: "chat_message",
          message: message,
          recipient: 'root', // Consider making this dynamic
      };
      window.ws.send(JSON.stringify(chatMessage));
      messageInput.value = ''; // Clear input after sending
  } else {
      console.error("WebSocket is not open. Unable to send message.");
      // Optionally, you could implement reconnection logic here
  }
}

loadFriendList();