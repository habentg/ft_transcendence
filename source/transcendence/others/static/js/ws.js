
function initWebsocket() {
    let wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    window.ws = new WebSocket(`${wsProtocol}://${window.location.host}/ws/`);
  
    window.ws.onopen = () => {
      console.log("WebSocket connected");
    };
  
    window.ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
  
    window.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  
    window.ws.onmessage = (message) => {
      console.log("WebSocket message:", message);
    };
  }
  