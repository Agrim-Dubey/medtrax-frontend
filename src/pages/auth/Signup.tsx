import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Heart, Stethoscope, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import { authAPI } from '../../api/auth';

export default function Signup() {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'doctor' | 'patient' | ''>('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password1 || !password2) return toast.error('Please fill all fields');
    if (password1 !== password2) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await authAPI.signup({ email, password1, password2, role });
      if (res.data.success) {
        sessionStorage.setItem('medtrax_pending_email', email);
        sessionStorage.setItem('medtrax_pending_role', role);
        toast.success('OTP sent to your email!');
        navigate('/verify-otp');
      }
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const msg = errors?.email?.[0] || errors?.password1?.[0] || errors?.non_field_errors?.[0] || err.response?.data?.error || 'Signup failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="auth-container">
        <ThreeBackground />
        <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}><Heart size={36} color="var(--accent)" style={{ marginBottom: 12 }} /></div>
          <h1 style={{ textAlign: 'center' }}>Join MedTrax</h1>
          <p className="auth-subtitle" style={{ textAlign: 'center' }}>Select your role to get started</p>
          <div className="role-cards">
            <motion.div className={`role-card ${role === 'doctor' ? 'selected' : ''}`} onClick={() => setRole('doctor')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Stethoscope size={36} color="var(--accent)" />
              <h3>Doctor</h3>
              <p>Manage patients & appointments</p>
            </motion.div>
            <motion.div className={`role-card ${role === 'patient' ? 'selected' : ''}`} onClick={() => setRole('patient')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <UserCheck size={36} color="var(--success)" />
              <h3>Patient</h3>
              <p>Book appointments & track health</p>
            </motion.div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" disabled={!role} onClick={() => setStep('form')}>Continue</button>
          <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}><Heart size={36} color="var(--accent)" style={{ marginBottom: 12 }} /></div>
        <h1 style={{ textAlign: 'center' }}>Create Account</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>Signing up as <span className={`badge badge-${role}`}>{role}</span></p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: 42 }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min 8 chars, uppercase, number, symbol" value={password1} onChange={e => setPassword1(e.target.value)} style={{ paddingLeft: 42, paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" type="password" placeholder="Re-enter password" value={password2} onChange={e => setPassword2(e.target.value)} style={{ paddingLeft: 42 }} />
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setStep('role')}>← Change Role</button>
        </div>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </motion.div>
    </div>
  );
}