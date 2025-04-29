import axios from "axios";
import { User, UserUpdate, AuthResponse } from "../types/user";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.post<AuthResponse>(
          `${API_URL}/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string): Promise<User> => {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  const { accessToken, refreshToken, user } = response.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return user;
};

export const signup = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  const response = await api.post<AuthResponse>("/auth/signup", {
    name,
    email,
    password,
  });
  const { accessToken, refreshToken, user } = response.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return user;
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const updateUser = async (updates: UserUpdate): Promise<User> => {
  const response = await api.put<User>("/auth/update-user", updates);
  return response.data;
};

export const deleteUser = async (): Promise<void> => {
  await api.delete("/auth/delete-user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export default api;
