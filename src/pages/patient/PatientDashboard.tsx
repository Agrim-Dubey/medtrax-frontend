import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { patientDashboardAPI } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, u, r] = await Promise.all([patientDashboardAPI.getStats(), patientDashboardAPI.getUpcomingAppointments(), patientDashboardAPI.getRecentAppointments()]);
        setStats(s.data); setUpcoming(u.data); setRecent(r.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Loader variant="pulse" text="Loading your health data..." />;

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const statCards = [
    { icon: <Calendar size={24} />, label: 'Total Appointments', value: stats?.total_appointments ?? 0, color: 'var(--accent)' },
    { icon: <Clock size={24} />, label: 'Upcoming', value: stats?.upcoming ?? 0, color: 'var(--info)' },
    { icon: <CheckCircle size={24} />, label: 'Completed', value: stats?.completed ?? 0, color: 'var(--success)' },
    { icon: <AlertCircle size={24} />, label: 'Pending', value: stats?.pending ?? 0, color: 'var(--warning)' },
  ];

  return (
    <div>
      <div className="page-header">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Welcome, {user?.username || 'Patient'} 👋</motion.h1>
        <p>Your health overview</p>
      </div>

      <motion.div className="stats-grid" variants={container} initial="hidden" animate="show">
        {statCards.map((s, i) => (
          <motion.div key={i} className="stat-card" variants={item}>
            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="content-grid">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={20} color="var(--accent)" /> Upcoming</h2>
          {upcoming.length === 0 ? <div className="empty-state"><Calendar size={40} /><h3>No upcoming appointments</h3></div> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map((a: any) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div><strong style={{ fontSize: '0.88rem' }}>{a.doctor_name}</strong><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.specialization || 'General'}</p></div>
                  <div style={{ textAlign: 'right' }}><p style={{ color: 'var(--accent)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{a.appointment_date || a.date}</p><p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{a.appointment_time_formatted || a.appointment_time || a.time}</p></div>
                </div>
              ))}
            </div>
          }
        </motion.div>
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={20} color="var(--success)" /> Recent</h2>
          {recent.length === 0 ? <div className="empty-state"><CheckCircle size={40} /><h3>No past appointments</h3></div> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.map((a: any) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div><strong style={{ fontSize: '0.88rem' }}>{a.doctor_name}</strong><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.specialization || 'General'}</p></div>
                  <div style={{ textAlign: 'right' }}><p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{a.appointment_date || a.date}</p><span className={`badge badge-${(a.status || '').toLowerCase()}`}>{a.status}</span></div>
                </div>
              ))}
            </div>
          }
        </motion.div>
      </div>
    </div>
  );
}
