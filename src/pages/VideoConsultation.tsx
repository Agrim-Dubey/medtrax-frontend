import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Monitor,
  Clock,
  ArrowLeft,
  AlertTriangle,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { videoAPI } from '../api/video';
import type { VideoCallInfo } from '../api/video';
import { useAuth } from '../context/AuthContext';
import { getWebSocketUrl } from '../utils/websocket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export default function VideoConsultation() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const apptId = appointmentId ? parseInt(appointmentId, 10) : 0;
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDoctor = user?.role === 'doctor';

  const [callInfo, setCallInfo] = useState<VideoCallInfo | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // In-call control states
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Media & WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const durationTimerRef = useRef<any>(null);

  // Initialize Call & Media
  const initCall = useCallback(async () => {
    if (!apptId) return;
    setConnecting(true);

    try {
      // 1. Get call status or initiate/join via API
      let callData: VideoCallInfo;
      try {
        const initRes = await videoAPI.initiateCall(apptId);
        callData = initRes.data;
      } catch {
        const joinRes = await videoAPI.joinCall(apptId);
        callData = joinRes.data;
      }
      setCallInfo(callData);

      // 2. Request User Camera & Audio Stream
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (err: any) {
        console.warn('Full media access failed, trying audio-only', err);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          setPermissionError(
            'Unable to access camera or microphone. Please check your browser permissions.'
          );
          stream = new MediaStream();
        }
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 3. Create WebRTC Peer Connection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local stream tracks to PC
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream tracks
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteUserJoined(true);
          setCallActive(true);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'ice_candidate',
              candidate: event.candidate,
            })
          );
        }
      };

      // 4. Connect to Video Signaling WebSocket
      const wsUrl = getWebSocketUrl(`ws/video/${apptId}/`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setConnecting(false);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'user_joined') {
            setRemoteUserJoined(true);
            // If remote joined, create offer
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              ws.send(JSON.stringify({ type: 'offer', offer }));
            } catch (err) {
              console.error('Error creating offer:', err);
            }
          } else if (data.type === 'offer' && data.offer) {
            setRemoteUserJoined(true);
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', answer }));
            setCallActive(true);
          } else if (data.type === 'answer' && data.answer) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            setCallActive(true);
          } else if (data.type === 'ice_candidate' && data.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
              console.warn('Error adding ICE candidate:', e);
            }
          } else if (data.type === 'user_left' || data.type === 'call_ended') {
            toast('The other participant has left the consultation.', { icon: '📞' });
            setRemoteUserJoined(false);
            setCallActive(false);
          }
        } catch {
          // ignore parsing error
        }
      };

      ws.onerror = () => {
        setConnecting(false);
      };
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate video session');
      setConnecting(false);
    }
  }, [apptId]);

  useEffect(() => {
    initCall();

    return () => {
      // Clean up on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [initCall]);

  // Duration Timer
  useEffect(() => {
    if (callActive) {
      durationTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callActive]);

  // Controls: Audio Mute
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // Controls: Video Mute
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  // Controls: Screen Share
  const toggleScreenShare = async () => {
    if (!peerConnectionRef.current) return;
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        const sender = peerConnectionRef.current
          .getSenders()
          .find(s => s.track?.kind === 'video');

        if (sender) {
          sender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenSharing();
        };

        setIsScreenSharing(true);
      } else {
        stopScreenSharing();
      }
    } catch {
      // User cancelled screen share prompt
    }
  };

  const stopScreenSharing = () => {
    if (localStreamRef.current && peerConnectionRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        .getSenders()
        .find(s => s.track?.kind === 'video');

      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
    setIsScreenSharing(false);
  };

  // End Call
  const handleEndCall = async () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'end_call' }));
      }
      await videoAPI.endCall(apptId);
    } catch {
      // silent
    } finally {
      toast.success('Consultation ended');
      const backPath = isDoctor ? '/doctor/appointments' : '/patient/appointments';
      navigate(backPath);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Telehealth Video Consultation</h1>
          <p>
            Appointment #{apptId} • {isDoctor ? `Patient: ${callInfo?.patient_name || 'Patient'}` : `Doctor: Dr. ${callInfo?.doctor_name || 'Doctor'}`}
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(isDoctor ? '/doctor/appointments' : '/patient/appointments')}
        >
          <ArrowLeft size={16} /> Exit Room
        </button>
      </div>

      {permissionError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 16,
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertTriangle size={18} />
          <span>{permissionError}</span>
        </div>
      )}

      <div className="video-room-container">
        {/* Top Status Badge */}
        <div className="video-status-overlay">
          <div className="pulse-dot" style={{ background: callActive ? '#22c55e' : '#f59e0b' }} />
          <span>{callActive ? 'Consultation Live' : connecting ? 'Connecting...' : 'Waiting for participant'}</span>
          {callActive && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, color: 'var(--text-muted)' }}>
              <Clock size={13} /> {formatDuration(callDuration)}
            </span>
          )}
        </div>

        {/* Video Grid */}
        <div className="video-grid">
          {/* Remote Video Stream */}
          <div className="remote-video-wrapper">
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />

            {!remoteUserJoined && (
              <div className="video-waiting-card">
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--accent-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    margin: '0 auto 16px',
                  }}
                >
                  <User size={36} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
                  Waiting for {isDoctor ? callInfo?.patient_name || 'the patient' : `Dr. ${callInfo?.doctor_name || 'the doctor'}`} to join
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                  The video stream will connect automatically as soon as both parties are in the session.
                </p>
              </div>
            )}
          </div>

          {/* Local Video PiP Tile */}
          <div className="local-video-wrapper">
            <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
            <div
              style={{
                position: 'absolute',
                bottom: 6,
                left: 8,
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: '0.68rem',
                color: '#fff',
              }}
            >
              You {isAudioMuted ? '(Muted)' : ''}
            </div>
          </div>
        </div>

        {/* Bottom In-Call Controls Bar */}
        <div className="video-controls-bar">
          <button
            className={`control-btn ${isAudioMuted ? 'active-off' : ''}`}
            onClick={toggleAudio}
            title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            className={`control-btn ${isVideoMuted ? 'active-off' : ''}`}
            onClick={toggleVideo}
            title={isVideoMuted ? 'Start Camera' : 'Stop Camera'}
          >
            {isVideoMuted ? <VideoOff size={20} /> : <VideoIcon size={20} />}
          </button>

          <button
            className={`control-btn ${isScreenSharing ? 'active-off' : ''}`}
            onClick={toggleScreenShare}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <Monitor size={20} />
          </button>

          <button
            className="control-btn end-call"
            onClick={handleEndCall}
            title="End Consultation"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
