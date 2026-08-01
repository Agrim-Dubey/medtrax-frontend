import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Calendar, FileText, Zap, Heart } from 'lucide-react';
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
      <section style={{ position: 'relative', zIndex: 10, paddingBottom: '80px' }}>
        <div className="landing-features">
          {[
            { icon: <Calendar size={28} />, title: 'Smart Scheduling', desc: 'Book appointments with real-time slot availability and queue tracking.' },
            { icon: <FileText size={28} />, title: 'Digital Prescriptions', desc: 'Manage medications, lab tests, and follow-ups digitally.' },
            { icon: <Shield size={28} />, title: 'Secure & Private', desc: 'Enterprise-grade encryption protecting all medical data.' },
          ].map((f, i) => (
            <motion.div key={i} className="landing-feature-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.5 }} viewport={{ once: true }}>
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
