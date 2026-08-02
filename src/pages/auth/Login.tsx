import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Heart, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login({ email: email.trim().toLowerCase(), password });
      const data = res.data;
      if (data.success) {
        if (data.is_profile_complete === false) {
          sessionStorage.setItem('medtrax_pending_email', data.email || email);
          sessionStorage.setItem('medtrax_pending_role', data.role);
          toast('Please complete your profile first.', { icon: '📋' });
          navigate('/complete-profile');
          return;
        }
        if (data.access_token) {
          localStorage.setItem('medtrax_token', data.access_token);
        }
        login(data.user);
        toast.success(`Welcome back, ${data.user?.username || 'User'}!`);
        navigate(data.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (err: any) {
      const d = err.response?.data;
      const msg = d?.errors?.non_field_errors?.[0] || d?.error || d?.errors?.email?.[0] || d?.detail || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div className="auth-card" initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <motion.div style={{ textAlign: 'center', marginBottom: 8 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <Heart size={40} color="var(--accent)" strokeWidth={2.5} />
        </motion.div>
        <h1 style={{ textAlign: 'center' }}>Welcome Back</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>Sign in to your MedTrax account</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.email ? 'var(--danger)' : 'var(--text-muted)' }} />
              <input className="form-input" type="email" placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                style={{ paddingLeft: 42, borderColor: errors.email ? 'var(--danger)' : undefined }} />
            </div>
            {errors.email && <div className="form-error"><AlertCircle size={13} /> {errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.password ? 'var(--danger)' : 'var(--text-muted)' }} />
              <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password}
                onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                style={{ paddingLeft: 42, paddingRight: 42, borderColor: errors.password ? 'var(--danger)' : undefined }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <div className="form-error"><AlertCircle size={13} /> {errors.password}</div>}
          </div>
          <div style={{ textAlign: 'right', marginBottom: 22 }}>
            <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 500 }}>Forgot Password?</Link>
          </div>
          <motion.button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} whileTap={{ scale: 0.98 }}>
            {loading ? <div className="dna-loader" style={{ height: 22 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />)}</div> : 'Sign In'}
          </motion.button>
        </form>
        <p className="auth-footer">Don't have an account? <Link to="/signup">Create one</Link></p>
      </motion.div>
    </div>
  );
}