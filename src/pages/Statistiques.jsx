import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import clsx from "clsx";
import { useApp } from "../context/AppContext";

const INSCRIPTIONS_DATA = [
  { mois: "Jan", inscriptions: 12 },
  { mois: "Fév", inscriptions: 19 },
  { mois: "Mar", inscriptions: 15 },
  { mois: "Avr", inscriptions: 28 },
  { mois: "Mai", inscriptions: 24 },
  { mois: "Juin", inscriptions: 31 },
];

const DEVIS_DATA = [
  { mois: "Jan", enAttente: 8, accepté: 12, refusé: 3 },
  { mois: "Fév", enAttente: 5, accepté: 18, refusé: 2 },
  { mois: "Mar", enAttente: 6, accepté: 14, refusé: 4 },
  { mois: "Avr", enAttente: 9, accepté: 22, refusé: 5 },
  { mois: "Mai", enAttente: 12, accepté: 20, refusé: 3 },
];

const SERVICES_DATA = [
  { name: "Nettoyage", value: 35, color: "#0052cc" },
  { name: "Investissement", value: 28, color: "#43617b" },
  { name: "Maintenance", value: 22, color: "#7b2600" },
  { name: "Autres", value: 15, color: "#c3c6d6" },
];

const REVENUE_DATA = [
  { mois: "Jan", revenue: 2400 },
  { mois: "Fév", revenue: 2210 },
  { mois: "Mar", revenue: 2290 },
  { mois: "Avr", revenue: 2000 },
  { mois: "Mai", revenue: 2181 },
  { mois: "Juin", revenue: 2500 },
];

const KPI_CARDS = [
  { label: "Total Clients", value: "1,234", change: "+5.2%", icon: "group", color: "text-primary" },
  { label: "Devis Ce Mois", value: "89", change: "+12.5%", icon: "description", color: "text-secondary" },
  { label: "Revenus Total", value: "145.2M XOF", change: "+8.3%", icon: "attach_money", color: "text-tertiary" },
  { label: "Taux Conversion", value: "64.2%", change: "+3.1%", icon: "trending_up", color: "text-primary" },
];

export default function Statistiques() {
  const { dashboardStats, fetchDashboardStats, loading, error } = useApp();
  const [period, setPeriod] = useState("6m");
  const [selectedMetric, setSelectedMetric] = useState("inscriptions");

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const stats = dashboardStats || {};
  
  const inscriptionsData = stats.inscriptionsTimeline || INSCRIPTIONS_DATA;
  const devisData = stats.quotesTimeline || DEVIS_DATA;

  // Build table data from the timelines
  const tableData = [];
  if (stats.inscriptionsTimeline && stats.quotesTimeline) {
    for (let i = 0; i < stats.inscriptionsTimeline.length; i++) {
      const inc = stats.inscriptionsTimeline[i];
      const qt = stats.quotesTimeline[i] || { enAttente: 0, accepté: 0, refusé: 0 };
      const totalQuotes = qt.enAttente + qt.accepté + qt.refusé;
      const taux = totalQuotes > 0 ? Math.round((qt.accepté / totalQuotes) * 100) : 0;
      tableData.push({
        mois: inc.mois,
        inscriptions: inc.inscriptions,
        devis: totalQuotes,
        acceptes: qt.accepté,
        revenus: "Calcul API", // we'd need monthly revenue from backend
        taux: `${taux}%`
      });
    }
  }

  const cards = [
    { label: "Total Clients", value: stats.clients ?? "...", change: "", icon: "group", color: "text-primary" },
    { label: "Devis Ce Mois", value: stats.pendingQuotes ?? "...", change: "", icon: "description", color: "text-secondary" },
    { label: "Devis Acceptés", value: stats.acceptedQuotes ?? "...", change: "", icon: "check_circle", color: "text-success" },
    { label: "Taux Conversion", value: stats.conversionRate ? `${stats.conversionRate}%` : "...", change: "", icon: "trending_up", color: "text-primary" },
  ];

  return (
    <div className="space-y-lg p-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-on-surface dark:text-[#e4e4ef] font-bold">Statistiques</h1>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
            Analysez les performances et tendances clés
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-sm">
          {[
            { value: "1m", label: "1 mois" },
            { value: "3m", label: "3 mois" },
            { value: "6m", label: "6 mois" },
            { value: "1y", label: "1 an" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={clsx(
                "px-md py-sm rounded-lg font-label-md transition-colors duration-150 whitespace-nowrap",
                period === p.value
                  ? "bg-primary text-white dark:bg-[#b2c5ff] dark:text-primary"
                  : "bg-surface-container-low dark:bg-[#1e1f2a] text-on-surface dark:text-[#e4e4ef] hover:bg-surface-container-high"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {KPI_CARDS.map((kpi, idx) => (
          <div
            key={idx}
            className={clsx(
              "p-md rounded-lg bg-surface-container-lowest dark:bg-[#1e1f2a]",
              "border border-outline-variant hover:shadow-card-hover transition-all duration-200"
            )}
          >
            <div className="flex items-start justify-between mb-md">
              <div>
                <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2] font-semibold">
                  {kpi.label}
                </p>
                <p className="text-headline-md text-on-surface dark:text-[#e4e4ef] font-bold mt-xs">
                  {kpi.value}
                </p>
              </div>
              <span className={clsx("material-symbols-outlined text-[24px]", kpi.color)}>
                {kpi.icon}
              </span>
            </div>
            <p className="text-label-sm text-secondary font-semibold">
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Inscriptions Chart */}
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] p-md">
          <h3 className="text-headline-md font-semibold text-on-surface dark:text-[#e4e4ef] mb-md">
            Nouvelles Inscriptions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={inscriptionsData}>
              <defs>
                <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0052cc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0052cc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e2ec" />
              <XAxis dataKey="mois" stroke="#8e90a2" />
              <YAxis stroke="#8e90a2" />
              <Tooltip contentStyle={{ backgroundColor: "#1e1f2a", border: "1px solid #2e3040" }} />
              <Area
                type="monotone"
                dataKey="inscriptions"
                stroke="#0052cc"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorInscriptions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] p-md">
          <h3 className="text-headline-md font-semibold text-on-surface dark:text-[#e4e4ef] mb-md">
            Revenus Mensuels
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e2ec" />
              <XAxis dataKey="mois" stroke="#8e90a2" />
              <YAxis stroke="#8e90a2" />
              <Tooltip contentStyle={{ backgroundColor: "#1e1f2a", border: "1px solid #2e3040" }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#7b2600"
                strokeWidth={2}
                dot={{ fill: "#7b2600", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Devis Status Chart */}
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] p-md">
          <h3 className="text-headline-md font-semibold text-on-surface dark:text-[#e4e4ef] mb-md">
            Statut des Devis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={devisData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e2ec" />
              <XAxis dataKey="mois" stroke="#8e90a2" />
              <YAxis stroke="#8e90a2" />
              <Tooltip contentStyle={{ backgroundColor: "#1e1f2a", border: "1px solid #2e3040" }} />
              <Legend />
              <Bar dataKey="enAttente" stackId="a" fill="#0052cc" />
              <Bar dataKey="accepté" stackId="a" fill="#43617b" />
              <Bar dataKey="refusé" stackId="a" fill="#ba1a1a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Services Distribution */}
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] p-md">
          <h3 className="text-headline-md font-semibold text-on-surface dark:text-[#e4e4ef] mb-md">
            Distribution des Services
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={SERVICES_DATA}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {SERVICES_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] p-md">
        <h3 className="text-headline-md font-semibold text-on-surface dark:text-[#e4e4ef] mb-md">
          Détails Mensuels
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant">
              <tr>
                {["Mois", "Inscriptions", "Devis Créés", "Devis Acceptés", "Revenus", "Taux Conversion"].map((h) => (
                  <th key={h} className="text-left px-md py-sm text-label-md font-semibold text-on-surface dark:text-[#e4e4ef]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {(tableData.length > 0 ? tableData : [
                { mois: "Janvier", inscriptions: 12, devis: 23, acceptes: 12, revenus: "2.4M", taux: "52%" },
                { mois: "Février", inscriptions: 19, devis: 25, acceptes: 18, revenus: "2.2M", taux: "72%" },
                { mois: "Mars", inscriptions: 15, devis: 20, acceptes: 14, revenus: "2.3M", taux: "70%" },
                { mois: "Avril", inscriptions: 28, devis: 36, acceptes: 22, revenus: "2.0M", taux: "61%" },
                { mois: "Mai", inscriptions: 24, devis: 32, acceptes: 20, revenus: "2.2M", taux: "63%" },
              ]).map((row) => (
                <tr key={row.mois} className="hover:bg-surface-container-low dark:hover:bg-[#282a36]">
                  <td className="px-md py-sm text-body-sm text-on-surface dark:text-[#e4e4ef] font-semibold">
                    {row.mois}
                  </td>
                  <td className="px-md py-sm text-body-sm text-on-surface dark:text-[#e4e4ef]">
                    {row.inscriptions}
                  </td>
                  <td className="px-md py-sm text-body-sm text-on-surface dark:text-[#e4e4ef]">
                    {row.devis}
                  </td>
                  <td className="px-md py-sm text-body-sm text-secondary font-semibold">
                    {row.acceptes}
                  </td>
                  <td className="px-md py-sm text-body-sm text-on-surface dark:text-[#e4e4ef]">
                    {row.revenus}
                  </td>
                  <td className="px-md py-sm text-body-sm text-primary font-semibold">
                    {row.taux}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
