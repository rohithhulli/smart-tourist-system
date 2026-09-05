import api from './api';

export const getPlaces = async (params = {}) => {
  const res = await api.get('/api/places/', { params });
  return res.data?.data || [];
};

export const getPlaceBySlug = async (slug) => {
  const res = await api.get(`/api/places/${slug}`);
  return res.data?.data || null;
};

export const getNearbyForPlace = async (slug, radius = 80, limit = 12) => {
  const res = await api.get(`/api/places/${slug}/nearby`, { params: { radius, limit } });
  return res.data?.data || [];
};

export const getPlaceGallery = async (slug) => {
  const res = await api.get(`/api/places/${slug}/gallery`);
  return res.data?.data || [];
};

export const getPlaceReviews = async (slug) => {
  const res = await api.get(`/api/places/${slug}/reviews`);
  return res.data?.data || [];
};

export const searchPlaces = async (q, limit = 8) => {
  const res = await api.get('/api/places/search', { params: { q, limit } });
  return res.data?.data || [];
};
