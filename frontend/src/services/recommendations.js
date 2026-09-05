import api from './api';

export const getRecommendations = async (payload) => {
  const res = await api.post('/api/planner/recommend', payload);
  return res.data;
};

export const buildItinerary = async (payload) => {
  const res = await api.post('/api/planner/itinerary', payload);
  return res.data;
};
