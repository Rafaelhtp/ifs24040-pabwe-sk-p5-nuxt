import { defineStore } from "pinia";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import {
  getMe,
  getUsers,
  postPhoto,
  putMe,
  putPassword,
  type PasswordPayload,
  type ProfilePayload,
  type User,
} from "../api/userApi";

export interface UsersState {
  users: User[];
  profile: User | null;
  isUsers: boolean;
  isProfile: boolean;
  isProfileChange: boolean;
  isPhotoChange: boolean;
  isPasswordChange: boolean;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isUsers: false,
    isProfile: false,
    isProfileChange: false,
    isPhotoChange: false,
    isPasswordChange: false,
  }),
  actions: {
    async asyncGetUsers(): Promise<boolean> {
      this.isUsers = true;
      const result = await getUsers();
      this.isUsers = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      this.users = result.data.users;
      return true;
    },

    async asyncGetProfile(): Promise<boolean> {
      this.isProfile = true;
      const result = await getMe();
      this.isProfile = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      this.profile = result.data.user;
      return true;
    },

    async asyncChangeProfile(payload: ProfilePayload): Promise<boolean> {
      this.isProfileChange = true;
      const result = await putMe(payload);
      this.isProfileChange = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      this.profile = result.data.user;
      await showSuccessDialog(result.message);
      return true;
    },

    async asyncChangePhoto(file: File): Promise<boolean> {
      this.isPhotoChange = true;
      const result = await postPhoto(file);
      this.isPhotoChange = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      await showSuccessDialog(result.message);
      return true;
    },

    async asyncChangePassword(payload: PasswordPayload): Promise<boolean> {
      this.isPasswordChange = true;
      const result = await putPassword(payload);
      this.isPasswordChange = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      await showSuccessDialog(result.message);
      return true;
    },
  },
});
