import { useState, useEffect } from "react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const REPORTS_DATA = [
  { id: 1, name: "Rapport Financier Q1 2026", type: "financier", date: "2026-04-30", size: "2.4 MB", status: "disponible", format: "PDF" },
  { id: 2, name: "Analyse Clients Avril 2026", type: "clients", date: "2026-05-01", size: "1.8 MB", status: "disponible", format: "Excel" },
  { id: 3, name: "Performance Devis Mars 2026", type: "devis", date: "2026-04-01", size: "0.9 MB", status: "disponible", format: "PDF" },
  { id: 4, name: "Statistiques Utilisation Avril", type: "utilisation", date: "2026-05-01", size: "3.2 MB", status: "en_generation", format: "PDF" },
  { id: 5, name: "Audit Annuel 2025", type: "audit", date: "2026-03-15", size: "5.1 MB", status: "disponible", format: "PDF" },
  { id: 6, name: "Plan Stratégique 2026-2028", type: "strategique", date: "2026-01-15", size: "4.5 MB", status: "disponible", format: "PowerPoint" },
];

const reportTypeConfig = {
  financier: { label: "Financier", icon: "attach_money", color: "bg-secondary" },
  clients: { label: "Clients", icon: "group", color: "bg-primary" },
  devis: { label: "Devis", icon: "description", color: "bg-tertiary" },
  utilisation: { label: "Utilisation", icon: "bar_chart", color: "bg-primary-fixed" },
  audit: { label: "Audit", icon: "verified_user", color: "bg-secondary-container" },
  strategique: { label: "Stratégique", icon: "trending_up", color: "bg-error" },
};

const statusConfig = {
  disponible: { label: "Disponible", color: "text-secondary", icon: "check_circle" },
  en_generation: { label: "En génération", color: "text-primary", icon: "hourglass_bottom" },
  archivé: { label: "Archivé", color: "text-on-surface-variant", icon: "archive" },
};

export default function Rapports() {
  const { reports, fetchReports } = useApp();
  const [localReports, setLocalReports] = useState(REPORTS_DATA);
  const [selectedType, setSelectedType] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchReports().then((data) => {
      if (Array.isArray(data) && data.length) {
        setLocalReports(data.map((report) => ({
          id: report.id ?? report._id,
          name: report.name || report.title || report.filename || "Rapport",
          type: report.type || report.category || "financier",
          date: report.date || report.createdAt || report.updatedAt || new Date().toISOString(),
          size: typeof report.size === "number" ? `${report.size.toFixed(1)} MB` : report.size || "—",
          status: report.status || "disponible",
          format: report.format || "PDF",
        })));
      }
    });
  }, [fetchReports]);

  const reportsData = (reports.length ? reports : localReports).map((report) => ({
    id: report.id ?? report._id,
    name: report.name || report.title || report.filename || "Rapport",
    type: report.type || report.category || "financier",
    date: report.date || report.createdAt || report.updatedAt || new Date().toISOString(),
    size: typeof report.size === "number" ? `${report.size.toFixed(1)} MB` : report.size || "—",
    status: report.status || "disponible",
    format: report.format || "PDF",
  }));

  const filteredReports = reportsData.filter((report) => {
    const matchesType = selectedType === "tous" || report.type === selectedType;
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.date) - new Date(a.date);
    if (sortBy === "nom") return a.name.localeCompare(b.name);
    if (sortBy === "taille") return parseFloat(b.size) - parseFloat(a.size);
    return 0;
  });

  const handleDownload = (report) => {
    console.log(`Téléchargement: ${report.name}`);
  };

  const handlePreview = (report) => {
    console.log(`Aperçu: ${report.name}`);
  };

  const handleDelete = (reportId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce rapport?")) {
      setLocalReports((prev) => prev.filter((r) => r.id !== reportId));
    }
  };

  return (
    <div className="space-y-lg p-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Rapports</h1>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
            Téléchargez et consultez vos rapports détaillés
          </p>
        </div>
        <button className={clsx(
          "px-lg py-sm rounded-lg font-label-md transition-colors duration-150 flex items-center gap-sm",
          "bg-primary text-on-primary dark:bg-[#b2c5ff] dark:text-primary hover:bg-primary-container"
        )}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          Générer Rapport
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-md">
        {/* Search and Sort */}
        <div className="flex items-center gap-md flex-wrap">
          <div className="flex-1 min-w-xs">
            <input
              type="text"
              placeholder="Chercher un rapport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={clsx(
                "w-full px-md py-sm rounded-lg border border-outline-variant",
                "bg-surface-container-low dark:bg-[#1e1f2a] text-on-surface dark:text-[#e4e4ef]",
                "focus:outline-none focus:border-primary"
              )}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={clsx(
              "px-md py-sm rounded-lg border border-outline-variant text-label-sm",
              "bg-surface-container-low dark:bg-[#1e1f2a] text-on-surface dark:text-[#e4e4ef]",
              "focus:outline-none focus:border-primary"
            )}
          >
            <option value="recent">Plus récent</option>
            <option value="nom">Par nom</option>
            <option value="taille">Par taille</option>
          </select>
        </div>

        {/* Type Filters */}
        <div className="flex gap-sm flex-wrap">
          {[
            { value: "tous", label: "Tous les rapports" },
            ...Object.entries(reportTypeConfig).map(([key, config]) => ({
              value: key,
              label: config.label,
            })),
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedType(filter.value)}
              className={clsx(
                "px-md py-sm rounded-lg font-label-md transition-colors duration-150",
                selectedType === filter.value
                  ? "bg-primary text-white dark:bg-[#b2c5ff] dark:text-primary"
                  : "bg-surface-container-low dark:bg-[#1e1f2a] text-on-surface dark:text-[#e4e4ef] hover:bg-surface-container-high"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low dark:bg-[#282a36]">
                <th className="text-left px-lg py-md font-semibold text-label-md text-on-surface dark:text-[#e4e4ef]">Nom</th>
                <th className="text-left px-lg py-md font-semibold text-label-md text-on-surface dark:text-[#e4e4ef]">Type</th>
                <th className="text-left px-lg py-md font-semibold text-label-md text-on-surface dark:text-[#e4e4ef]">Date</th>
                <th className="text-left px-lg py-md font-semibold text-label-md text-on-surface dark:text-[#e4e4ef]">Taille</th>
                <th className="text-left px-lg py-md font-semibold text-label-md text-on-surface dark:text-[#e4e4ef]">Statut</th>
                <th className="text-left px-lg py-md font-semibold text-label-md text-on-surface dark:text-[#e4e4ef]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {sortedReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-surface-container-low dark:hover:bg-[#282a36] transition-colors duration-150"
                >
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <span className={clsx(
                        "material-symbols-outlined text-white p-xs rounded text-[18px]",
                        reportTypeConfig[report.type].color
                      )}>
                        {reportTypeConfig[report.type].icon}
                      </span>
                      <div>
                        <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef]">
                          {report.name}
                        </p>
                        <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">
                          {report.format}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-sm text-on-surface dark:text-[#e4e4ef]">
                    {reportTypeConfig[report.type].label}
                  </td>
                  <td className="px-lg py-md text-body-sm text-on-surface dark:text-[#e4e4ef]">
                    {new Date(report.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-lg py-md text-body-sm text-on-surface dark:text-[#e4e4ef]">
                    {report.size}
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-xs">
                      <span className={clsx(
                        "material-symbols-outlined text-[16px]",
                        statusConfig[report.status].color
                      )}>
                        {statusConfig[report.status].icon}
                      </span>
                      <span className={clsx("text-label-sm font-semibold", statusConfig[report.status].color)}>
                        {statusConfig[report.status].label}
                      </span>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex gap-sm">
                      <button
                        onClick={() => handlePreview(report)}
                        disabled={report.status !== "disponible"}
                        className={clsx(
                          "p-xs rounded-lg transition-colors duration-150",
                          report.status === "disponible"
                            ? "text-primary dark:text-[#b2c5ff] hover:bg-primary-fixed dark:hover:bg-[#001848]/30"
                            : "text-on-surface-variant dark:text-[#8e90a2] opacity-50 cursor-not-allowed"
                        )}
                        title="Aperçu"
                      >
                        <span className="material-symbols-outlined">preview</span>
                      </button>
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={report.status !== "disponible"}
                        className={clsx(
                          "p-xs rounded-lg transition-colors duration-150",
                          report.status === "disponible"
                            ? "text-secondary dark:text-[#abcae8] hover:bg-secondary-container dark:hover:bg-[#2b4a62]/30"
                            : "text-on-surface-variant dark:text-[#8e90a2] opacity-50 cursor-not-allowed"
                        )}
                        title="Télécharger"
                      >
                        <span className="material-symbols-outlined">download</span>
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-xs rounded-lg text-error dark:text-[#ffb5a5] hover:bg-error/10 transition-colors duration-150"
                        title="Supprimer"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedReports.length === 0 && (
          <div className="text-center py-xl">
            <span className="material-symbols-outlined text-[48px] text-outline-variant opacity-50 block mb-md">
              summarize
            </span>
            <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2]">
              Aucun rapport trouvé
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
