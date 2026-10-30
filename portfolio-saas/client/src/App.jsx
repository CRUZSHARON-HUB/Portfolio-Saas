import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AppShell from './components/layout/AppShell.jsx';
import Loader from './components/ui/Loader.jsx';

import Landing from './pages/Landing.jsx';
import Features from './pages/Features.jsx';
import Pricing from './pages/Pricing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Portfolios from './pages/Portfolios.jsx';
import PortfolioEditor from './pages/PortfolioEditor.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';
import PublicPortfolio from './pages/PublicPortfolio.jsx';
import Directory from './pages/Directory.jsx';
import NotFound from './pages/NotFound.jsx';

function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/p/:slug" element={<PublicPortfolio />} />

            <Route element={<RequireAuth />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="portfolios" element={<Portfolios />} />
                <Route path="portfolio/:id" element={<PortfolioEditor />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
