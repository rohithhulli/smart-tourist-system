import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizePlace } from '../utils/places';

const TripContext = createContext(null);

export const useTrip = () => useContext(TripContext);

export function TripProvider({ children }) {
  const [tripData, setTripData] = useState(null);
  const [draftTrip, setDraftTrip] = useState(null);
  const navigate = useNavigate();

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
    draftTrip,
    setDraftTrip,
    clearDraftTrip: () => setDraftTrip(null),
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}
