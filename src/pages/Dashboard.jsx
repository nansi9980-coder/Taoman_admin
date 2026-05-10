import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import clsx from "clsx";
import { useApp } from "../context/AppContext";

// ─── Placeholder data shapes (connect to your API) ─────────────────────────
const INSCRIPTIONS_DATA = [
  { mois: "Jan", inscriptions: 0 },
  { mois: "Fév", inscriptions: 0 },
  { mois: "Mar", inscriptions: 0 },
  { mois: "Avr", inscriptions: 0 },
  { mois: "Mai", inscriptions: 0 },
  { mois: "Juin", inscriptions: 0 },
];

const DEVIS_DATA = [
  { mois: "Jan", enAttente: 0, accepté: 0, refusé: 0 },
  { mois: "Fév", enAttente: 0, accepté: 0, refusé: 0 },
  { mois: "Mar", enAttente: 0, accepté: 0, refusé: 0 },
  { mois: "Avr", enAttente: 0, accepté: 0, refusé: 0 },
  { mois: "Mai", enAttente: 0, accepté: 0, refusé: 0 },
];

const SERVICES_DATA = [
  { name: "Nettoyage", value: 0, color: "#0052cc" },
  { name: "Investissement", value: 0, color: "#43617b" },
  { name: "Maintenance", value: 0, color: "#7b2600" },
  { name: "Autres", value: 0, color: "#c3c6d6" },
];

// ─── Sub-components ─────────────────────────────────────────────────────────
function StatCard({ icon, label, value, trend, trendLabel, accent = "secondary" }) {
  const accentMap = {
    secondary: "bg-secondary-container text-on-secondary-container",
    primary:   "bg-primary-fixed text-on-primary-fixed",
    success:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    error:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    orange:    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  const isPositive = typeof trend === "number" ? trend >= 0 : null;

  return (
    <div className="stat-card min-h-[120px]">
      <div className="flex justify-between items-start">
        <span className={clsx("p-sm rounded-lg", accentMap[accent])}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
            {icon}
          </span>
        </span>
        {trend !== undefined && (
          <span className={clsx(
            "flex items-center gap-0.5 text-label-sm font-semibold",
            isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            <span className="material-symbols-outlined text-[14px]">
              {isPositive ? "trending_up" : "trending_down"}
            </span>
            {trend !== null ? `${Math.abs(trend)}%` : "—"}
          </span>
        )}
      </div>
      <div className="mt-md">
        <p className="text-label-sm text-outline uppercase tracking-wider mb-xs">{label}</p>
        <p className="text-headline-md font-headline-md font-bold text-on-surface dark:text-[#e4e4ef]">
          {value ?? <span className="skeleton w-16 h-6 inline-block" />}
        </p>
        {trendLabel && (
          <p className="text-label-sm text-outline mt-xs">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef] mb-lg">
      {children}
    </h3>
  );
}

function ChartCard({ title, children, action }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-lg">
        <h4 className="font-label-md text-label-md text-on-surface dark:text-[#e4e4ef] uppercase tracking-wider">
          {title}
        </h4>
        {action}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-container-lowest dark:bg-[#1e1f2a] border border-outline-variant dark:border-[#2e3040] rounded-lg p-sm shadow-card text-body-sm">
      <p className="font-semibold text-on-surface dark:text-[#e4e4ef] mb-xs">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Recent activity placeholder ─────────────────────────────────────────
const RECENT_ACTIVITY = [];

// ─── Dashboard page ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [period, setPeriod] = useState("6m");

  const { dashboardStats, fetchDashboardStats, logs, fetchLogs, loading, error } = useApp();

  useEffect(() => {
    fetchDashboardStats();
    fetchLogs();
  }, [fetchDashboardStats, fetchLogs]);

  const RECENT_ACTIVITY = (logs || []).slice(0, 5).map(log => ({
    message: `${log.user} - ${log.action} (${log.resource})`,
    time: new Date(log.createdAt).toLocaleString("fr-FR")
  }));

  const stats = dashboardStats || {};
  const clientCount = stats.clients ?? "—";
  const pendingQuotes = stats.pendingQuotes ?? "—"; 
  const acceptedQuotes = stats.acceptedQuotes ?? "—"; 
  const conversionRate = stats.conversionRate != null ? `${stats.conversionRate}%` : "—";
  const inscriptionsData = stats.inscriptionsTimeline ?? INSCRIPTIONS_DATA;
  const devisData = stats.quotesTimeline ?? DEVIS_DATA;
  const servicesData = stats.servicesDistribution ?? SERVICES_DATA;

  return (
    <div className="animate-fadeIn">
      {loading && (
        <div className="mb-lg rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">
          Chargement des statistiques...
        </div>
      )}
      {error && (
        <div className="mb-lg rounded-lg border border-error/20 bg-error-container/10 p-md text-error">
          Erreur : {error}
        </div>
      )}
      {/* Page header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h2 className="page-title">Vue d'ensemble</h2>
          <p className="page-subtitle">Tableau de bord — Taoman Groupe Administration</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-xs bg-surface-container-low dark:bg-[#1e1f2a] rounded-lg p-xs border border-outline-variant dark:border-[#2e3040]">
          {[
            { label: "7j", value: "7d" },
            { label: "1m", value: "1m" },
            { label: "6m", value: "6m" },
            { label: "1an", value: "1y" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={clsx(
                "px-md py-xs rounded-md text-label-sm font-medium transition-colors",
                period === p.value
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant dark:text-[#8e90a2] hover:text-primary"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        <StatCard icon="group" label="Clients inscrits" value={clientCount} trend={stats.clientsGrowth ?? null} trendLabel={stats.clientsTrendLabel ?? "Connectez votre API"} accent="secondary" />
        <StatCard icon="description" label="Devis en attente" value={pendingQuotes} trend={stats.pendingQuotesGrowth ?? null} trendLabel={stats.pendingQuotesTrendLabel ?? "Connectez votre API"} accent="warning" />
        <StatCard icon="check_circle" label="Devis acceptés" value={acceptedQuotes} trend={stats.acceptedQuotesGrowth ?? null} trendLabel={stats.acceptedQuotesTrendLabel ?? "Ce mois-ci"} accent="success" />
        <StatCard icon="trending_up" label="Taux de conversion" value={conversionRate} trend={stats.conversionRateChange ?? null} trendLabel={stats.conversionRateLabel ?? "vs. mois précédent"} accent="primary" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
        {/* Inscriptions area chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Évolution des inscriptions"
            action={
              <span className="badge badge-info">6 derniers mois</span>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={INSCRIPTIONS_DATA}>
                <defs>
                  <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052cc" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0052cc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#737685" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#737685" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="inscriptions"
                  name="Inscriptions"
                  stroke="#0052cc"
                  strokeWidth={2}
                  fill="url(#colorInscriptions)"
                  dot={{ r: 4, fill: "#0052cc" }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-label-sm text-outline text-center mt-sm">
              Données disponibles après connexion API
            </p>
          </ChartCard>
        </div>

        {/* Services pie chart */}
        <ChartCard title="Demandes par service">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={SERVICES_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {SERVICES_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-xs mt-sm">
            {SERVICES_DATA.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-label-sm">
                <div className="flex items-center gap-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-on-surface-variant dark:text-[#8e90a2]">{s.name}</span>
                </div>
                <span className="text-on-surface dark:text-[#e4e4ef] font-medium">—</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Devis bar chart + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">
        <ChartCard title="Statuts des devis par mois">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEVIS_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#737685" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#737685" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="accepté"   name="Accepté"   fill="#0052cc" radius={[3,3,0,0]} />
              <Bar dataKey="enAttente" name="En attente" fill="#43617b" radius={[3,3,0,0]} />
              <Bar dataKey="refusé"    name="Refusé"    fill="#ba1a1a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent activity */}
        <ChartCard
          title="Activité récente"
          action={
            <button className="text-label-sm text-primary dark:text-[#b2c5ff] hover:underline">
              Voir les logs →
            </button>
          }
        >
          {RECENT_ACTIVITY.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <span className="material-symbols-outlined text-[40px] text-outline mb-sm">
                history
              </span>
              <p className="text-body-sm text-outline">Aucune activité récente</p>
              <p className="text-label-sm text-outline mt-xs">
                Les actions apparaîtront ici après connexion API
              </p>
            </div>
          ) : (
            <div className="space-y-sm overflow-y-auto max-h-48">
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-sm">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-body-sm text-on-surface dark:text-[#c4c6d6]">{a.message}</p>
                    <p className="text-label-sm text-outline">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Quick actions */}
      <div className="card">
        <SectionTitle>Actions rapides</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
          {[
            { icon: "person_add", label: "Ajouter un client", to: "/clients/nouveau" },
            { icon: "post_add", label: "Nouveau devis", to: "/devis/nouveau" },
            { icon: "add_photo_alternate", label: "Ajouter un média", to: "/medias" },
            { icon: "article", label: "Voir les rapports", to: "/rapports" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.to}
              className={clsx(
                "flex flex-col items-center gap-sm p-lg rounded-xl border border-outline-variant",
                "hover:border-primary hover:bg-surface-container-low dark:hover:bg-[#1e1f2a]",
                "transition-all duration-150 text-center group cursor-pointer"
              )}
            >
              <span className={clsx(
                "w-10 h-10 rounded-xl bg-primary-fixed dark:bg-[#0040a2]/30 flex items-center justify-center",
                "group-hover:bg-primary group-hover:text-on-primary transition-colors"
              )}>
                <span className="material-symbols-outlined text-[20px] text-primary dark:text-[#b2c5ff] group-hover:text-on-primary">
                  {action.icon}
                </span>
              </span>
              <span className="text-label-sm text-on-surface-variant dark:text-[#8e90a2] group-hover:text-primary dark:group-hover:text-[#b2c5ff] leading-tight">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}