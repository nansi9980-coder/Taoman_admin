import { useState, useEffect } from "react";
import clsx from "clsx";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-lg sticky top-0 bg-surface pt-4 pb-2 z-10 border-b border-outline-variant">
          <h3 className="font-headline-md text-headline-md">{title}</h3>
          <button onClick={onClose} className="p-xs hover:bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({ client: "", email: "", date: "", time: "09:00", service: "", status: "planifie", notes: "" });

  const loadEvents = async () => {
    try {
      const data = await apiFetch("/appointments", { token });
      setEvents(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date && e.date.startsWith(dateStr));
  };

  const today = new Date();
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const handleOpenNew = (day) => {
    setEditingEvent(null);
    let dateStr = "";
    if (day) {
      dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    setFormData({ client: "", email: "", date: dateStr, time: "09:00", service: "", status: "planifie", notes: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    const dateObj = new Date(evt.date);
    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = String(dateObj.getHours()).padStart(2, '0') + ":" + String(dateObj.getMinutes()).padStart(2, '0');
    setFormData({ client: evt.client || "", email: evt.email || "", date: dateStr, time: timeStr, service: evt.service || "", status: evt.status || "planifie", notes: evt.notes || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const combinedDate = new Date(`${formData.date}T${formData.time}:00`);
      const payload = {
        client: formData.client,
        email: formData.email,
        service: formData.service,
        date: combinedDate.toISOString(),
        status: formData.status,
        notes: formData.notes,
      };

      if (editingEvent) {
        await apiFetch(`/appointments/${editingEvent.id}`, { method: "PUT", body: payload, token });
      } else {
        await apiFetch("/appointments", { method: "POST", body: payload, token });
      }
      setModalOpen(false);
      loadEvents();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await apiFetch(`/appointments/${id}`, { method: "DELETE", token });
      loadEvents();
      setModalOpen(false);
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-lg p-lg animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display font-bold">Calendrier</h1>
          <p className="text-body-md text-on-surface-variant mt-sm">Gérez vos rendez-vous clients.</p>
        </div>
        <button onClick={() => handleOpenNew(selectedDate || null)} className="btn-primary gap-xs">
          <span className="material-symbols-outlined text-[18px]">add</span>Nouveau RDV
        </button>
      </div>

      {loading && <div className="p-md text-primary bg-primary/10 rounded">Chargement du calendrier...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="text-headline-md font-semibold capitalize">{monthName}</h2>
            <div className="flex gap-sm">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-sm rounded-lg hover:bg-surface-container-low">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-sm rounded-lg hover:bg-surface-container-low">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-xs mb-md">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div key={day} className="text-center text-label-md font-semibold text-on-surface-variant">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-xs">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDate(day);
              const isTodayDate = isToday(day);
              const isSelected = selectedDate === day;

              return (
                <button
                  key={idx}
                  onClick={() => day && setSelectedDate(day)}
                  className={clsx(
                    "p-xs min-h-[100px] rounded-lg border transition-colors text-left",
                    !day ? "bg-transparent border-transparent" :
                    isSelected ? "bg-primary/20 border-primary" :
                    isTodayDate ? "bg-primary/5 border-primary" : "bg-surface-container-low border-outline-variant hover:bg-surface-container-high"
                  )}
                >
                  {day && (
                    <div>
                      <p className={clsx("font-semibold text-body-sm mb-xs", (isTodayDate || isSelected) ? "text-primary" : "text-on-surface")}>
                        {day}
                      </p>
                      <div className="space-y-xs overflow-y-auto max-h-[60px]">
                        {dayEvents.map((event) => (
                          <div key={event.id} className="text-[10px] px-1 py-0.5 rounded truncate bg-primary text-on-primary">
                            {new Date(event.date).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })} - {event.title || event.client}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
          <div className="flex justify-between items-center mb-md">
            <h3 className="text-headline-md font-semibold">
              {selectedDate ? `${selectedDate} ${monthName}` : "Sélectionnez une date"}
            </h3>
            {selectedDate && (
              <button onClick={() => handleOpenNew(selectedDate)} className="p-xs bg-primary/10 text-primary rounded hover:bg-primary/20" title="Ajouter ici">
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            )}
          </div>

          <div className="space-y-sm max-h-96 overflow-y-auto pr-1">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => (
                <div key={event.id} onClick={() => handleOpenEdit(event)} className="p-md rounded-lg bg-surface-container-low border border-outline-variant cursor-pointer hover:border-primary transition-colors group relative">
                  <div className="flex justify-between items-start mb-xs">
                    <span className="text-label-sm font-semibold text-primary">
                      {new Date(event.date).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={clsx("badge", event.status === 'planifie' ? 'badge-warning' : event.status === 'termine' ? 'badge-success' : 'badge-error')}>
                      {event.status}
                    </span>
                  </div>
                  <h4 className="text-body-sm font-bold text-on-surface mb-xs">{event.title || event.client}</h4>
                  <p className="text-label-sm text-on-surface-variant mb-xs line-clamp-1">{event.service}</p>
                  {event.notes && <p className="text-[11px] text-on-surface-variant/70 line-clamp-2 mt-xs italic">{event.notes}</p>}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleDelete(event.id, e)} className="p-1 rounded text-error hover:bg-error-container">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-on-surface-variant text-center py-md">Aucun rendez-vous ce jour</p>
            )}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingEvent ? "Modifier le Rendez-vous" : "Nouveau Rendez-vous"}>
        <form onSubmit={handleSubmit} className="space-y-md pb-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs">Client *</label>
              <input required value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} className="input-field" placeholder="Nom du client" />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-field" placeholder="email@client.com" />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs">Date *</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs">Heure *</label>
              <input required type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs">Service concerné</label>
              <input value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} className="input-field" placeholder="Ex: Nettoyage" />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs">Statut</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="input-field">
                <option value="planifie">Planifié</option>
                <option value="confirme">Confirmé</option>
                <option value="annule">Annulé</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Notes supplémentaires</label>
            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} className="input-field resize-none" placeholder="Détails du rdv..." />
          </div>
          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary gap-xs">
              <span className="material-symbols-outlined text-[18px]">save</span>Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}