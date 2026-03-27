import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080/api' 
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/auth/register', data),
};

// ===== Participants =====
export const participantsApi = {
  list: () => api.get('/participants'),
};

export const participantPortalApi = {
  getEvents: () => api.get('/participant/events'),
  register: (id: number) => api.post(`/participant/events/${id}/register`),
  unregister: (id: number) => api.post(`/participant/events/${id}/unregister`),
  getProfile: () => api.get('/participant/me'),
  updateProfile: (data: any) => api.put('/participant/me', data),
};

// ===== Tags =====
export const tagsApi = {
  list: () => api.get('/tags'),
  get: (id: number) => api.get(`/tags/${id}`),
  create: (data: { name: string }) => api.post('/tags', data),
  update: (id: number, data: { name: string }) => api.put(`/tags/${id}`, data),
  delete: (id: number) => api.delete(`/tags/${id}`),
};

// ===== Locations =====
export const locationsApi = {
  list: () => api.get('/locations'),
  get: (id: number) => api.get(`/locations/${id}`),
  create: (data: any) => api.post('/locations', data),
  update: (id: number, data: any) => api.put(`/locations/${id}`, data),
  delete: (id: number) => api.delete(`/locations/${id}`),
};

// ===== Staff =====
export const staffApi = {
  list: () => api.get('/staff'),
  get: (id: number) => api.get(`/staff/${id}`),
  create: (data: any) => api.post('/staff', data),
  update: (id: number, data: any) => api.put(`/staff/${id}`, data),
  delete: (id: number) => api.delete(`/staff/${id}`),
  getSchedule: (id: number, from?: string, to?: string) =>
    api.get(`/staff/${id}/schedule`, { params: { from, to } }),
  updateAvailability: (id: number, data: any[]) =>
    api.put(`/staff/${id}/availability`, data),
  updateMaxHours: (id: number, maxHours: number) =>
    api.put(`/staff/${id}/max-hours`, { maxHours }),
  getHolidays: (id: number) =>
    api.get(`/staff/${id}/holidays`),
  addHoliday: (id: number, data: { startDate: string; endDate: string }) =>
    api.post(`/staff/${id}/holidays`, data),
  removeHoliday: (id: number, holidayId: number) =>
    api.delete(`/staff/${id}/holidays/${holidayId}`),
  updateTags: (id: number, tagIds: number[]) =>
    api.put(`/staff/${id}/tags`, tagIds),
};

// ===== Event Types =====
export const eventTypesApi = {
  list: () => api.get('/event-types'),
  get: (id: number) => api.get(`/event-types/${id}`),
  create: (data: any) => api.post('/event-types', data),
  update: (id: number, data: any) => api.put(`/event-types/${id}`, data),
  delete: (id: number) => api.delete(`/event-types/${id}`),
};

// ===== Event Instances =====
export const eventInstancesApi = {
  list: (params?: { from?: string; to?: string; status?: string }) =>
    api.get('/event-instances', { params }),
  get: (id: number) => api.get(`/event-instances/${id}`),
  create: (data: any) => api.post('/event-instances', data),
  update: (id: number, data: any) => api.put(`/event-instances/${id}`, data),
  delete: (id: number) => api.delete(`/event-instances/${id}`),
  publish: (id: number) => api.post(`/event-instances/${id}/publish`),
  getAvailableStaff: (id: number) => api.get(`/event-instances/${id}/available-staff`),
  assignStaff: (eventId: number, staffId: number) =>
    api.post(`/event-instances/${eventId}/assign`, { staffId }),
  unassignStaff: (id: number, staffId: number) =>
    api.delete(`/event-instances/${id}/assign/${staffId}`),
};

// ===== Communications =====
export const communicationsApi = {
  notifyStaff: (weekStartDate: string) =>
    api.post('/communications/notify-staff', { weekStartDate }),
};

export default api;
