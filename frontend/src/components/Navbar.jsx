import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { LogOut, MessageSquare, User, Palette, Sparkles, Download } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import toast from "react-hot-toast";

const THEMES = [
  "light", "dark", "cupcake", "synthwave",  "cyberpunk",
  "forest", "luxury", "night", "coffee",
];

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { isInstallable, isInstalled, handleInstall } = usePWAInstall();

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">TalkynFlow</h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm btn-ghost gap-2">
                <Palette className="size-5" />
                <span className="hidden sm:inline">Theme</span>
              </div>
              <ul tabIndex={0} className="dropdown-content bg-base-200 text-base-content rounded-box z-[1] w-52 p-2 shadow-2xl mt-4 border border-base-300 max-h-80 overflow-y-auto">
                {THEMES.map((t) => (
                  <li key={t}>
                    <button
                      className={`w-full text-left capitalize btn btn-sm btn-ghost justify-start ${
                        theme === t ? "bg-primary text-primary-content hover:bg-primary/90" : ""
                      }`}
                      onClick={() => setTheme(t)}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {!isInstalled && (
              <button
                onClick={handleInstall}
                className={`btn btn-sm gap-2 shadow-sm ${
                  isInstallable ? "btn-primary animate-pulse" : "btn-ghost border border-primary/30 text-primary"
                }`}
                title="Install TalkynFlow App"
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {authUser && (
              <>
                <Link to="/ai" className="btn btn-sm btn-ghost gap-2 text-secondary hover:text-secondary-focus transition-colors">
                  <Sparkles className="size-5 text-secondary animate-pulse" />
                  <span className="hidden sm:inline">TalkynBot AI</span>
                </Link>

                <Link to="/friends" className="btn btn-sm btn-ghost gap-2">
                  <MessageSquare className="size-5" />
                  <span className="hidden sm:inline">Friends</span>
                </Link>

                <Link to="/onboarding" className="btn btn-sm btn-ghost gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center btn btn-sm btn-error btn-outline" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
