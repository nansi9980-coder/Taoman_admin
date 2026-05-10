import { useState, useEffect } from "react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";

const actionConfig = {
  login: { label: "Connexion", icon: "login", color: "text-secondary" },
  logout: { label: "Déconnexion", icon: "logout", color: "text-on-surface-variant" },
  modify: { label: "Modification", icon: "edit", color: "text-primary" },
  delete: { label: "Suppression", icon: "delete", color: "text-error" },
  create: { label: "Création", icon: "add", color: "text-secondary" },
  export: { label: "Export", icon: "download", color: "text-primary" },
  backup: { label: "Sauvegarde", icon: "backup", color: "text-secondary" },
  maintenance: { label: "Maintenance", icon: "settings", color: "text-tertiary" },
  access_denied: { label: "Accès refusé", icon: "block", color: "text-error" },
};

const statusConfig = {
  success: { label: "Succès", icon: "check_circle", bgColor: "bg-secondary/20", textColor: "text-secondary" },
  warning: { label: "Attention", icon: "warning", bgColor: "bg-tertiary/20", textColor: "text-tertiary" },
  error: { label: "Erreur", icon: "error", bgColor: "bg-error/20", textColor: "text-error" },
};

export default function Logs() {
  const { fetchLogs } = useApp();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");

  useEffect(() => {
    fetchLogs().then((data) => {
      if (Array.isArray(data) && data.length) {
        setLogs(data.map((log) => ({
          id: log.id ?? log._id,
          timestamp: log.timestamp || log.createdAt || "unknown",
          user: log.user || log.username || log.actor || "Utilisateur inconnu",
          action: log.action || "modify",
          resource: log.resource || log.target || "Ressource inconnue",
          status: log.status || "success",
          ip: log.ip || log.address || "—",
          details: log.details || log.message || "Aucune information disponible",
        })));
      }
    });
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filter === "tous" || log.action === filter;
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "tous" || log.status === statusFilter;
    const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);
    return matchesAction && matchesSearch && matchesStatus && matchesDate;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const successCount = logs.filter((l) => l.status === "success").length;
  const warningCount = logs.filter((l) => l.status === "warning").length;
  const errorCount = logs.filter((l) => l.status === "error").length;

  return (
    <div className="space-y-lg p-lg">
      {/* Header */}
      <div>
        <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Journaux d'Activité</h1>
        <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
          Consultez et analysez les événements du système
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-md">
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Total</p>
          <p className="text-headline-md text-on-surface dark:text-[#e4e4ef] font-bold mt-xs">{logs.length}</p>
        </div>
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Succès</p>
          <p className="text-headline-md text-secondary font-bold mt-xs">{successCount}</p>
        </div>
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Attention</p>
          <p className="text-headline-md text-tertiary font-bold mt-xs">{warningCount}</p>
        </div>
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Erreurs</p>
          <p className="text-headline-md text-error font-bold mt-xs">{errorCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-md">
        <div className="flex items-center gap-md flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-xs">
            <input
              type="text"
              placeholder="Chercher par utilisateur ou ressource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={clsx(
                "w-full px-md py-sm rounded-lg border border-outline-variant",
                "bg-surface-container-low dark:bg-[#1e1f2a] text-on-surface dark:text-[#e4e4ef]",
                "focus:outline-none focus:border-primary"
              )}
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={clsx(
              "px-md py-sm rounded-lg border border-outline-variant text-label-sm",
              "bg-surface-container-low dark:bg-[#1e1f2a] text-on-surface dark:text-[#e4e4ef]",
              "focus:outline-none focus:border-primary"
            )}
          />
        </div>

        <div className="flex gap-sm flex-wrap overflow-x-auto pb-2">
          {/* Status Filters */}
          <div className="flex gap-sm flex-shrink-0">
            {[
              { value: "tous", label: "Tous les statuts" },
              { value: "success", label: "Succès" },
              { value: "warning", label: "Attention" },
              { value: "error", label: "Erreurs" },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={clsx(
                  "px-md py-sm rounded-lg font-label-md transition-colors duration-150 whitespace-nowrap",
                  statusFilter === s.value
                    ? "bg-primary text-white dark:bg-[#b2c5ff] dark:text-primary"
                    : "bg-surface-container-low dark:bg-[#1e1f2a] text-on-surface dark:text-[#e4e4ef] hover:bg-surface-container-high"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Action Filters */}
          <div className="w-px h-6 bg-outline-variant"></div>
          <div className="flex gap-sm flex-shrink-0">
            {[
              { value: "tous", label: "Toutes les actions" },
              { value: "login", label: "Connexions" },
              { value: "modify", label: "Modifications" },
              { value: "delete", label: "Suppressions" },
            ].map((a) => (
              <button
                key={a.value}
                onClick={() => setFilter(a.value)}
                className={clsx(
                  "px-md py-sm rounded-lg font-label-md transition-colors duration-150 whitespace-nowrap",
                  filter === a.value
                    ? "bg-primary text-white dark:bg-[#b2c5ff] dark:text-primary"
                    : "bg-surface-container-low dark:bg-[#1e1f2a] text-on-surface dark:text-[#e4e4ef] hover:bg-surface-container-high"
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-md">
        {sortedLogs.map((log) => (
          <div
            key={log.id}
            className={clsx(
              "rounded-lg border border-outline-variant transition-all duration-150 cursor-pointer",
              expandedId === log.id
                ? "bg-surface-container-low dark:bg-[#282a36] border-primary"
                : "bg-surface-container-lowest dark:bg-[#1e1f2a] hover:bg-surface-container-low dark:hover:bg-[#282a36]"
            )}
            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
          >
            <div className="p-md">
              <div className="flex items-start justify-between gap-md">
                <div className="flex items-start gap-md flex-1 min-w-0">
                  {/* Status Badge */}
                  <div className={clsx(
                    "p-xs rounded-lg shrink-0",
                    statusConfig[log.status].bgColor
                  )}>
                    <span className={clsx(
                      "material-symbols-outlined text-[18px]",
                      statusConfig[log.status].textColor
                    )}>
                      {statusConfig[log.status].icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-sm flex-wrap">
                      <span className={clsx(
                        "material-symbols-outlined text-[18px]",
                        actionConfig[log.action].color
                      )}>
                        {actionConfig[log.action].icon}
                      </span>
                      <h3 className="text-body-md font-semibold text-on-surface dark:text-[#e4e4ef]">
                        {actionConfig[log.action].label}
                      </h3>
                      <span className="text-label-sm px-sm py-xs rounded bg-surface-container-high dark:bg-[#282a36] text-on-surface-variant dark:text-[#8e90a2]">
                        {log.resource}
                      </span>
                    </div>
                    <div className="flex items-center gap-md flex-wrap mt-xs text-label-sm text-on-surface-variant dark:text-[#8e90a2]">
                      <span>👤 {log.user}</span>
                      <span>🕐 {log.timestamp}</span>
                      <span>🔗 {log.ip}</span>
                    </div>
                  </div>
                </div>

                {/* Expand Icon */}
                <span className="material-symbols-outlined text-on-surface-variant dark:text-[#8e90a2] shrink-0 transition-transform duration-200" style={{
                  transform: expandedId === log.id ? "rotate(180deg)" : "rotate(0deg)"
                }}>
                  expand_more
                </span>
              </div>

              {/* Details */}
              {expandedId === log.id && (
                <div className="mt-md pt-md border-t border-outline-variant">
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Utilisateur</p>
                      <p className="text-body-sm text-on-surface dark:text-[#e4e4ef] font-semibold mt-xs">{log.user}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Ressource</p>
                      <p className="text-body-sm text-on-surface dark:text-[#e4e4ef] font-semibold mt-xs">{log.resource}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Adresse IP</p>
                      <p className="text-body-sm text-on-surface dark:text-[#e4e4ef] font-semibold mt-xs">{log.ip}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Timestamp</p>
                      <p className="text-body-sm text-on-surface dark:text-[#e4e4ef] font-semibold mt-xs">{log.timestamp}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Détails</p>
                      <p className="text-body-sm text-on-surface dark:text-[#e4e4ef] mt-xs">{log.details}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sortedLogs.length === 0 && (
        <div className="text-center py-xl">
          <span className="material-symbols-outlined text-[48px] text-outline-variant opacity-50 block mb-md">
            history
          </span>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2]">
            Aucun journal trouvé
          </p>
        </div>
      )}
    </div>
  );
}
