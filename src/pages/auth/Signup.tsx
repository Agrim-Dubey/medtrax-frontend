import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Heart, Stethoscope, UserCheck, AlertCircle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import { authAPI } from '../../api/auth';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PW_RULES = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(p) },
];

export default function Signup() {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'doctor' | 'patient' | ''>('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email)) e.email = 'Enter a valid email address';
    if (!password1) e.password1 = 'Password is required';
    else if (PW_RULES.some(r => !r.test(password1))) e.password1 = 'Password does not meet requirements';
    if (!password2) e.password2 = 'Please confirm your password';
    else if (password1 !== password2) e.password2 = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.signup({ email: email.trim().toLowerCase(), password1, password2, role });
      if (res.data.success) {
        sessionStorage.setItem('medtrax_pending_email', email.trim().toLowerCase());
        sessionStorage.setItem('medtrax_pending_role', role);
        toast.success('OTP sent to your email!');
        navigate('/verify-otp');
      }
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      const msg = errs?.email?.[0] || errs?.password1?.[0] || errs?.non_field_errors?.[0] || err.response?.data?.error || 'Signup failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  if (step === 'role') {
    return (
      <div className="auth-container">
        <ThreeBackground />
        <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div style={{ textAlign: 'center', marginBottom: 8 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <Heart size={40} color="var(--accent)" strokeWidth={2.5} />
          </motion.div>
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
          <motion.button className="btn btn-primary btn-full btn-lg" disabled={!role} onClick={() => setStep('form')} whileTap={{ scale: 0.98 }}>Continue</motion.button>
          <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div className="auth-card" style={{ maxWidth: 460 }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <motion.div style={{ textAlign: 'center', marginBottom: 8 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <Heart size={40} color="var(--accent)" strokeWidth={2.5} />
        </motion.div>
        <h1 style={{ textAlign: 'center' }}>Create Account</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>Signing up as <span className={`badge badge-${role}`}>{role}</span></p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.email ? 'var(--danger)' : 'var(--text-muted)' }} />
              <input className="form-input" type="email" placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                style={{ paddingLeft: 42, borderColor: errors.email ? 'var(--danger)' : undefined }} />
            </div>
            {errors.email && <div className="form-error"><AlertCircle size={13} /> {errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.password1 ? 'var(--danger)' : 'var(--text-muted)' }} />
              <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Create a strong password" value={password1}
                onChange={e => { setPassword1(e.target.value); if (errors.password1) setErrors(p => ({ ...p, password1: '' })); }}
                style={{ paddingLeft: 42, paddingRight: 42, borderColor: errors.password1 ? 'var(--danger)' : undefined }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8 }}>
                {PW_RULES.map((r, i) => (
                  <span key={i} style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 3, color: r.test(password1) ? 'var(--success)' : 'var(--text-muted)' }}>
                    {r.test(password1) ? <Check size={11} /> : <X size={11} />} {r.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.password2 ? 'var(--danger)' : 'var(--text-muted)' }} />
              <input className="form-input" type="password" placeholder="Re-enter password" value={password2}
                onChange={e => { setPassword2(e.target.value); if (errors.password2) setErrors(p => ({ ...p, password2: '' })); }}
                style={{ paddingLeft: 42, borderColor: errors.password2 ? 'var(--danger)' : undefined }} />
            </div>
            {errors.password2 && <div className="form-error"><AlertCircle size={13} /> {errors.password2}</div>}
          </div>
          <motion.button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} whileTap={{ scale: 0.98 }}>
            {loading ? <div className="dna-loader" style={{ height: 22 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />)}</div> : 'Create Account'}
          </motion.button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setStep('role')}>← Change Role</button>
        </div>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </motion.div>
    </div>
  );
}