import api from './axios';

export const appointmentsAPI = {
  bookAppointment: (data: Record<string, unknown>) => api.post('/api/appointments/patient/book/', data),
  getPatientAppointments: () => api.get('/api/appointments/patient/list/'),
  getAvailableDoctors: () => api.get('/api/appointments/doctors/available/'),
  getDoctorSlots: (doctorId: number, date: string) => api.get(`/api/appointments/doctors/${doctorId}/available-slots/?date=${date}`),
  getDoctorRequests: () => api.get('/api/appointments/doctor/requests/'),
  getDoctorAppointments: () => api.get('/api/appointments/doctor/appointments/'),
  acceptAppointment: (id: number) => api.patch(`/api/appointments/doctor/${id}/accept/`),
  rejectAppointment: (id: number) => api.patch(`/api/appointments/doctor/${id}/reject/`),
  getDoctorQueueInfo: (doctorId: number) => api.get(`/api/appointments/doctors/${doctorId}/queue-info/`),
  getDoctorDashboardStats: () => api.get('/api/appointments/doctor/dashboard/stats/'),
  getPatientDashboardStats: () => api.get('/api/appointments/patient/dashboard/stats/'),
  getPatientUpcoming: () => api.get('/api/appointments/patient/dashboard/appointments/'),
  getPatientRecent: () => api.get('/api/appointments/patient/dashboard/appointments/recent/'),
};
