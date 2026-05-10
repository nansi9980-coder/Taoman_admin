import { useState, useEffect } from "react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";

const typeConfig = {
  fonds: { label: "Fonds", icon: "pie_chart", color: "bg-primary" },
  etf: { label: "ETF", icon: "trending_up", color: "bg-secondary" },
  obligations: { label: "Obligations", icon: "attach_money", color: "bg-tertiary" },
  actions: { label: "Actions", icon: "show_chart", color: "bg-primary-fixed" },
  immobilier: { label: "Immobilier", icon: "home", color: "bg-secondary-container" },
};

const statusConfig = {
  actif: { label: "Actif", color: "text-secondary" },
  en_cours: { label: "En cours", color: "text-primary" },
  termine: { label: "Terminé", color: "text-tertiary" },
};

const riskConfig = {
  bas: { label: "Bas", color: "text-secondary" },
  moyen: { label: "Moyen", color: "text-primary" },
  haut: { label: "Haut", color: "text-tertiary" },
};

export default function Investments() {
  const { investments, setInvestments, fetchInvestments, loading, error } = useApp();
  const [filter, setFilter] = useState("tous");
  const [sortBy, setSortBy] = useState("roi");

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const avgROI = investments.length ? (investments.reduce((sum, inv) => sum + inv.roi, 0) / investments.length).toFixed(2) : "0.00";

  const filteredInvestments = investments.filter((inv) => {
    if (filter === "tous") return true;
    if (filter === "haut") return inv.roi >= 10;
    if (filter === "moyen") return inv.roi >= 5 && inv.roi < 10;
    if (filter === "bas") return inv.roi < 5;
    return true;
  });

  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    if (sortBy === "roi") return b.roi - a.roi;
    if (sortBy === "amount") return b.amount - a.amount;
    return 0;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-lg p-lg">
      {loading && investments.length === 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">
          Chargement des investissements...
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-error/20 bg-error-container/10 p-md text-error">
          Erreur : {error}
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Portefeuille d'Investissements</h1>
        <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
          Suivez vos investissements et leur performance
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Total Investi</p>
          <p className="text-headline-md text-on-surface dark:text-[#e4e4ef] font-bold mt-xs">
            {formatCurrency(totalInvested)}
          </p>
        </div>
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">ROI Moyen</p>
          <p className="text-headline-md text-on-surface dark:text-[#e4e4ef] font-bold mt-xs">
            <span className="text-secondary">{avgROI}%</span>
          </p>
        </div>
        <div className="p-md rounded-lg bg-surface-container-low dark:bg-[#1e1f2a] border border-outline-variant">
          <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Nombre d'Investissements</p>
          <p className="text-headline-md text-on-surface dark:text-[#e4e4ef] font-bold mt-xs">
            {investments.length}
          </p>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-md flex-wrap">
        <div className="flex gap-sm">
          {[
            { value: "tous", label: "Tous" },
            { value: "haut", label: "ROI ≥ 10%" },
            { value: "moyen", label: "ROI 5-10%" },
            { value: "bas", label: "ROI < 5%" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={clsx(
                "px-md py-sm rounded-lg font-label-md transition-colors duration-150",
                filter === f.value
                  ? "bg-primary text-white dark:bg-[#b2c5ff] dark:text-primary"
                  : "bg-surface-container-low dark:bg-[#1e1f2a] text-on-surface dark:text-[#e4e4ef] hover:bg-surface-container-high"
              )}
            >
              {f.label}
            </button>
          ))}
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
          <option value="roi">Trier par ROI</option>
          <option value="amount">Trier par montant</option>
        </select>
      </div>

      {/* Investments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {sortedInvestments.map((inv) => (
          <div
            key={inv.id}
            className={clsx(
              "p-md rounded-lg border border-outline-variant transition-colors duration-150",
              "bg-surface-container-lowest dark:bg-[#1e1f2a] hover:bg-surface-container-low dark:hover:bg-[#282a36]"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span className={clsx(
                  "material-symbols-outlined text-white p-sm rounded-lg text-[20px]",
                  typeConfig[inv.type].color
                )}>
                  {typeConfig[inv.type].icon}
                </span>
                <div>
                  <h3 className="text-body-md font-semibold text-on-surface dark:text-[#e4e4ef]">
                    {inv.name}
                  </h3>
                  <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2] mt-xs">
                    {typeConfig[inv.type].label} • {statusConfig[inv.status].label}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-headline-md font-bold text-secondary">{inv.roi}%</p>
                <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">ROI</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-md mb-md">
              <div>
                <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Montant Investi</p>
                <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef] mt-xs">
                  {formatCurrency(inv.amount)}
                </p>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Niveau de Risque</p>
                <p className={clsx("text-body-sm font-semibold mt-xs", riskConfig[inv.riskLevel].color)}>
                  {riskConfig[inv.riskLevel].label}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Date de Début</p>
                <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef] mt-xs">
                  {new Date(inv.startDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-xs">
              <div className="flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">Performance</span>
                <span className={clsx(
                  "text-label-sm font-semibold",
                  inv.roi >= 10 ? "text-secondary" : inv.roi >= 5 ? "text-primary" : "text-tertiary"
                )}>
                  {inv.roi >= 0 ? "+" : ""}{(inv.amount * (inv.roi / 100)).toFixed(0)}
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-high dark:bg-[#282a36] rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary dark:bg-[#abcae8] transition-all duration-300"
                  style={{ width: `${Math.min(inv.roi * 5, 100)}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            <button className={clsx(
              "w-full mt-md px-md py-sm rounded-lg font-label-md transition-colors duration-150",
              "bg-surface-container-high dark:bg-[#282a36] text-on-surface dark:text-[#e4e4ef]",
              "hover:bg-surface-container-highest dark:hover:bg-[#3a3d4a]"
            )}>
              Détails & Modifier
            </button>
          </div>
        ))}
      </div>

      {sortedInvestments.length === 0 && (
        <div className="text-center py-xl">
          <span className="material-symbols-outlined text-[48px] text-outline-variant opacity-50 block mb-md">
            trending_up
          </span>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2]">
            Aucun investissement trouvé
          </p>
        </div>
      )}
    </div>
  );
}
