import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { IMessage } from "../types/chat";
import { SocketService as socketService } from "../services/socketService";
import { useEffect } from "react";

export const useChat = () => {
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const { activeChat } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    if (activeChat) {
      if (activeChat.type === "private") {
        socketService.loadMessages(activeChat.id);
      } else if (activeChat.type === "group") {
        socketService.loadMessages(undefined, activeChat.id);
      }
    }
  }, [activeChat]);

  const sendMessage = (
    content: string,
    type: "text" | "file" = "text",
    fileUrl?: string
  ) => {
    if (!currentUser || !activeChat) return;

    const message: IMessage = {
      _id: Date.now().toString(),
      sender: {
        _id: currentUser._id,
        email: currentUser.email,
      },
      content,
      type,
      fileUrl,
      createdAt: new Date().toISOString(),
    };

    if (activeChat.type === "private") {
      message.receiver = activeChat.id;
    } else {
      message.group = activeChat.id;
    }

    socketService.sendMessage(message);
  };

  const setTyping = (isTyping: boolean) => {
    if (!activeChat) return;
    socketService.sendTypingStatus(isTyping, activeChat.id);
  };

  const startCall = (type: "video" | "audio") => {
    if (!activeChat) return;
    socketService.startCall(
      activeChat.type === "private" ? activeChat.id : undefined,
      activeChat.type === "group" ? activeChat.id : undefined,
      type
    );
  };

  return {
    sendMessage,
    setTyping,
    startCall,
  };
};
