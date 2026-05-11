import { useState, useMemo, useEffect } from "react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { buildUrl } from "../utils/api";

// ── Constants ─────────────────────────────────────────────────────
const STATUS_META = {
  "En attente":  { badge: "badge-warning", icon: "hourglass_empty" },
  "En révision": { badge: "badge-info",    icon: "rate_review" },
  "Envoyé":      { badge: "badge-success", icon: "mark_email_read" },
  "Refusé":      { badge: "badge-error",   icon: "cancel" },
};

const PRIO_META = {
  haute:   { badge: "badge-error",   label: "Haute" },
  normale: { badge: "badge-info",    label: "Normale" },
  basse:   { badge: "badge badge-outline dark:text-[#8e90a2]", label: "Basse" },
};

function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const w = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }[size];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={clsx("modal-content", w, "max-h-[92vh] flex flex-col")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-lg shrink-0">
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

// ── Email send panel ──────────────────────────────────────────────
function EmailPanel({ devis, onSent, onClose }) {
  const [mail, setMail] = useState({
    to: devis.email,
    subject: `Votre devis Taoman Groupe — Réf. #${devis.id}`,
    body: devis.response || `Bonjour ${devis.client},\n\nSuite à votre demande concernant ${devis.service}, nous avons le plaisir de vous transmettre notre proposition.\n\n[Votre devis ici]\n\nCordialement,\nL'équipe Taoman Groupe`,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setTimeout(() => { onSent(); onClose(); }, 1800);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-md">
          <span className="material-symbols-outlined text-[32px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <p className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">Email envoyé !</p>
        <p className="text-body-sm text-outline mt-xs">Le devis a bien été transmis à {devis.client}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <div>
        <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Destinataire</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">email</span>
          <input type="email" value={mail.to} onChange={(e) => setMail((p) => ({ ...p, to: e.target.value }))} className="input-field pl-9" />
        </div>
      </div>
      <div>
        <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Objet</label>
        <input value={mail.subject} onChange={(e) => setMail((p) => ({ ...p, subject: e.target.value }))} className="input-field" />
      </div>
      <div>
        <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Corps du message</label>
        <textarea value={mail.body} onChange={(e) => setMail((p) => ({ ...p, body: e.target.value }))} rows={10} className="input-field resize-none font-mono text-label-sm" />
      </div>
      <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant dark:border-[#2e3040]">
        <button onClick={onClose} className="btn-secondary">Annuler</button>
        <button onClick={handleSend} disabled={sending} className="btn-primary gap-xs">
          {sending ? (
            <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Envoi en cours…</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>Envoyer</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Devis detail + response form ──────────────────────────────────
function DevisDetail({ devis, onSave, onRefuse, onOpenEmail, onGeneratePdf }) {
  const [response, setResponse] = useState(devis.response || "");
  const [generating, setGenerating] = useState(false);
  const sm = STATUS_META[devis.status] || STATUS_META["En attente"];
  const pm = PRIO_META[devis.priority] || PRIO_META.normale;

  return (
    <div className="space-y-lg">
      {/* Header info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
        {[
          { label: "Client", val: devis.client, icon: "person" },
          { label: "Email", val: devis.email, icon: "email" },
          { label: "Service", val: devis.service, icon: "work" },
          { label: "Date", val: devis.date, icon: "calendar_today" },
          { label: "Priorité", val: <span className={clsx("badge", pm.badge)}>{pm.label}</span>, icon: "priority_high" },
          { label: "Statut", val: <span className={clsx("badge", sm.badge)}>{devis.status}</span>, icon: sm.icon },
        ].map((info) => (
          <div key={info.label} className="flex items-start gap-xs p-sm bg-surface-container-low dark:bg-[#191a24] rounded-lg">
            <span className="material-symbols-outlined text-[16px] text-primary mt-xs shrink-0">{info.icon}</span>
            <div>
              <p className="text-label-sm text-outline">{info.label}</p>
              <div className="text-body-sm font-semibold text-on-surface dark:text-[#e4e4ef] mt-xs">{info.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Client request */}
      <div>
        <p className="text-label-md text-outline uppercase tracking-wider mb-sm">Demande du client</p>
        <div className="p-md bg-surface-container-low dark:bg-[#191a24] border border-outline-variant dark:border-[#2e3040] rounded-xl">
          <p className="text-body-sm text-on-surface dark:text-[#c4c6d6] leading-relaxed">{devis.desc}</p>
        </div>
      </div>

      {/* Response editor */}
      <div>
        <p className="text-label-md text-outline uppercase tracking-wider mb-sm">Votre réponse / Devis</p>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={7}
          placeholder="Rédigez votre proposition détaillée ici…"
          className="input-field resize-none leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-sm pt-sm border-t border-outline-variant dark:border-[#2e3040]">
        <button onClick={() => onSave(response)} className="btn-secondary gap-xs">
          <span className="material-symbols-outlined text-[18px]">save</span> Sauvegarder
        </button>
        <button 
          onClick={async () => {
            setGenerating(true);
            await onGeneratePdf(devis.id);
            setGenerating(false);
          }} 
          disabled={generating}
          className="btn-primary gap-xs"
        >
          {generating ? (
            <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Génération...</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>Générer PDF</>
          )}
        </button>
        <button onClick={() => onOpenEmail(response)} className="btn-primary gap-xs">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          Envoyer par email
        </button>
        {devis.status !== "Refusé" && (
          <button onClick={onRefuse} className="btn-danger gap-xs ml-auto">
            <span className="material-symbols-outlined text-[18px]">cancel</span> Refuser
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function Devis() {
  const { devis, setDevis, fetchDevis, loading, error } = useApp();
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPrio, setFilterPrio] = useState("all");

  const [detailDevis, setDetailDevis] = useState(null);
  const [emailDevis, setEmailDevis] = useState(null);   // { devis, response }

  useEffect(() => {
    fetchDevis();
  }, [fetchDevis]);

  // ── Derived list ──────────────────────────────────────────────
  const filtered = useMemo(() => devis.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.client.toLowerCase().includes(q) || d.id.includes(q) || d.service.toLowerCase().includes(q)) &&
      (filterStatus === "all" || d.status === filterStatus) &&
      (filterPrio === "all" || d.priority === filterPrio)
    );
  }), [devis, search, filterStatus, filterPrio]);

  // ── CRUD helpers ──────────────────────────────────────────────
  const updateDevis = (id, patch) => {
    setDevis((p) => p.map((d) => d.id === id ? { ...d, ...patch } : d));
    if (detailDevis?.id === id) setDetailDevis((p) => ({ ...p, ...patch }));
  };

  const handleSaveResponse = (response) => {
    updateDevis(detailDevis.id, { response, status: "En révision" });
  };

  const handleRefuse = () => {
    updateDevis(detailDevis.id, { status: "Refusé" });
    setDetailDevis(null);
  };

  const handleSent = () => {
    if (emailDevis) updateDevis(emailDevis.devis.id, { status: "Envoyé", response: emailDevis.response });
  };


  const handleGeneratePdf = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(buildUrl(`/quotes/${id}/generate-pdf`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const pdfUrl = data.url?.startsWith("http") ? data.url : buildUrl(data.url);
        window.open(pdfUrl, '_blank');
        updateDevis(id, { status: "Envoyé", pdfUrl: data.url });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Counts ────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    "En attente": devis.filter((d) => d.status === "En attente").length,
    "En révision": devis.filter((d) => d.status === "En révision").length,
    "Envoyé": devis.filter((d) => d.status === "Envoyé").length,
    "Refusé": devis.filter((d) => d.status === "Refusé").length,
  }), [devis]);

  return (
    <div className="animate-fadeIn">
      {/* Page header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h2 className="page-title">Gestion des Devis</h2>
          <p className="page-subtitle">Consultez les demandes, répondez et envoyez les devis par email.</p>
        </div>
        <button className="btn-primary gap-xs w-fit">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nouveau devis
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md mb-xl">
        {[
          { key: "En attente",  icon: "hourglass_empty", accent: "warning" },
          { key: "En révision", icon: "rate_review",      accent: "secondary" },
          { key: "Envoyé",      icon: "mark_email_read",  accent: "success" },
          { key: "Refusé",      icon: "cancel",           accent: "error" },
        ].map((s) => (
          <div key={s.key} className="stat-card cursor-pointer" onClick={() => setFilterStatus(s.key)}>
            <span className={clsx("p-xs rounded-lg w-fit", {
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400": s.accent === "warning",
              "bg-secondary-container text-secondary": s.accent === "secondary",
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400": s.accent === "success",
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": s.accent === "error",
            })}>
              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
            </span>
            <div>
              <p className="text-label-sm text-outline uppercase tracking-wider">{s.key}</p>
              <p className="text-headline-md font-bold text-on-surface dark:text-[#e4e4ef]">{counts[s.key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-lg">
        <div className="flex flex-wrap gap-md">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Client, référence, service…" className="input-field pl-10" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field max-w-[180px]">
            <option value="all">Tous les statuts</option>
            {["En attente", "En révision", "Envoyé", "Refusé"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filterPrio} onChange={(e) => setFilterPrio(e.target.value)} className="input-field max-w-[160px]">
            <option value="all">Toutes priorités</option>
            {["haute", "normale", "basse"].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          {(search || filterStatus !== "all" || filterPrio !== "all") && (
            <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPrio("all"); }} className="btn-secondary gap-xs">
              <span className="material-symbols-outlined text-[18px]">clear</span>Réinitialiser
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
                <th>Référence</th>
                <th>Client</th>
                <th>Service</th>
                <th>Priorité</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="flex flex-col items-center py-16 text-center">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">description</span>
                    <p className="font-semibold text-on-surface dark:text-[#e4e4ef]">Aucun devis trouvé</p>
                  </div>
                </td></tr>
              ) : filtered.map((d) => {
                const sm = STATUS_META[d.status] || STATUS_META["En attente"];
                const pm = PRIO_META[d.priority] || PRIO_META.normale;
                return (
                  <tr key={d.id} className="group cursor-pointer" onClick={() => setDetailDevis(d)}>
                    <td className="font-mono font-bold text-primary dark:text-[#b2c5ff]">#{d.id}</td>
                    <td>
                      <p className="font-semibold text-on-surface dark:text-[#e4e4ef]">{d.client}</p>
                      <p className="text-label-sm text-outline">{d.email}</p>
                    </td>
                    <td>{d.service}</td>
                    <td><span className={clsx("badge", pm.badge)}>{pm.label}</span></td>
                    <td>{d.date}</td>
                    <td><span className={clsx("badge", sm.badge)}>{d.status}</span></td>
                    <td>
                      <div className="flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDetailDevis(d)}
                          className="p-xs rounded-lg text-primary hover:bg-primary-fixed transition-colors"
                          title="Voir / Répondre"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        {d.status !== "Envoyé" && d.status !== "Refusé" && (
                          <button
                            onClick={() => setEmailDevis({ devis: d, response: d.response })}
                            className="p-xs rounded-lg text-secondary hover:bg-secondary-container transition-colors"
                            title="Envoyer par email"
                          >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={!!detailDevis} onClose={() => setDetailDevis(null)} title={`Devis #${detailDevis?.id}`} size="xl">
        {detailDevis && (
          <DevisDetail
            devis={detailDevis}
            onSave={handleSaveResponse}
            onRefuse={handleRefuse}
            onGeneratePdf={handleGeneratePdf}
            onOpenEmail={(response) => {
              setEmailDevis({ devis: detailDevis, response });
              setDetailDevis(null);
            }}
          />
        )}
      </Modal>

      {/* Email modal */}
      <Modal open={!!emailDevis} onClose={() => setEmailDevis(null)} title="Envoyer le devis par email" size="lg">
        {emailDevis && (
          <EmailPanel
            devis={{ ...emailDevis.devis, response: emailDevis.response }}
            onSent={handleSent}
            onClose={() => setEmailDevis(null)}
          />
        )}
      </Modal>
    </div>
  );
}