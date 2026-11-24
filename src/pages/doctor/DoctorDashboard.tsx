import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Video,
  MessageSquare,
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doctorDashboardAPI } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import { CardSkeleton, TableRowSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { useDebounce } from '../../hooks/useDebounce';

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

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [today, setToday] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredToday = useMemo(() => {
    return today.filter((apt) => {
      const matchesSearch = !debouncedSearch || apt.patient_name?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [today, debouncedSearch, statusFilter]);

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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            Welcome back, Dr. {user?.username || 'Doctor'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0' }}>
            Clinical Operations & Telehealth Patient Appointments Overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/doctor/chat')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MessageSquare size={14} /> Consultation Chat
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/doctor/appointments')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Calendar size={14} /> View Full Schedule
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Today's Appts"
          value={stats?.total_appointments_today ?? 0}
          icon={<Calendar size={22} />}
          color="var(--accent)"
          trend={{ value: 'Daily active', positive: true }}
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

      {/* Clinical Capacity & Queue Flow HUD */}
      <div
        style={{
          marginBottom: 24,
          padding: '16px 20px',
          borderRadius: 14,
          background: '#0f172a',
          border: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>
              Daily Clinical Capacity
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
              {stats?.total_appointments_today ?? 0} / 12 Patients Booked ({Math.min(100, Math.round(((stats?.total_appointments_today ?? 0) / 12) * 100))}%)
            </span>
          </div>
          <div style={{ height: 6, background: '#1e293b', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(8, Math.round(((stats?.total_appointments_today ?? 0) / 12) * 100)))}%`,
                background: 'linear-gradient(90deg, #0ea5e9, #34d399)',
                borderRadius: 999,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#94a3b8' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
            <span>Avg Session: <strong>18 mins</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#94a3b8' }}>
            <Clock size={14} color="#38bdf8" />
            <span>Queue Pace: <strong>On Track</strong></span>
          </div>
        </div>
      </div>

      {/* AI Clinical Suite Banner */}
      <div
        style={{
          marginBottom: 24,
          padding: '16px 22px',
          borderRadius: 14,
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#f8fafc', display: 'block', fontWeight: 700 }}>
              PharmaGuard Clinical Safety & SOAP Documentation AI
            </strong>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Automated drug-drug interaction validation, allergy contraindication checks, and clinical SOAP documentation.
            </span>
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/doctor/ai-agents')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          Open AI Clinical Suite <ChevronRight size={14} />
        </button>
      </div>

      <div className="content-grid">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
                <Calendar size={18} color="var(--accent)" /> Today's Consultation Schedule
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Showing {filteredToday.length} of {today.length} scheduled sessions
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: 150 }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.78rem',
                    background: '#090d16',
                    border: '1px solid #1e293b',
                    borderRadius: 8,
                    color: '#f8fafc',
                    outline: 'none',
                    width: 140,
                  }}
                />
              </div>

              {(['all', 'confirmed', 'pending', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    borderRadius: 9999,
                    border: '1px solid',
                    borderColor: statusFilter === st ? '#38bdf8' : '#1e293b',
                    background: statusFilter === st ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    color: statusFilter === st ? '#38bdf8' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredToday.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="No appointments match"
              description={searchQuery || statusFilter !== 'all' ? "Try adjusting your search query or filter tags." : "No patient consultations are scheduled for today."}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Time & Mode</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredToday.map((apt: any) => {
                    const initials = getInitials(apt.patient_name);
                    const avatarBg = getAvatarBg(apt.patient_name);
                    const isVideo = apt.consultation_type !== 'in_person';

                    return (
                      <tr key={apt.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: avatarBg,
                                color: '#04101e',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <strong style={{ display: 'block', fontSize: '0.88rem', color: '#f8fafc' }}>
                                {apt.patient_name || 'Anonymous Patient'}
                              </strong>
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                {apt.reason || 'General Clinical Follow-up'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                              <Clock size={12} color="#38bdf8" />
                              <span>{apt.appointment_time_formatted || apt.appointment_time || 'Scheduled'}</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: isVideo ? '#38bdf8' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                              {isVideo ? <Video size={11} /> : <UserCheck size={11} />}
                              {isVideo ? 'HD Telehealth' : 'In-Person'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <Badge variant={apt.status} pulse={apt.status === 'confirmed'}>
                            {apt.status}
                          </Badge>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          {apt.status === 'confirmed' ? (
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '5px 10px', fontSize: '0.75rem', gap: 5 }}
                                onClick={() => navigate(`/doctor/video/${apt.id}`)}
                                title="Start Video Consultation"
                              >
                                <Video size={13} />
                                <span>Join</span>
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '5px 10px', fontSize: '0.75rem', gap: 5 }}
                                onClick={() => navigate('/doctor/chat')}
                                title="Open Patient Chat"
                              >
                                <MessageSquare size={13} />
                                <span>Chat</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                              onClick={() => navigate('/doctor/appointments')}
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Right side: Upcoming Consultations Timeline */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
              <TrendingUp size={18} color="var(--info)" /> Upcoming Clinical Queue
            </h2>
            <button
              type="button"
              onClick={() => navigate('/doctor/appointments')}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              See all <ChevronRight size={13} />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Clock size={28} />}
              title="No upcoming consultations"
              description="New scheduled sessions will appear here as patients book appointments."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.slice(0, 5).map((apt: any) => {
                const initials = getInitials(apt.patient_name);
                const avatarBg = getAvatarBg(apt.patient_name);

                return (
                  <div
                    key={apt.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: '#090d16',
                      borderRadius: 10,
                      border: '1px solid #1e293b',
                      transition: 'border-color 0.2s ease, background 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                        <strong style={{ fontSize: '0.86rem', color: '#f8fafc', display: 'block' }}>
                          {apt.patient_name}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {apt.reason || 'General Routine'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', margin: 0, fontWeight: 600 }}>
                        {apt.appointment_date}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0' }}>
                        {apt.appointment_time_formatted || apt.appointment_time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {reviews.length > 0 && (
        <motion.div className="glass-card" style={{ marginTop: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
              <Star size={18} color="var(--warning)" /> Patient Feedback & Clinical Reviews
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#94a3b8' }}>
              <ShieldCheck size={14} color="#34d399" />
              <span>Verified Patients</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {reviews.map((r: any) => (
              <div
                key={r.id}
                style={{
                  padding: '16px',
                  background: '#090d16',
                  borderRadius: 12,
                  border: '1px solid #1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getInitials(r.patient_name)}
                      </div>
                      <strong style={{ fontSize: '0.86rem', color: '#f8fafc' }}>{r.patient_name}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < r.rating ? '#fbbf24' : 'none'}
                          color={i < r.rating ? '#fbbf24' : '#334155'}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                    "{r.comment}"
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid #1e293b', paddingTop: 8 }}>
                  <span>Teleconsultation Session</span>
                  <span>Verified Visit</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
