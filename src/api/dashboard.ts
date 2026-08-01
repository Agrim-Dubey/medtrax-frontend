import api from './axios';

export const doctorDashboardAPI = {
  getProfile: () => api.get('/api/doctor/dashboard/profile/'),
  getStats: () => api.get('/api/doctor/dashboard/stats/'),
  getTodayAppointments: () => api.get('/api/doctor/dashboard/appointments/today/'),
  getUpcomingAppointments: () => api.get('/api/doctor/dashboard/appointments/upcoming/'),
  getRecentReviews: () => api.get('/api/doctor/dashboard/reviews/recent/'),
  getWeeklyStats: () => api.get('/api/doctor/dashboard/stats/weekly/'),
  getCompleteProfile: () => api.get('/api/doctor/dashboard/profile/complete/'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/api/doctor/dashboard/profile/complete/', data),
};

export const patientDashboardAPI = {
  getProfile: () => api.get('/api/patient/dashboard/profile/'),
  getUpcomingAppointments: () => api.get('/api/patient/dashboard/appointments/'),
  getRecentAppointments: () => api.get('/api/patient/dashboard/appointments/recent/'),
  getStats: () => api.get('/api/patient/dashboard/stats/'),
  getCompleteProfile: () => api.get('/api/patient/dashboard/profile/complete/'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/api/patient/dashboard/profile/complete/', data),
};
