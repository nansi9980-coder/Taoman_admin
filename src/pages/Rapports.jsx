import { useState } from 'react';
import { buildUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Rapports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const generateReport = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(buildUrl(`/reports/generate/${type}`), {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, notes }),
      });

      if (!response.ok) {
        const text = await response.text();
        const message = text || 'Erreur génération';
        throw new Error(message);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Erreur génération');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${type}-${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Erreur lors de la génération du rapport");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-on-surface">Rapports & Exports</h1>
      <div className="grid gap-6 mb-8 md:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-label-sm text-on-surface-variant">Titre du rapport</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre personnalisé"
              className="input-field w-full mt-2"
            />
          </label>
          <label className="block">
            <span className="text-label-sm text-on-surface-variant">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes ou instructions pour le rapport"
              rows={4}
              className="input-field w-full mt-2 resize-none"
            />
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['quotes', 'clients', 'investments', 'global'].map((type) => (
          <div key={type} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
            <h3 className="font-bold text-xl mb-4 capitalize">{type}</h3>
            <button
              onClick={() => generateReport(type)}
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-container disabled:opacity-50"
            >
              {loading ? 'Génération...' : `Télécharger PDF`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}