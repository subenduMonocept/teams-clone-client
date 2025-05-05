import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useChat } from "../../customHooks/useChat";
import { ICallData, IMessage } from "../../types/chat";
import { FaPaperclip, FaVideo, FaPhone, FaFile } from "react-icons/fa";
import { SocketService as socketService } from "../../services/socketService";

interface ActiveChat {
  type: "private" | "group";
  id: string;
}

const ChatWindow: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, typingStatus, onlineStatus, activeChat } = useSelector(
    (state: RootState) => state.chat
  );
  const { users, currentUser } = useSelector((state: RootState) => state.auth);

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [callInProgress, setCallInProgress] = useState<{
    type: "video" | "audio";
    chatType: "private" | "group";
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<ICallData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, setTyping, startCall } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setCallInProgress(null);
  }, [activeChat]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChat]);

  useEffect(() => {
    const handleIncomingCall = (data: ICallData) => {
      if (data.status === "ringing") {
        setIncomingCall({
          from: data.from,
          type: data.type,
          status: data.status,
        });
      } else if (data.status === "ended") {
        setIncomingCall(null);
        setCallInProgress(null);
      }
    };

    if (activeChat?.id) {
      socketService.registerCallHandler(activeChat.id, handleIncomingCall);
    }

    return () => {
      if (activeChat?.id) {
        socketService.unregisterCallHandler(activeChat.id);
      }
    };
  }, [activeChat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && activeChat) {
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data?.fileUrl) {
        sendMessage(file.name, "file", data.fileUrl);
      }
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  const handleCall = (type: "video" | "audio") => {
    if (!activeChat) return;

    startCall(type);
    setCallInProgress({
      type,
      chatType: activeChat.type,
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    try {
      await sendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const answerCall = () => {
    if (!incomingCall || !activeChat) return;

    socketService.startCall(incomingCall.from, undefined, incomingCall.type);
    setIncomingCall(null);
    setCallInProgress({
      type: incomingCall.type,
      chatType: "private",
    });
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    socketService.endCall(incomingCall.from, undefined, incomingCall.type);
    setIncomingCall(null);
  };

  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setTyping(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isTyping, setTyping]);

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  const chat = activeChat as ActiveChat;

  const selectedUser =
    chat.type === "private" ? users.find((user) => user._id === chat.id) : null;

  return (
    <div className="flex flex-col h-full">
      {incomingCall && (
        <div
          className="fixed inset-0 bg-black 
        bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded-lg text-center">
            <h3 className="text-xl mb-4">
              {incomingCall.type.toUpperCase()} call from {incomingCall.from}
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={answerCall}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {chat.type === "private"
              ? selectedUser?.name || "Private Chat"
              : "Group Chat"}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {typingStatus[chat.id] ? (
              <span>Typing...</span>
            ) : (
              <>
                <span
                  className={`h-2 w-2 rounded-full ${
                    onlineStatus[chat.id] ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span>{onlineStatus[chat.id] ? "Online" : "Offline"}</span>
              </>
            )}
          </div>
        </div>
        {callInProgress && (
          <div
            className="bg-green-100 text-green-800 p-2 
          flex justify-between items-center border-b px-4"
          >
            <span>
              {callInProgress.type === "video" ? "📹" : "🎧"}{" "}
              {callInProgress.chatType === "private" ? "Private" : "Group"} call
              in progress...
            </span>
            <button
              onClick={() => {
                socketService.endCall(
                  activeChat.type === "private" ? activeChat.id : undefined,
                  activeChat.type === "group" ? activeChat.id : undefined,
                  callInProgress.type
                );
                setCallInProgress(null);
              }}
              className="text-sm bg-red-500 text-white 
              px-3 py-1 rounded hover:bg-red-600"
            >
              End Call
            </button>
          </div>
        )}
        <div className="flex space-x-2">
          <button
            onClick={() => handleCall("video")}
            className="p-2 rounded-full hover:bg-gray-200"
            title="Start video call"
          >
            <FaVideo className="text-blue-500" />
          </button>
          <button
            onClick={() => handleCall("audio")}
            className="p-2 rounded-full hover:bg-gray-200"
            title="Start audio call"
          >
            <FaPhone className="text-blue-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg: IMessage) => {
          const isCurrentUser = currentUser?._id === msg.sender._id;
          return (
            <div
              key={msg._id}
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`min-w-[20%] max-w-[70%] rounded-lg p-3 ${
                  isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {msg.type === "file" ? (
                  <div className="flex items-center">
                    <FaFile className="mr-2" />
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {msg.content}
                    </a>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <p className="text-[0.6rem] mt-1 opacity-60 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black 
          bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-[90%] max-h-[90%] object-contain"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            ref={inputRef}
            name="chat-message"
            id="chat-message"
            autoComplete="off"
            onChange={(e) => {
              setMessage(e.target.value);
              setIsTyping(true);
              setTyping(true);
            }}
            placeholder="Type a message..."
            className="flex-1 h-10 px-3 border rounded-l-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            id="chat-file-upload"
            name="chat-file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-3 border-t border-b border-r 
          hover:bg-gray-100"
            title="Attach file"
          >
            <FaPaperclip />
          </button>
          <button
            type="submit"
            className="h-10 px-4 bg-blue-500 text-white 
            rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
