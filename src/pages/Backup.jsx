import { useState, useEffect } from "react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";

const BACKUPS = [
  { id: 1, name: "Sauvegarde Complète 2026-05-09", size: 5.2, type: "complete", date: "2026-05-09", time: "23:00", status: "success", duration: "45 min" },
  { id: 2, name: "Sauvegarde Incrémentale 2026-05-08", size: 0.8, type: "incremental", date: "2026-05-08", time: "23:00", status: "success", duration: "8 min" },
  { id: 3, name: "Sauvegarde Incrémentale 2026-05-07", size: 0.6, type: "incremental", date: "2026-05-07", time: "23:00", status: "success", duration: "6 min" },
  { id: 4, name: "Sauvegarde Complète 2026-05-02", size: 5.1, type: "complete", date: "2026-05-02", time: "23:00", status: "success", duration: "44 min" },
  { id: 5, name: "Sauvegarde Complète 2026-04-25", size: 4.9, type: "complete", date: "2026-04-25", time: "23:00", status: "failed", duration: "N/A" },
];

const BACKUP_SCHEDULE = {
  full: { day: "Vendredi", time: "23:00", frequency: "Hebdomadaire" },
  incremental: { day: "Quotidien", time: "23:00", frequency: "Tous les jours" },
};

const statusConfig = {
  success: { label: "Succès", color: "bg-secondary", icon: "check_circle" },
  failed: { label: "Échoué", color: "bg-error", icon: "error" },
  running: { label: "En cours", color: "bg-primary", icon: "hourglass_bottom" },
};

export default function Backup() {
  const { fetchBackups } = useApp();
  const [backups, setBackups] = useState(BACKUPS);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);

  useEffect(() => {
    fetchBackups().then((data) => {
      if (Array.isArray(data) && data.length) {
        setBackups(data.map((backup) => ({
          id: backup.id ?? backup._id,
          name: backup.name || backup.title || "Sauvegarde",
          size: typeof backup.size === "number" ? backup.size : parseFloat(backup.size) || 0,
          type: backup.type || "complete",
          date: backup.date || backup.createdAt || new Date().toISOString().split("T")[0],
          time: backup.time || backup.createdAt?.split("T")[1]?.split(".")[0] || new Date().toLocaleTimeString("fr-FR"),
          status: backup.status || "success",
          duration: backup.duration || "—",
        })));
      }
    });
  }, [fetchBackups]);

  const totalBackupSize = backups.reduce((sum, b) => sum + (typeof b.size === "number" ? b.size : parseFloat(b.size) || 0), 0);
  const successCount = backups.filter((b) => b.status === "success").length;

  const handleBackupNow = async () => {
    setIsRunning(true);
    // Simulate backup
    await new Promise((r) => setTimeout(r, 2000));
    setIsRunning(false);
    // Add new backup
    const newBackup = {
      id: Math.max(...backups.map((b) => b.id)) + 1,
      name: `Sauvegarde Manuelle ${new Date().toISOString().split("T")[0]}`,
      size: Math.random() * 5,
      type: "complete",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("fr-FR"),
      status: "success",
      duration: "42 min",
    };
    setBackups((prev) => [newBackup, ...prev]);
  };

  const handleRestore = (backup) => {
    if (confirm(`Êtes-vous sûr de vouloir restaurer ${backup.name}?`)) {
      console.log("Restoring backup:", backup.id);
    }
  };

  const handleDelete = (backup) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${backup.name}?`)) {
      setBackups((prev) => prev.filter((b) => b.id !== backup.id));
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
            {totalBackupSize.toFixed(1)} GB
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
          {backups.map((backup) => (
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
                      statusConfig[backup.status].color
                    )}>
                      {statusConfig[backup.status].icon}
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
                    <span>💾 {backup.size.toFixed(1)} GB</span>
                    <span>⏱️ {backup.duration}</span>
                    <span className={clsx(
                      "font-semibold",
                      statusConfig[backup.status].color === "bg-secondary"
                        ? "text-secondary"
                        : statusConfig[backup.status].color === "bg-error"
                        ? "text-error"
                        : "text-primary"
                    )}>
                      {statusConfig[backup.status].label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-sm">
                  <button
                    onClick={() => handleRestore(backup)}
                    disabled={backup.status !== "success"}
                    className={clsx(
                      "px-md py-sm rounded-lg font-label-md transition-colors duration-150",
                      backup.status === "success"
                        ? "bg-secondary text-white hover:bg-secondary-container dark:bg-[#abcae8] dark:text-secondary dark:hover:bg-[#c1e0ff]"
                        : "bg-surface-container-high dark:bg-[#282a36] text-on-surface-variant dark:text-[#8e90a2] opacity-50 cursor-not-allowed"
                    )}
                  >
                    Restaurer
                  </button>
                  <button
                    onClick={() => handleDelete(backup)}
                    className={clsx(
                      "px-md py-sm rounded-lg font-label-md transition-colors duration-150",
                      "bg-error/20 text-error hover:bg-error/30"
                    )}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                {selectedBackup.size.toFixed(1)} GB
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
