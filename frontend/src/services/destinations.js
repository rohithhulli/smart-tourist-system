import api from './api';

export const getDestinations = async (params = {}) => {
  const res = await api.get('/api/destinations/', { params });
  return res.data?.data || [];
};

export const getDestinationBySlug = async (slug) => {
  const res = await api.get(`/api/destinations/${slug}`);
  return res.data?.data || null;
};

export const getDestinationPlaces = async (slug) => {
  const res = await api.get(`/api/destinations/${slug}/places`);
  return res.data?.data || [];
};

export const getDestinationEvents = async (slug) => {
  const res = await api.get(`/api/destinations/${slug}/events`);
  return res.data?.data || [];
};

export const getDestinationGallery = async (slug) => {
  const res = await api.get(`/api/destinations/${slug}/gallery`);
  return res.data?.data || [];
};

export const getDestinationReviews = async (slug) => {
  const res = await api.get(`/api/destinations/${slug}/reviews`);
  return res.data?.data || [];
};

export const searchUnified = async (q, limit = 8) => {
  const res = await api.get('/api/destinations/unified-search', { params: { q, limit } });
  return res.data?.data || { destinations: [], places: [] };
};
