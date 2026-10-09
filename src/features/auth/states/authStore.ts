import { defineStore } from "pinia";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import {
  postLogin,
  postLogout,
  postRegister,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "../api/authApi";

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthLogin: boolean;
  isAuthRegister: boolean;
  isAuthLogout: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: getAccessToken(),
    user: null,
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
  },
  actions: {
    async asyncSetIsAuthLogin(payload: LoginPayload): Promise<boolean> {
      this.isAuthLogin = true;
      const result = await postLogin(payload);
      this.isAuthLogin = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }

      putAccessToken(result.data.token);
      this.token = result.data.token;
      this.user = result.data.user;
      return true;
    },

    async asyncSetIsAuthRegister(payload: RegisterPayload): Promise<boolean> {
      this.isAuthRegister = true;
      const result = await postRegister(payload);
      this.isAuthRegister = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }

      await showSuccessDialog(result.message);
      return true;
    },

    async asyncSetIsAuthLogout(): Promise<void> {
      this.isAuthLogout = true;
      await postLogout();
      putAccessToken(null);
      this.token = null;
      this.user = null;
      this.isAuthLogout = false;
    },
  },
});
