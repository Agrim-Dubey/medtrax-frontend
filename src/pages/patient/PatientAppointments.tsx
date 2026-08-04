import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Video, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentsAPI } from '../../api/appointments';
import { getWebSocketUrl } from '../../utils/websocket';

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
  const queueWsRef = useRef<WebSocket | null>(null);

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

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Appointments</h1><p>Book and manage appointments</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => setTab(tab === 'book' ? 'list' : 'book')}>
          {tab === 'book' ? <><Calendar size={16} /> My Appointments</> : <><Plus size={16} /> Book New</>}
        </button>
      </div>

      {tab === 'book' ? (
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Book an Appointment</h2>
          <div className="form-group">
            <label className="form-label">Select Doctor</label>
            <div style={{ display: 'grid', gap: 8, maxHeight: 250, overflowY: 'auto' }}>
              {doctors.map((d: any) => (
                <div key={d.id} onClick={() => { setSelectedDoctor(d); setSlots([]); setSelectedSlot(''); if (date) fetchSlots(d.id, date); }}
                  style={{ padding: '12px 16px', background: selectedDoctor?.id === d.id ? 'var(--accent-soft)' : 'var(--bg-input)', border: `1px solid ${selectedDoctor?.id === d.id ? 'var(--accent)' : 'var(--border-primary)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' }}>
                  <strong>{d.full_name || `Dr. ${d.first_name || ''} ${d.last_name || ''}`}</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    {d.specialization || 'General'} {d.qualification ? `• ${d.qualification}` : ''} {d.city ? `• ${d.city}` : ''}
                  </p>
                </div>
              ))}
              {doctors.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No doctors available</p>}
            </div>

            {queueInfo && (
              <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="pulse-dot" style={{ width: 8, height: 8 }} />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Live Waiting Queue</strong>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {queueInfo.current_queue_count} patients waiting • Estimated wait: ~{queueInfo.estimated_wait_time ?? 0} mins
                    </p>
                  </div>
                </div>
                {queueInfo.current_session && (
                  <span style={{ fontSize: '0.75rem', background: 'var(--bg-input)', padding: '4px 8px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                    Session: {queueInfo.current_session}
                  </span>
                )}
              </div>
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
        appointments.length === 0 ? <div className="empty-state"><Calendar size={48} /><h3>No appointments</h3><p>Book your first appointment!</p></div> :
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
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
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
      )}
    </div>
  );
}
