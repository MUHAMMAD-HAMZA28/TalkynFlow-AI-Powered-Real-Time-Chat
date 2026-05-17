import React, { useEffect, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  ChannelHeader,
  MessageList,
  MessageComposer,
  Thread,
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";
import { Loader } from "lucide-react";

// Stable sort object outside
const sort = { last_message_at: -1 };

const ChatPage = () => {
  const { chatClient, isConnecting } = useChatStore();
  const { authUser } = useAuthStore();
  const { theme } = useThemeStore();
  
  const isDark = ["coffee", "dark", "halloween", "forest", "luxury", "dracula", "business", "night"].includes(theme);
  const chatTheme = isDark ? "str-chat__theme-dark" : "str-chat__theme-light";
  
  const filters = useMemo(() => {
    if (!authUser) return null;
    const userId = (authUser._id || authUser.id).toString();
    return { type: "messaging", members: { $in: [userId] } };
  }, [authUser]);

  if (isConnecting || !chatClient) {
    return (
      <div className="flex h-screen items-center justify-center pt-16 bg-base-100">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] mt-16 bg-base-100 flex flex-col overflow-hidden">
      <Chat client={chatClient} theme={chatTheme}>
        <div className="flex-1 flex overflow-hidden w-full border-t border-base-300">
          <div className="w-80 border-r border-base-300 bg-base-200 hidden md:flex flex-col h-full overflow-y-auto">
            {filters && <ChannelList filters={filters} sort={sort} showChannelSearch />}
          </div>
          <div className="flex-1 flex flex-col min-w-0 h-full bg-base-100 relative">
            <Channel>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageComposer />
              </Window>
              <Thread />
            </Channel>
          </div>
        </div>
      </Chat>
    </div>
  );
};

export default ChatPage;