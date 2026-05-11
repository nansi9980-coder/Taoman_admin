import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/", icon: "dashboard", label: "Vue d'ensemble", permission: null },
  { to: "/clients", icon: "group", label: "Clients", permission: "clients" },
  { to: "/devis", icon: "description", label: "Devis", permission: "devis" },
  { to: "/contenu", icon: "edit_note", label: "Contenu du site", permission: "content" },
  { to: "/medias", icon: "perm_media", label: "Médiathèque", permission: "content" },
  { to: "/jobs", icon: "work", label: "Emplois", permission: null },
  { to: "/messages", icon: "chat", label: "Contact", permission: null },
  { to: "/calendar", icon: "calendar_month", label: "Calendrier", permission: null },
  { to: "/investments", icon: "trending_up", label: "Investissements", permission: null },
  { to: "/backup", icon: "backup", label: "Sauvegarde", permission: null },
  { to: "/statistiques", icon: "bar_chart", label: "Statistiques", permission: "reports" },
  { to: "/rapports", icon: "summarize", label: "Rapports", permission: "reports" },
  { to: "/logs", icon: "history", label: "Journaux d'activité", permission: "logs" },
  { to: "/notifications", icon: "notifications", label: "Notifications", permission: null },
  { to: "/parametres", icon: "settings", label: "Paramètres", permission: "settings" },
];

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-md px-lg py-[10px] rounded-lg font-label-md text-label-md transition-colors duration-150 cursor-pointer select-none",
          isActive
            ? "text-primary dark:text-[#b2c5ff] font-bold bg-surface-container-low dark:bg-[#1e1f2a] border-r-2 border-primary dark:border-[#b2c5ff]"
            : "text-on-surface-variant dark:text-[#8e90a2] hover:text-primary dark:hover:text-[#b2c5ff] hover:bg-surface-container-low dark:hover:bg-[#1e1f2a]"
        )
      }
    >
      <span
        className="material-symbols-outlined text-[20px]"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        {icon}
      </span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside
      className={clsx(
        "flex flex-col fixed left-0 top-0 h-screen border-r border-outline-variant",
        "bg-surface-container-lowest dark:bg-[#12131a] shadow-sm z-50 transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="px-lg py-xl flex items-center gap-sm min-h-[72px] border-b border-outline-variant">
        <img src="/logo.png" alt="Taoman" className="w-9 h-9 object-contain" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-[15px] leading-tight text-primary dark:text-[#b2c5ff] whitespace-nowrap">
              Taoman Groupe
            </h1>
            <p className="text-label-sm text-outline whitespace-nowrap">Administration</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container-low transition-colors"
          title={collapsed ? "Développer" : "Réduire"}
        >
          <span className="material-symbols-outlined text-[18px]">
            {collapsed ? "menu" : "menu_open"}
          </span>
        </button>
      </div>

      {/* New Devis CTA */}
      {!collapsed && (
        <div className="px-md py-md">
          <NavLink
            to="/devis/nouveau"
            className="w-full py-sm px-lg bg-primary text-on-primary rounded-lg font-label-md text-label-md
                       flex items-center justify-center gap-sm shadow-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nouveau devis
          </NavLink>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-sm py-md flex flex-col gap-xs overflow-y-auto">
        {visibleItems.map((item) => (
          collapsed ? (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              title={item.label}
              className={({ isActive }) =>
                clsx(
                  "flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-colors duration-150",
                  isActive
                    ? "text-primary dark:text-[#b2c5ff] bg-surface-container-low dark:bg-[#1e1f2a]"
                    : "text-on-surface-variant dark:text-[#8e90a2] hover:text-primary hover:bg-surface-container-low dark:hover:bg-[#1e1f2a]"
                )
              }
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                {item.icon}
              </span>
            </NavLink>
          ) : (
            <NavItem key={item.to} {...item} />
          )
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="border-t border-outline-variant px-sm py-md">
        {!collapsed && user && (
          <div className="flex items-center gap-sm px-md py-sm mb-xs rounded-lg bg-surface-container-low dark:bg-[#1e1f2a]">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span className="text-label-md text-on-primary-container font-bold uppercase">
                {user.name?.[0] ?? "A"}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-label-md text-on-surface dark:text-[#e4e4ef] truncate">{user.name}</p>
              <p className="text-label-sm text-outline truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={clsx(
            "flex items-center gap-md px-lg py-[10px] rounded-lg w-full text-left",
            "text-on-surface-variant dark:text-[#8e90a2] hover:text-error hover:bg-error-container/20",
            "font-label-md text-label-md transition-colors duration-150",
            collapsed && "justify-center px-0"
          )}
          title="Déconnexion"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}