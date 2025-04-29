import { User } from "./user";

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserData {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
}

export interface AuthError {
  message: string;
  status?: number;
}
