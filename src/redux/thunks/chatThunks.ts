import { AppThunk } from "../store";
import {
  setMessages,
  setUsers,
  setError,
  setLoading,
  setUploadStatus,
  setUploadError,
  addMessage,
} from "../slices/chatSlice";
import axios from "axios";
import { IMessage } from "../../types/chat";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const sendMessage =
  (
    receiverId: string,
    content: string,
    type: string = "text",
    fileUrl?: string
  ): AppThunk =>
  async (dispatch) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/chat/send`,
        { receiverId, content, type, fileUrl },
        {
          headers: getAuthHeader(),
        }
      );

      // Transform the response data to match IMessage interface
      const message: IMessage = {
        _id: response.data._id,
        sender: {
          _id: response.data.sender._id,
          email: response.data.sender.email,
        },
        receiver: response.data.receiver,
        content: response.data.content,
        type: response.data.type,
        fileUrl: response.data.fileUrl,
        createdAt: response.data.createdAt,
      };

      dispatch(addMessage(message));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        dispatch(
          setError(error.response?.data?.message || "Failed to send message")
        );
      } else {
        dispatch(setError("An unexpected error occurred"));
      }
      throw error;
    }
  };

export const fetchMessages =
  (userId: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(
        `${API_URL}/api/chat/messages/${userId}`,
        {
          headers: getAuthHeader(),
        }
      );
      dispatch(setMessages(response.data));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        dispatch(
          setError(error.response?.data?.message || "Failed to fetch messages")
        );
      } else {
        dispatch(setError("An unexpected error occurred"));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

export const fetchUsers = (): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.get(`${API_URL}/api/chat/users`, {
      headers: getAuthHeader(),
    });
    dispatch(setUsers(response.data));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      dispatch(
        setError(error.response?.data?.message || "Failed to fetch users")
      );
    } else {
      dispatch(setError("An unexpected error occurred"));
    }
  } finally {
    dispatch(setLoading(false));
  }
};

export const uploadFile =
  (file: File): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setUploadStatus("loading"));
      dispatch(setUploadError(null));
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      const { fileUrl } = response.data;
      const message: IMessage = {
        _id: Date.now().toString(),
        sender: {
          _id: "",
          email: "",
        },
        content: file.name,
        type: "file",
        fileUrl,
        createdAt: new Date().toISOString(),
      };

      dispatch(addMessage(message));
      dispatch(setUploadStatus("success"));
      return fileUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        dispatch(
          setUploadError(
            error.response?.data?.message || "Failed to upload file"
          )
        );
      } else {
        dispatch(setUploadError("An unexpected error occurred"));
      }
      dispatch(setUploadStatus("error"));
      throw error;
    }
  };
