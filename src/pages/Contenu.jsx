import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import clsx from "clsx";

const SITE_SECTIONS = [
  { key: "hero", label: "Section Hero", description: "Titre principal et boutons d'appel à l'action" },
  { key: "about", label: "À propos", description: "Description de l'entreprise et ses forces" },
  { key: "statistics", label: "Statistiques", description: "Chiffres clés affichés sur la page d'accueil" },
  { key: "cta", label: "Bannière CTA", description: "Appel à l'action principal du site" },
  { key: "faq", label: "FAQ", description: "Questions fréquentes" },
  { key: "footer", label: "Footer", description: "Informations de pied de page" },
  { key: "contact", label: "Contact", description: "Texte et coordonnées du formulaire de contact" },
  { key: "quick-links", label: "Liens rapides", description: "Accès vers les pages importantes" },
  { key: "realizations", label: "Réalisations", description: "Bloc galerie ou témoignages" },
];

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-lg sticky top-0 bg-surface dark:bg-[#12131a] pt-4 pb-2 z-10 border-b border-outline-variant">
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">{title}</h3>
          <button onClick={onClose} className="p-xs rounded-lg hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px] text-outline">close</span>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function Contenu() {
  const { token } = useAuth();
  const [tab, setTab] = useState("sections");
  const [services, setServices] = useState([]);
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState("hero");

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    icon: "",
    actionText: "",
    actionLink: "",
    published: true,
  });

  const [textForm, setTextForm] = useState({
    section: "hero",
    content: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/content", { token });
      const items = Array.isArray(data) ? data : [];
      setServices(items.filter((item) => item.type === "service"));
      setTexts(items.filter((item) => item.type === "text"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const currentSection = texts.find((item) => item.section === selectedSection);

  const openNewService = () => {
    setEditingItem(null);
    setServiceForm({ title: "", description: "", icon: "", actionText: "", actionLink: "", published: true });
    setModalOpen(true);
  };

  const openEditService = (srv) => {
    setEditingItem(srv);
    setServiceForm({
      title: srv.title || "",
      description: srv.description || "",
      icon: srv.icon || "",
      actionText: srv.actionText || "",
      actionLink: srv.actionLink || "",
      published: srv.published ?? true,
    });
    setModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiFetch(`/content/${editingItem.id}`, { method: "PUT", body: serviceForm, token });
      } else {
        await apiFetch("/content", { method: "POST", body: { ...serviceForm, type: "service" }, token });
      }
      setModalOpen(false);
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteService = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer ce service ?")) return;
    try {
      await apiFetch(`/content/${id}`, { method: "DELETE", token });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleTogglePublish = async (id, currentStatus, e) => {
    e.stopPropagation();
    try {
      await apiFetch(`/content/services/${id}`, { method: "PUT", body: { published: !currentStatus }, token });
      loadData();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const openSectionEditor = (key) => {
    const section = texts.find((item) => item.section === key) || null;
    setSelectedSection(key);
    setEditingItem(section);
    setTextForm({ section: key, content: section?.content || "" });
    setModalOpen(true);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiFetch(`/content/${editingItem.id}`, { method: "PUT", body: { section: textForm.section, content: textForm.content }, token });
      } else {
        await apiFetch("/content/texts", { method: "POST", body: { ...textForm, type: "text" }, token });
      }
      setModalOpen(false);
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteText = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer cette section ?")) return;
    try {
      await apiFetch(`/content/${id}`, { method: "DELETE", token });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-lg p-lg animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Contenu du site</h1>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
            Éditez les sections du site client et gérez les cartes de services affichées sur la vitrine.
          </p>
        </div>
        <button onClick={() => (tab === "services" ? openNewService() : openSectionEditor(selectedSection))} className="btn-primary gap-xs w-fit">
          <span className="material-symbols-outlined text-[18px]">add</span>
          {tab === "services" ? "Nouveau Service" : "Modifier une section"}
        </button>
      </div>

      <div className="flex gap-md border-b border-outline-variant">
        <button
          onClick={() => setTab("sections")}
          className={clsx(
            "pb-sm px-sm font-semibold transition-colors border-b-2",
            tab === "sections" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          )}
        >
          Sections du site
        </button>
        <button
          onClick={() => setTab("services")}
          className={clsx(
            "pb-sm px-sm font-semibold transition-colors border-b-2",
            tab === "services" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          )}
        >
          Cartes de services
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">
          Chargement...
        </div>
      ) : (
        <div className="grid gap-lg">
          {tab === "sections" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                {SITE_SECTIONS.map((section) => {
                  const saved = texts.some((item) => item.section === section.key);
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => openSectionEditor(section.key)}
                      className="text-left rounded-xl border border-outline-variant bg-surface-container-lowest p-md hover:border-primary/70 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-sm mb-xs">
                        <span className="font-semibold text-on-surface">{section.label}</span>
                        <span className={clsx("badge", saved ? "badge-success" : "badge-secondary")}>{saved ? "Défini" : "À définir"}</span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">{section.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
                <h2 className="text-headline-sm text-on-surface font-semibold mb-sm">Sections enregistrées</h2>
                {texts.length === 0 ? (
                  <div className="text-center py-xl text-on-surface-variant">Aucune section texte encore enregistrée.</div>
                ) : (
                  <div className="grid gap-sm">
                    {texts.map((txt) => (
                      <div
                        key={txt.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-md rounded-lg border border-outline-variant p-md bg-surface"
                      >
                        <div>
                          <p className="font-semibold text-on-surface">{txt.section}</p>
                          <p className="text-body-sm text-on-surface-variant line-clamp-2">{txt.content}</p>
                        </div>
                        <div className="flex gap-sm">
                          <button onClick={() => openEditText(txt)} className="btn-secondary">Modifier</button>
                          <button onClick={(e) => handleDeleteText(txt.id, e)} className="btn-outline text-error">Supprimer</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "services" && (
            services.length === 0 ? (
              <div className="text-center py-xl border border-dashed border-outline-variant rounded-xl">
                <span className="material-symbols-outlined text-[48px] text-outline-variant opacity-50 block mb-md">design_services</span>
                <p className="text-body-md text-on-surface-variant">Aucun service défini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                {services.map((srv) => (
                  <div key={srv.id} onClick={() => openEditService(srv)} className="card hover:border-primary/50 cursor-pointer transition-colors relative group">
                    <div className="flex justify-between items-start mb-sm">
                      <span className="material-symbols-outlined text-[32px] text-primary bg-primary-container/20 p-sm rounded-lg">
                        {srv.icon || "category"}
                      </span>
                      <span className={clsx("badge", srv.published ? "badge-success" : "badge-warning")}>{srv.published ? "Publié" : "Brouillon"}</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{srv.title}</h3>
                    <p className="text-body-sm text-on-surface-variant line-clamp-3 mb-md">{srv.description}</p>
                    <div className="flex items-center gap-xs text-label-sm font-semibold text-primary">
                      {srv.actionText || "En savoir plus"} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleTogglePublish(srv.id, srv.published, e)} className="p-xs bg-surface shadow-sm rounded text-primary hover:bg-primary-container">
                        <span className="material-symbols-outlined text-[18px]">{srv.published ? "visibility_off" : "visibility"}</span>
                      </button>
                      <button onClick={(e) => handleDeleteService(srv.id, e)} className="p-xs bg-surface shadow-sm rounded text-error hover:bg-error-container">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {tab === "services" && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Modifier le service" : "Nouveau service"}>
          <form onSubmit={handleServiceSubmit} className="space-y-md pb-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="md:col-span-2">
                <label className="block text-label-md text-on-surface-variant mb-xs">Titre du service *</label>
                <input
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Lavage & Entretien Auto"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Icône (Material Symbol) *</label>
                <input
                  required
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  className="input-field"
                  placeholder="Ex: cleaning_services"
                />
              </div>
              <div className="row-span-2 md:col-span-2">
                <label className="block text-label-md text-on-surface-variant mb-xs">Description *</label>
                <textarea
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Description de l'offre..."
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Texte d'action</label>
                <input
                  value={serviceForm.actionText}
                  onChange={(e) => setServiceForm({ ...serviceForm, actionText: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Demander un devis"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Lien d'action</label>
                <input
                  value={serviceForm.actionLink}
                  onChange={(e) => setServiceForm({ ...serviceForm, actionLink: e.target.value })}
                  className="input-field"
                  placeholder="Ex: /devis/lavage-auto"
                />
              </div>
            </div>
            <label className="flex items-center gap-sm cursor-pointer mt-sm">
              <input
                type="checkbox"
                checked={serviceForm.published}
                onChange={(e) => setServiceForm({ ...serviceForm, published: e.target.checked })}
                className="w-4 h-4 text-primary bg-surface-container-low border-outline rounded"
              />
              <span className="text-body-md text-on-surface">Publier la carte sur le site</span>
            </label>
            <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn-primary gap-xs">
                <span className="material-symbols-outlined text-[18px]">save</span>Enregistrer
              </button>
            </div>
          </form>
        </Modal>
      )}

      {tab === "sections" && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Modifier la section texte" : "Ajouter une section texte"}>
          <form onSubmit={handleTextSubmit} className="space-y-md pb-lg">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs">Section</label>
              <input
                required
                disabled
                value={textForm.section}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs">Contenu *</label>
              <textarea
                required
                value={textForm.content}
                onChange={(e) => setTextForm({ ...textForm, content: e.target.value })}
                rows={10}
                className="input-field resize-none font-mono"
                placeholder="Rédigez le texte ici... (JSON autorisé pour les sections structurées)"
              />
            </div>
            <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn-primary gap-xs">
                <span className="material-symbols-outlined text-[18px]">save</span>Enregistrer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
