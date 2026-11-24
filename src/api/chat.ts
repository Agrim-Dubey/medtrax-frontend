import api from './axios';

export interface ChatParticipant {
  id: number;
  username: string;
  email: string;
  role: 'doctor' | 'patient';
  full_name: string;
}

export interface ChatMessage {
  id: number;
  room: number;
  sender: ChatParticipant;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface ChatRoomItem {
  id: number;
  room_type: 'patient_doctor' | 'doctor_doctor';
  name: string;
  is_active: boolean;
  participants: ChatParticipant[];
  other_participant?: ChatParticipant;
  last_message?: {
    id: number;
    content: string;
    timestamp: string;
    sender: string;
  } | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatRoomDetail extends ChatRoomItem {
  messages: ChatMessage[];
  appointment_info?: {
    id: number;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason?: string;
  } | null;
}

export interface DoctorSearchResult {
  id: number;
  user_id: number;
  full_name: string;
  specialization: string;
  qualification?: string;
  years_of_experience?: number;
}

export interface DoctorConnectionRequest {
  id: number;
  from_doctor: DoctorSearchResult;
  to_doctor: DoctorSearchResult;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const chatAPI = {
  // Patient endpoints
  getPatientDoctors: () => api.get<ChatRoomItem[]>('/api/chat/patient/doctors/'),

  // Doctor endpoints
  getDoctorPatients: () => api.get<ChatRoomItem[]>('/api/chat/doctor/patients/'),
  getDoctorDoctors: () => api.get<ChatRoomItem[]>('/api/chat/doctor/doctors/'),
  searchDoctors: (query: string) =>
    api.get<DoctorSearchResult[]>(`/api/chat/doctor/search/?q=${encodeURIComponent(query)}`),
  sendDoctorConnection: (toDoctorId: number) =>
    api.post('/api/chat/doctor/connection/send/', { to_doctor_id: toDoctorId }),
  getPendingDoctorConnections: () =>
    api.get<DoctorConnectionRequest[]>('/api/chat/doctor/connection/pending/'),
  acceptDoctorConnection: (id: number) =>
    api.post(`/api/chat/doctor/connection/${id}/accept/`),
  rejectDoctorConnection: (id: number) =>
    api.post(`/api/chat/doctor/connection/${id}/reject/`),

  // Generic Room endpoints
  getRoom: (roomId: number) => api.get<ChatRoomDetail>(`/api/chat/room/${roomId}/`),
  sendMessage: (roomId: number, content: string) =>
    api.post<ChatMessage>(`/api/chat/room/${roomId}/send/`, { content }),
  markAsRead: (roomId: number) =>
    api.post<{ message?: string; status?: string; marked_read?: number }>(`/api/chat/room/${roomId}/read/`),
};
