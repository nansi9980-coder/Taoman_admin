import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import clsx from "clsx";

const SITE_SECTIONS = [
  { key: "hero", emoji: "🏠", label: "Section Hero", description: "Titre principal et boutons" },
  { key: "about", emoji: "🏢", label: "À propos", description: "Description de l'entreprise" },
  { key: "statistics", emoji: "📊", label: "Statistiques", description: "Chiffres clés" },
  { key: "cta", emoji: "📣", label: "Bannière CTA", description: "Appel à l'action principal" },
  { key: "faq", emoji: "❓", label: "FAQ", description: "Questions fréquentes" },
  { key: "footer", emoji: "🔗", label: "Footer", description: "Pied de page" },
  { key: "contact", emoji: "📞", label: "Page Contact", description: "Informations de contact" },
  { key: "seo", emoji: "🔍", label: "SEO", description: "Titres et descriptions" },
];

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
    content: {},
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
    setTextForm({ section: key, content: section?.content || {} });
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

  return (
    <div className="space-y-lg p-lg animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Contenu du site</h1>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
            Modifiez les textes et contenus affichés sur le site vitrine
          </p>
        </div>
        <a
          href="https://taoman-platforme.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary gap-xs w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          Voir le site
        </a>
      </div>

      {/* Explanatory text */}
      <p className="text-body-md text-on-surface-variant">
        Les modifications sont appliquées <strong>immédiatement</strong> sur le site vitrine après sauvegarde. Cliquez sur une section pour la modifier.
      </p>

      {/* Avis clients link */}
      <a
        href="/temoignages"
        className="inline-flex items-center gap-md p-md rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary/50 transition-colors w-fit"
      >
        <span className="text-2xl">💬</span>
        <div>
          <p className="font-semibold text-on-surface">Avis clients</p>
          <p className="text-body-sm text-on-surface-variant">Ajouter, modifier ou supprimer des témoignages</p>
        </div>
        <span className="material-symbols-outlined text-outline">arrow_forward</span>
      </a>

      {/* Sections grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {SITE_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => openSectionEditor(section.key)}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-muted/30 transition-colors rounded-xl border border-outline-variant"
          >
            <span className="text-2xl">{section.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-on-surface">{section.label}</p>
              <p className="text-body-sm text-on-surface-variant">{section.description}</p>
            </div>
            <span className="material-symbols-outlined text-outline">edit</span>
          </button>
        ))}
      </div>

      {/* Services section */}
      <div className="mt-xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-md">
          <div>
            <h2 className="text-headline-lg text-on-surface dark:text-[#e4e4ef] font-bold">Cartes de services</h2>
            <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
              Gérez les cartes de services affichées sur la page d'accueil
            </p>
          </div>
          <button onClick={openNewService} className="btn-primary gap-xs w-fit">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nouveau service
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">
            Chargement...
          </div>
        ) : services.length === 0 ? (
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
        )}
      </div>

      {/* Section Modal */}
      {modalOpen && editingItem && editingItem.type === "text" && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Modifier ${SITE_SECTIONS.find(s => s.key === selectedSection)?.label || selectedSection}`}>
          <form onSubmit={handleTextSubmit} className="space-y-md pb-lg">
            {selectedSection === "hero" && (
              <div className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Titre (Français)</label>
                    <input
                      required
                      value={textForm.content?.titleFr || ""}
                      onChange={(e) => setTextForm({...textForm, content: {...textForm.content, titleFr: e.target.value}})}
                      className="input-field"
                      placeholder="Titre principal"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Titre (Anglais)</label>
                    <input
                      value={textForm.content?.titleEn || ""}
                      onChange={(e) => setTextForm({...textForm, content: {...textForm.content, titleEn: e.target.value}})}
                      className="input-field"
                      placeholder="Main title"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Sous-titre</label>
                  <textarea
                    value={textForm.content?.subtitle || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, subtitle: e.target.value}})}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Description principale"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Bouton principal</label>
                    <input
                      value={textForm.content?.primaryButton || ""}
                      onChange={(e) => setTextForm({...textForm, content: {...textForm.content, primaryButton: e.target.value}})}
                      className="input-field"
                      placeholder="Texte du bouton"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Bouton secondaire</label>
                    <input
                      value={textForm.content?.secondaryButton || ""}
                      onChange={(e) => setTextForm({...textForm, content: {...textForm.content, secondaryButton: e.target.value}})}
                      className="input-field"
                      placeholder="Texte du bouton"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Badge / étiquette</label>
                  <input
                    value={textForm.content?.badge || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, badge: e.target.value}})}
                    className="input-field"
                    placeholder="Texte du badge"
                  />
                </div>
              </div>
            )}

            {selectedSection === "about" && (
              <div className="space-y-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Titre</label>
                  <input
                    required
                    value={textForm.content?.title || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, title: e.target.value}})}
                    className="input-field"
                    placeholder="Titre de la section"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Description</label>
                  <textarea
                    required
                    value={textForm.content?.description || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, description: e.target.value}})}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Description de l'entreprise"
                  />
                </div>
              </div>
            )}

            {selectedSection === "statistics" && (
              <div className="space-y-md">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-md p-md border border-outline-variant rounded-lg">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-xs">Valeur {index + 1}</label>
                      <input
                        value={textForm.content?.[`value${index}`] || ""}
                        onChange={(e) => setTextForm({...textForm, content: {...textForm.content, [`value${index}`]: e.target.value}})}
                        className="input-field"
                        placeholder="500+"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-xs">Label {index + 1}</label>
                      <input
                        value={textForm.content?.[`label${index}`] || ""}
                        onChange={(e) => setTextForm({...textForm, content: {...textForm.content, [`label${index}`]: e.target.value}})}
                        className="input-field"
                        placeholder="Foyers raccordés"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedSection === "cta" && (
              <div className="space-y-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Titre</label>
                  <input
                    required
                    value={textForm.content?.title || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, title: e.target.value}})}
                    className="input-field"
                    placeholder="Titre de l'appel à l'action"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Sous-titre</label>
                  <textarea
                    value={textForm.content?.subtitle || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, subtitle: e.target.value}})}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Description de l'appel à l'action"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Texte du bouton</label>
                  <input
                    value={textForm.content?.buttonText || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, buttonText: e.target.value}})}
                    className="input-field"
                    placeholder="Texte du bouton d'action"
                  />
                </div>
              </div>
            )}

            {selectedSection === "footer" && (
              <div className="space-y-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Description</label>
                  <textarea
                    required
                    value={textForm.content?.description || ""}
                    onChange={(e) => setTextForm({...textForm, content: {...textForm.content, description: e.target.value}})}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Texte du footer"
                  />
                </div>
              </div>
            )}

            {(selectedSection === "contact" || selectedSection === "seo") && (
              <div className="text-center py-xl">
                <p className="text-body-md text-on-surface-variant">Contenu complexe — non éditable visuellement.</p>
              </div>
            )}

            <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn-primary gap-xs">
                <span className="material-symbols-outlined text-[18px]">save</span>Sauvegarder
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Service Modal */}
      {modalOpen && editingItem && editingItem.type === "service" && (
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
    </div>
  );
}
