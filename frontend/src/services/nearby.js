import api from './api';

export const getNearbyServices = async (lat, lng, category = 'hotels', radius = 80) => {
  const res = await api.get('/api/nearby/services', {
    params: { lat, lng, category, radius },
  });
  return res.data?.data || [];
};
