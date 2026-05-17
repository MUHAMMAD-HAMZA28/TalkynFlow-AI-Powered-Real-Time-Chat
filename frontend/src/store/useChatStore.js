import { create } from "zustand";
import { StreamChat } from "stream-chat";
import { axiosInstance } from "../lib/axios";

const API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const useChatStore = create((set, get) => ({
  chatClient: null,
  isConnecting: false,
  error: null,

  connectChatUser: async (authUser) => {
    if (!authUser) return;

    const currentClient = get().chatClient;
    const userId = (authUser._id || authUser.id).toString();

    // Already connected with the same user — skip
    if (currentClient?.userID === userId && currentClient?.wsConnection?.isConnected) {
      return;
    }

    set({ isConnecting: true, error: null });

    try {
      const { data } = await axiosInstance.get("/chat/token");
      const token = data.token;

      const client = StreamChat.getInstance(API_KEY);

      // Disconnect stale session if any
      if (client.userID) {
        await client.disconnectUser();
      }

      await client.connectUser(
        {
          id: userId,
          name: authUser.fullName,
          image: authUser.profilePic || `https://getstream.io/random_svg/?name=${authUser.fullName}`,
        },
        token
      );

      set({ chatClient: client, isConnecting: false });
      console.log("TalkynFlow: Stream Connected Successfully");
    } catch (error) {
      console.error("Error connecting stream user:", error);
      set({ error: "Failed to connect to chat", isConnecting: false, chatClient: null });
    }
  },

  disconnectChatUser: async () => {
    try {
      const client = get().chatClient;
      if (client) {
        await client.disconnectUser();
        set({ chatClient: null });
        console.log("TalkynFlow: Stream Disconnected");
      }
    } catch (error) {
      console.error("Error disconnecting stream:", error);
    }
  },
}));