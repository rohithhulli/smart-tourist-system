import api from './api';

export const getMe = async () => {
  const res = await api.get('/api/auth/me');
  return res.data?.user;
};

export const login = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data;
};

export const signup = async (userData) => {
  const res = await api.post('/api/auth/signup', userData);
  return res.data;
};

export const logout = async () => {
  const res = await api.post('/api/auth/logout');
  return res.data;
};
