import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useApp } from "../context/AppContext";

const TYPE_META = {
  devis:  { icon: "description", bg: "bg-primary-fixed",         ic: "text-primary",    label: "Devis" },
  client: { icon: "person_add",  bg: "bg-secondary-container",   ic: "text-secondary",  label: "Client" },
  system: { icon: "settings",    bg: "bg-surface-container-high", ic: "text-on-surface-variant", label: "Système" },
  report: { icon: "summarize",   bg: "bg-tertiary-fixed",         ic: "text-tertiary",   label: "Rapport" },
  alert:  { icon: "warning",     bg: "bg-error-container",        ic: "text-error",      label: "Alerte" },
};

const PREFS_DEFAULT = {
  newDevis:     true,
  newClient:    true,
  devisEnvoye:  true,
  rapportPret:  true,
  systemAlerts: false,
  weeklyDigest: true,
};

export default function Notifications() {
  const { fetchNotifications } = useApp();
  const [notifs, setNotifs] = useState([]);
  const [tab, setTab] = useState("all");      // "all" | "unread" | "prefs"
  const [prefs, setPrefs] = useState(PREFS_DEFAULT);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications().then((data) => {
      if (Array.isArray(data) && data.length) {
        setNotifs(data.map((notification) => ({
          id: notification.id ?? notification._id,
          type: notification.type || notification.category || "system",
          title: notification.title || notification.subject || "Notification",
          body: notification.body || notification.message || "Aucune description disponible.",
          time: notification.time || notification.createdAt || "Il y a quelques instants",
          read: Boolean(notification.read),
          to: notification.to || notification.link || "#",
        })));
      }
    });
  }, [fetchNotifications]);

  const unread = notifs.filter((n) => !n.read);
  const displayed = tab === "unread" ? unread : notifs;

  const markRead = (id) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const deleteNotif = (id) => setNotifs((p) => p.filter((n) => n.id !== id));
  const clearAll = () => setNotifs([]);

  const togglePref = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const handleClick = (n) => {
    markRead(n.id);
    if (n.to && n.to !== "#") navigate(n.to);
  };

  // Group by date label
  const groups = displayed.reduce((acc, n) => {
    const key = n.time.includes("min") || n.time.includes("h") ? "Aujourd'hui" : n.time.includes("Hier") ? "Hier" : "Plus ancien";
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <div className="animate-fadeIn max-w-3xl">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle">
            Suivez les événements importants de la plateforme.
            {unread.length > 0 && (
              <span className="ml-sm badge badge-error">{unread.length} non lu{unread.length > 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        {unread.length > 0 && (
          <button onClick={markAllRead} className="btn-secondary gap-xs w-fit">
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-xs bg-surface-container-low dark:bg-[#1e1f2a] rounded-xl p-xs border border-outline-variant dark:border-[#2e3040] mb-xl w-fit">
        {[
          { key: "all",    label: "Toutes",      count: notifs.length },
          { key: "unread", label: "Non lues",     count: unread.length },
          { key: "prefs",  label: "Préférences",  count: null },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "flex items-center gap-xs px-md py-xs rounded-lg text-label-sm font-medium transition-colors",
              tab === t.key
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant dark:text-[#8e90a2] hover:text-primary"
            )}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className={clsx("w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                tab === t.key ? "bg-white/30 text-on-primary" : "bg-surface-container text-on-surface-variant dark:bg-[#282a36]"
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Preferences tab */}
      {tab === "prefs" && (
        <div className="card">
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef] mb-lg">Préférences de Notification</h3>
          <div className="space-y-md">
            {[
              { key: "newDevis",     label: "Nouveau devis reçu",             desc: "Être alerté dès qu'un client soumet une demande." },
              { key: "newClient",    label: "Nouveau client inscrit",          desc: "Notification à chaque nouveau compte créé." },
              { key: "devisEnvoye",  label: "Confirmation d'envoi de devis",   desc: "Après chaque envoi de devis par email." },
              { key: "rapportPret",  label: "Rapport disponible",              desc: "Quand un rapport mensuel ou hebdomadaire est prêt." },
              { key: "systemAlerts", label: "Alertes système",                  desc: "Maintenance, erreurs et mises à jour de la plateforme." },
              { key: "weeklyDigest", label: "Récapitulatif hebdomadaire",       desc: "Résumé des activités chaque lundi matin par email." },
            ].map((item) => (
              <div key={item.key} className="flex items-start justify-between py-sm border-b border-outline-variant dark:border-[#2e3040] last:border-0">
                <div>
                  <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef]">{item.label}</p>
                  <p className="text-label-sm text-outline mt-xs">{item.desc}</p>
                </div>
                <button
                  onClick={() => togglePref(item.key)}
                  className={clsx("w-12 h-6 rounded-full transition-all shrink-0 relative ml-lg mt-xs",
                    prefs[item.key] ? "bg-primary" : "bg-outline-variant dark:bg-[#434654]"
                  )}
                >
                  <span className={clsx(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                    prefs[item.key] ? "left-6" : "left-0.5"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification list */}
      {tab !== "prefs" && (
        <>
          {displayed.length === 0 ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-md">notifications_none</span>
              <p className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">
                {tab === "unread" ? "Tout est à jour !" : "Aucune notification"}
              </p>
              <p className="text-body-sm text-outline mt-xs">
                {tab === "unread" ? "Vous n'avez aucune notification non lue." : "Les notifications apparaîtront ici."}
              </p>
            </div>
          ) : (
            <>
              {Object.entries(groups).map(([groupLabel, items]) => (
                <div key={groupLabel} className="mb-xl">
                  <p className="text-label-sm text-outline uppercase tracking-wider mb-md font-semibold">{groupLabel}</p>
                  <div className="space-y-sm">
                    {items.map((n) => {
                      const meta = TYPE_META[n.type] || TYPE_META.system;
                      return (
                        <div
                          key={n.id}
                          className={clsx(
                            "card flex items-start gap-md cursor-pointer hover:shadow-card-hover transition-all duration-150 group",
                            !n.read && "border-l-4 border-primary dark:border-[#b2c5ff]"
                          )}
                          onClick={() => handleClick(n)}
                        >
                          {/* Icon */}
                          <span className={clsx("p-sm rounded-lg shrink-0 mt-xs", meta.bg, meta.ic)}>
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                          </span>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-sm mb-xs flex-wrap">
                              <span className={clsx("badge", {
                                "badge-primary": n.type === "devis",
                                "badge-info":    n.type === "client",
                                "badge-success": n.type === "report",
                                "badge-error":   n.type === "alert",
                              })}>{meta.label}</span>
                              <span className="text-label-sm text-outline">{n.time}</span>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                            </div>
                            <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef]">{n.title}</p>
                            <p className="text-label-sm text-outline mt-xs">{n.body}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            {!n.read && (
                              <button onClick={() => markRead(n.id)} className="p-xs rounded-lg text-primary hover:bg-primary-fixed transition-colors" title="Marquer comme lu">
                                <span className="material-symbols-outlined text-[16px]">done</span>
                              </button>
                            )}
                            <button onClick={() => deleteNotif(n.id)} className="p-xs rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors" title="Supprimer">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Clear all */}
              <div className="flex justify-end mt-lg">
                <button onClick={clearAll} className="btn-secondary gap-xs text-error border-error/30 hover:bg-error-container/20">
                  <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                  Effacer tout
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}