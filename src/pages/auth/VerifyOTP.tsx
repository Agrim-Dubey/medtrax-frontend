import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import { authAPI } from '../../api/auth';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const email = sessionStorage.getItem('medtrax_pending_email') || '';

  useEffect(() => {
    if (!email) { navigate('/signup'); return; }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    text.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) return toast.error('Please enter complete OTP');
    setLoading(true);
    try {
      const res = await authAPI.verifySignupOTP({ email, otp: otpStr });
      if (res.data.success) {
        toast.success('Email verified!');
        navigate('/complete-profile');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.resendSignupOTP({ email });
      toast.success('New OTP sent!');
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resend');
    }
  };

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}><Heart size={36} color="var(--accent)" style={{ marginBottom: 12 }} /></div>
        <h1 style={{ textAlign: 'center' }}>Verify Email</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>Enter the 6-digit code sent to<br /><strong style={{ color: 'var(--accent)' }}>{email}</strong></p>
        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input key={i} ref={el => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} />
          ))}
        </div>
        <button className="btn btn-primary btn-full btn-lg" onClick={handleVerify} disabled={loading || otp.join('').length !== 6}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Verify'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          {countdown > 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Resend in {countdown}s</p>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={handleResend}><RotateCcw size={14} /> Resend OTP</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}