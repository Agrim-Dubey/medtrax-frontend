import api from './axios';

export const authAPI = {
  signup: (data: { email: string; password1: string; password2: string; role: string }) =>
    api.post('/api/auth/signup/', data),
  verifySignupOTP: (data: { email: string; otp: string }) =>
    api.post('/api/auth/verify-signup-otp/', data),
  resendSignupOTP: (data: { email: string }) =>
    api.post('/api/auth/resend-signup-otp/', data),
  completeDoctorProfile: (data: Record<string, unknown>) =>
    api.post('/api/auth/complete-doctor-profile/', data),
  completePatientProfile: (data: Record<string, unknown>) =>
    api.post('/api/auth/complete-patient-profile/', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login/', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/api/auth/forgot-password/', data),
  verifyPasswordResetOTP: (data: { email: string; otp: string }) =>
    api.post('/api/auth/verify-password-reset-otp/', data),
  resetPassword: (data: { email: string; new_password: string; confirm_password: string }) =>
    api.post('/api/auth/reset-password/', data),
  resendPasswordResetOTP: (data: { email: string }) =>
    api.post('/api/auth/resend-password-reset-otp/', data),
  verifyToken: () => api.get('/api/auth/verify-token/'),
  refreshToken: (data?: { refresh_token?: string }) => api.post('/api/auth/refresh-token/', data),
  logout: () => api.post('/api/auth/logout/'),
};
