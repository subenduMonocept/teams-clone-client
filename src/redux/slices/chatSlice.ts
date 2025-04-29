import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IMessage } from "../../types/chat";
import { User } from "../../types/user";

interface ActiveChat {
  type: "private" | "group";
  id: string;
}

interface ChatState {
  messages: IMessage[];
  users: User[];
  typingStatus: Record<string, boolean>;
  onlineStatus: Record<string, boolean>;
  activeChat: ActiveChat | null;
  uploadStatus: "idle" | "loading" | "success" | "error";
  uploadError: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  users: [],
  typingStatus: {},
  onlineStatus: {},
  activeChat: null,
  uploadStatus: "idle",
  uploadError: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<IMessage[]>) => {
      state.messages = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addMessage: (state, action: PayloadAction<IMessage>) => {
      state.messages.push(action.payload);
    },
    setTypingStatus: (
      state,
      action: PayloadAction<{ userId: string; status: boolean }>
    ) => {
      state.typingStatus[action.payload.userId] = action.payload.status;
    },
    setOnlineStatus: (
      state,
      action: PayloadAction<{ userId: string; status: boolean }>
    ) => {
      state.onlineStatus[action.payload.userId] = action.payload.status;
    },
    setActiveChat: (state, action: PayloadAction<ActiveChat | null>) => {
      state.activeChat = action.payload;
    },
    setUploadStatus: (
      state,
      action: PayloadAction<"idle" | "loading" | "success" | "error">
    ) => {
      state.uploadStatus = action.payload;
    },
    setUploadError: (state, action: PayloadAction<string | null>) => {
      state.uploadError = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMessages,
  setUsers,
  addMessage,
  setTypingStatus,
  setOnlineStatus,
  setActiveChat,
  setUploadStatus,
  setUploadError,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;
