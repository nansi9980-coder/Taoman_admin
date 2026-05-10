import { useState, useEffect } from "react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

export default function Jobs() {
  const { jobs, fetchJobs, loading, error } = useApp();
  const { token } = useAuth();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "", category: "", description: "", skills: "", location: "", type: "Temps plein", startDate: "", endDate: "", published: true
  });

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleOpenNew = () => {
    setEditingJob(null);
    setFormData({ title: "", category: "", description: "", skills: "", location: "", type: "Temps plein", startDate: "", endDate: "", published: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || "",
      category: job.category || "",
      description: job.description || "",
      skills: job.skills || "",
      location: job.location || "",
      type: job.type || "Temps plein",
      startDate: job.startDate ? new Date(job.startDate).toISOString().split('T')[0] : "",
      endDate: job.endDate ? new Date(job.endDate).toISOString().split('T')[0] : "",
      published: job.published ?? true
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;

      if (editingJob) {
        await apiFetch(`/jobs/${editingJob.id}`, { method: "PUT", body: payload, token });
      } else {
        await apiFetch("/jobs", { method: "POST", body: payload, token });
      }
      await fetchJobs();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erreur: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Voulez-vous vraiment supprimer cette offre ?")) return;
    try {
      await apiFetch(`/jobs/${id}`, { method: "DELETE", token });
      await fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Erreur: " + err.message);
    }
  };

  const handleTogglePublish = async (id, currentStatus, e) => {
    e.stopPropagation();
    try {
      await apiFetch(`/jobs/${id}`, { method: "PUT", body: { published: !currentStatus }, token });
      await fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Erreur: " + err.message);
    }
  };

  return (
    <div className="space-y-lg p-lg animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Offres d'emploi</h1>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
            Gérez vos offres de recrutement publiées sur le site client.
          </p>
        </div>
        <button onClick={handleOpenNew} className="btn-primary gap-xs w-fit">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nouveau Poste
        </button>
      </div>

      {loading && jobs.length === 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">
          Chargement des offres...
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-error/20 bg-error-container/10 p-md text-error">
          Erreur : {error}
        </div>
      )}

      {/* Jobs List */}
      <div className="grid gap-md">
        {jobs.length === 0 && !loading ? (
          <div className="text-center py-xl border border-dashed border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-[48px] text-outline-variant opacity-50 block mb-md">
              work_off
            </span>
            <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2]">Aucune offre trouvée</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleOpenEdit(job)}
              className={clsx(
                "p-md rounded-lg border border-outline-variant transition-colors duration-150 cursor-pointer",
                "bg-surface-container-lowest dark:bg-[#1e1f2a] hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between gap-md">
                <div className="flex-1">
                  <div className="flex items-center gap-sm mb-xs">
                    <h3 className="text-body-lg font-semibold text-on-surface dark:text-[#e4e4ef]">{job.title}</h3>
                    <span className={clsx("badge", job.published ? "badge-success" : "badge-warning")}>
                      {job.published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                  <p className="text-label-sm text-outline mb-sm">{job.category} • {job.type} • {job.location}</p>
                  <p className="text-body-sm text-on-surface-variant dark:text-[#c4c6d6] line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex items-center gap-sm mt-sm">
                    {job.skills && job.skills.split(",").map(s => s.trim()).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-surface-container rounded-md text-[11px] font-mono text-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-sm">
                  <button 
                    onClick={(e) => handleTogglePublish(job.id, job.published, e)}
                    className="p-xs rounded text-primary hover:bg-primary-container transition-colors"
                    title={job.published ? "Dépublier" : "Publier"}
                  >
                    <span className="material-symbols-outlined text-[20px]">{job.published ? "visibility_off" : "visibility"}</span>
                  </button>
                  <button 
                    onClick={(e) => handleDelete(job.id, e)}
                    className="p-xs rounded text-error hover:bg-error-container transition-colors"
                    title="Supprimer"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingJob ? "Modifier le poste" : "Nouveau poste"}>
        <form onSubmit={handleSubmit} className="space-y-md pb-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Titre du poste *</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" placeholder="Ex: Développeur React" />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Catégorie</label>
              <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field" placeholder="Ex: Informatique" />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Type de contrat</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input-field">
                <option>Temps plein</option>
                <option>Temps partiel</option>
                <option>Freelance</option>
                <option>Stage</option>
              </select>
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Lieu</label>
              <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input-field" placeholder="Ex: Lomé, Togo ou Télétravail" />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Date de début</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Date de fin</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="input-field" />
            </div>
          </div>
          
          <div>
            <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Compétences (séparées par une virgule)</label>
            <input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="input-field" placeholder="Ex: React, Node.js, CSS" />
          </div>

          <div>
            <label className="block text-label-md text-on-surface-variant dark:text-[#8e90a2] mb-xs">Description *</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={6} className="input-field resize-none" placeholder="Décrivez les missions et responsabilités..." />
          </div>

          <label className="flex items-center gap-sm cursor-pointer">
            <input type="checkbox" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="w-4 h-4 text-primary bg-surface-container-low border-outline rounded" />
            <span className="text-body-md text-on-surface dark:text-[#e4e4ef]">Publier immédiatement</span>
          </label>

          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={submitting} className="btn-primary gap-xs">
              {submitting ? (
                <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Enregistrement...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">save</span>Enregistrer</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
