import api from './api';

export const getFavorites = async () => {
  const res = await api.get('/api/favorites/');
  return res.data?.data || [];
};

export const addFavorite = async (placeId) => {
  const res = await api.post('/api/favorites/', { place_id: placeId });
  return res.data;
};

export const removeFavorite = async (placeId) => {
  const res = await api.delete(`/api/favorites/${placeId}`);
  return res.data;
};
