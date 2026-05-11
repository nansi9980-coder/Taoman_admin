import { useState, useEffect } from "react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const BACKUP_SCHEDULE = {
  full: { day: "Dimanche", time: "02:00", frequency: "Hebdomadaire" },
  incremental: { day: "Tous les jours", time: "03:00", frequency: "Quotidienne" },
};

const statusConfig = {
  success: { label: "Succès", icon: "check_circle", color: "bg-secondary" },
  Complété: { label: "Complété", icon: "check_circle", color: "bg-secondary" },
  error: { label: "Échec", icon: "error", color: "bg-error" },
  running: { label: "En cours", icon: "autorenew", color: "bg-primary" },
};

function normalizeStatus(status) {
  if (!status) return "success";
  if (statusConfig[status]) return status;
  const lower = status.toLowerCase();
  if (lower.includes("complet") || lower.includes("success")) return "success";
  if (lower.includes("err") || lower.includes("fail") || lower.includes("refus")) return "error";
  if (lower.includes("cours") || lower.includes("running")) return "running";
  return "success";
}

function mapBackup(backup) {
  return {
    id: backup.id ?? backup._id,
    name: backup.name || backup.title || "Sauvegarde",
    size: typeof backup.size === "number" ? backup.size : parseFloat(backup.size) || 0,
    type: backup.type || "complete",
    date: backup.date || backup.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
    time: backup.time || backup.createdAt?.split("T")[1]?.split(".")[0] || new Date().toLocaleTimeString("fr-FR"),
    status: normalizeStatus(backup.status),
    duration: backup.duration || "—",
  };
}

export default function Backup() {
  const { fetchBackups } = useApp();
  const { token } = useAuth();
  const [backups, setBackups] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchBackups().then((data) => {
      if (Array.isArray(data) && data.length) {
        setBackups(data.map(mapBackup));
      }
    });
  }, [token, fetchBackups]);

  const totalBackupSize = backups.reduce((sum, b) => sum + (typeof b.size === "number" ? b.size : parseFloat(b.size) || 0), 0);
  const successCount = backups.filter((b) => b.status === "success" || b.status === "Complété").length;

  const handleBackupNow = async () => {
    setIsRunning(true);
    try {
      await apiFetch("/backups", { method: "POST", token });
      const data = await fetchBackups();
      if (Array.isArray(data) && data.length) {
        setBackups(data.map(mapBackup));
      }
    } catch (err) {
      alert("Erreur lors de la sauvegarde: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRestore = (backup) => {
    if (confirm(`Êtes-vous sûr de vouloir restaurer ${backup.name}?`)) {
      console.log("Restoring backup:", backup.id);
    }
  };

  const handleDelete = async (backup) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${backup.name}?`)) return;
    try {
      await apiFetch(`/backups/${backup.id}`, { method: "DELETE", token });
      setBackups((prev) => prev.filter((b) => b.id !== backup.id));
      if (selectedBackup?.id === backup.id) setSelectedBackup(null);
    } catch (err) {
      alert("Erreur suppression: " + err.message);
    }
  };

  return (
    <div className="space-y-lg p-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Sauvegardes & Restauration</h1>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
            Gérez vos sauvegardes et effectuez des restaurations
          </p>
        </div>
        <button
          onClick={handleBackupNow}
          disabled={isRunning}
          className={clsx(
            "px-lg py-sm rounded-lg font-label-md transition-colors duration-150 flex items-center gap-sm",
            isRunning
              ? "bg-surface-container-low dark:bg-[#282a36] text-on-surface-variant dark:text-[#8e90a2] cursor-not-allowed opacity-50"
              : "bg-primary text-on-primary dark:bg-[#b2c5ff] dark:text-primary hover:bg-primary-container"
          )}
        >
          {isRunning ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">backup</span>
              Sauvegarder maintenant
            </>
          )}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Total Sauvegardes</p>
          <p className="text-headline-md text-on-surface dark:text-[#e4e4ef] font-bold mt-xs">{backups.length}</p>
        </div>
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Succès</p>
          <p className="text-headline-md text-secondary font-bold mt-xs">{successCount}</p>
        </div>
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Taille Totale</p>
          <p className="text-headline-md text-on-surface dark:text-[#e4e4ef] font-bold mt-xs">
            {totalBackupSize.toFixed(1)} MB
          </p>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] p-md">
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-headline-md font-semibold text-on-surface dark:text-[#e4e4ef]">
            Calendrier de Sauvegarde
          </h2>
          <button
            onClick={() => setShowScheduleEditor(!showScheduleEditor)}
            className={clsx(
              "px-md py-sm rounded-lg font-label-md transition-colors duration-150",
              "bg-surface-container-high dark:bg-[#282a36] text-on-surface dark:text-[#e4e4ef]",
              "hover:bg-surface-container-highest dark:hover:bg-[#3a3d4a]"
            )}
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>

        {!showScheduleEditor ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {[
              { key: "full", label: "Sauvegardes Complètes", ...BACKUP_SCHEDULE.full },
              { key: "incremental", label: "Sauvegardes Incrémentales", ...BACKUP_SCHEDULE.incremental },
            ].map((schedule) => (
              <div key={schedule.key} className="p-md rounded-lg bg-surface-container-low dark:bg-[#282a36] border border-outline-variant">
                <h3 className="text-body-md font-semibold text-on-surface dark:text-[#e4e4ef] mb-xs">
                  {schedule.label}
                </h3>
                <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2] mb-xs">
                  📅 {schedule.day} à {schedule.time}
                </p>
                <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">
                  ⏱️ {schedule.frequency}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-md p-md bg-surface-container-low dark:bg-[#282a36] rounded-lg border border-outline-variant">
            <p className="text-body-md text-on-surface dark:text-[#e4e4ef]">
              Éditeur de calendrier (en développement)
            </p>
          </div>
        )}
      </div>

      {/* Backups List */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] overflow-hidden">
        <div className="p-md border-b border-outline-variant">
          <h2 className="text-headline-md font-semibold text-on-surface dark:text-[#e4e4ef]">
            Historique des Sauvegardes
          </h2>
        </div>

        <div className="divide-y divide-outline-variant max-h-96 overflow-y-auto">
          {backups.length === 0 && (
            <div className="p-lg text-center text-on-surface-variant dark:text-[#8e90a2]">
              Aucune sauvegarde disponible.
            </div>
          )}
          {backups.map((backup) => {
            const cfg = statusConfig[backup.status] || statusConfig.success;
            return (
              <div
                key={backup.id}
                className={clsx(
                  "p-md hover:bg-surface-container-low dark:hover:bg-[#282a36] transition-colors duration-150 cursor-pointer",
                  selectedBackup?.id === backup.id ? "bg-primary-fixed dark:bg-[#001848]/30" : ""
                )}
                onClick={() => setSelectedBackup(backup)}
              >
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-xs">
                      <span className={clsx(
                        "material-symbols-outlined text-white p-xs rounded text-[18px]",
                        cfg.color
                      )}>
                        {cfg.icon}
                      </span>
                      <h3 className="text-body-md font-semibold text-on-surface dark:text-[#e4e4ef]">
                        {backup.name}
                      </h3>
                      <span className="text-label-sm px-sm py-xs rounded-full bg-surface-container-low dark:bg-[#282a36] text-on-surface-variant dark:text-[#8e90a2]">
                        {backup.type === "complete" ? "Complète" : "Incrémentale"}
                      </span>
                    </div>
                    <div className="flex items-center gap-md flex-wrap text-label-sm text-on-surface-variant dark:text-[#8e90a2]">
                      <span>📅 {backup.date} {backup.time}</span>
                      <span>💾 {backup.size.toFixed ? backup.size.toFixed(1) : backup.size} MB</span>
                      <span>⏱️ {backup.duration}</span>
                      <span className={clsx(
                        "font-semibold",
                        cfg.color === "bg-secondary" ? "text-secondary"
                          : cfg.color === "bg-error" ? "text-error"
                          : "text-primary"
                      )}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-sm" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleRestore(backup)}
                      disabled={backup.status !== "success" && backup.status !== "Complété"}
                      className={clsx(
                        "px-md py-sm rounded-lg font-label-md transition-colors duration-150",
                        (backup.status === "success" || backup.status === "Complété")
                          ? "bg-secondary text-white hover:bg-secondary-container dark:bg-[#abcae8] dark:text-secondary dark:hover:bg-[#c1e0ff]"
                          : "bg-surface-container-high dark:bg-[#282a36] text-on-surface-variant dark:text-[#8e90a2] opacity-50 cursor-not-allowed"
                      )}
                    >
                      Restaurer
                    </button>
                    <button
                      onClick={() => handleDelete(backup)}
                      className="px-md py-sm rounded-lg font-label-md transition-colors duration-150 bg-error/20 text-error hover:bg-error/30"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Info */}
      {selectedBackup && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] p-md">
          <h3 className="text-headline-md font-semibold text-on-surface dark:text-[#e4e4ef] mb-md">
            Détails de la Sauvegarde
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
            <div>
              <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Nom</p>
              <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef] mt-xs">
                {selectedBackup.name}
              </p>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Type</p>
              <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef] mt-xs">
                {selectedBackup.type === "complete" ? "Complète" : "Incrémentale"}
              </p>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Taille</p>
              <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef] mt-xs">
                {selectedBackup.size.toFixed ? selectedBackup.size.toFixed(1) : selectedBackup.size} MB
              </p>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Durée</p>
              <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef] mt-xs">
                {selectedBackup.duration}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}