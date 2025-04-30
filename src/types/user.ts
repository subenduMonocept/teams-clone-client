export interface User {
  _id: string;
  name: string;
  email: string;
  gender?: string;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
  gender?: string;
  profileImage?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  token: string;
  refreshToken: string;
}
