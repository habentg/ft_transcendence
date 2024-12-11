const chatMessages = document.getElementById("chatMessages");
const friendList = document.getElementById("friendList");
const chatTitle = document.getElementById("chatTitle");
const messageInput = document.getElementById("messageInput");

const friends = [
  { id: 1, name: "John Doe", messages: [{ user: "user1", content: "Hey Miguel!, this is John"}, { user: "user2", content: "Hola John" }  ] },
  { id: 2, name: "Jane Smith", messages: [{ user: "user1", content: "Hi, I am Jane" }, {user:"user2", content:"Hey Jane"}] },
  { id: 3, name: "Alice", messages: [{ user: "user1", content: "Hi, I am Alice" }, {user:"user2", content:"Hey Alice"}] },
  { id: 4, name: "Bob", messages: [{ user: "user1", content: "Hi, I am Bob" }, {user:"user2", content:"Hey Bob"}] },
];

let currentFriendId = null;

// Load friend list
function loadFriendList() {
  friends.forEach((friend) => {
    const friendItem = document.createElement("li");
    friendItem.className = "friend-item d-flex align-items-center";

    // Add the profile icon. Later we will replace this with the actual profile picture
    const profileIcon = document.createElement("i");
    profileIcon.className = "fas fa-user me-2 profile-icon"; 

    const friendName = document.createElement("span");
    friendName.textContent = friend.name;

    friendItem.appendChild(profileIcon);
    friendItem.appendChild(friendName);

    friendItem.onclick = () => openChat(friend.id);
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
function openChat(friendId) {
  currentFriendId = friendId;
  const friend = friends.find((f) => f.id === friendId);

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
  document.querySelectorAll(".friend-item")[friendId - 1].classList.add("active");
}

// Send a new message
function sendMessage() {
  const newMessage = messageInput.value.trim();
  if (newMessage && currentFriendId !== null) {
    const friend = friends.find((f) => f.id === currentFriendId);
    friend.messages.push({ user: "user2", content: newMessage });

    // Add to chat messages
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message user2";
    messageElement.innerHTML = `<div class="message-content">${newMessage}</div>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    messageInput.value = ""; 
  }
}

// Initialize
loadFriendList();
