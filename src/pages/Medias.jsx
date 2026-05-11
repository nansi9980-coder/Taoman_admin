import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch, buildUrl } from "../utils/api";
import clsx from "clsx";

export default function Medias() {
  const { fetchMediaLibrary, uploadMedia } = useApp();
  const { token } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("general");
  const [loading, setLoading] = useState(true);

  const loadMedia = () => {
    setLoading(true);
    fetchMediaLibrary().then((data) => {
      if (Array.isArray(data)) {
        setMediaItems(data.map((item) => ({
          id: item.id ?? item._id,
          name: item.name || item.filename || item.title || "Fichier",
          type: item.type || item.mimetype || "media",
          size: item.size ? (typeof item.size === "number" ? `${item.size} MB` : item.size) : "—",
          category: item.category || "general",
          url: item.url,
          uploadedAt: item.uploadedAt || item.createdAt ? new Date(item.uploadedAt || item.createdAt).toLocaleString("fr-FR") : "—",
        })));
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadMedia();
  }, [fetchMediaLibrary]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadMedia(file, uploadCategory);
    if (result) {
      loadMedia(); // Refresh full list
    }
    setIsUploading(false);
    // Reset file input
    event.target.value = null;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce fichier ?")) return;
    try {
      await apiFetch(`/media/${id}`, { method: "DELETE", token });
      loadMedia();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la suppression : " + e.message);
    }
  };

  return (
    <div className="space-y-lg p-lg animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h1 className="text-display text-on-surface dark:text-[#e4e4ef] font-bold">Médiathèque</h1>
          <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2] mt-sm">
            Gérez vos documents, images et fichiers partagés.
          </p>
        </div>
        
        <div className="flex items-center gap-sm bg-surface-container-low p-sm rounded-lg border border-outline-variant">
          <select 
            value={uploadCategory} 
            onChange={e => setUploadCategory(e.target.value)}
            className="input-field py-1 px-3 min-w-[150px] !m-0"
          >
            <option value="general">Général</option>
            <option value="documents">Documents</option>
            <option value="images">Images</option>
            <option value="contrats">Contrats</option>
          </select>
          <label className={clsx(
            "cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-container transition-colors inline-flex items-center gap-2",
            isUploading && "opacity-50 pointer-events-none"
          )}>
            <span className="material-symbols-outlined">{isUploading ? 'progress_activity' : 'upload'}</span>
            <span className={isUploading ? "animate-pulse" : ""}>{isUploading ? "Envoi..." : "Uploader"}</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-primary/20 bg-primary-container/10 p-md text-primary">
          Chargement de la médiathèque...
        </div>
      ) : (
        <div className="grid gap-md">
          {mediaItems.length === 0 ? (
            <div className="text-center py-xl border border-dashed border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-[48px] text-outline-variant opacity-50 block mb-md">
                folder_open
              </span>
              <p className="text-body-md text-on-surface-variant dark:text-[#8e90a2]">Aucun média disponible</p>
            </div>
          ) : (
            mediaItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md flex items-center justify-between gap-md hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">
                      {item.type.includes("image") ? "image" : item.type.includes("pdf") ? "picture_as_pdf" : "insert_drive_file"}
                    </span>
                  </div>
                  <div>
                    <a href={item.url?.startsWith("http") ? item.url : buildUrl(item.url)} target="_blank" rel="noreferrer" className="text-body-md font-semibold text-primary hover:underline">{item.name}</a>
                    <div className="flex items-center gap-sm mt-xs">
                      <span className="text-label-sm px-2 py-0.5 rounded bg-secondary-container text-secondary">{item.category}</span>
                      <span className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">{item.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-lg text-right">
                  <div className="hidden sm:block">
                    <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">{item.size}</p>
                    <p className="text-label-sm text-on-surface-variant dark:text-[#8e90a2]">{item.uploadedAt}</p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="p-xs text-error hover:bg-error-container rounded-lg transition-colors" title="Supprimer">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
