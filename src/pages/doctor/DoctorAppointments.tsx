import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, X, Clock, Video, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentsAPI } from '../../api/appointments';
import { useDebounce } from '../../hooks/useDebounce';
import Tabs from '../../components/Tabs';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

function getInitials(name?: string): string {
  if (!name) return 'PT';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'linear-gradient(135deg, #0284c7, #38bdf8)',
  'linear-gradient(135deg, #059669, #34d399)',
  'linear-gradient(135deg, #7c3aed, #a78bfa)',
  'linear-gradient(135deg, #d97706, #fbbf24)',
  'linear-gradient(135deg, #e11d48, #f43f5e)',
];

function getAvatarBg(name?: string): string {
  if (!name) return AVATAR_COLORS[0];
  const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
}

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
        filteredRequests.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <EmptyState
              icon={<Clock size={36} />}
              title="No pending requests"
              description="You have reviewed all incoming consultation requests. New requests will appear here immediately."
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {filteredRequests.map((r: any, i: number) => {
              const initials = getInitials(r.patient_name);
              const avatarBg = getAvatarBg(r.patient_name);

              return (
                <motion.div
                  key={r.id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    padding: '18px 22px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: avatarBg,
                        color: '#04101e',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#f8fafc', display: 'block' }}>
                        {r.patient_name}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                          {r.appointment_date} at {r.appointment_time_formatted || r.appointment_time}
                        </span>
                        <Badge variant="pending">Pending Review</Badge>
                      </div>
                      {r.reason && (
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '6px 0 0', lineHeight: 1.4 }}>
                          Reason: {r.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAccept(r.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}
                    >
                      <Check size={15} /> Accept Request
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setRejectTargetId(r.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      <X size={15} /> Decline
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      )}

      {tab === 'all' && (
        filteredAppointments.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <EmptyState
              icon={<Calendar size={36} />}
              title="No consultations found"
              description={searchQuery ? "Try refining your search term." : "No scheduled consultations recorded yet."}
            />
          </div>
        ) : (
          <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Clinical Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a: any) => {
                  const initials = getInitials(a.patient_name);
                  const avatarBg = getAvatarBg(a.patient_name);

                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: avatarBg,
                              color: '#04101e',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#f8fafc', display: 'block' }}>
                              {a.patient_name}
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                          {a.appointment_date}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {a.appointment_time_formatted || a.appointment_time}
                        </div>
                      </td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', color: '#94a3b8' }}>
                        {a.reason || 'General Follow-up'}
                      </td>
                      <td>
                        <Badge variant={a.status} pulse={a.status === 'confirmed'}>
                          {a.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {a.status === 'confirmed' ? (
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 10px', fontSize: '0.74rem', gap: 5 }}
                              onClick={() => navigate(`/doctor/video/${a.id}`)}
                              title="Join Video Consultation"
                            >
                              <Video size={13} /> Video
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 10px', fontSize: '0.74rem', gap: 5 }}
                              onClick={() => navigate('/doctor/chat')}
                              title="Open Chat"
                            >
                              <MessageSquare size={13} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )
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
