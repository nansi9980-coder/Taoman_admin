import { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export default function Contact() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/contacts", { token });
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement contacts:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteContact = async (id) => {
    if (!confirm("Supprimer cette demande de contact ?")) return;
    try {
      await apiFetch(`/contacts/${id}`, { method: "DELETE", token });
      setContacts(prev => prev.filter(c => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    } catch (err) {
      alert("Erreur suppression: " + err.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-lg p-lg">
      {/* Contacts Sidebar */}
      <div className="w-80 flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] overflow-hidden">
        {/* Header */}
        <div className="p-md border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef] mb-sm">
            Demandes de Contact
          </h2>
          <input
            type="text"
            placeholder="Chercher un contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={clsx(
              "w-full px-md py-sm rounded-lg border border-outline-variant",
              "bg-surface-container-low dark:bg-[#282a36] text-on-surface dark:text-[#e4e4ef]",
              "focus:outline-none focus:border-primary"
            )}
          />
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-md text-center text-outline">Chargement...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-md text-center text-outline">
              {searchQuery ? "Aucun contact trouvé" : "Aucune demande de contact"}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={clsx(
                  "w-full p-md border-b border-outline-variant text-left transition-colors duration-150",
                  selectedContact?.id === contact.id
                    ? "bg-primary-fixed dark:bg-[#0040a2]"
                    : "hover:bg-surface-container-low dark:hover:bg-[#282a36]"
                )}
              >
                <div className="flex items-center justify-between mb-xs">
                  <h3 className={clsx(
                    "font-semibold text-body-sm truncate",
                    selectedContact?.id === contact.id
                      ? "text-primary dark:text-[#b2c5ff]"
                      : "text-on-surface dark:text-[#e4e4ef]"
                  )}>
                    {contact.name}
                  </h3>
                  <span className="text-label-sm text-outline">
                    {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className={clsx(
                  "text-label-sm truncate mb-xs",
                  selectedContact?.id === contact.id
                    ? "text-primary dark:text-[#b2c5ff]"
                    : "text-outline"
                )}>
                  {contact.subject}
                </p>
                <p className={clsx(
                  "text-label-sm truncate",
                  selectedContact?.id === contact.id
                    ? "text-primary dark:text-[#b2c5ff]"
                    : "text-outline"
                )}>
                  {contact.email}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Contact Detail */}
      <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] overflow-hidden">
        {selectedContact ? (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef]">
                  {selectedContact.name}
                </h2>
                <p className="text-body-sm text-outline">{selectedContact.email}</p>
                <p className="text-label-sm text-outline">
                  Reçu le {new Date(selectedContact.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => handleDeleteContact(selectedContact.id)}
                className="btn-danger gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Supprimer
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-lg overflow-y-auto">
              <div className="space-y-lg">
                {/* Subject */}
                <div>
                  <h3 className="font-semibold text-body-md text-on-surface dark:text-[#e4e4ef] mb-sm">
                    Sujet: {selectedContact.subject}
                  </h3>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-md">
                  <div className="p-md bg-surface-container-low dark:bg-[#282a36] rounded-lg">
                    <p className="text-label-sm text-outline mb-xs">Téléphone</p>
                    <p className="text-body-sm text-on-surface dark:text-[#e4e4ef]">
                      {selectedContact.phone || "Non fourni"}
                    </p>
                  </div>
                  <div className="p-md bg-surface-container-low dark:bg-[#282a36] rounded-lg">
                    <p className="text-label-sm text-outline mb-xs">Email</p>
                    <p className="text-body-sm text-on-surface dark:text-[#e4e4ef]">
                      {selectedContact.email}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h3 className="font-semibold text-body-md text-on-surface dark:text-[#e4e4ef] mb-sm">
                    Message
                  </h3>
                  <div className="p-md bg-surface-container-low dark:bg-[#282a36] rounded-lg">
                    <p className="text-body-sm text-on-surface dark:text-[#e4e4ef] whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-sm pt-md border-t border-outline-variant">
                  <button className="btn-primary gap-xs">
                    <span className="material-symbols-outlined text-[18px]">email</span>
                    Répondre par email
                  </button>
                  <button className="btn-secondary gap-xs">
                    <span className="material-symbols-outlined text-[18px]">phone</span>
                    Appeler
                  </button>
                  <button className="btn-secondary gap-xs">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Créer client
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-[64px] text-outline mb-md">contact_mail</span>
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#e4e4ef] mb-sm">
                Sélectionnez une demande de contact
              </h3>
              <p className="text-body-sm text-outline">
                Cliquez sur une demande dans la liste pour voir les détails
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}