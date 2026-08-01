import api from './axios';

export const prescriptionsAPI = {
  getDoctorPatients: () => api.get('/api/prescriptions/doctor/patients/'),
  createPrescription: (data: Record<string, unknown>) => api.post('/api/prescriptions/doctor/create/', data),
  getDoctorPrescriptions: (patientId?: number) => api.get(`/api/prescriptions/doctor/list/${patientId ? `?patient_id=${patientId}` : ''}`),
  getPatientPrescriptions: () => api.get('/api/prescriptions/patient/list/'),
  getPatientPrescriptionsByDoctor: (doctorId: number) => api.get(`/api/prescriptions/patient/doctor/${doctorId}/`),
};
