import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthResponse } from "../../types/user";
import { UserData } from "../../types/auth";
import axiosInstance from "../../utils/axiosInstance";
import axios from "axios";

interface StoredAuth {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: User | null;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

const getInitialState = (): AuthState => {
  const storedAuth = sessionStorage.getItem("auth");
  if (storedAuth) {
    const parsedAuth = JSON.parse(storedAuth) as StoredAuth;
    if (parsedAuth.token && parsedAuth.currentUser) {
      return {
        isAuthenticated: true,
        token: parsedAuth.token,
        currentUser: parsedAuth.currentUser,
        users: [],
        loading: false,
        error: null,
      };
    }
  }
  return {
    isAuthenticated: false,
    token: null,
    currentUser: null,
    users: [],
    loading: false,
    error: null,
  };
};

const initialState = getInitialState();

export const signup = createAsyncThunk<AuthResponse, UserData>(
  "auth/signup",
  async (userData, thunkAPI) => {
    try {
      const res = await axiosInstance.post<AuthResponse>(
        "/auth/signup",
        userData
      );
      return res.data;
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error?.msg
          ? err.response.data.error.msg
          : "An unknown error occurred while signup";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const login = createAsyncThunk<AuthResponse, UserData>(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const res = await axiosInstance.post<AuthResponse>(
        "/auth/login",
        userData
      );
      return res.data;
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error?.msg
          ? err.response.data.error.msg
          : "An unknown error occurred while login";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (email: string, thunkAPI) => {
    try {
      const res = await axiosInstance.delete("/auth/delete-user", {
        data: { email },
      });
      return res.data;
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error?.msg
          ? err.response.data.error.msg
          : "An unknown error occurred while deleting user";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (
    { email, userData }: { email: string; userData: { password: string } },
    thunkAPI
  ) => {
    try {
      const res = await axiosInstance.put(
        `/auth/update-user?email=${email}`,
        userData
      );
      return res.data;
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error?.msg
          ? err.response.data.error.msg
          : "An unknown error occurred while updating user";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const getAllUsers = createAsyncThunk<User[], void>(
  "auth/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get<User[]>("/auth/get-all-users");
      return res.data;
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error?.msg
          ? err.response.data.error.msg
          : "An unknown error occurred while retrieving al users";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.currentUser = null;
      state.users = [];
      sessionStorage.removeItem("auth");
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.accessToken;
        state.currentUser = action.payload.user;
        sessionStorage.setItem(
          "auth",
          JSON.stringify({
            isAuthenticated: true,
            token: action.payload.accessToken,
            currentUser: action.payload.user,
          })
        );
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            ...action.payload,
            _id: state.currentUser._id,
          };
          sessionStorage.setItem("user", JSON.stringify(state.currentUser));
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUsers, clearError } = authSlice.actions;

export default authSlice.reducer;
