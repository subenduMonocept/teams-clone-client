import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setActiveChat } from "../../redux/slices/chatSlice";
import { User } from "../../types/auth";

const ChatList: React.FC = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state: RootState) => state.auth);
  const { activeChat } = useSelector((state: RootState) => state.chat);

  const handleChatSelect = (user: User) => {
    if (user._id) {
      dispatch(
        setActiveChat({
          id: user._id,
          type: "private",
        })
      );
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No users available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>
      <div className="divide-y">
        {users.map((user) => (
          <div
            key={user._id}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              activeChat?.id === user._id ? "bg-blue-50" : ""
            }`}
            onClick={() => handleChatSelect(user)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
