import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, X, Clock, Video, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentsAPI } from '../../api/appointments';
import { useDebounce } from '../../hooks/useDebounce';
import Tabs from '../../components/Tabs';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'requests' | 'all'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredRequests = useMemo(() => {
    if (!debouncedSearch) return requests;
    const q = debouncedSearch.toLowerCase();
    return requests.filter(
      (r) => r.patient_name?.toLowerCase().includes(q) || r.reason?.toLowerCase().includes(q)
    );
  }, [requests, debouncedSearch]);

  const filteredAppointments = useMemo(() => {
    if (!debouncedSearch) return appointments;
    const q = debouncedSearch.toLowerCase();
    return appointments.filter(
      (a) => a.patient_name?.toLowerCase().includes(q) || a.reason?.toLowerCase().includes(q)
    );
  }, [appointments, debouncedSearch]);

  const load = async () => {
    setLoading(true);
    try {
      const [req, all] = await Promise.all([appointmentsAPI.getDoctorRequests(), appointmentsAPI.getDoctorAppointments()]);
      setRequests(req.data);
      setAppointments(all.data);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (id: number) => {
    try { await appointmentsAPI.acceptAppointment(id); toast.success('Accepted!'); load(); } catch { toast.error('Failed'); }
  };

  const confirmReject = async () => {
    if (!rejectTargetId) return;
    setRejecting(true);
    try {
      await appointmentsAPI.rejectAppointment(rejectTargetId);
      toast.success('Appointment request declined');
      setRejectTargetId(null);
      load();
    } catch {
      toast.error('Failed to reject appointment');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Appointments</h1>
          <p>Manage your patient appointments</p>
        </div>
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search patient or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>
      </div>
      <Tabs<'requests' | 'all'>
        tabs={[
          { id: 'requests', label: 'Pending Requests', icon: <Clock size={15} />, badge: requests.length },
          { id: 'all', label: 'All Consultations', icon: <Calendar size={15} />, badge: appointments.length },
        ]}
        activeTab={tab}
        onChange={(newTab) => setTab(newTab)}
      />

      {tab === 'requests' && (
        filteredRequests.length === 0 ? <div className="empty-state"><Clock size={48} /><h3>No pending requests</h3></div> :
        <div style={{ display: 'grid', gap: 12 }}>
          {filteredRequests.map((r: any, i: number) => (
            <motion.div key={r.id} className="glass-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <strong>{r.patient_name}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.appointment_date} at {r.appointment_time_formatted || r.appointment_time}</p>
                {r.reason && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{r.reason}</p>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-success btn-sm" onClick={() => handleAccept(r.id)}><Check size={16} /> Accept</button>
                <button className="btn btn-danger btn-sm" onClick={() => setRejectTargetId(r.id)}><X size={16} /> Reject</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'all' && (
        filteredAppointments.length === 0 ? <div className="empty-state"><Calendar size={48} /><h3>No appointments yet</h3></div> :
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredAppointments.map((a: any) => (
                <tr key={a.id}>
                  <td><strong>{a.patient_name}</strong></td>
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
                          onClick={() => navigate(`/doctor/video/${a.id}`)}
                          title="Join Video Consultation"
                        >
                          <Video size={13} /> Video
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => navigate('/doctor/chat')}
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

      <ConfirmDialog
        isOpen={rejectTargetId !== null}
        onClose={() => setRejectTargetId(null)}
        onConfirm={confirmReject}
        title="Decline Appointment Request"
        message="Are you sure you want to decline this patient's consultation request? The patient will be notified immediately."
        confirmText="Decline Request"
        variant="danger"
        loading={rejecting}
      />
    </div>
  );
}
