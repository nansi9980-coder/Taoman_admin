import { createContext, useContext, useState } from "react";
import { apiFetch } from "../utils/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "taoman-admin-session";

const ROLE_PERMISSIONS = {
  admin: ["clients", "devis", "content", "settings", "logs", "reports"],
  manager: ["clients", "devis", "content", "reports"],
};

function normalizePermissions(role) {
  if (!role) return [];
  const key = String(role).toLowerCase();
  return ROLE_PERMISSIONS[key] || ROLE_PERMISSIONS.admin;
}


export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const saveSession = (data) => {
    const user = {
      ...data.user,
      permissions: normalizePermissions(data.user?.role),
    };
    const nextSession = { token: data.access_token, user };
    setSession(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      saveSession(data);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: error.message || "Erreur de connexion." };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasPermission = (permission) => {
    return session?.user?.permissions?.includes(permission) ?? false;
  };

  const updateProfile = (updates) => {
    const nextUser = { ...session?.user, ...updates };
    const nextSession = { ...session, user: nextUser };
    setSession(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        token: session?.token || null,
        loading,
        login,
        logout,
        hasPermission,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}