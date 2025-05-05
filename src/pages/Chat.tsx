import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import ChatWindow from "../components/chat/ChatWindow";
import ChatList from "../components/chat/ChatList";
import { getAllUsers } from "../redux/slices/authSlice";
import { SocketService as socketService } from "../services/socketService";

const Chat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(getAllUsers());
      socketService.connect(token);
    }

    return () => {
      socketService.disconnect();
    };
  }, [dispatch, isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">Please login to access the chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] mt-16">
      <div className="w-1/4 border-r">
        <ChatList />
      </div>
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
};

export default Chat;
