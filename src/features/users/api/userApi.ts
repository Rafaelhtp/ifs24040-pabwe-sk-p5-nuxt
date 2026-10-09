import { apiRequest } from "../../../helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfilePayload {
  name: string;
  email: string;
}

export interface PasswordPayload {
  password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const getUsers = () => apiRequest<{ users: User[] }>("/users");

export const getMe = () => apiRequest<{ user: User }>("/users/me");

export const putMe = (payload: ProfilePayload) =>
  apiRequest<{ user: User }>("/users/me", { method: "PUT", body: payload });

export const postPhoto = (file: File) => {
  const formData = new FormData();
  formData.append("photo", file);
  return apiRequest("/users/me/photo", { method: "POST", body: formData });
};

export const putPassword = (payload: PasswordPayload) =>
  apiRequest("/users/password", { method: "PUT", body: payload });
