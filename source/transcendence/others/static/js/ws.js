
function initWebsocket() {
    let wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    wsUrl = `${wsProtocol}://${window.location.host}/ws/notify/`;
    window.ws = new WebSocket(wsUrl);
  
    window.ws.onopen = () => {
      console.log("WebSocket connected");
    };
  
    window.ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
  
    window.ws.onerror = (error) => {
      console.log("wsUrl:", wsUrl);
      console.error("WebSocket error:", error);
    };
  
    window.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "friend_request") {
        alert(`${data.message}`);
        console.log("friend request received", data.message);
      }

    };
  }
  
function createNotificationSocket() {
  if (window.ws === undefined) {
    initWebsocket();
  }
} 