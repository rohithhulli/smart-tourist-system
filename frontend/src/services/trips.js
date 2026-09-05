import api from './api';

export const getTrips = async () => {
  const res = await api.get('/api/trips/');
  return res.data?.data || [];
};

export const getTripById = async (id) => {
  const res = await api.get(`/api/trips/${id}`);
  return res.data?.data || null;
};

export const saveTrip = async (tripData) => {
  const res = await api.post('/api/trips/', tripData);
  return res.data?.data;
};

export const updateTrip = async (id, tripData) => {
  const res = await api.put(`/api/trips/${id}`, tripData);
  return res.data?.data;
};

export const deleteTrip = async (id) => {
  const res = await api.delete(`/api/trips/${id}`);
  return res.data;
};
