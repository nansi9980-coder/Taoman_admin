import { createContext, useContext, useEffect, useState } from "react";
import { buildUrl } from "../utils/api";

// Modes: "light" | "dark" | "system"
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("taoman-theme") || "light");
  const [resolvedTheme, setResolvedTheme] = useState("light");

  // Resolve "system" mode based on OS preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolve = () => {
      if (mode === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");
      } else {
        setResolvedTheme(mode);
      }
    };

    resolve();
    mediaQuery.addEventListener("change", resolve);
    return () => mediaQuery.removeEventListener("change", resolve);
  }, [mode]);

  // Apply class to <html> and custom color palette
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const [activePalette, setActivePalette] = useState(null);

  const fetchActiveTheme = async () => {
    try {
      const res = await fetch(buildUrl("/theme/active"));
      const theme = await res.json();
      if (theme) {
        setActivePalette(theme);
        const root = document.documentElement;
        // Simple hex injection. Note: if Tailwind needs rgb variables, we would convert hex to rgb here.
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-secondary', theme.secondary);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  const setTheme = (newMode) => {
    setMode(newMode);
    localStorage.setItem("taoman-theme", newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setTheme, activePalette, fetchActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}