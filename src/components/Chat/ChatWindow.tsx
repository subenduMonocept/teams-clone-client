import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useChat } from "../../customHooks/useChat";
import { IMessage } from "../../types/chat";
import { FaPaperclip, FaVideo, FaPhone, FaFile } from "react-icons/fa";

interface ActiveChat {
  type: "private" | "group";
  id: string;
}

const ChatWindow: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, typingStatus, onlineStatus, activeChat } = useSelector(
    (state: RootState) => state.chat
  );
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const { sendMessage, setTyping, startCall } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && activeChat) {
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      setTyping(true);
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setTyping(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  };

  const handleCall = (type: "video" | "audio") => {
    if (activeChat) {
      startCall(type);
    }
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

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  const chat = activeChat as ActiveChat;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {chat.type === "private" ? "Private Chat" : "Group Chat"}
          </h2>
          <p className="text-sm text-gray-500">
            {typingStatus[chat.id] ? "Typing..." : ""}
            {onlineStatus[chat.id] ? "Online" : "Offline"}
          </p>
        </div>
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
                className={`max-w-[70%] rounded-lg p-3 ${
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
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Popup */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
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
            name="chat-message"
            id="chat-message"
            autoComplete="off"
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="p-2 border-t border-b border-r hover:bg-gray-100"
            title="Attach file"
          >
            <FaPaperclip />
          </button>
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
