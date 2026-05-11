import { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Rapports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const generateReport = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/generate/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erreur génération');

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