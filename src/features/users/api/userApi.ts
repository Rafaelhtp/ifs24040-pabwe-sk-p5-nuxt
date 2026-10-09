import { fetchWithAuth } from "~/helpers/apiHelper";

export interface User {
  id: string | number;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfilePayload {
  name: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  confirm_password?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const userApi = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    return fetchWithAuth<ApiResponse<User[]>>("/users");
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return fetchWithAuth<ApiResponse<User>>("/users/me");
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<User>> {
    return fetchWithAuth<ApiResponse<User>>("/users/me", {
      method: "PUT",
      body: payload as any,
    });
  },

  async uploadPhoto(file: File | Blob): Promise<ApiResponse<{ photo: string }>> {
    const formData = new FormData();
    formData.append("photo", file);
    return fetchWithAuth<ApiResponse<{ photo: string }>>("/users/me/photo", {
      method: "POST",
      body: formData,
    });
  },

  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<null>> {
    return fetchWithAuth<ApiResponse<null>>("/users/me/password", {
      method: "PUT",
      body: payload as any,
    });
  },
};
