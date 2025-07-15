import WebSocket from "ws";

export const initWebSocketCapsy = (
  host = "localhost",
  port = 81,
): WebSocket => {
  const socket = new WebSocket(`ws://${host}:${port}`);

  socket.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data.toString());
    console.log("Message from server:", message);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket connection closed:", event);
  };

  return socket;
};
