import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Parametres() {
  const { mode, setTheme, activePalette, fetchActiveTheme } = useTheme();
  const [themes, setThemes] = useState([]);
  
  useEffect(() => {
    fetch("http://localhost:3000/theme")
      .then(res => res.json())
      .then(setThemes)
      .catch(console.error);
  }, []);

  const handleSetTheme = async (id) => {
    try {
      await fetch(`http://localhost:3000/theme/active/${id}`, { method: "PUT" });
      await fetchActiveTheme();
    } catch (e) {
      console.error(e);
    }
  };

  const handleInitThemes = async () => {
    try {
      await fetch(`http://localhost:3000/theme/init`, { method: "POST" });
      const res = await fetch("http://localhost:3000/theme");
      setThemes(await res.json());
      await fetchActiveTheme();
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-lg animate-fadeIn">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Configuration de l'application et gestion des thèmes.</p>
      </div>
      
      <div className="card max-w-3xl">
        <h3 className="font-headline-md text-headline-md mb-md">Palettes de couleurs</h3>
        <p className="text-body-md text-on-surface-variant mb-lg">
          Choisissez un thème pour modifier instantanément l'apparence de l'interface administrateur et du site client.
        </p>
        
        {themes.length === 0 ? (
          <button onClick={handleInitThemes} className="btn-primary">
            Initialiser les thèmes par défaut
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {themes.map(t => (
              <div 
                key={t.id} 
                onClick={() => handleSetTheme(t.id)}
                className={`p-md rounded-xl border-2 cursor-pointer transition-all ${
                  activePalette?.id === t.id 
                    ? "border-primary bg-primary/10" 
                    : "border-outline-variant hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-center mb-sm">
                  <h4 className="font-semibold text-on-surface">{t.name}</h4>
                  {activePalette?.id === t.id && (
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
                <div className="flex gap-xs">
                  <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: t.primary }} title="Primary" />
                  <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: t.secondary }} title="Secondary" />
                  <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: t.surface }} title="Surface" />
                  <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: t.background }} title="Background" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}