import api from './axios';

export interface VideoCallInfo {
  id: number;
  appointment_id: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  initiated_by: number;
  doctor_name: string;
  patient_name: string;
  started_at?: string | null;
  ended_at?: string | null;
  created_at: string;
}

export const videoAPI = {
  initiateCall: (appointmentId: number) =>
    api.post<VideoCallInfo>(`/vapi/video/${appointmentId}/initiate/`),
  joinCall: (appointmentId: number) =>
    api.post<VideoCallInfo>(`/vapi/video/${appointmentId}/join/`),
  endCall: (appointmentId: number) =>
    api.post<VideoCallInfo>(`/vapi/video/${appointmentId}/end/`),
  getStatus: (appointmentId: number) =>
    api.get<VideoCallInfo>(`/vapi/video/${appointmentId}/status/`),
};
