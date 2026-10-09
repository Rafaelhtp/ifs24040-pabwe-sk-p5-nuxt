import { fetchWithAuth } from "~/helpers/apiHelper";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token?: string;
    user?: AuthUser;
  };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return fetchWithAuth<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload as any,
    });
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return fetchWithAuth<AuthResponse>("/auth/register", {
      method: "POST",
      body: payload as any,
    });
  },
};
