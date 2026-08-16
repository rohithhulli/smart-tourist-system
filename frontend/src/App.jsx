import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
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
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
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
  const showSidebar = Boolean(currentUser) && !isAuthPage;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onMenuClick={showSidebar ? () => setSidebarOpen(true) : null} />

      <div className="flex flex-1">
        {sidebarOpen && showSidebar && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        {showSidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        <main className="flex-1 bg-slate-950 min-h-[calc(100vh-4rem)] overflow-y-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/nearby" element={<RequireAuth><NearbyPlaces /></RequireAuth>} />
            <Route path="/nearby-places" element={<RequireAuth><NearbyPlaces /></RequireAuth>} />
            <Route path="/plan-trip" element={<RequireAuth><PlanTrip /></RequireAuth>} />
            <Route path="/my-trips" element={<RequireAuth><MyTrips /></RequireAuth>} />
            <Route path="/my-trips/:tripId" element={<RequireAuth><TripDetail /></RequireAuth>} />
            <Route path="/map" element={<RequireAuth><MapViewPage /></RequireAuth>} />
            <Route path="/map-view" element={<RequireAuth><MapViewPage /></RequireAuth>} />
            <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
