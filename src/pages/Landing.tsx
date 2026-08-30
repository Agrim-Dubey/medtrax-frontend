import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Calendar, FileText, Zap, Heart, Video, MessageSquare, Activity } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="page-container">
      <ThreeBackground />
      <section className="landing-hero">
        <motion.div className="landing-content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
          <motion.div className="landing-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Heart size={14} /> Healthcare Reimagined
          </motion.div>
          <motion.h1 className="landing-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}>
            The Future of Healthcare Management
          </motion.h1>
          <motion.p className="landing-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            Seamlessly connect patients and doctors with intelligent appointment scheduling, digital prescriptions, and real-time communication.
          </motion.p>
          <motion.div className="landing-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>Get Started</button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>Sign In</button>
          </motion.div>
        </motion.div>
      </section>
      <section style={{ position: 'relative', zIndex: 10, paddingBottom: '40px' }}>
        {/* Clinical Metrics Banner */}
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto 48px auto',
            padding: '24px 32px',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>99.9%</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Uptime Telehealth Infrastructure</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>&lt; 15 min</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Average Virtual Queue Wait</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--info)' }}>256-bit</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Encrypted Clinical Data Channels</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>Zero Lag</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Real-Time WebRTC Peer Consults</p>
          </div>
        </div>

        <div className="landing-features" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {[
            { icon: <Calendar size={28} />, title: 'Intelligent Scheduling', desc: 'Real-time doctor appointment slots with live queue position updates and zero scheduling conflicts.' },
            { icon: <Video size={28} />, title: 'WebRTC Teleconsultations', desc: 'Peer-to-peer low-latency encrypted HD video calls with screen sharing and speech diagnostics.' },
            { icon: <FileText size={28} />, title: 'Digital Rx & PDF Export', desc: 'Tamper-evident medical prescriptions complete with dosages, lab orders, and printable barcode letterheads.' },
            { icon: <MessageSquare size={28} />, title: 'Doctor-Patient Messenger', desc: 'Secure asynchronous instant messaging, consultation chats, and doctor peer referral networks.' },
            { icon: <Activity size={28} />, title: 'Vitals & Clinical Analytics', desc: 'Instant regex tracking for blood pressure, heart rate, temperature, and vital signs monitoring.' },
            { icon: <Shield size={28} />, title: 'Enterprise Medical Security', desc: 'Multi-layer JWT session management, RBAC authorization, and hardened HIPAA-compliant storage.' },
          ].map((f, i) => (
            <motion.div key={i} className="landing-feature-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }} viewport={{ once: true }}>
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <footer style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border-primary)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Zap size={14} /> MedTrax © {new Date().getFullYear()}. Built for better healthcare.
        </div>
      </footer>
    </div>
  );
}
