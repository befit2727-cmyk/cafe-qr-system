import { io, Socket } from "socket.io-client";
import { API_SERVER } from "./api";

const SERVER_URL = API_SERVER || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");

export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  timeout: 4000
});

socket.on("connect", () => {
  console.log("⚡ [Socket.io Client] Connected to Node.js backend:", socket.id);
});

socket.on("connect_error", (err) => {
  // Silent fallback to local storage / BroadcastChannel
  console.log("⚡ [Socket.io] Node.js server offline, running in client-side high-speed mode.");
});

export const joinCafeRoom = (cafeId: string) => {
  if (socket.connected) {
    socket.emit("join:cafe", cafeId);
  } else {
    socket.once("connect", () => {
      socket.emit("join:cafe", cafeId);
    });
  }
};
