import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { User, AuthResponse } from "../../types/user";
import { UserData } from "../../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

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
      const res = await axios.post<AuthResponse>(
        `${API_URL}/auth/signup`,
        userData
      );
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.error || "An unknown error occurred";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("An unknown error occurred");
    }
  }
);

export const login = createAsyncThunk<AuthResponse, UserData>(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const res = await axios.post<{
        message: string;
        user: User;
        accessToken: string;
        refreshToken: string;
      }>(`${API_URL}/auth/login`, userData);

      return {
        user: res.data.user,
        token: res.data.accessToken,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.error || "An unknown error occurred";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (email: string, thunkAPI) => {
    try {
      const res = await axios.delete(`${API_URL}/auth/delete-user`, {
        data: { email },
      });
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.error || "An unknown error occurred";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("An unknown error occurred");
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
      const res = await axios.put(
        `${API_URL}/auth/update-user?email=${email}`,
        userData
      );
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.error || "An unknown error occurred";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("An unknown error occurred");
    }
  }
);

export const getAllUsers = createAsyncThunk<User[], void>(
  "auth/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get<User[]>(`${API_URL}/auth/get-all-users`);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.error || "An unknown error occurred";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("An unknown error occurred");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.currentUser = action.payload.user;
      sessionStorage.setItem(
        "auth",
        JSON.stringify({
          isAuthenticated: true,
          token: action.payload.token,
          currentUser: action.payload.user,
        })
      );
    },
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.error = null;
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.currentUser = action.payload.user;
        sessionStorage.setItem(
          "auth",
          JSON.stringify({
            isAuthenticated: true,
            token: action.payload.token,
            currentUser: action.payload.user,
          })
        );
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
        state.token = action.payload.token;
        state.currentUser = action.payload.user;
        sessionStorage.setItem(
          "auth",
          JSON.stringify({
            isAuthenticated: true,
            token: action.payload.token,
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

export const {
  setAuth,
  logout,
  setUsers,
  clearError,
  setLoading,
  setError,
  loginSuccess,
  logoutSuccess,
  updateUserSuccess,
} = authSlice.actions;
export default authSlice.reducer;
