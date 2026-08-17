import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, CheckCircle, Star, TrendingUp, Video, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doctorDashboardAPI } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import { CardSkeleton, TableRowSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        setStats(s.data); setToday(t.data); setUpcoming(u.data); setReviews(r.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div style={{ height: 32, width: 280, background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 16, width: 180, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }} />
        </div>
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
        </div>
        <div className="content-grid">
          <div className="glass-card" style={{ padding: 20 }}>
            <table className="data-table">
              <tbody>
                <TableRowSkeleton columns={4} />
                <TableRowSkeleton columns={4} />
                <TableRowSkeleton columns={4} />
              </tbody>
            </table>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <CardSkeleton lines={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Welcome, Dr. {user?.username || 'Doctor'} 👋</motion.h1>
        <p>Here's your overview for today</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Today's Appts"
          value={stats?.total_appointments_today ?? 0}
          icon={<Calendar size={22} />}
          color="var(--accent)"
          trend={{ value: 'Daily sync', positive: true }}
        />
        <StatCard
          label="Pending Requests"
          value={stats?.pending_appointments ?? 0}
          icon={<Clock size={22} />}
          color="var(--warning)"
        />
        <StatCard
          label="Upcoming"
          value={stats?.upcoming_appointments ?? 0}
          icon={<Users size={22} />}
          color="var(--info)"
        />
        <StatCard
          label="Completed"
          value={stats?.completed_appointments ?? 0}
          icon={<CheckCircle size={22} />}
          color="var(--success)"
        />
      </div>

      <div className="content-grid">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={20} color="var(--accent)" /> Today's Appointments
          </h2>
          {today.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="No appointments today"
              description="Your consultation schedule is clear for today."
            />
          ) : (
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {today.map((apt: any) => (
                  <tr key={apt.id}>
                    <td><strong>{apt.patient_name}</strong></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{apt.appointment_time_formatted || apt.appointment_time}</td>
                    <td><Badge variant={apt.status} pulse={apt.status === 'confirmed'}>{apt.status}</Badge></td>
                    <td>
                      {apt.status === 'confirmed' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 7px', fontSize: '0.72rem' }}
                            onClick={() => navigate(`/doctor/video/${apt.id}`)}
                            title="Start Video Consultation"
                          >
                            <Video size={12} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 7px', fontSize: '0.72rem' }}
                            onClick={() => navigate('/doctor/chat')}
                            title="Open Chat"
                          >
                            <MessageSquare size={12} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="var(--info)" /> Upcoming
          </h2>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Clock size={28} />}
              title="No upcoming consultations"
              description="New scheduled sessions will show up here."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.slice(0, 5).map((apt: any) => (
                <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', transition: 'var(--transition)' }}>
                  <div><strong style={{ fontSize: '0.88rem' }}>{apt.patient_name}</strong><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{apt.reason || 'General'}</p></div>
                  <div style={{ textAlign: 'right' }}><p style={{ fontSize: '0.82rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{apt.appointment_date}</p><p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{apt.appointment_time_formatted || apt.appointment_time}</p></div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {reviews.length > 0 && (
        <motion.div className="glass-card" style={{ marginTop: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Star size={20} color="var(--warning)" /> Reviews</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {reviews.map((r: any) => (
              <div key={r.id} style={{ padding: 14, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: '0.88rem' }}>{r.patient_name}</strong>
                  <div style={{ display: 'flex', gap: 2 }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill={i < r.rating ? 'var(--warning)' : 'none'} color={i < r.rating ? 'var(--warning)' : 'var(--text-muted)'} />)}</div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
