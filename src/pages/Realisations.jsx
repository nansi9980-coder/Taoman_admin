import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const REALISATION_CATEGORIES = [
  'Logistique',
  'Transport',
  'Lavage Auto',
  'Équipe terrain',
  'Agro & Commerce',
  'BTP & Infrastructure',
  'Agro Business',
  'Numérique',
];

export default function Realisations() {
  const { token } = useAuth();
  const [realisations, setRealisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIdx, setEditingIdx] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    progress: 70,
    imageUrl: '',
  });
  const [mediaList, setMediaList] = useState([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  const loadRealisations = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/content/texts/realisations', { token });
      console.log('Realisations response:', response);
      
      if (response?.content) {
        let items = response.content;
        if (typeof items === 'string') {
          items = JSON.parse(items);
        }
        const realList = items?.items || [];
        console.log('Loaded realisations:', realList);
        setRealisations(realList);
      } else {
        setRealisations([]);
      }
    } catch (e) {
      console.error('Erreur lors du chargement des réalisations:', e);
      setRealisations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const data = await apiFetch('/media', { token });
      if (Array.isArray(data)) {
        const realisationImages = data.filter(m => m.category === 'realisation');
        console.log('Media images:', realisationImages);
        setMediaList(realisationImages);
      }
    } catch (e) {
      console.error('Erreur lors du chargement des médias:', e);
    }
  };

  useEffect(() => {
    if (token) {
      loadRealisations();
      loadMedia();
    }
  }, [token]);

  const handleEdit = (idx) => {
    const realisation = realisations[idx];
    setEditingIdx(idx);
    setFormData({
      title: realisation?.title || '',
      category: realisation?.category || '',
      progress: realisation?.progress || 70,
      imageUrl: realisation?.imageUrl || '',
    });
  };

  const handleSave = async () => {
    try {
      const updatedItems = realisations.map((item, idx) => 
        idx === editingIdx ? { ...item, ...formData } : item
      );
      
      const payload = {
        section: 'realisations',
        content: { items: updatedItems },
      };
      
      console.log('Saving payload:', payload);
      
      await apiFetch('/content/texts', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });
      
      setEditingIdx(null);
      setFormData({ title: '', category: '', progress: 70, imageUrl: '' });
      await loadRealisations();
      alert('Réalisation enregistrée avec succès!');
    } catch (e) {
      console.error('Erreur lors de la sauvegarde:', e);
      alert('Erreur lors de la sauvegarde : ' + e.message);
    }
  };

  const handleCancel = () => {
    setEditingIdx(null);
    setFormData({ title: '', category: '', progress: 70, imageUrl: '' });
  };

  const handleSelectMedia = (media) => {
    setFormData(prev => ({ ...prev, imageUrl: media.url }));
    setShowMediaSelector(false);
  };

  return (
    <div className="space-y-lg p-lg animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Réalisations terrain</h1>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
            Gérez les réalisations, les catégories et les images du carrousel.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">
          Chargement des réalisations...
        </div>
      ) : (
        <div className="grid gap-md">
          {realisations.length === 0 ? (
            <div className="text-center py-xl border border-dashed border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-[48px] text-outline-variant opacity-50 block mb-md">
                image
              </span>
              <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2]">Aucune réalisation disponible</p>
              <p className="text-label-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
                Les réalisations s'affichent après avoir ajouté des images dans la Médiathèque avec la catégorie "Réalisations terrain"
              </p>
            </div>
          ) : (
            realisations.map((realisation, idx) => (
              <div key={idx} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
                {editingIdx === idx ? (
                  // Mode édition
                  <div className="space-y-md">
                    <div>
                      <label className="text-label-md font-bold text-on-surface mb-xs block">Titre</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="input-field w-full"
                        placeholder="Ex: Conducteur TAOMAN 01"
                      />
                    </div>
                    <div>
                      <label className="text-label-md font-bold text-on-surface mb-xs block">Catégorie</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="input-field w-full"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {REALISATION_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-label-md font-bold text-on-surface mb-xs block">Progression (%)</label>
                      <div className="flex items-center gap-md">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={e => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                          className="flex-1"
                        />
                        <span className="text-label-lg font-bold text-on-surface min-w-[50px]">{formData.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-label-md font-bold text-on-surface mb-xs block">Image</label>
                      <div className="flex items-center gap-sm">
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className="input-field flex-1"
                          placeholder="URL de l'image"
                        />
                        <button
                          onClick={() => setShowMediaSelector(true)}
                          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-container transition-colors"
                        >
                          Parcourir
                        </button>
                      </div>
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-md">
                        <img src={formData.imageUrl} alt="Aperçu" className="w-full h-40 object-cover rounded-lg" />
                      </div>
                    )}
                    <div className="flex gap-sm pt-md">
                      <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors font-bold"
                      >
                        ✓ Enregistrer
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 bg-surface-container text-on-surface rounded-lg hover:bg-surface-container-high transition-colors font-bold"
                      >
                        ✕ Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div className="flex items-start gap-md">
                    {realisation?.imageUrl && (
                      <img src={realisation.imageUrl} alt={realisation.title} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body-lg font-bold text-on-surface truncate">{realisation.title || 'Sans titre'}</h3>
                      <div className="flex items-center gap-sm mt-xs flex-wrap">
                        {realisation.category && (
                          <span className="text-label-sm px-2 py-0.5 rounded bg-secondary-container text-secondary">
                            {realisation.category}
                          </span>
                        )}
                        <span className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">
                          Progression: {realisation.progress || 70}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(idx)}
                      className="p-xs text-primary hover:bg-primary-container rounded-lg transition-colors flex-shrink-0"
                      title="Modifier"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Sélecteur de médias */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg p-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-md">
              <h2 className="text-display text-on-surface font-bold">Sélectionner une image</h2>
              <button
                onClick={() => setShowMediaSelector(false)}
                className="text-2xl text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            {mediaList.length === 0 ? (
              <p className="text-center py-xl text-on-surface-variant">
                Aucune image disponible. Veuillez en télécharger dans la Médiathèque avec la catégorie "Réalisations terrain".
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                {mediaList.map(media => (
                  <button
                    key={media.id}
                    onClick={() => handleSelectMedia(media)}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-outline-variant hover:border-primary transition-colors cursor-pointer"
                    type="button"
                  >
                    <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
