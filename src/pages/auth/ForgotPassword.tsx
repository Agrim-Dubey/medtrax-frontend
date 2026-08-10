import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import { authAPI } from '../../api/auth';
import { validation } from '../../utils/validation';

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string; password?: string }>({});
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'Email address is required' });
      return;
    }
    if (!validation.isValidEmail(email)) {
      setErrors({ email: 'Enter a valid email address (e.g. name@domain.com)' });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      toast.success('Security code sent to your email!');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to dispatch reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit verification code' });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await authAPI.verifyPasswordResetOTP({ email: email.trim().toLowerCase(), otp });
      toast.success('Code verified! Set your new password.');
      setStep('reset');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid or expired reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPw) {
      setErrors({ password: 'Password is required' });
      return;
    }
    const strength = validation.evaluatePasswordStrength(newPw);
    if (strength.score < 2) {
      setErrors({ password: 'Password is too weak. Please fulfill more requirements.' });
      return;
    }
    if (newPw !== confirmPw) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await authAPI.resetPassword({
        email: email.trim().toLowerCase(),
        new_password: newPw,
        confirm_password: confirmPw,
      });
      toast.success('Password updated successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      const errData = err.response?.data?.errors;
      toast.error(
        errData?.new_password?.[0] ||
        errData?.non_field_errors?.[0] ||
        err.response?.data?.error ||
        'Failed to reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = email.length > 3 && validation.isValidEmail(email);

  const stepsList = [
    { id: 'email', label: '1. Email' },
    { id: 'otp', label: '2. Verify Code' },
    { id: 'reset', label: '3. New Password' },
  ];

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <KeyRound size={28} color="var(--accent)" strokeWidth={2.2} />
          </div>
        </div>

        {/* Step Progress Pills */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {stepsList.map((s, idx) => {
            const currentIdx = stepsList.findIndex(st => st.id === step);
            const isDone = idx < currentIdx;
            const isCurrent = s.id === step;

            return (
              <span
                key={s.id}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: 100,
                  background: isCurrent
                    ? 'rgba(56, 189, 248, 0.2)'
                    : isDone
                    ? 'rgba(52, 211, 153, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: isCurrent ? 'var(--accent)' : isDone ? 'var(--success)' : 'var(--text-muted)',
                  fontWeight: isCurrent || isDone ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {isDone && <Check size={11} />}
                {s.label}
              </span>
            );
          })}
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
          {step === 'email' ? 'Reset Password' : step === 'otp' ? 'Enter Code' : 'New Credentials'}
        </h1>
        <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>
          {step === 'email'
            ? 'Enter your account email to receive a recovery code'
            : step === 'otp'
            ? `Enter the 6-digit code sent to ${email}`
            : 'Set a new strong password for your account'}
        </p>

        {step === 'email' && (
          <form onSubmit={handleSendOTP} noValidate>
            <Input
              label="Account Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({});
              }}
              error={errors.email}
              success={isEmailValid}
              leftIcon={<Mail size={18} />}
              clearable
              onClear={() => setEmail('')}
              required
            />

            <motion.button
              className="btn btn-primary btn-full btn-lg"
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="dna-loader" style={{ height: 20 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />
                  ))}
                </div>
              ) : (
                'Send Recovery Code'
              )}
            </motion.button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">6-Digit Code</label>
              <input
                className="form-input"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (errors.otp) setErrors({});
                }}
                placeholder="000000"
                maxLength={6}
                style={{
                  textAlign: 'center',
                  fontSize: '1.6rem',
                  letterSpacing: 10,
                  fontFamily: 'var(--font-mono)',
                  borderColor: errors.otp ? 'var(--danger)' : undefined,
                }}
              />
              {errors.otp && (
                <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 6, textAlign: 'center' }}>
                  {errors.otp}
                </p>
              )}
            </div>

            <motion.button
              className="btn btn-primary btn-full btn-lg"
              type="submit"
              disabled={loading || otp.length !== 6}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="dna-loader" style={{ height: 20 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />
                  ))}
                </div>
              ) : (
                'Verify Code'
              )}
            </motion.button>

            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setStep('email')}
              >
                ← Back to Email
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <PasswordInput
              label="New Password"
              placeholder="Create strong password"
              value={newPw}
              onChange={(e) => {
                setNewPw(e.target.value);
                if (errors.password) setErrors({});
              }}
              error={errors.password}
              showStrength
              required
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Re-enter password"
              value={confirmPw}
              onChange={(e) => {
                setConfirmPw(e.target.value);
                if (errors.password) setErrors({});
              }}
              error={errors.password}
              required
            />

            <motion.button
              className="btn btn-primary btn-full btn-lg"
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="dna-loader" style={{ height: 20 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />
                  ))}
                </div>
              ) : (
                'Reset & Secure Account'
              )}
            </motion.button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link
            to="/login"
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
