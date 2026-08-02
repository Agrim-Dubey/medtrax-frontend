import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import { authAPI } from '../../api/auth';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string; password?: string }>({});
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErrors({ email: 'Enter a valid email address' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrors({ otp: 'Enter 6-digit OTP' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authAPI.verifyPasswordResetOTP({ email: email.trim().toLowerCase(), otp });
      toast.success('OTP verified!');
      setStep('reset');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPw) {
      setErrors({ password: 'Password is required' });
      return;
    }
    if (newPw.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }
    if (newPw !== confirmPw) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authAPI.resetPassword({ email: email.trim().toLowerCase(), new_password: newPw, confirm_password: confirmPw });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err: any) {
      const errData = err.response?.data?.errors;
      toast.error(errData?.new_password?.[0] || errData?.non_field_errors?.[0] || err.response?.data?.error || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <motion.div style={{ textAlign: 'center', marginBottom: 8 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <Heart size={40} color="var(--accent)" strokeWidth={2.5} />
        </motion.div>
        <h1 style={{ textAlign: 'center' }}>
          {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'New Password'}
        </h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
          {step === 'email' ? 'Enter your email to receive a reset code' : step === 'otp' ? `Enter code sent to ${email}` : 'Set your new password'}
        </p>

        {step === 'email' && (
          <form onSubmit={handleSendOTP} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.email ? 'var(--danger)' : 'var(--text-muted)' }} />
                <input className="form-input" type="email" value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({}); }} placeholder="you@example.com" style={{ paddingLeft: 42, borderColor: errors.email ? 'var(--danger)' : undefined }} />
              </div>
              {errors.email && <div className="form-error"><AlertCircle size={13} /> {errors.email}</div>}
            </div>
            <motion.button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} whileTap={{ scale: 0.98 }}>
              {loading ? <div className="dna-loader" style={{ height: 22 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />)}</div> : 'Send OTP'}
            </motion.button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label className="form-label">OTP Code</label>
              <input className="form-input" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); if (errors.otp) setErrors({}); }} placeholder="Enter 6-digit code" maxLength={6} style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: 8, fontFamily: 'var(--font-mono)', borderColor: errors.otp ? 'var(--danger)' : undefined }} />
              {errors.otp && <div className="form-error"><AlertCircle size={13} /> {errors.otp}</div>}
            </div>
            <motion.button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} whileTap={{ scale: 0.98 }}>
              {loading ? <div className="dna-loader" style={{ height: 22 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />)}</div> : 'Verify'}
            </motion.button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.password ? 'var(--danger)' : 'var(--text-muted)' }} />
                <input className="form-input" type={showPw ? 'text' : 'password'} value={newPw} onChange={e => { setNewPw(e.target.value); if (errors.password) setErrors({}); }} placeholder="Min 8 characters" style={{ paddingLeft: 42, paddingRight: 42, borderColor: errors.password ? 'var(--danger)' : undefined }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.password ? 'var(--danger)' : 'var(--text-muted)' }} />
                <input className="form-input" type="password" value={confirmPw} onChange={e => { setConfirmPw(e.target.value); if (errors.password) setErrors({}); }} placeholder="Confirm password" style={{ paddingLeft: 42, borderColor: errors.password ? 'var(--danger)' : undefined }} />
              </div>
              {errors.password && <div className="form-error"><AlertCircle size={13} /> {errors.password}</div>}
            </div>
            <motion.button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} whileTap={{ scale: 0.98 }}>
              {loading ? <div className="dna-loader" style={{ height: 22 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />)}</div> : 'Reset Password'}
            </motion.button>
          </form>
        )}
        <p className="auth-footer"><Link to="/login">← Back to Login</Link></p>
      </motion.div>
    </div>
  );
}