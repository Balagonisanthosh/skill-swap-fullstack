import { io } from "socket.io-client";

let socket;
const SERVER_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://skill-swap-fullstack-1-8y82.onrender.com";

export const connectSocket = (token) => {
  if (socket) return socket;

  socket = io(SERVER_URL, {
    transports: ["websocket"],       // 🔴 force websocket
    withCredentials: true,           // 🔴 REQUIRED
    auth: {
      token,                         // 🔴 JWT sent here
    },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
