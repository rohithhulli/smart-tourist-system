import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizePlace } from '../utils/places';
import { useAuth } from './AuthContext';

const TripContext = createContext(null);

export const useTrip = () => useContext(TripContext);

// ---------------------------------------------------------------------------
// Persistent draft storage
//
// The Plan a Trip page keeps its full working state (form inputs AND the
// generated recommendations/itinerary) in this context so that navigating to
// Dashboard / Map View / My Trips (component unmount + remount) or even a
// browser refresh can never erase it.
//
// Storage layout (localStorage, per authenticated user):
//   smarttourist.planner.<userId>  -> { form fields + generated results }
//   smarttourist.tripdata.<userId> -> last data handed to Map View
// ---------------------------------------------------------------------------

const PLANNER_KEY_PREFIX = 'smarttourist.planner.';
const TRIPDATA_KEY_PREFIX = 'smarttourist.tripdata.';

export const EMPTY_PLANNER = Object.freeze({
  // Original first-visit prefill; kept so a brand-new planner looks exactly
  // as before. Any user-edited value always overrides these via hydration.
  startLocation: 'Bengaluru',
  destination: 'Mysuru',
  stops: [],
  startDate: null,
  endDate: null,
  budget: 0,
  travelers: 1,
  travelerType: '',
  durationDays: '',
  interests: [],
  categories: [],
  activities: [],
  isPlanGenerated: false,
  groupedRecommendations: [],
  selectedPlaces: [],
  itinerary: null,
  stats: null,
});

const storageKeyFor = (prefix, userId) => `${prefix}${userId ?? 'guest'}`;

const readJson = (key) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const writeJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded / storage unavailable: persistence is best-effort and
    // must never break normal app behaviour.
  }
};

const removeKey = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

// Merge stored data over the defaults; arrays/objects coming from corrupted
// or legacy payloads fall back to their default shape.
const hydratePlanner = (stored) => ({
  ...EMPTY_PLANNER,
  ...(stored || {}),
  stops: Array.isArray(stored?.stops) ? stored.stops : [],
  interests: Array.isArray(stored?.interests) ? stored.interests : [],
  categories: Array.isArray(stored?.categories) ? stored.categories : [],
  activities: Array.isArray(stored?.activities) ? stored.activities : [],
  groupedRecommendations: Array.isArray(stored?.groupedRecommendations)
    ? stored.groupedRecommendations
    : [],
  selectedPlaces: Array.isArray(stored?.selectedPlaces) ? stored.selectedPlaces : [],
});

export function TripProvider({ children }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? null;

  // Hydration happens during render (documented React pattern for deriving
  // state from props) so that pages mounting in the SAME commit as the auth
  // state change - e.g. PlanTrip right after session restore on refresh -
  // already see the persisted draft instead of empty defaults.
  const [hydratedUserId, setHydratedUserId] = useState(userId);
  const [planner, setPlanner] = useState(() => hydratePlanner(readJson(storageKeyFor(PLANNER_KEY_PREFIX, userId))));
  const [tripData, setTripDataState] = useState(() => readJson(storageKeyFor(TRIPDATA_KEY_PREFIX, userId)));
  // Ephemeral hand-off used by "Edit in Planner" on TripDetail: consumed once
  // by PlanTrip on mount, never persisted.
  const [draftTrip, setDraftTripState] = useState(null);

  if (hydratedUserId !== userId) {
    setHydratedUserId(userId);
    setPlanner(hydratePlanner(readJson(storageKeyFor(PLANNER_KEY_PREFIX, userId))));
    setTripDataState(readJson(storageKeyFor(TRIPDATA_KEY_PREFIX, userId)));
    setDraftTripState(null);
  }

  // Persist on every change (best-effort; never blocks rendering).
  useEffect(() => {
    writeJson(storageKeyFor(PLANNER_KEY_PREFIX, userId), planner);
  }, [planner, userId]);

  useEffect(() => {
    writeJson(storageKeyFor(TRIPDATA_KEY_PREFIX, userId), tripData);
  }, [tripData, userId]);

  const setTripData = useCallback((next) => {
    setTripDataState((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  const updatePlanner = useCallback((patch) => {
    setPlanner((prev) =>
      typeof patch === 'function' ? { ...prev, ...patch(prev) } : { ...prev, ...patch }
    );
  }, []);

  // Explicit "start a new trip": wipes the persisted draft + generated plan.
  // Never called implicitly by navigation.
  const clearPlanner = useCallback(() => {
    setPlanner({ ...EMPTY_PLANNER });
    removeKey(storageKeyFor(PLANNER_KEY_PREFIX, userId));
  }, [userId]);

  // Open a single place on the interactive map (used by navbar search and
  // the nearby "View on Map" actions). Builds a small, real route.
  const openPlaceOnMap = (place, extra = {}) => {
    const normalized = normalizePlace(place);
    if (normalized.lat == null || normalized.lng == null) return false;

    const waypoints = [
      {
        name: normalized.name,
        stop_number: 1,
        lat: normalized.lat,
        lng: normalized.lng,
        description: `${normalized.category} · ${normalized.city}${normalized.state ? `, ${normalized.state}` : ''}`,
      },
    ];

    setTripData({
      fromNearby: false,
      routeStops: [normalized.name],
      waypoints,
      selectedPlaces: [normalized],
      groupedRecommendations: [],
      itinerary: null,
      stats: null,
      focusPlace: normalized,
      ...extra,
    });
    navigate('/map');
    return true;
  };

  const value = {
    tripData,
    setTripData,
    openPlaceOnMap,
    planner,
    updatePlanner,
    clearPlanner,
    draftTrip,
    setDraftTrip: setDraftTripState,
    clearDraftTrip: () => setDraftTripState(null),
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}
