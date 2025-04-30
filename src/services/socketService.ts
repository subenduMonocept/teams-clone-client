import { io, Socket } from "socket.io-client";
import store from "../redux/store";
import {
  addMessage,
  setTypingStatus,
  setOnlineStatus,
  setMessages,
} from "../redux/slices/chatSlice";
import { IMessage, ICallData } from "../types/chat";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private callHandlers: Map<string, (data: ICallData) => void> = new Map();

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token: string): void {
    if (!token) {
      console.error("No token provided for socket connection");
      return;
    }

    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    const cleanToken = token.replace(/^Bearer\s+/i, "");
    const formattedToken = `Bearer ${cleanToken}`;

    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: formattedToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectTimeout,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to socket server");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from socket server:", reason);
      if (reason === "io server disconnect") {
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      console.error("Error details:", error.message);

      if (error.message.includes("Authentication error")) {
        console.error("Authentication failed. Please login again.");
        this.reconnectAttempts = this.maxReconnectAttempts;
        return;
      }

      this.reconnectAttempts++;
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        setTimeout(() => {
          this.socket?.connect();
        }, this.reconnectTimeout * this.reconnectAttempts);
      } else {
        console.error("Max reconnection attempts reached");
      }
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    this.socket.on("newMessage", (message: IMessage) => {
      if (message.sender._id !== store.getState().auth.currentUser?._id) {
        store.dispatch(addMessage(message));
      }
    });

    this.socket.on("message", (message: IMessage) => {
      if (message.sender._id !== store.getState().auth.currentUser?._id) {
        store.dispatch(addMessage(message));
      }
    });

    this.socket.on("typing", ({ userId, isTyping }) => {
      store.dispatch(setTypingStatus({ userId, status: isTyping }));
    });

    this.socket.on("onlineStatus", ({ userId, isOnline }) => {
      store.dispatch(setOnlineStatus({ userId, status: isOnline }));
    });

    this.socket.on("onlineUsers", ({ users }) => {
      users.forEach((userId: string) => {
        store.dispatch(setOnlineStatus({ userId, status: true }));
      });
    });

    this.socket.on(
      "userJoined",
      ({ userId, groupId }: { userId: string; groupId: string }) => {
        console.log(`User ${userId} joined group ${groupId}`);
      }
    );

    this.socket.on(
      "userLeft",
      ({ userId, groupId }: { userId: string; groupId: string }) => {
        console.log(`User ${userId} left group ${groupId}`);
      }
    );

    this.socket.on("call", (callData: ICallData) => {
      const handler = this.callHandlers.get(callData.from);
      if (handler) {
        handler(callData);
      }
    });

    this.socket.on("messagesLoaded", (messages: IMessage[]) => {
      store.dispatch(setMessages(messages));
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.callHandlers.clear();
      this.reconnectAttempts = 0;
    }
  }

  public sendMessage(message: IMessage): void {
    if (!this.socket) return;

    const payload = {
      content: message.content,
      receiverId: message.receiver,
      groupId: message.group,
      type: message.type,
      fileUrl: message.fileUrl,
    };

    store.dispatch(addMessage(message));

    this.socket.emit("sendMessage", payload);
  }

  public sendTypingStatus(isTyping: boolean, chatId: string): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("typing", { isTyping, chatId });
  }

  public joinGroup(groupId: string): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("joinGroup", groupId);
  }

  public leaveGroup(groupId: string): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("leaveGroup", groupId);
  }

  public startCall(
    receiverId: string | undefined,
    groupId: string | undefined,
    type: "video" | "audio"
  ): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("call", {
      receiverId,
      groupId,
      type,
      status: "ringing",
    });
  }

  public endCall(
    receiverId: string | undefined,
    groupId: string | undefined,
    type: "video" | "audio"
  ): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("call", {
      receiverId,
      groupId,
      type,
      status: "ended",
    });
  }

  public registerCallHandler(
    userId: string,
    handler: (data: ICallData) => void
  ) {
    this.callHandlers.set(userId, handler);
  }

  public unregisterCallHandler(userId: string) {
    this.callHandlers.delete(userId);
  }

  public onMessage(callback: (message: IMessage) => void): void {
    if (!this.socket) return;
    this.socket.on("message", callback);
  }

  public onTyping(
    callback: (data: { userId: string; isTyping: boolean }) => void
  ): void {
    if (!this.socket) return;
    this.socket.on("typing", callback);
  }

  public onUserOnline(callback: (data: { userId: string }) => void): void {
    if (!this.socket) return;
    this.socket.on("onlineStatus", callback);
  }

  public onUserOffline(callback: (data: { userId: string }) => void): void {
    if (!this.socket) return;
    this.socket.on("onlineStatus", callback);
  }

  public onCall(
    callback: (data: {
      from: string;
      type: "video" | "audio";
      status: string;
    }) => void
  ): void {
    if (!this.socket) return;
    this.socket.on("call", callback);
  }

  public removeAllListeners(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public loadMessages(receiverId?: string, groupId?: string): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("loadMessages", { receiverId, groupId });
  }
}

export default SocketService.getInstance();
