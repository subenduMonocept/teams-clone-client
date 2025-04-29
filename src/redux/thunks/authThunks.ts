import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  login,
  signup,
  logout,
  updateUser,
  deleteUser,
} from "../../services/authService";
import { UserUpdate } from "../../types/user";
import {
  setLoading,
  setError,
  loginSuccess,
  logoutSuccess,
  updateUserSuccess,
} from "../slices/authSlice";
import { LoginCredentials, SignupData } from "../../types/auth";
import axios from "axios";

const handleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const user = await login(credentials.email, credentials.password);
      dispatch(loginSuccess(user));
      return user;
    } catch (error) {
      const errorMessage = handleError(error);
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (data: SignupData, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const user = await signup(data.name, data.email, data.password);
      dispatch(loginSuccess(user));
      return user;
    } catch (error) {
      const errorMessage = handleError(error);
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await logout();
      dispatch(logoutSuccess());
    } catch (error) {
      const errorMessage = handleError(error);
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUser",
  async (updates: UserUpdate, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const updatedUser = await updateUser(updates);
      dispatch(updateUserSuccess(updatedUser));
      return updatedUser;
    } catch (error) {
      const errorMessage = handleError(error);
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteUserAccount = createAsyncThunk(
  "auth/deleteUser",
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await deleteUser();
      dispatch(logoutSuccess());
    } catch (error) {
      const errorMessage = handleError(error);
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
