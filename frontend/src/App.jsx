import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import Attractions from './pages/Attractions';
import PlaceDetails from './pages/PlaceDetails';
import Experiences from './pages/Experiences';
import Events from './pages/Events';
import AiGuide from './pages/AiGuide';
import Dashboard from './pages/Dashboard';
import NearbyPlaces from './pages/NearbyPlaces';
import PlanTrip from './pages/PlanTrip';
import MyTrips from './pages/MyTrips';
import TripDetail from './pages/TripDetail';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import MapViewPage from './pages/MapViewPage';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';

function RequireAuth({ children }) {
  const { currentUser, authInitializing } = useAuth();
  const location = useLocation();
  if (authInitializing) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-full">
        <div className="flex flex-col items-center gap-3 text-cream/50">
          <div className="w-10 h-10 rounded-2xl bg-safari-600/20 border border-safari-500/30 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-safari-400 border-t-transparent animate-spin" />
          </div>
          <p className="text-xs">Restoring your session...</p>
        </div>
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default function App() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const showSidebar = !isAuthPage;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-ink-950 text-cream font-sans">
      {/* App shell: sidebar occupies its own column (sticky on desktop,
          off-canvas drawer on mobile); the main area takes the remaining width. */}
      <div className="flex min-h-screen w-full">
        {showSidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        {/* Main area: owns the Navbar + page content, sized by flex —
            never underneath the sidebar. */}
        <div className="flex flex-col flex-1 min-w-0 box-border bg-ink-950">
          <Navbar onMenuClick={showSidebar ? () => setSidebarOpen(true) : null} />

          <main className="w-full flex-1 bg-ink-950 min-h-[calc(100vh-4rem)] box-border">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Public Tourism Discovery Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:slug" element={<DestinationDetails />} />
              <Route path="/attractions" element={<Attractions />} />
              <Route path="/places/:slug" element={<PlaceDetails />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/events" element={<Events />} />
              <Route path="/ai-guide" element={<AiGuide />} />
              <Route path="/plan-trip" element={<PlanTrip />} />
              <Route path="/nearby" element={<NearbyPlaces />} />
              <Route path="/nearby-places" element={<NearbyPlaces />} />
              <Route path="/map" element={<MapViewPage />} />
              <Route path="/map-view" element={<MapViewPage />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected User Account Routes */}
              <Route path="/my-trips" element={<RequireAuth><MyTrips /></RequireAuth>} />
              <Route path="/my-trips/:tripId" element={<RequireAuth><TripDetail /></RequireAuth>} />
              <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer minimal={isAuthPage} />
        </div>
      </div>

      {sidebarOpen && showSidebar && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
