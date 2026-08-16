// Shared place normalization used across NearbyPlaces, PlanTrip, the map
// and the navbar search. Keeps place objects consistent everywhere.
export const normalizePlace = (place) => ({
  id: place.id || place.name,
  name: place.name,
  lat: place.latitude ?? place.lat ?? null,
  lng: place.longitude ?? place.lng ?? null,
  category: place.category || 'Tourist',
  image: place.image || null,
  rating: place.rating || 0,
  description: place.description || place.history || '',
  city: place.city || '',
  state: place.state || '',
  tags: place.tags || [],
  opening_time: place.opening_time || place.open_time || null,
  closing_time: place.closing_time || place.close_time || null,
});

export const formatDistance = (km) => {
  if (km == null) return null;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
};

export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
