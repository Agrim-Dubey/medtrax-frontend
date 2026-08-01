import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { doctorDashboardAPI } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [today, setToday] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, u, r] = await Promise.all([
          doctorDashboardAPI.getStats(),
          doctorDashboardAPI.getTodayAppointments(),
          doctorDashboardAPI.getUpcomingAppointments(),
          doctorDashboardAPI.getRecentReviews(),
        ]);
        setStats(s.data);
        setToday(t.data);
        setUpcoming(u.data);
        setReviews(r.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /><p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p></div>;

  const statCards = [
    { icon: <Calendar size={24} />, label: "Today's Appointments", value: stats?.total_appointments_today ?? 0, color: 'var(--accent)' },
    { icon: <Clock size={24} />, label: 'Pending Requests', value: stats?.pending_appointments ?? 0, color: 'var(--warning)' },
    { icon: <Users size={24} />, label: 'Upcoming', value: stats?.upcoming_appointments ?? 0, color: 'var(--info)' },
    { icon: <CheckCircle size={24} />, label: 'Completed', value: stats?.completed_appointments ?? 0, color: 'var(--success)' },
  ];

  return (
    <div>
      <div className="page-header">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          Welcome, Dr. {user?.username || 'Doctor'} 👋
        </motion.h1>
        <p>Here's your overview for today</p>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="content-grid">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={20} color="var(--accent)" /> Today's Appointments
          </h2>
          {today.length === 0 ? (
            <div className="empty-state"><Calendar size={40} /><h3>No appointments today</h3><p>Your schedule is clear</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
              <tbody>
                {today.map((apt: any) => (
                  <tr key={apt.id}>
                    <td><strong>{apt.patient_name}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.patient_gender === 'M' ? 'Male' : apt.patient_gender === 'F' ? 'Female' : 'Other'} • {apt.patient_blood_group}</span></td>
                    <td>{apt.appointment_time_formatted || apt.appointment_time}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.reason || '—'}</td>
                    <td><span className={`badge badge-${apt.status}`}>{apt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="var(--accent)" /> Upcoming Appointments
          </h2>
          {upcoming.length === 0 ? (
            <div className="empty-state"><Clock size={40} /><h3>No upcoming</h3><p>No upcoming appointments</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.slice(0, 5).map((apt: any) => (
                <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{apt.patient_name}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{apt.reason || 'General'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{apt.appointment_date}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.appointment_time_formatted || apt.appointment_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {reviews.length > 0 && (
        <motion.div className="glass-card" style={{ marginTop: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={20} color="var(--warning)" /> Recent Reviews
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {reviews.map((r: any) => (
              <div key={r.id} style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong>{r.patient_name}</strong>
                  <div style={{ display: 'flex', gap: 2 }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill={i < r.rating ? 'var(--warning)' : 'none'} color={i < r.rating ? 'var(--warning)' : 'var(--text-muted)'} />)}</div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.comment}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{r.time_ago}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
