import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { AuthGuard } from './components/auth/AuthGuard';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Payment } from './pages/Payment';
import { LiveGame } from './pages/LiveGame';
import { Highlights } from './pages/Highlights';
import { HighlightDetail } from './pages/HighlightDetail';
import { VideoDetail } from './pages/VideoDetail';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Subscribe } from './pages/Subscribe';
import { Terms } from './pages/Terms';
import { WatchParty } from './pages/WatchParty';
import { ModerationPanel } from './components/moderation/ModerationPanel';
import { BillingManagement } from './components/payments/BillingManagement';
import { useTheme } from './hooks/useTheme';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/auth' || location.pathname === '/payment';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black transition-colors">
        {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/live/:id" element={<LiveGame />} />
          <Route path="/live" element={<LiveGame />} />
          <Route path="/highlights" element={<Highlights />} />
          <Route path="/highlight/:id" element={<HighlightDetail />} />
          <Route path="/video/:id" element={<VideoDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Terms />} />
          <Route path="/moderation" element={<ModerationPanel />} />
          <Route path="/billing" element={<BillingManagement />} />
          <Route path="/watch-party/:id" element={<WatchParty />} />
        </Routes>
      </div>
    </AuthGuard>
  );
}

function App() {
  useTheme(); // Initialize theme

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;