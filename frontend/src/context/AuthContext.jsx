import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const normalizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [tripsCount, setTripsCount] = useState(0);
  const [authLoading, setAuthLoading] = useState(false);
  // True while we are still checking whether an HttpOnly session cookie exists.
  const [authInitializing, setAuthInitializing] = useState(true);

  const refreshTripsCount = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/trips/`, {
        withCredentials: true,
        timeout: 6000,
      });
      setTripsCount(res.data?.data?.length ?? 0);
    } catch {
      // Non-fatal: the badge stays at its last known value.
    }
  }, []);

  // Session restore: the backend owns the session via the HttpOnly cookie.
  // localStorage is never used for credentials or session state.
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
          timeout: 6000,
        });
        if (cancelled) return;
        setCurrentUser(normalizeUser(res.data.user));
      } catch (err) {
        if (cancelled) return;
        // 401 -> no valid session (expected). Network errors -> leave logged out.
        setCurrentUser(null);
      } finally {
        if (!cancelled) setAuthInitializing(false);
      }
    };
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currentUser) refreshTripsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handleSessionExpired = useCallback(() => {
    setCurrentUser(null);
    setTripsCount(0);
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true, timeout: 4000 }
      );
      setCurrentUser(normalizeUser(res.data.user));
      await refreshTripsCount();
      return { ok: true, user: res.data.user };
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Backend is unreachable. Please start it and try again.';
      return { ok: false, error: msg };
    } finally {
      setAuthLoading(false);
    }
  }, [refreshTripsCount]);

  const signup = useCallback(async (name, email, password) => {
    setAuthLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/signup`,
        { name, email, password },
        { withCredentials: true, timeout: 6000 }
      );
      setCurrentUser(normalizeUser(res.data.user));
      await refreshTripsCount();
      return { ok: true, user: res.data.user };
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Signup failed. Please check your details and try again.';
      return { ok: false, error: msg };
    } finally {
      setAuthLoading(false);
    }
  }, [refreshTripsCount]);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch {
      // backend down: nothing to invalidate, clear local state regardless
    }
    setCurrentUser(null);
    setTripsCount(0);
  }, []);

  const value = {
    currentUser,
    tripsCount,
    authLoading,
    authInitializing,
    login,
    signup,
    logout,
    refreshTripsCount,
    handleSessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
