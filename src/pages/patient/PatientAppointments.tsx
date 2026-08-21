import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Video, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentsAPI } from '../../api/appointments';
import { getWebSocketUrl } from '../../utils/websocket';
import { useDebounce } from '../../hooks/useDebounce';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { TableRowSkeleton } from '../../components/Skeleton';
import Tabs from '../../components/Tabs';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'list' | 'book'>('list');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [queueInfo, setQueueInfo] = useState<any>(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const debouncedDoctorSearch = useDebounce(doctorSearch, 300);
  const queueWsRef = useRef<WebSocket | null>(null);

  const filteredDoctors = useMemo(() => {
    if (!debouncedDoctorSearch) return doctors;
    const q = debouncedDoctorSearch.toLowerCase();
    return doctors.filter((d) => {
      const name = (d.full_name || `${d.first_name || ''} ${d.last_name || ''}`).toLowerCase();
      const spec = (d.specialization || '').toLowerCase();
      const city = (d.city || '').toLowerCase();
      return name.includes(q) || spec.includes(q) || city.includes(q);
    });
  }, [doctors, debouncedDoctorSearch]);

  useEffect(() => {
    appointmentsAPI.getPatientAppointments().then(r => setAppointments(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'book') appointmentsAPI.getAvailableDoctors().then(r => setDoctors(r.data)).catch(() => {});
  }, [tab]);

  const fetchSlots = async (doctorId: number, d: string) => {
    if (!d) return;
    try { const r = await appointmentsAPI.getDoctorSlots(doctorId, d); setSlots(r.data.available_slots || []); } catch { setSlots([]); }
  };

  useEffect(() => {
    if (!selectedDoctor?.id) {
      setQueueInfo(null);
      return;
    }

    appointmentsAPI.getDoctorQueueInfo(selectedDoctor.id)
      .then(res => setQueueInfo(res.data))
      .catch(() => setQueueInfo(null));

    const wsUrl = getWebSocketUrl(`ws/queue/${selectedDoctor.id}/`);
    const ws = new WebSocket(wsUrl);
    queueWsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setQueueInfo((prev: any) => ({ ...prev, ...data }));
      } catch {
        // silent
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [selectedDoctor]);

  const handleBook = async () => {
    if (!selectedDoctor || !date || !selectedSlot) return toast.error('Select doctor, date & time');
    setBooking(true);
    try {
      await appointmentsAPI.bookAppointment({ doctor_id: selectedDoctor.id, appointment_date: date, appointment_time: selectedSlot, reason });
      toast.success('Appointment requested!');
      setTab('list'); setSelectedDoctor(null); setDate(''); setSlots([]); setSelectedSlot(''); setReason('');
      const r = await appointmentsAPI.getPatientAppointments(); setAppointments(r.data);
    } catch (err: any) { toast.error(err.response?.data?.error || err.response?.data?.appointment_date?.[0] || 'Booking failed'); }
    setBooking(false);
  };

  if (loading) {
    return (
      <div>
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div style={{ height: 32, width: 220, background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 16, width: 160, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }} />
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <table className="data-table">
            <tbody>
              <TableRowSkeleton columns={6} />
              <TableRowSkeleton columns={6} />
              <TableRowSkeleton columns={6} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Consultation Appointments</h1>
        <p>Book new visits and track pending consultations</p>
      </div>

      <Tabs<'list' | 'book'>
        tabs={[
          { id: 'list', label: 'My Appointments', icon: <Calendar size={15} />, badge: appointments.length },
          { id: 'book', label: 'Book Consultation', icon: <Plus size={15} /> },
        ]}
        activeTab={tab}
        onChange={(t) => setTab(t)}
      />

      {tab === 'book' ? (
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Book an Appointment</h2>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Select Doctor</label>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter by name, spec..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.78rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gap: 8, maxHeight: 250, overflowY: 'auto' }}>
              {filteredDoctors.map((d: any) => (
                <div key={d.id} onClick={() => { setSelectedDoctor(d); setSlots([]); setSelectedSlot(''); if (date) fetchSlots(d.id, date); }}
                  style={{ padding: '12px 16px', background: selectedDoctor?.id === d.id ? 'var(--accent-soft)' : 'var(--bg-input)', border: `1px solid ${selectedDoctor?.id === d.id ? 'var(--accent)' : 'var(--border-primary)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' }}>
                  <strong>{d.full_name || `Dr. ${d.first_name || ''} ${d.last_name || ''}`}</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    {d.specialization || 'General'} {d.qualification ? `• ${d.qualification}` : ''} {d.city ? `• ${d.city}` : ''}
                  </p>
                </div>
              ))}
              {filteredDoctors.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '12px 0' }}>
                  {doctorSearch ? 'No matching doctors found' : 'No doctors available'}
                </p>
              )}
            </div>

            {queueInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  marginTop: 14,
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(30, 41, 59, 0.6) 100%)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                      animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                      }}
                    />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: '0.9rem', color: '#f0f9ff' }}>Live Clinic Queue</strong>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 9999, background: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent)', fontWeight: 600 }}>
                        Real-time
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>{queueInfo.current_queue_count ?? 0}</strong> patients ahead in queue • Est. wait ~<strong>{queueInfo.estimated_wait_time ?? 0} mins</strong>
                    </p>
                  </div>
                </div>

                {queueInfo.current_session && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', background: 'rgba(15, 23, 42, 0.7)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Now Serving:</span>
                    <strong style={{ color: 'var(--accent)' }}>Session #{queueInfo.current_session}</strong>
                  </div>
                )}
              </motion.div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={date} min={new Date().toISOString().split('T')[0]}
                onChange={e => { setDate(e.target.value); setSelectedSlot(''); if (selectedDoctor) fetchSlots(selectedDoctor.id, e.target.value); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Available Slots</label>
              {slots.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {slots.map(s => (
                    <button key={s} onClick={() => setSelectedSlot(s)} className={`btn btn-sm ${selectedSlot === s ? 'btn-primary' : 'btn-secondary'}`}>{s}</button>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '12px 0' }}>{date ? 'No slots available' : 'Select a date'}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason (optional)</label>
            <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe your concern..." rows={3} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleBook} disabled={booking || !selectedDoctor || !date || !selectedSlot}>
            {booking ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Request Appointment'}
          </button>
        </motion.div>
      ) : (
        appointments.length === 0 ? (
          <EmptyState
            icon={<Calendar size={32} />}
            title="No appointments scheduled"
            description="You don't have any appointments on record. Select a doctor to request a consultation."
            actionLabel="Book First Appointment"
            onAction={() => setTab('book')}
          />
        ) : (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table className="data-table">
            <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {appointments.map((a: any) => (
                <tr key={a.id}>
                  <td><strong>{a.doctor_name || `Dr. ${a.doctor?.first_name || ''}`}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.specialization || a.doctor?.specialization || ''}</span></td>
                  <td>{a.appointment_date}</td>
                  <td>{a.appointment_time_formatted || a.appointment_time}</td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || '—'}</td>
                  <td><Badge variant={a.status} pulse={a.status === 'confirmed'}>{a.status}</Badge></td>
                  <td>
                    {a.status === 'confirmed' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => navigate(`/patient/video/${a.id}`)}
                          title="Join Video Consultation"
                        >
                          <Video size={13} /> Video
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => navigate('/patient/chat')}
                          title="Open Chat"
                        >
                          <MessageSquare size={13} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        )
      )}
    </div>
  );
}
