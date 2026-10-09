import { apiRequest } from "../../../helpers/apiHelper";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface LoginData {
  user: AuthUser;
  token: string;
}

export const postLogin = (payload: LoginPayload) =>
  apiRequest<LoginData>("/auth/login", { method: "POST", body: payload, auth: false });

export const postRegister = (payload: RegisterPayload) =>
  apiRequest("/auth/register", { method: "POST", body: payload, auth: false });

export const postLogout = () => apiRequest("/auth/logout", { method: "POST" });
