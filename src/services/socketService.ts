import { io, Socket } from "socket.io-client";
import store from "../redux/store";
import {
  addMessage,
  setTypingStatus,
  setOnlineStatus,
  setMessages,
} from "../redux/slices/chatSlice";
import { IMessage, ICallData } from "../types/chat";

let socket: Socket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectTimeout = 1000;
const callHandlers = new Map<string, (data: ICallData) => void>();

function redirectToLogin() {
  sessionStorage.clear();
  window.location.href = "/login";
}

async function getValidToken(): Promise<string> {
  try {
    const storedAuth = sessionStorage.getItem("auth");
    const parsedAuth = storedAuth ? JSON.parse(storedAuth) : null;
    const refreshToken = parsedAuth?.refreshToken;

    if (!refreshToken) return "";

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!res.ok) return "";

    const data = await res.json();
    const updatedAuth = {
      ...parsedAuth,
      token: data.accessToken,
      refreshToken: data.refreshToken,
    };
    sessionStorage.setItem("auth", JSON.stringify(updatedAuth));
    return data.accessToken;
  } catch (err) {
    console.log(err);
    redirectToLogin();
    return "";
  }
}

async function connectSocket(token: string) {
  if (!token || socket?.connected) return;

  const formattedToken = `Bearer ${await getValidToken()}`;
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token: formattedToken },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: maxReconnectAttempts,
    reconnectionDelay: reconnectTimeout,
    timeout: 20000,
  });

  setupListeners();
}

function setupListeners() {
  if (!socket) return;

  socket.on("connect", () => {
    reconnectAttempts = 0;
    console.log("Connected to socket");
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
    if (reason === "io server disconnect") {
      socket?.connect();
    }
  });

  socket.on("connect_error", async (error) => {
    console.error("Socket connect error:", error.message);
    if (error.message.includes("Authentication")) {
      reconnectAttempts = maxReconnectAttempts;
      return;
    }

    reconnectAttempts++;
    if (reconnectAttempts <= maxReconnectAttempts) {
      setTimeout(() => socket?.connect(), reconnectTimeout * reconnectAttempts);
    }
  });

  socket.on("reconnect_attempt", async () => {
    const freshToken = `Bearer ${await getValidToken()}`;
    if (socket) socket.auth = { token: freshToken };
  });

  socket.on("newMessage", (message: IMessage) => {
    if (message.sender._id !== store.getState().auth.currentUser?._id) {
      store.dispatch(addMessage(message));
    }
  });

  socket.on("typing", ({ userId, isTyping }) => {
    store.dispatch(setTypingStatus({ userId, status: isTyping }));
  });

  socket.on("onlineStatus", ({ userId, isOnline }) => {
    store.dispatch(setOnlineStatus({ userId, status: isOnline }));
  });

  socket.on("onlineUsers", ({ users }) => {
    users.forEach((userId: string) => {
      store.dispatch(setOnlineStatus({ userId, status: true }));
    });
  });

  socket.on("call", (callData: ICallData) => {
    const handler = callHandlers.get(callData.from);
    if (handler) handler(callData);
  });

  socket.on("messagesLoaded", (messages: IMessage[]) => {
    store.dispatch(setMessages(messages));
  });
}

function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  reconnectAttempts = 0;
  callHandlers.clear();
}

function sendMessage(message: IMessage) {
  if (!socket) return;

  store.dispatch(addMessage(message));
  socket.emit("sendMessage", {
    content: message.content,
    receiverId: message.receiver,
    groupId: message.group,
    type: message.type,
    fileUrl: message.fileUrl,
  });
}

function sendTypingStatus(isTyping: boolean, chatId: string) {
  if (!socket?.connected) return;
  socket.emit("typing", { isTyping, chatId });
}

function joinGroup(groupId: string) {
  socket?.emit("joinGroup", groupId);
}

function leaveGroup(groupId: string) {
  socket?.emit("leaveGroup", groupId);
}

function startCall(
  receiverId?: string,
  groupId?: string,
  type: "video" | "audio" = "video"
) {
  socket?.emit("call", {
    receiverId,
    groupId,
    type,
    status: "ringing",
    timestamp: new Date().toISOString(),
  });
}

function endCall(
  receiverId?: string,
  groupId?: string,
  type: "video" | "audio" = "video"
) {
  socket?.emit("call", {
    receiverId,
    groupId,
    type,
    status: "ended",
    timestamp: new Date().toISOString(),
  });
}

function registerCallHandler(
  userId: string,
  handler: (data: ICallData) => void
) {
  callHandlers.set(userId, handler);
}

function unregisterCallHandler(userId: string) {
  callHandlers.delete(userId);
}

function isConnected() {
  return socket?.connected || false;
}

function removeAllListeners() {
  socket?.removeAllListeners();
}

function loadMessages(receiverId?: string, groupId?: string) {
  if (!socket?.connected) return;
  socket.emit("loadMessages", { receiverId, groupId });
}

export const SocketService = {
  connect: connectSocket,
  disconnect: disconnectSocket,
  sendMessage,
  sendTypingStatus,
  joinGroup,
  leaveGroup,
  startCall,
  endCall,
  registerCallHandler,
  unregisterCallHandler,
  isConnected,
  removeAllListeners,
  loadMessages,
};
