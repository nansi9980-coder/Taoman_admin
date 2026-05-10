import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useApp } from "../context/AppContext";

// ── Types & constants ─────────────────────────────────────────────
const STATUS_META = {
  Actif:       { badge: "badge-success", dot: "bg-green-500",  label: "Actif" },
  Suspendu:    { badge: "badge-error",   dot: "bg-red-500",    label: "Suspendu" },
  "En attente":{ badge: "badge-warning", dot: "bg-yellow-500", label: "En attente" },
};

const SERVICE_META = {
  "Investissement":     { badge: "badge-primary" },
  "Gestion Patrimoine": { badge: "badge-info" },
  "Services Entretien": { badge: "badge badge-outline" },
};

const PER_PAGE = 8;

// ── Shared UI helpers ─────────────────────────────────────────────
function Avatar({ initials, size = "md" }) {
  const sz = size === "sm" ? "w-8 h-8 text-label-sm" : "w-9 h-9 text-label-md";
  return (
    <div className={clsx("rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shrink-0", sz)}>
      {initials}
    </div>
  );
}

function Badge({ className }) { return <span className={clsx("badge", className)} />; }

// ── Modal ─────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const maxW = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" }[size];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={clsx("modal-content", maxW, "max-h-[90vh] flex flex-col")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-lg">
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">{title}</h3>
          <button onClick={onClose} className="p-xs rounded-lg hover:bg-surface-container-low dark:hover:bg-[#282a36] transition-colors">
            <span className="material-symbols-outlined text-[20px] text-outline">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────
function Confirm({ open, onClose, onConfirm, title, message, label = "Confirmer", danger }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-surface-container-lowest dark:bg-[#1e1f2a] border border-outline-variant dark:border-[#2e3040] rounded-xl shadow-card-hover p-xl w-full max-w-sm mx-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-sm mb-md">
          <span className={clsx("p-sm rounded-lg", danger ? "bg-error-container/30 text-error" : "bg-primary-fixed text-primary")}>
            <span className="material-symbols-outlined text-[20px]">{danger ? "warning" : "help"}</span>
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">{title}</h3>
        </div>
        <p className="text-body-sm text-on-surface-variant dark:text-[#8e90a2] mb-lg">{message}</p>
        <div className="flex justify-end gap-sm">
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={danger ? "btn-danger" : "btn-primary"}>{label}</button>
        </div>
      </div>
    </div>
  );
}

// ── Client form (create / edit) ───────────────────────────────────
function ClientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: "", email: "", phone: "", service: "Investissement", status: "En attente", note: "",
  });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    onSave(form);
  };

  const fields = [
    { label: "Nom complet *", key: "name", type: "text", placeholder: "Prénom Nom", icon: "person" },
    { label: "Email *", key: "email", type: "email", placeholder: "client@email.com", icon: "email" },
    { label: "Téléphone", key: "phone", type: "tel", placeholder: "+228 90 00 00 00", icon: "phone" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">{f.label}</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">{f.icon}</span>
            <input type={f.type} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} className="input-field pl-9" />
          </div>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-md">
        <div>
          <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Service</label>
          <select value={form.service} onChange={set("service")} className="input-field">
            <option>Investissement</option>
            <option>Gestion Patrimoine</option>
            <option>Services Entretien</option>
          </select>
        </div>
        <div>
          <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Statut</label>
          <select value={form.status} onChange={set("status")} className="input-field">
            <option>En attente</option>
            <option>Actif</option>
            <option>Suspendu</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Note interne</label>
        <textarea value={form.note} onChange={set("note")} rows={3} placeholder="Informations complémentaires…" className="input-field resize-none" />
      </div>

      <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant dark:border-[#2e3040]">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="submit" className="btn-primary">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Sauvegarder
        </button>
      </div>
    </form>
  );
}

// ── Client detail panel ───────────────────────────────────────────
function ClientDetail({ client, onEdit, onDelete, onToggleStatus }) {
  const statusMeta = STATUS_META[client.status] || STATUS_META["En attente"];
  return (
    <div className="space-y-lg">
      {/* Identity */}
      <div className="flex items-center gap-md p-md bg-surface-container-low dark:bg-[#191a24] rounded-xl">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary text-headline-md font-bold shrink-0">
          {client.av}
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">{client.name}</h3>
          <p className="text-body-sm text-outline">{client.email}</p>
          <span className={clsx("badge mt-xs", statusMeta.badge)}>{client.status}</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-sm">
        {[
          { icon: "phone", label: "Téléphone", val: client.phone },
          { icon: "work", label: "Service", val: client.service },
          { icon: "calendar_today", label: "Inscrit le", val: client.joined },
          { icon: "folder_open", label: "Dossiers", val: client.dossiers },
        ].map((info) => (
          <div key={info.label} className="flex items-start gap-sm p-sm border border-outline-variant dark:border-[#2e3040] rounded-lg">
            <span className="material-symbols-outlined text-[18px] text-primary mt-xs shrink-0">{info.icon}</span>
            <div>
              <p className="text-label-sm text-outline">{info.label}</p>
              <p className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef]">{info.val || "—"}</p>
            </div>
          </div>
        ))}
      </div>

      {client.note && (
        <div className="p-sm bg-surface-container-low dark:bg-[#191a24] rounded-lg">
          <p className="text-label-sm text-outline mb-xs">Note interne</p>
          <p className="text-body-sm text-on-surface dark:text-[#c4c6d6]">{client.note}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-sm pt-sm border-t border-outline-variant dark:border-[#2e3040]">
        <button onClick={onEdit} className="btn-secondary gap-xs">
          <span className="material-symbols-outlined text-[18px]">edit</span> Modifier
        </button>
        <button onClick={onToggleStatus} className="btn-secondary gap-xs">
          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          {client.status === "Actif" ? "Suspendre" : "Activer"}
        </button>
        <button className="btn-secondary gap-xs">
          <span className="material-symbols-outlined text-[18px]">email</span> Contacter
        </button>
        <button onClick={onDelete} className="btn-danger gap-xs ml-auto">
          <span className="material-symbols-outlined text-[18px]">delete</span> Supprimer
        </button>
      </div>
    </div>
  );
}

// ── Seed data ─────────────────────────────────────────────────────
let nextId = 10;

// ── Main page ─────────────────────────────────────────────────────
export default function Clients() {
  const { clients, setClients, fetchClients, loading, error } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [sort, setSort] = useState({ key: "name", dir: 1 });
  const [page, setPage] = useState(1);

  // Modals
  const [detail, setDetail] = useState(null);
  const [editModal, setEditModal] = useState(null);   // null | client | "new"
  const [delTarget, setDelTarget] = useState(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ── Derived list ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = clients.filter((c) => {
      const q = search.toLowerCase();
      return (
        (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)) &&
        (filterStatus === "all" || c.status === filterStatus) &&
        (filterService === "all" || c.service === filterService)
      );
    });
    list = [...list].sort((a, b) => {
      const va = a[sort.key] ?? ""; const vb = b[sort.key] ?? "";
      return va < vb ? -sort.dir : va > vb ? sort.dir : 0;
    });
    return list;
  }, [clients, search, filterStatus, filterService, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── CRUD ─────────────────────────────────────────────────────
  const handleSave = (form) => {
    if (editModal === "new") {
      const initials = form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
      setClients((p) => [...p, { ...form, id: nextId++, dossiers: 0, joined: new Date().toLocaleDateString("fr-FR"), av: initials }]);
    } else {
      setClients((p) => p.map((c) => c.id === editModal.id ? { ...c, ...form } : c));
      if (detail?.id === editModal.id) setDetail((p) => ({ ...p, ...form }));
    }
    setEditModal(null);
  };

  const handleDelete = () => {
    setClients((p) => p.filter((c) => c.id !== delTarget.id));
    setDetail(null);
    setDelTarget(null);
  };

  const handleToggleStatus = (client) => {
    const next = client.status === "Actif" ? "Suspendu" : "Actif";
    setClients((p) => p.map((c) => c.id === client.id ? { ...c, status: next } : c));
    if (detail?.id === client.id) setDetail((p) => ({ ...p, status: next }));
  };

  // ── Sort helper ───────────────────────────────────────────────
  const toggleSort = (key) => setSort((s) => s.key === key ? { key, dir: -s.dir } : { key, dir: 1 });

  const SortIcon = ({ k }) => (
    <span className="material-symbols-outlined text-[14px] ml-xs text-outline">
      {sort.key === k ? (sort.dir === 1 ? "arrow_upward" : "arrow_downward") : "unfold_more"}
    </span>
  );

  // ── Summary counts ────────────────────────────────────────────
  const counts = useMemo(() => ({
    total: clients.length,
    actifs: clients.filter((c) => c.status === "Actif").length,
    suspendus: clients.filter((c) => c.status === "Suspendu").length,
    attente: clients.filter((c) => c.status === "En attente").length,
  }), [clients]);

  return (
    <div className="animate-fadeIn">
      {loading && clients.length === 0 && (
        <div className="mb-lg rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">
          Chargement des clients...
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
          <h2 className="page-title">Portefeuille Clients</h2>
          <p className="page-subtitle">Gérez les comptes clients et leurs accès à la plateforme.</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn-secondary gap-xs">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Exporter CSV
          </button>
          <button onClick={() => setEditModal("new")} className="btn-primary gap-xs">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Ajouter un client
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md mb-xl">
        {[
          { label: "Total", val: counts.total, icon: "group", accent: "secondary" },
          { label: "Actifs", val: counts.actifs, icon: "check_circle", accent: "success" },
          { label: "Suspendus", val: counts.suspendus, icon: "block", accent: "error" },
          { label: "En attente", val: counts.attente, icon: "hourglass_empty", accent: "warning" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <span className={clsx("p-xs rounded-lg w-fit", {
              "bg-secondary-container text-secondary": s.accent === "secondary",
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400": s.accent === "success",
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": s.accent === "error",
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400": s.accent === "warning",
            })}>
              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
            </span>
            <div>
              <p className="text-label-sm text-outline uppercase tracking-wider">{s.label}</p>
              <p className="text-headline-md font-bold text-on-surface dark:text-[#e4e4ef]">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-lg">
        <div className="flex flex-wrap gap-md">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">search</span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher un client…"
              className="input-field pl-10"
            />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="input-field max-w-[180px]">
            <option value="all">Tous les statuts</option>
            {["Actif", "Suspendu", "En attente"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filterService} onChange={(e) => { setFilterService(e.target.value); setPage(1); }} className="input-field max-w-[220px]">
            <option value="all">Tous les services</option>
            {["Investissement", "Gestion Patrimoine", "Services Entretien"].map((s) => <option key={s}>{s}</option>)}
          </select>
          {(search || filterStatus !== "all" || filterService !== "all") && (
            <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterService("all"); setPage(1); }} className="btn-secondary gap-xs">
              <span className="material-symbols-outlined text-[18px]">clear</span>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {[
                  { key: "name", label: "Client" },
                  { key: "service", label: "Service" },
                  { key: "status", label: "Statut" },
                  { key: "joined", label: "Inscrit le" },
                  { key: "dossiers", label: "Dossiers" },
                ].map((col) => (
                  <th key={col.key} onClick={() => toggleSort(col.key)} className="cursor-pointer select-none hover:text-primary transition-colors">
                    <div className="flex items-center">
                      {col.label}
                      <SortIcon k={col.key} />
                    </div>
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-outline mb-md">group_off</span>
                      <p className="font-semibold text-on-surface dark:text-[#e4e4ef]">Aucun client trouvé</p>
                      <p className="text-body-sm text-outline mt-xs">Essayez de modifier vos filtres.</p>
                    </div>
                  </td>
                </tr>
              ) : paged.map((c) => {
                const sm = STATUS_META[c.status] || STATUS_META["En attente"];
                return (
                  <tr
                    key={c.id}
                    className="group cursor-pointer"
                    onClick={() => setDetail(c)}
                  >
                    <td>
                      <div className="flex items-center gap-sm">
                        <Avatar initials={c.av} />
                        <div>
                          <p className="font-semibold text-on-surface dark:text-[#e4e4ef]">{c.name}</p>
                          <p className="text-label-sm text-outline">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={clsx("badge", SERVICE_META[c.service]?.badge || "badge-info")}>{c.service}</span></td>
                    <td>
                      <span className={clsx("flex items-center gap-xs w-fit", "badge", sm.badge)}>
                        <span className={clsx("w-1.5 h-1.5 rounded-full", sm.dot)} />
                        {c.status}
                      </span>
                    </td>
                    <td>{c.joined}</td>
                    <td className="text-center font-semibold">{c.dossiers}</td>
                    <td>
                      <div className="flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setEditModal(c)} className="p-xs rounded-lg text-primary hover:bg-primary-fixed transition-colors" title="Modifier">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleToggleStatus(c)} className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" title="Changer statut">
                          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                        </button>
                        <button onClick={() => setDelTarget(c)} className="p-xs rounded-lg text-error hover:bg-error-container/30 transition-colors" title="Supprimer">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-lg py-md border-t border-outline-variant dark:border-[#2e3040]">
            <p className="text-label-sm text-outline">{filtered.length} résultat{filtered.length > 1 ? "s" : ""} — Page {page} / {totalPages}</p>
            <div className="flex gap-xs">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-xs px-sm gap-xs disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span> Préc.
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary py-xs px-sm gap-xs disabled:opacity-50">
                Suiv. <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Fiche Client" size="md">
        {detail && (
          <ClientDetail
            client={detail}
            onEdit={() => { setEditModal(detail); setDetail(null); }}
            onDelete={() => { setDelTarget(detail); setDetail(null); }}
            onToggleStatus={() => handleToggleStatus(detail)}
          />
        )}
      </Modal>

      {/* Create / Edit modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal === "new" ? "Ajouter un client" : "Modifier le client"} size="md">
        <ClientForm
          initial={editModal !== "new" ? editModal : null}
          onSave={handleSave}
          onCancel={() => setEditModal(null)}
        />
      </Modal>

      {/* Confirm delete */}
      <Confirm
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer ce client ?"
        message={`Le compte de ${delTarget?.name} sera supprimé définitivement. Cette action est irréversible.`}
        label="Supprimer"
        danger
      />
    </div>
  );
}