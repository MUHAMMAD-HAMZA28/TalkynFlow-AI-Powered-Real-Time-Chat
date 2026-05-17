import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { Sparkles, Send, Trash2, ArrowLeft, Sparkle } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const STARTERS = [
  {
    label: "Explore Features",
    desc: "What can I do on TalkynFlow?",
    prompt: "What are the main real-time chat features of TalkynFlow, and how does it keep my messages secure?"
  },
  {
    label: "Translate Chats",
    desc: "Translate phrases into Roman Urdu",
    prompt: "Can you translate 'Hey everyone, let's meet in the general group chat in 10 minutes!' into a natural Roman Urdu message?"
  },
  {
    label: "Sleek Chat Bios",
    desc: "Create a cool profile status bio",
    prompt: "Give me 5 unique, short, and cool status bio ideas that I can put on my TalkynFlow chat profile status."
  },
  {
    label: "Friendly Icebreakers",
    desc: "Fun ways to start a chat with a friend",
    prompt: "Give me 3 funny, friendly, and catchy icebreaker messages that I can use to start a conversation with a new friend on TalkynFlow."
  }
];

const AIPage = () => {
  const { authUser } = useAuthStore();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("talkyn_ai_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Persist messages in localStorage
  useEffect(() => {
    localStorage.setItem("talkyn_ai_messages", JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText("");
    setIsLoading(true);

    const userMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Gather history for contextual memory
      const historyContext = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await axiosInstance.post("/chat/ai", {
        messageText: query,
        history: historyContext
      });

      const botMessage = {
        id: `msg-${Date.now()}-bot`,
        role: "assistant",
        content: res.data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("AI Query Error:", err);
      toast.error("Failed to generate response.");
      
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "I'm sorry, I encountered an issue connecting to my networks. Please check your credentials or configuration.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your conversation with TalkynBot AI?")) {
      setMessages([]);
      toast.success("Conversation cleared!");
    }
  };

  // Simple clean bold text formatting
  const formatMessageText = (text) => {
    if (!text) return "";
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bp, idx) => {
      if (bp.startsWith("**") && bp.endsWith("**")) {
        return <strong key={idx} className="font-extrabold text-base-content">{bp.slice(2, -2)}</strong>;
      }
      return bp;
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] mt-16 bg-base-100 flex justify-center overflow-hidden">
      <div className="max-w-4xl w-full flex flex-col h-full bg-base-100 border-x border-base-300/40 relative">
        {/* Sleek Minimal Header */}
        <header className="h-16 border-b border-base-300 flex items-center justify-between px-6 bg-base-100/90 backdrop-blur-md z-10 shrink-0">
          <Link to="/" className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 rounded-xl transition-all">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          <div className="flex items-center gap-2 select-none">
            <div className="size-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-secondary-content font-bold text-xs shadow-md">
              TA
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none flex items-center gap-1.5">
                TalkynBot AI <Sparkles className="size-3.5 text-secondary animate-pulse" />
              </span>
              <span className="text-[10px] text-success font-medium mt-0.5">Online Assistant</span>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error transition-all"
            title="Clear Chat"
          >
            <Trash2 className="size-4" />
          </button>
        </header>

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            /* Spacious Premium Empty State */
            <div className="max-w-2xl mx-auto min-h-[calc(100vh-280px)] flex flex-col justify-center items-center py-6 text-center">
              <div className="size-16 rounded-3xl bg-gradient-to-tr from-secondary/20 to-primary/20 flex items-center justify-center mb-6 shadow-sm border border-secondary/10 shrink-0">
                <Sparkle className="size-9 text-secondary animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 mb-4 shrink-0">
                TalkynBot <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-base-content/60 text-sm md:text-base max-w-md mt-2 mb-4 leading-relaxed shrink-0">
                Your friendly AI assistant inside TalkynFlow. Ask questions, translate messages, or write clean chat code.
              </p>

              {/* Spaced Grid Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left mt-10 shrink-0">
                {STARTERS.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSend(s.prompt)}
                    className="p-4 bg-base-200 hover:bg-base-300 border border-base-300/60 hover:border-secondary/40 rounded-xl cursor-pointer shadow-sm hover:shadow transition-all duration-200 group"
                  >
                    <div className="font-bold text-sm mb-1 group-hover:text-secondary transition-colors">
                      {s.label}
                    </div>
                    <div className="text-xs text-base-content/60">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Bubbles Feed */
            <div className="space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex items-end gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role !== "user" && (
                    <div className="size-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-secondary-content font-bold text-xs shadow-md select-none shrink-0 mb-1">
                      TA
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1 max-w-[75%]">
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-content rounded-tr-none"
                          : "bg-base-200 border border-base-300 rounded-tl-none text-base-content"
                      }`}
                    >
                      {formatMessageText(m.content)}
                    </div>
                    <span className={`text-[10px] text-base-content/40 px-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                      {m.timestamp}
                    </span>
                  </div>

                  {m.role === "user" && (
                    <div className="size-8 rounded-full bg-base-300 flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden select-none shrink-0 mb-1 border border-base-400">
                      {authUser?.profilePic ? (
                        <img src={authUser.profilePic} alt="avatar" className="size-full object-cover" />
                      ) : (
                        <span>{authUser?.fullName?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Bouncing Dot Loader */}
              {isLoading && (
                <div className="flex items-end gap-3 justify-start">
                  <div className="size-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-secondary-content font-bold text-xs shadow-md select-none shrink-0 mb-1">
                    TA
                  </div>
                  <div className="flex gap-1.5 items-center bg-base-200 border border-base-300 p-3 px-4 rounded-2xl rounded-tl-none shadow-sm">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-base-300 bg-base-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex flex-col gap-2"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                placeholder="Message TalkynBot AI..."
                className="input input-bordered w-full pr-12 rounded-full pl-6 bg-base-200/60 focus:bg-base-100 hover:bg-base-200 shadow-inner focus:outline-none focus:border-secondary transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className={`absolute right-1.5 btn btn-circle btn-sm shadow-sm transition-all ${
                  inputText.trim()
                    ? "btn-secondary text-secondary-content scale-100 hover:scale-105"
                    : "btn-ghost text-base-content/30 cursor-not-allowed scale-95"
                }`}
              >
                <Send className="size-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-base-content/40 leading-none select-none">
              TalkynBot AI can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
