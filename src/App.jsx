import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

// Pages (lazy-loaded for performance)
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Devis from "./pages/Devis";
import Contenu from "./pages/Contenu";
import Medias from "./pages/Medias";
import Statistiques from "./pages/Statistiques";
import Rapports from "./pages/Rapports";
import Logs from "./pages/Logs";
import Notification from "./pages/Notification";
import Parametres from "./pages/Parametres";
import Jobs from "./pages/Jobs";
import Messages from "./pages/Messages";
import Calendar from "./pages/Calendar";
import Investments from "./pages/Investments";
import Backup from "./pages/Backup";
import Contact from "./pages/Contact";
import Login from "./pages/Login";

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Admin layout (sidebar + header + main)
function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 64 : 256;

  return (
    <div className="min-h-screen bg-background dark:bg-[#12131a]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      <Header sidebarWidth={sidebarWidth} />
      <main
        className="pt-16 transition-all duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients/*" element={<Clients />} />
            <Route path="/devis/*" element={<Devis />} />
            <Route path="/contenu/*" element={<Contenu />} />
            <Route path="/medias" element={<Medias />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/rapports" element={<Rapports />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/notifications" element={<Notification />} />
            <Route path="/parametres/*" element={<Parametres />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}