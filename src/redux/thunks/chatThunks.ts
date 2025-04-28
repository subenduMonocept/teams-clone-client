import { AppThunk } from "../store";
import {
  setUploadStatus,
  setUploadError,
  addMessage,
} from "../slices/chatSlice";
import axios from "axios";
import { IMessage } from "../../types/chat";
import { showToast } from "../../utils/toast";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  try {
    const auth = sessionStorage.getItem("auth");
    if (!auth) return {};
    const { token } = JSON.parse(auth);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (err) {
    const errorMessage =
      typeof err === "string" ? err : "Error getting auth token";
    showToast(errorMessage, "error");
    return {};
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

      const headers = {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      };
      console.log("Request headers:", headers);

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers,
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
        console.log("Error response:", error.response); // Debug log
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
