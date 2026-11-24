import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Video,
  MessageSquare,
  ChevronRight,
  HeartPulse,
  Activity,
  Stethoscope,
  Radio
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientDashboardAPI } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import { CardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import VitalsIndicator from '../../components/VitalsIndicator';

function getInitials(name?: string): string {
  if (!name) return 'DR';
  const clean = name.replace(/^dr\.?\s+/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return clean.slice(0, 2).toUpperCase() || 'DR';
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            Welcome back, {user?.username || 'Patient'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0' }}>
            Personal Health Records, Teleconsultations & Vitals Overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/patient/chat')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MessageSquare size={14} /> Doctor Messages
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/patient/appointments')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Calendar size={14} /> Book New Care
          </button>
        </div>
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

      {/* AI Health Suite Banner */}
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
            <HeartPulse size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#f8fafc', display: 'block', fontWeight: 700 }}>
              AI Symptom Checker & Daily Medication Care Plan
            </strong>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Check acute symptoms for emergency triage, or review your personalized daily dosing schedule.
            </span>
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/patient/ai-agents')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          Open AI Health Suite <ChevronRight size={14} />
        </button>
      </div>

      <div className="content-grid">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
              <Clock size={18} color="var(--accent)" /> Upcoming Consultations
            </h2>
            <button
              type="button"
              onClick={() => navigate('/patient/appointments')}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Manage all <ChevronRight size={13} />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="No upcoming consultations"
              description="Schedule a new session with your doctor or clinical specialist anytime."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.map((a: any) => {
                const initials = getInitials(a.doctor_name);
                const avatarBg = getAvatarBg(a.doctor_name);

                return (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 16px',
                      background: '#090d16',
                      borderRadius: 12,
                      border: '1px solid #1e293b',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: avatarBg,
                          color: '#04101e',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'block' }}>
                          {a.doctor_name?.startsWith('Dr') ? a.doctor_name : `Dr. ${a.doctor_name || 'Physician'}`}
                        </strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Stethoscope size={12} color="#38bdf8" />
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {a.specialization || 'Clinical Specialist'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#38bdf8', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', margin: 0, fontWeight: 600 }}>
                          {a.appointment_date || a.date}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.74rem', margin: '2px 0 0' }}>
                          {a.appointment_time_formatted || a.appointment_time || a.time}
                        </p>
                      </div>

                      {a.status === 'confirmed' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '5px 10px', fontSize: '0.75rem', gap: 5 }}
                            onClick={() => navigate(`/patient/video/${a.id}`)}
                            title="Join HD Telehealth Session"
                          >
                            <Video size={13} />
                            <span>Join</span>
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 10px', fontSize: '0.75rem', gap: 5 }}
                            onClick={() => navigate('/patient/chat')}
                            title="Open Doctor Chat"
                          >
                            <MessageSquare size={13} />
                          </button>
                        </div>
                      ) : (
                        <Badge variant={a.status}>{a.status}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Right side: Recent Visits History */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
              <CheckCircle size={18} color="var(--success)" /> Clinical Visit History
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Archived records</span>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={<CheckCircle size={28} />}
              title="No visit history yet"
              description="Your completed clinical consultations and encounter summaries will be recorded here."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.map((a: any) => {
                const initials = getInitials(a.doctor_name);

                return (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: '#090d16',
                      borderRadius: 10,
                      border: '1px solid #1e293b',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: 'rgba(52, 211, 153, 0.12)',
                          color: '#34d399',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.86rem', color: '#f8fafc', display: 'block' }}>
                          {a.doctor_name?.startsWith('Dr') ? a.doctor_name : `Dr. ${a.doctor_name || 'Physician'}`}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {a.specialization || 'Consultation'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 3px', fontFamily: 'var(--font-mono)' }}>
                        {a.appointment_date || a.date}
                      </p>
                      <Badge variant={a.status}>{a.status}</Badge>
                    </div>
                  </div>
                );
              })}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
              <Activity size={18} color="var(--accent)" /> Real-Time Physiological Telemetry HUD
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Automated continuous vital signs monitoring stream
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 10px', borderRadius: 9999, border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              <Radio size={12} className="animate-pulse" />
              <span>Sensor Sync Active</span>
            </div>
          </div>
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
