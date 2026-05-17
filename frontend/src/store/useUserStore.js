import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  recommendedUsers: [],
  friends: [],
  friendRequests: [],
  outgoingRequests: [],
  isUsersLoading: false,

  getRecommendedUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users");
      set({ recommendedUsers: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load recommended users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyFriends: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users/friends");
      set({ friends: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load friends list");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getFriendRequests: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users/friend-request");
      set({ friendRequests: res.data.notifications });
    } catch (error) {
      console.error("Error in getFriendRequests:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getOutgoingRequests: async () => {
    try {
      const res = await axiosInstance.get("/users/outgoing-friend-request");
      set({ outgoingRequests: res.data.outgoingRequests });
    } catch (error) {
      console.error("Error in getOutgoingRequests:", error);
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/users/friend-request/${userId}`);
      toast.success("Friend request sent!");
      // Refresh recommended and outgoing
      get().getRecommendedUsers();
      get().getOutgoingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
      toast.success("Friend request accepted!");
      // Refresh friends and requests
      get().getMyFriends();
      get().getFriendRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  rejectFriendRequest: async (requestId) => {
    try {
      await axiosInstance.put(`/users/friend-request/${requestId}/reject`);
      toast.success("Friend request rejected");
      // Refresh requests and recommended (in case they move back)
      get().getFriendRequests();
      get().getRecommendedUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  },

  cancelFriendRequest: async (userId) => {
    try {
      await axiosInstance.delete(`/users/friend-request/${userId}`);
      toast.success("Friend request cancelled");
      // Refresh recommended and outgoing
      get().getRecommendedUsers();
      get().getOutgoingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    }
  },

  unfriendUser: async (userId) => {
    try {
      await axiosInstance.delete(`/users/unfriend/${userId}`);
      toast.success("User unfriended");
      get().getMyFriends();
      get().getRecommendedUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unfriend");
    }
  },

  blockUser: async (userId) => {
    try {
      await axiosInstance.post(`/users/block/${userId}`);
      toast.success("User blocked");
      get().getMyFriends();
      get().getRecommendedUsers();
      get().getOutgoingRequests();
      get().getFriendRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block user");
    }
  },
}));
