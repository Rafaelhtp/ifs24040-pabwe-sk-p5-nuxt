import { defineStore } from "pinia";
import { userApi, type User, type UpdateProfilePayload, type ChangePasswordPayload } from "../api/userApi";

export interface UsersState {
  users: User[];
  profile: User | null;
  isLoadingUsers: boolean;
  isLoadingProfile: boolean;
  isUpdatingProfile: boolean;
  isUploadingPhoto: boolean;
  isChangingPassword: boolean;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isLoadingUsers: false,
    isLoadingProfile: false,
    isUpdatingProfile: false,
    isUploadingPhoto: false,
    isChangingPassword: false,
  }),

  actions: {
    async asyncGetUsers(): Promise<User[]> {
      this.isLoadingUsers = true;
      try {
        const response = await userApi.getUsers();
        this.users = response.data || [];
        return this.users;
      } finally {
        this.isLoadingUsers = false;
      }
    },

    async asyncGetProfile(): Promise<User | null> {
      this.isLoadingProfile = true;
      try {
        const response = await userApi.getProfile();
        this.profile = response.data || null;
        return this.profile;
      } finally {
        this.isLoadingProfile = false;
      }
    },

    async asyncUpdateProfile(payload: UpdateProfilePayload): Promise<User> {
      this.isUpdatingProfile = true;
      try {
        const response = await userApi.updateProfile(payload);
        if (response.data) {
          this.profile = { ...(this.profile || {}), ...response.data } as User;
        }
        return response.data;
      } finally {
        this.isUpdatingProfile = false;
      }
    },

    async asyncUploadPhoto(file: File | Blob): Promise<string> {
      this.isUploadingPhoto = true;
      try {
        const response = await userApi.uploadPhoto(file);
        const photoUrl = response.data?.photo;
        if (this.profile && photoUrl) {
          this.profile.photo = photoUrl;
        }
        return photoUrl;
      } finally {
        this.isUploadingPhoto = false;
      }
    },

    async asyncChangePassword(payload: ChangePasswordPayload): Promise<void> {
      this.isChangingPassword = true;
      try {
        await userApi.changePassword(payload);
      } finally {
        this.isChangingPassword = false;
      }
    },
  },
});
