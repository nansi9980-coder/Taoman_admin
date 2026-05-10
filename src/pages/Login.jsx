import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

export default function Login() {
  const { login, loading } = useAuth();
  const { mode, setTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Erreur de connexion.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const cycleTheme = () => {
    const next = { light: "dark", dark: "system", system: "light" };
    setTheme(next[mode] || "light");
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#12131a] flex items-center justify-center p-md relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-fixed/30 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary-container/40 dark:bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Theme toggle – top right */}
      <button
        onClick={cycleTheme}
        className="absolute top-md right-md p-sm rounded-lg text-outline hover:text-primary hover:bg-surface-container-low dark:hover:bg-[#1e1f2a] transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">
          {mode === "dark" ? "dark_mode" : mode === "system" ? "settings_brightness" : "light_mode"}
        </span>
      </button>

      {/* Card */}
      <div
        className={clsx(
          "relative w-full max-w-md bg-surface-container-lowest dark:bg-[#1e1f2a]",
          "border border-outline-variant dark:border-[#2e3040] rounded-2xl shadow-card-hover p-xl",
          "animate-fadeIn",
          shake && "animate-[shake_0.4s_ease-in-out]"
        )}
        style={shake ? { animation: "shake 0.4s ease-in-out" } : {}}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-20 h-20 mb-md">
            <img src="/logo.png" alt="Taoman Groupe" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-headline-md font-headline-md text-primary dark:text-[#b2c5ff]">
            Taoman Groupe
          </h1>
          <p className="text-body-sm text-outline mt-xs">Administration — Connexion sécurisée</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-md">
          {/* Email */}
          <div>
            <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">
              Adresse email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
                email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@taoman-groupe.com"
                autoComplete="email"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-xs">
              <label className="text-label-md text-on-surface-variant dark:text-[#8e90a2]">
                Mot de passe
              </label>
              <button
                type="button"
                className="text-label-sm text-primary dark:text-[#b2c5ff] hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
                lock
              </span>
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-field pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPw ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-xs p-sm bg-error-container/30 border border-error/30 rounded-lg animate-fadeIn">
              <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
              <p className="text-label-sm text-error">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-md mt-sm text-body-sm"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Connexion en cours…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  login
                </span>
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Demo hint */}
        <div className="mt-lg pt-lg border-t border-outline-variant dark:border-[#2e3040]">
          <p className="text-label-sm text-outline text-center mb-sm">Accès démo</p>
          <div className="bg-surface-container-low dark:bg-[#191a24] rounded-lg p-sm text-center">
            <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2] font-mono">
              admin@taoman-groupe.com
            </p>
            <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2] font-mono">
              admin123
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ email: "admin@taoman-groupe.com", password: "admin123" })}
            className="w-full mt-sm text-label-sm text-primary dark:text-[#b2c5ff] hover:underline"
          >
            Remplir automatiquement
          </button>
        </div>
      </div>

      {/* Shake keyframe via style tag */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}