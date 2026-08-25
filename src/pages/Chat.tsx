import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Video,
  UserPlus,
  Users,
  Search,
  Check,
  CheckCheck,
  X,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { chatAPI } from '../api/chat';
import type {
  ChatRoomItem,
  ChatMessage,
  DoctorSearchResult,
  DoctorConnectionRequest,
} from '../api/chat';
import { useAuth } from '../context/AuthContext';
import { getWebSocketUrl } from '../utils/websocket';
import { useDebounce } from '../hooks/useDebounce';

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDoctor = user?.role === 'doctor';

  // State
  const [tab, setTab] = useState<'patients' | 'doctors'>('patients');
  const [rooms, setRooms] = useState<ChatRoomItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [appointmentInfo, setAppointmentInfo] = useState<any>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const debouncedContactSearch = useDebounce(contactSearch, 250);

  const filteredRooms = rooms.filter((room) => {
    if (!debouncedContactSearch) return true;
    const q = debouncedContactSearch.toLowerCase();
    const name = (room.other_participant?.full_name || room.name || '').toLowerCase();
    const lastMsg = (room.last_message?.content || '').toLowerCase();
    return name.includes(q) || lastMsg.includes(q);
  });

  // Doctor Networking State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedColleagueQuery = useDebounce(searchQuery, 350);
  const [searchResults, setSearchResults] = useState<DoctorSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<DoctorConnectionRequest[]>([]);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatChatDateChip = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const playIncomingChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext autoplay policies
    }
  };

  // Load Rooms
  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      if (isDoctor) {
        if (tab === 'patients') {
          const res = await chatAPI.getDoctorPatients();
          setRooms(res.data || []);
        } else {
          const res = await chatAPI.getDoctorDoctors();
          setRooms(res.data || []);
        }
      } else {
        const res = await chatAPI.getPatientDoctors();
        setRooms(res.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoadingRooms(false);
    }
  }, [isDoctor, tab]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Load Pending Requests count for doctor
  const loadPendingRequests = useCallback(async () => {
    if (!isDoctor) return;
    try {
      const res = await chatAPI.getPendingDoctorConnections();
      setPendingRequests(res.data || []);
    } catch {
      // silent
    }
  }, [isDoctor]);

  useEffect(() => {
    if (isDoctor) {
      loadPendingRequests();
    }
  }, [isDoctor, loadPendingRequests]);

  // Handle Room Selection & WebSocket connection
  useEffect(() => {
    if (!selectedRoom) return;

    // Load full room details via REST first
    chatAPI.getRoom(selectedRoom.id).then(res => {
      setMessages(res.data.messages || []);
      setAppointmentInfo(res.data.appointment_info || null);
      scrollToBottom();
      // Mark read
      chatAPI.markAsRead(selectedRoom.id).catch(() => {});
    }).catch(() => {});

    // Open WebSocket
    const wsUrl = getWebSocketUrl(`ws/chat/${selectedRoom.id}/`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Connected
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connection_established' && data.messages) {
          // If server sends history
          if (data.messages.length > 0) {
            setMessages(data.messages);
            scrollToBottom();
          }
        } else if (data.type === 'chat_message' && data.message) {
          const msg = data.message;
          const formattedMsg: ChatMessage = {
            id: msg.id,
            room: msg.room || selectedRoom.id,
            sender: {
              id: msg.sender_id,
              username: msg.sender_username,
              email: '',
              role: msg.sender_role,
              full_name: msg.sender_full_name,
            },
            content: msg.content,
            timestamp: msg.timestamp,
            is_read: msg.is_read || false,
          };
          setMessages(prev => {
            if (prev.some(m => m.id === formattedMsg.id)) return prev;
            if (formattedMsg.sender.id !== user?.user_id) {
              playIncomingChime();
            }
            return [...prev, formattedMsg];
          });
          scrollToBottom();
        } else if (data.type === 'typing' && data.sender_id !== user?.user_id) {
          setIsPeerTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsPeerTyping(false), 3000);
        } else if (data.type === 'appointment_completed') {
          toast(data.message || 'Consultation session concluded', { icon: 'ℹ️' });
        }
      } catch {
        // error parsing json
      }
    };

    ws.onerror = () => {
      // Fallback works automatically via REST
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !selectedRoom) return;

    setInputText('');

    // Try sending over WebSocket first
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text }));
    } else {
      // REST fallback
      try {
        const res = await chatAPI.sendMessage(selectedRoom.id, text);
        setMessages(prev => [...prev, res.data]);
        scrollToBottom();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to send message');
      }
    }
  };

  // Auto-search doctors as user types
  useEffect(() => {
    if (!isSearchOpen || !debouncedColleagueQuery.trim()) {
      if (!debouncedColleagueQuery.trim()) setSearchResults([]);
      return;
    }
    const executeSearch = async () => {
      setSearching(true);
      try {
        const res = await chatAPI.searchDoctors(debouncedColleagueQuery.trim());
        setSearchResults(res.data || []);
      } catch {
        // silent search
      } finally {
        setSearching(false);
      }
    };
    executeSearch();
  }, [isSearchOpen, debouncedColleagueQuery]);

  // Doctor Search
  const handleSearchDoctors = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await chatAPI.searchDoctors(searchQuery.trim());
      setSearchResults(res.data || []);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSendConnection = async (docId: number) => {
    try {
      await chatAPI.sendDoctorConnection(docId);
      toast.success('Connection request sent!');
      setSearchResults(prev => prev.filter(d => d.id !== docId));
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Connection request failed');
    }
  };

  const handleAcceptConnection = async (reqId: number) => {
    try {
      await chatAPI.acceptDoctorConnection(reqId);
      toast.success('Connection accepted!');
      setPendingRequests(prev => prev.filter(r => r.id !== reqId));
      loadRooms();
    } catch {
      toast.error('Failed to accept');
    }
  };

  const handleRejectConnection = async (reqId: number) => {
    try {
      await chatAPI.rejectDoctorConnection(reqId);
      toast.success('Connection rejected');
      setPendingRequests(prev => prev.filter(r => r.id !== reqId));
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleLaunchVideo = () => {
    if (!appointmentInfo?.id) {
      toast.error('No linked appointment available for video call');
      return;
    }
    const path = isDoctor ? `/doctor/video/${appointmentInfo.id}` : `/patient/video/${appointmentInfo.id}`;
    navigate(path);
  };

  return (
    <div>
      <div className="chat-container">
        {/* ─── Left Sidebar: Conversations ─── */}
        <div className={`chat-sidebar ${selectedRoom ? 'hidden-mobile' : ''}`}>
          <div className="chat-sidebar-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={20} color="var(--accent)" /> Messages
              </h2>

              {isDoctor && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {pendingRequests.length > 0 && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', position: 'relative' }}
                      onClick={() => setIsRequestsOpen(true)}
                      title="Pending Requests"
                    >
                      <Users size={16} />
                      <span
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          background: 'var(--danger)',
                          color: '#fff',
                          borderRadius: '50%',
                          width: 16,
                          height: 16,
                          fontSize: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {pendingRequests.length}
                      </span>
                    </button>
                  )}
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: '4px 8px' }}
                    onClick={() => setIsSearchOpen(true)}
                    title="Find Colleague Doctors"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Doctor Subtabs */}
            {isDoctor && (
              <div className="chat-tabs">
                <button
                  className={`chat-tab ${tab === 'patients' ? 'active' : ''}`}
                  onClick={() => {
                    setTab('patients');
                    setSelectedRoom(null);
                  }}
                >
                  Patients
                </button>
                <button
                  className={`chat-tab ${tab === 'doctors' ? 'active' : ''}`}
                  onClick={() => {
                    setTab('doctors');
                    setSelectedRoom(null);
                  }}
                >
                  Doctor Network
                </button>
              </div>
            )}

            {/* Quick Contacts Filter */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-primary)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search chats or messages..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.78rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="chat-rooms-list">
            {loadingRooms ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading conversations...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                {contactSearch ? 'No conversations match your search.' : 'No active conversations found.'}
                {isDoctor && tab === 'doctors' && !contactSearch && (
                  <p style={{ marginTop: 8 }}>Use the + icon above to connect with fellow doctors.</p>
                )}
              </div>
            ) : (
              filteredRooms.map(room => {
                const other = room.other_participant;
                const displayName = other?.full_name || room.name || 'Chat';
                const isSelected = selectedRoom?.id === room.id;

                return (
                  <div
                    key={room.id}
                    className={`chat-room-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className={`chat-avatar ${other?.role === 'doctor' ? 'doctor' : 'patient'}`}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="chat-room-info">
                      <div className="chat-room-info-top">
                        <span className="chat-room-name">{displayName}</span>
                        {room.last_message?.timestamp && (
                          <span className="chat-room-time">
                            {new Date(room.last_message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="chat-room-snippet">
                          {room.last_message?.content || 'No messages yet'}
                        </span>
                        {room.unread_count > 0 && (
                          <span className="chat-badge">{room.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── Right Main Chat Pane ─── */}
        <div className={`chat-main ${!selectedRoom ? 'hidden-mobile' : ''}`}>
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 8px', display: 'flex', alignItems: 'center' }}
                    onClick={() => setSelectedRoom(null)}
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <div
                    className={`chat-avatar ${
                      selectedRoom.other_participant?.role === 'doctor' ? 'doctor' : 'patient'
                    }`}
                    style={{ width: 36, height: 36, fontSize: '0.85rem' }}
                  >
                    {(selectedRoom.other_participant?.full_name || selectedRoom.name || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                      {selectedRoom.other_participant?.full_name || selectedRoom.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      {selectedRoom.other_participant?.role === 'doctor'
                        ? 'Medical Practitioner'
                        : 'Patient Consultation'}
                    </p>
                  </div>
                </div>

                {appointmentInfo && (
                  <button className="btn btn-success btn-sm" onClick={handleLaunchVideo}>
                    <Video size={16} /> Launch Video
                  </button>
                )}
              </div>

              {/* Consultation Context Banner */}
              {appointmentInfo && (
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    borderBottom: '1px solid var(--border-primary)',
                    padding: '8px 20px',
                    fontSize: '0.8rem',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Clock size={14} /> Linked to appointment scheduled for{' '}
                  <strong>
                    {appointmentInfo.appointment_date} at {appointmentInfo.appointment_time}
                  </strong>{' '}
                  (Status: {appointmentInfo.status})
                </div>
              )}

              {/* Messages Scroll View */}
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="chat-empty-state">
                    <MessageSquare size={36} opacity={0.4} />
                    <p style={{ fontSize: '0.9rem' }}>No messages yet. Send a greeting to start!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender?.id === user?.user_id;
                    const dateChip = formatChatDateChip(msg.timestamp);
                    const prevDateChip = idx > 0 ? formatChatDateChip(messages[idx - 1]?.timestamp) : '';
                    const showDateChip = dateChip && dateChip !== prevDateChip;

                    return (
                      <div key={msg.id || idx}>
                        {showDateChip && (
                          <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0 8px 0' }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '3px 12px',
                                borderRadius: 100,
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid var(--border-primary)',
                                color: 'var(--text-secondary)',
                                backdropFilter: 'blur(8px)',
                              }}
                            >
                              {dateChip}
                            </span>
                          </div>
                        )}
                        <motion.div
                          className={`chat-bubble ${isMe ? 'sent' : 'received'}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {!isMe && (
                            <div
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: 'var(--accent)',
                                marginBottom: 2,
                              }}
                            >
                              {msg.sender?.full_name || msg.sender?.username}
                            </div>
                          )}
                          <div>{msg.content}</div>
                          <div className="chat-bubble-meta">
                            <span>
                              {msg.timestamp
                                ? new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                            {isMe && (
                              <span>
                                {msg.is_read ? <CheckCheck size={13} /> : <Check size={13} />}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })
                )}
                <AnimatePresence>
                  {isPeerTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="chat-bubble received"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginRight: 4 }}>
                        {selectedRoom?.other_participant?.full_name || 'Participant'} is typing
                      </span>
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }}
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
                        style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }}
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, delay: 0.4, repeat: Infinity }}
                        style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSendMessage} className="chat-input-bar">
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!inputText.trim()}
                  style={{ padding: '0 18px', height: 42 }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty-state">
              <MessageSquare size={48} opacity={0.4} />
              <h3>Select a conversation</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Choose an active consultation or colleague from the list to begin messaging.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Doctor Search & Connect Modal ─── */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="modal-overlay" onClick={() => setIsSearchOpen(false)}>
            <motion.div
              className="modal-content"
              style={{ maxWidth: 540 }}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h2>
                  <UserPlus size={20} color="var(--accent)" /> Doctor Colleague Directory
                </h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input
                    className="form-input"
                    placeholder="Search doctor by name or specialty..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearchDoctors()}
                  />
                  <button className="btn btn-primary" onClick={handleSearchDoctors} disabled={searching}>
                    <Search size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Search by doctor name (e.g. "Smith", "Cardiology") to send a connection request.
                    </div>
                  ) : (
                    searchResults.map(doc => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 12,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{doc.full_name}</strong>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--accent)' }}>
                            {doc.specialization} {doc.qualification ? `• ${doc.qualification}` : ''}
                          </p>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSendConnection(doc.id)}>
                          Connect
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Pending Connection Requests Modal ─── */}
      <AnimatePresence>
        {isRequestsOpen && (
          <div className="modal-overlay" onClick={() => setIsRequestsOpen(false)}>
            <motion.div
              className="modal-content"
              style={{ maxWidth: 540 }}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h2>
                  <Users size={20} color="var(--accent)" /> Pending Colleague Requests
                </h2>
                <button
                  onClick={() => setIsRequestsOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {pendingRequests.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No pending connection requests.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pendingRequests.map(req => (
                      <div
                        key={req.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 12,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div>
                          <strong>{req.from_doctor?.full_name}</strong>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {req.from_doctor?.specialization}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAcceptConnection(req.id)}
                          >
                            <Check size={16} /> Accept
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRejectConnection(req.id)}
                          >
                            <X size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
