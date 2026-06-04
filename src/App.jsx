import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './lib/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddUser from './pages/AddUser.jsx';
import Alert from './pages/Alert.jsx';
import Awareness from './pages/Awareness.jsx';
import Simulator from './pages/Simulator.jsx';
import Sidebar from './components/scamguard/Navbar.jsx';
import RealtimeAlertManager from './components/scamguard/RealtimeAlertManager.jsx';

// ProtectedRoute: Ensures only authenticated guardians can access system panels
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted">Securing session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e8edf5 25%, #f0f4f8 50%, #e8edf5 75%, #dbeafe 100%)' }}>
      <RealtimeAlertManager />
      <div className="app-container flex w-full h-full overflow-hidden">
        {/* Sidebar stays fixed — it's inside a flex container with shrink-0 and doesn't scroll */}
        <Sidebar />
        {/* Main content area scrolls independently */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
};

// PublicOnlyRoute: Redirects logged-in guardians away from public pages
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f0f4f8]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          {/* Public routes — NO sidebar shell */}
          <Route
            path="/"
            element={<Landing />}
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          {/* Protected routes — WITH sidebar shell */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-family"
            element={
              <ProtectedRoute>
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quarantine"
            element={
              <ProtectedRoute>
                <Alert />
              </ProtectedRoute>
            }
          />
          <Route
            path="/awareness"
            element={
              <ProtectedRoute>
                <Awareness />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulator"
            element={
              <ProtectedRoute>
                <Simulator />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
