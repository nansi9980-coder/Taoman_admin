import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../utils/api";
import { io } from "socket.io-client";

/**
 * AppContext - Global state management
 * Consolidates theme, auth, notifications, and shared data
 */
const AppContext = createContext(null);

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapClient(client) {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone || "",
    service: client.company || "Investissement",
    status: "Actif",
    joined: client.createdAt ? new Date(client.createdAt).toLocaleDateString("fr-FR") : "—",
    dossiers: client.quotes?.length ?? 0,
    note: client.company ? `Entreprise: ${client.company}` : "",
    av: getInitials(client.name),
  };
}

function mapQuote(quote) {
  return {
    id: quote.id,
    client: quote.client?.name || "Client inconnu",
    email: quote.client?.email || "",
    service: quote.title || "Devis",
    priority: "normale",
    status: quote.status || "En attente",
    date: quote.createdAt ? new Date(quote.createdAt).toLocaleDateString("fr-FR") : "—",
    desc: quote.description || "Pas de description disponible.",
    response: quote.description || "",
  };
}

export function AppProvider({ children }) {
  const { token } = useAuth();

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Shared data from API
  const [clients, setClients] = useState([]);
  const [devis, setDevis] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [media, setMedia] = useState([]);
  const [backups, setBackups] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // WebSocket integration
  useEffect(() => {
    if (!token) return;
    const socket = io("http://localhost:3000");
    
    socket.on("newLog", (log) => {
      setLogs((prev) => [log, ...prev]);
    });
    
    socket.on("newNotification", (notif) => {
      // Create a local notification object using addNotification below
      const id = Date.now();
      setNotifications((prev) => [{ id, ...notif, read: false }, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [token]);

  // Notification methods
  const addNotification = useCallback((notif) => {
    const id = Date.now();
    const newNotif = { id, ...notif, read: false };
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
    return id;
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && !n.read ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/notifications", { token });
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
      return list;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Modal methods
  const openModal = useCallback((modalType, data = null) => {
    setActiveModal(modalType);
    setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  // Sidebar toggle
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // API helpers
  const fetchClients = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/clients", { token });
      setClients(Array.isArray(data) ? data.map(mapClient) : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchDevis = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/quotes", { token });
      setDevis(Array.isArray(data) ? data.map(mapQuote) : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchInvestments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/investments", { token });
      setInvestments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/jobs", { token });
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/messages", { token });
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchContent = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/content", { token });
      const list = Array.isArray(data) ? data : [];
      setContent(list);
      return list;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchReports = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/reports", { token });
      const list = Array.isArray(data) ? data : [];
      setReports(list);
      return list;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchLogs = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/logs", { token });
      const list = Array.isArray(data) ? data : [];
      setLogs(list);
      return list;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMediaLibrary = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/media", { token });
      const list = Array.isArray(data) ? data : [];
      setMedia(list);
      return list;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const uploadMedia = useCallback(async (file, category = 'general') => {
    if (!token) return null;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      const response = await fetch('http://localhost:3000/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error("Erreur lors de l'upload");
      
      const newMedia = await response.json();
      setMedia(prev => [newMedia, ...prev]);
      return newMedia;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchBackups = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/backups", { token });
      const list = Array.isArray(data) ? data : [];
      setBackups(list);
      return list;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchDashboardStats = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/stats", { token });
      setDashboardStats(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const value = {
    // Notifications
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,

    // UI
    sidebarCollapsed,
    toggleSidebar,
    activeModal,
    modalData,
    openModal,
    closeModal,

    // Data
    clients,
    setClients,
    devis,
    setDevis,
    investments,
    setInvestments,
    jobs,
    setJobs,
    messages,
    setMessages,
    content,
    setContent,
    reports,
    setReports,
    logs,
    setLogs,
    media,
    setMedia,
    backups,
    setBackups,
    dashboardStats,
    loading,
    error,
    fetchClients,
    fetchDevis,
    fetchInvestments,
    fetchJobs,
    fetchMessages,
    fetchContent,
    fetchReports,
    fetchLogs,
    fetchMediaLibrary,
    uploadMedia,
    fetchBackups,
    fetchNotifications,
    fetchDashboardStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
