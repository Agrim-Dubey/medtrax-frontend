import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentsAPI } from '../../api/appointments';

export default function DoctorAppointments() {
  const [tab, setTab] = useState<'requests' | 'all'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const handleReject = async (id: number) => {
    try { await appointmentsAPI.rejectAppointment(id); toast.success('Rejected'); load(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header"><h1>Appointments</h1><p>Manage your patient appointments</p></div>
      <div className="tabs">
        <button className={`tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>Pending ({requests.length})</button>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All ({appointments.length})</button>
      </div>

      {tab === 'requests' && (
        requests.length === 0 ? <div className="empty-state"><Clock size={48} /><h3>No pending requests</h3></div> :
        <div style={{ display: 'grid', gap: 12 }}>
          {requests.map((r: any, i: number) => (
            <motion.div key={r.id} className="glass-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <strong>{r.patient_name}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.appointment_date} at {r.appointment_time_formatted || r.appointment_time}</p>
                {r.reason && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{r.reason}</p>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-success btn-sm" onClick={() => handleAccept(r.id)}><Check size={16} /> Accept</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleReject(r.id)}><X size={16} /> Reject</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'all' && (
        appointments.length === 0 ? <div className="empty-state"><Calendar size={48} /><h3>No appointments yet</h3></div> :
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {appointments.map((a: any) => (
                <tr key={a.id}>
                  <td><strong>{a.patient_name}</strong></td>
                  <td>{a.appointment_date}</td>
                  <td>{a.appointment_time_formatted || a.appointment_time}</td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || '—'}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
