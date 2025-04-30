import { User, UserUpdate, AuthResponse } from "../types/user";
import api from "../utils/axiosInstance";

export const login = async (email: string, password: string): Promise<User> => {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  const { accessToken, user } = response.data;
  sessionStorage.setItem("accessToken", accessToken);
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
  const { accessToken, user } = response.data;

  sessionStorage.setItem("accessToken", accessToken);
  return user;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const updateUser = async (updates: UserUpdate): Promise<User> => {
  const response = await api.put<User>("/auth/update-user", updates);
  return response.data;
};

export const deleteUser = async (): Promise<void> => {
  await api.delete("/auth/delete-user");
};
