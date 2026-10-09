import { defineStore } from "pinia";
import { authApi, type LoginPayload, type RegisterPayload, type AuthUser } from "../api/authApi";
import { getAccessToken, putAccessToken } from "~/helpers/apiHelper";

export interface AuthState {
  isAuthLogin: boolean;
  isAuthRegister: boolean;
  isAuthLogout: boolean;
  token: string | null;
  user: AuthUser | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
    token: getAccessToken(),
    user: null,
  }),

  actions: {
    async asyncLogin(payload: LoginPayload): Promise<boolean> {
      this.isAuthLogin = true;
      try {
        const response = await authApi.login(payload);
        const token = response.data?.token || null;
        const user = response.data?.user || null;

        this.token = token;
        this.user = user;
        if (token) {
          putAccessToken(token);
        }
        return true;
      } finally {
        this.isAuthLogin = false;
      }
    },

    async asyncRegister(payload: RegisterPayload): Promise<boolean> {
      this.isAuthRegister = true;
      try {
        await authApi.register(payload);
        return true;
      } finally {
        this.isAuthRegister = false;
      }
    },

    async asyncLogout(): Promise<void> {
      this.isAuthLogout = true;
      try {
        putAccessToken(null);
        this.token = null;
        this.user = null;
      } finally {
        this.isAuthLogout = false;
      }
    },

    setUser(user: AuthUser | null) {
      this.user = user;
    },
  },
});
