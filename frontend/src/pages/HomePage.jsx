import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { MessageSquare, Bell, Users, Sparkles } from "lucide-react";

const HomePage = () => {
  const { authUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-base-200 pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-base-100 rounded-xl p-8 shadow-sm text-center border border-base-300 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {authUser?.fullName || "User"}!</h1>
          <p className="text-base-content/60">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/chat"
            className="flex flex-col items-center justify-center p-8 bg-base-100 rounded-xl border border-base-300 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="size-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Messages</h2>
            <p className="text-base-content/60 text-center">Chat with your friends and groups</p>
          </Link>

          <Link
            to="/notifications"
            className="flex flex-col items-center justify-center p-8 bg-base-100 rounded-xl border border-base-300 hover:border-accent hover:shadow-md transition-all group"
          >
            <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <Bell className="size-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Notifications</h2>
            <p className="text-base-content/60 text-center">View requests and alerts</p>
          </Link>

          <Link
            to="/friends"
            className="flex flex-col items-center justify-center p-8 bg-base-100 rounded-xl border border-base-300 hover:border-info hover:shadow-md transition-all group"
          >
            <div className="size-16 rounded-full bg-info/10 flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
              <Users className="size-8 text-info" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Profile & Friends</h2>
            <p className="text-base-content/60 text-center">Manage your profile and connections</p>
          </Link>

          <Link
            to="/ai"
            className="flex flex-col items-center justify-center p-8 bg-base-100 rounded-xl border border-base-300 hover:border-secondary hover:shadow-md transition-all group"
          >
            <div className="size-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
              <Sparkles className="size-8 text-secondary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">TalkynBot AI</h2>
            <p className="text-base-content/60 text-center">Chat with your personal AI companion</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;