import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

export default function Debug() {
  const { token } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Test 1: Realisations endpoint
        const realRes = await apiFetch('/realisations', { token });
        console.log('Realisations endpoint:', realRes);
        
        // Test 2: Media endpoint
        const mediaRes = await apiFetch('/media', { token });
        console.log('Media endpoint:', mediaRes);
        
        // Test 3: SiteContent endpoint
        const siteRes = await apiFetch('/content/texts/realisations', { token });
        console.log('SiteContent realisations:', siteRes);
        
        setData({
          realisations: realRes,
          media: Array.isArray(mediaRes) ? mediaRes.filter(m => m.category === 'realisation') : [],
          siteContent: siteRes,
        });
      } catch (e) {
        console.error('Error:', e);
        setData({ error: e.message });
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchData();
  }, [token]);

  return (
    <div className="p-lg space-y-lg">
      <h1 className="text-display font-bold">🔧 Debug Realisations</h1>
      
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <div className="bg-surface-container-lowest p-md rounded-lg">
            <h2 className="font-bold mb-md">1️⃣ Realisations Endpoint (/realisations)</h2>
            <pre className="bg-on-surface/5 p-md rounded overflow-auto max-h-64 text-xs">
              {JSON.stringify(data.realisations, null, 2)}
            </pre>
          </div>

          <div className="bg-surface-container-lowest p-md rounded-lg">
            <h2 className="font-bold mb-md">2️⃣ Media Realisation ({data.media?.length || 0} images)</h2>
            <pre className="bg-on-surface/5 p-md rounded overflow-auto max-h-64 text-xs">
              {JSON.stringify(data.media, null, 2)}
            </pre>
          </div>

          <div className="bg-surface-container-lowest p-md rounded-lg">
            <h2 className="font-bold mb-md">3️⃣ SiteContent Realisations</h2>
            <pre className="bg-on-surface/5 p-md rounded overflow-auto max-h-64 text-xs">
              {JSON.stringify(data.siteContent, null, 2)}
            </pre>
          </div>

          <div className="bg-blue-100 border border-blue-400 p-md rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">📋 Checklist:</h3>
            <ul className="text-sm text-blue-900 space-y-1">
              <li>✓ Avez-vous uploadé les images dans Médiathèque?</li>
              <li>✓ Catégorie est "realisation"?</li>
              <li>✓ Avez-vous cliqué "Synchroniser les images"?</li>
              <li>✓ Avez-vous redémarré le backend?</li>
              <li>✓ Le token est valide?</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
