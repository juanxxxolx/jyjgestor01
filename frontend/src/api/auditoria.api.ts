import api from './client';

export const auditoriaApi = {
  getAll: (page = 1, limit = 50) =>
    api.get('/audit-logs', { params: { page, limit } }).then((r) => r.data),
};
