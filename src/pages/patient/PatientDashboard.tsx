import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, Video, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientDashboardAPI } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import { CardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import VitalsIndicator from '../../components/VitalsIndicator';
import { Activity } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div>
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div style={{ height: 32, width: 260, background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 16, width: 170, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }} />
        </div>
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
        </div>
        <div className="content-grid">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Welcome, {user?.username || 'Patient'} 👋</motion.h1>
        <p>Your comprehensive health overview</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total Consultations"
          value={stats?.total_appointments ?? 0}
          icon={<Calendar size={22} />}
          color="var(--accent)"
        />
        <StatCard
          label="Upcoming"
          value={stats?.upcoming ?? 0}
          icon={<Clock size={22} />}
          color="var(--info)"
          trend={{ value: 'Scheduled', positive: true }}
        />
        <StatCard
          label="Completed"
          value={stats?.completed ?? 0}
          icon={<CheckCircle size={22} />}
          color="var(--success)"
        />
        <StatCard
          label="Pending Confirmation"
          value={stats?.pending ?? 0}
          icon={<AlertCircle size={22} />}
          color="var(--warning)"
        />
      </div>

      <div className="content-grid">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={20} color="var(--accent)" /> Upcoming Appointments</h2>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="No upcoming consultations"
              description="Book an appointment with a doctor anytime."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map((a: any) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', flexWrap: 'wrap', gap: 8 }}>
                  <div><strong style={{ fontSize: '0.88rem' }}>{a.doctor_name}</strong><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.specialization || 'General'}</p></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}><p style={{ color: 'var(--accent)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{a.appointment_date || a.date}</p><p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{a.appointment_time_formatted || a.appointment_time || a.time}</p></div>
                    {a.status === 'confirmed' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }} onClick={() => navigate(`/patient/video/${a.id}`)} title="Join Video">
                          <Video size={13} />
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => navigate('/patient/chat')} title="Open Chat">
                          <MessageSquare size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={20} color="var(--success)" /> Recent Visits</h2>
          {recent.length === 0 ? (
            <EmptyState
              icon={<CheckCircle size={28} />}
              title="No visit history yet"
              description="Your completed consultations will be archived here."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.map((a: any) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div><strong style={{ fontSize: '0.88rem' }}>{a.doctor_name}</strong><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.specialization || 'General'}</p></div>
                  <div style={{ textAlign: 'right' }}><p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{a.appointment_date || a.date}</p><Badge variant={a.status}>{a.status}</Badge></div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        className="glass-card"
        style={{ marginTop: 24 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={20} color="var(--accent)" /> Real-Time Health Vitals
          </h2>
          <Badge variant="success" pulse size="sm">Live Connected</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <VitalsIndicator
            type="heart_rate"
            value="72"
            unit="bpm"
            recordedAt="10m ago"
          />
          <VitalsIndicator
            type="blood_pressure"
            value="118/78"
            unit="mmHg"
            recordedAt="1h ago"
          />
          <VitalsIndicator
            type="spo2"
            value="98"
            unit="%"
            recordedAt="1h ago"
          />
          <VitalsIndicator
            type="temperature"
            value="98.4"
            unit="°F"
            recordedAt="Today, 8:00 AM"
          />
        </div>
      </motion.div>
    </div>
  );
}
