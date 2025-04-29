export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: "user" | "admin";
  gender: string;
  profileImage: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  token: string | null;
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}
