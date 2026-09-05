import api from './api';

export const getEventsForDestination = async (slug) => {
  const res = await api.get(`/api/destinations/${slug}/events`);
  return res.data?.data || [];
};
