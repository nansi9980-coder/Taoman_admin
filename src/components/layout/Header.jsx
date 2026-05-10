import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import clsx from "clsx";

export default function Header({ sidebarWidth }) {
  const { user, logout } = useAuth();
  const { mode, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const profileRef = useRef(null);
  const themeRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

  return (
    <header
      className={clsx(
        "fixed top-0 right-0 h-16 bg-surface-container-lowest dark:bg-[#12131a]",
        "border-b border-outline-variant shadow-topbar z-40",
        "flex items-center justify-between px-lg transition-all duration-200"
      )}
      style={{ width: `calc(100% - ${sidebarWidth}px)`, left: sidebarWidth }}
    >
      {/* Left section - Search */}
      <div className="flex-1">
        <div className="max-w-md flex items-center gap-sm px-md py-sm bg-surface-container-low dark:bg-[#1e1f2a] rounded-lg border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant dark:text-[#8e90a2] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Rechercher..."
            className="flex-1 bg-transparent text-body-sm text-on-surface dark:text-[#e4e4ef] placeholder-on-surface-variant dark:placeholder-[#8e90a2] outline-none"
          />
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-md ml-xl">
        {/* Notifications */}
        <button
          onClick={() => navigate("/notifications")}
          className={clsx(
            "relative p-sm rounded-lg transition-colors duration-150",
            "hover:bg-surface-container-low dark:hover:bg-[#1e1f2a]",
            "text-on-surface-variant dark:text-[#8e90a2]"
          )}
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute w-2 h-2 bg-error rounded-full -top-1 -right-1"></span>
        </button>

        {/* Theme Toggle */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={clsx(
              "p-sm rounded-lg transition-colors duration-150",
              "hover:bg-surface-container-low dark:hover:bg-[#1e1f2a]",
              "text-on-surface-variant dark:text-[#8e90a2]"
            )}
            title="Thème"
          >
            <span className="material-symbols-outlined text-[20px]">
              {resolvedTheme === "dark" ? "dark_mode" : "light_mode"}
            </span>
          </button>

          {showThemeMenu && (
            <div className={clsx(
              "absolute top-full right-0 mt-xs bg-surface-container-lowest dark:bg-[#1e1f2a]",
              "border border-outline-variant rounded-lg shadow-card z-50 w-40 py-sm"
            )}>
              {[
                { id: "light", label: "☀️ Clair", icon: "light_mode" },
                { id: "dark", label: "🌙 Sombre", icon: "dark_mode" },
                { id: "system", label: "💻 Système", icon: "brightness_auto" },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={clsx(
                    "w-full text-left px-md py-xs flex items-center gap-sm transition-colors duration-150",
                    mode === theme.id
                      ? "bg-primary-fixed dark:bg-[#0040a2] text-primary dark:text-[#b2c5ff]"
                      : "text-on-surface dark:text-[#e4e4ef] hover:bg-surface-container-low dark:hover:bg-[#282a36]"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">{theme.icon}</span>
                  <span className="text-body-sm">{theme.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-variant"></div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={clsx(
              "flex items-center gap-sm px-sm py-xs rounded-lg transition-colors duration-150",
              "hover:bg-surface-container-low dark:hover:bg-[#1e1f2a]"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-label-md font-bold">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="text-left">
              <p className="text-label-md text-on-surface dark:text-[#e4e4ef] font-semibold">
                {user?.name?.split(" ")[0] || "Admin"}
              </p>
              <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">
                {user?.role || "Administrateur"}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className={clsx(
              "absolute top-full right-0 mt-xs bg-surface-container-lowest dark:bg-[#1e1f2a]",
              "border border-outline-variant rounded-lg shadow-card z-50 w-52 py-sm"
            )}>
              <button
                onClick={() => {
                  navigate("/parametres");
                  setShowProfileMenu(false);
                }}
                className={clsx(
                  "w-full text-left px-md py-xs flex items-center gap-sm transition-colors duration-150",
                  "text-on-surface dark:text-[#e4e4ef] hover:bg-surface-container-low dark:hover:bg-[#282a36]"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
                <span className="text-body-sm">Mon profil</span>
              </button>
              <button
                onClick={() => {
                  navigate("/parametres");
                  setShowProfileMenu(false);
                }}
                className={clsx(
                  "w-full text-left px-md py-xs flex items-center gap-sm transition-colors duration-150",
                  "text-on-surface dark:text-[#e4e4ef] hover:bg-surface-container-low dark:hover:bg-[#282a36]"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                <span className="text-body-sm">Paramètres</span>
              </button>
              <hr className="my-xs border-outline-variant" />
              <button
                onClick={handleLogout}
                className={clsx(
                  "w-full text-left px-md py-xs flex items-center gap-sm transition-colors duration-150",
                  "text-error hover:bg-error-container dark:hover:bg-[#282a36]"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="text-body-sm">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
