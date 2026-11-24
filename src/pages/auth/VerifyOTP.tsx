import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import ErrorAlert from '../../components/ErrorAlert';
import { authAPI } from '../../api/auth';
import { parseApiError } from '../../utils/errorParser';
import type { ParsedError } from '../../utils/errorParser';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [formAlert, setFormAlert] = useState<ParsedError | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const email = sessionStorage.getItem('medtrax_pending_email') || localStorage.getItem('medtrax_pending_email') || '';

  useEffect(() => {
    if (!email) {
      toast.error('No pending verification found. Please sign up or sign in.');
      navigate('/signup');
      return;
    }
    sessionStorage.setItem('medtrax_pending_email', email);
    localStorage.setItem('medtrax_pending_email', email);
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = clean.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 filled
    if (index === 5 && clean) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        triggerVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;

    const newOtp = [...otp];
    text.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    if (text.length === 6) {
      triggerVerify(text);
    } else {
      inputRefs.current[Math.min(text.length, 5)]?.focus();
    }
  };

  const triggerVerify = async (otpStr: string) => {
    if (otpStr.length !== 6) {
      return toast.error('Please enter the complete 6-digit code');
    }
    setLoading(true);
    setFormAlert(null);
    try {
      const res = await authAPI.verifySignupOTP({ email, otp: otpStr });
      if (res.data.success) {
        toast.success('Email successfully authenticated!');
        navigate('/complete-profile');
      }
    } catch (err: any) {
      const parsed = parseApiError(err);
      setFormAlert(parsed);
      toast.error(parsed.message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setFormAlert(null);
    try {
      await authAPI.resendSignupOTP({ email });
      toast.success('Fresh verification code sent!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const parsed = parseApiError(err);
      setFormAlert(parsed);
      toast.error(parsed.message);
    }
  };

  const isComplete = otp.join('').length === 6;

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
            <ShieldCheck size={28} color="var(--accent)" strokeWidth={2.2} />
          </div>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800 }}>Verify Your Email</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: 20 }}>
          Enter the 6-digit security code sent to
          <br />
          <strong style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>{email}</strong>
        </p>

        {formAlert && (
          <div style={{ marginBottom: 20 }}>
            <ErrorAlert
              title="Verification Error"
              message={formAlert.message}
              fieldErrors={formAlert.fieldErrors}
              onClose={() => setFormAlert(null)}
              action={
                countdown === 0
                  ? {
                      label: 'Send New Code Now',
                      onClick: handleResend,
                    }
                  : undefined
              }
            />
          </div>
        )}

        <div
          className="otp-inputs"
          onPaste={handlePaste}
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="form-input"
              style={{
                width: 48,
                height: 56,
                textAlign: 'center',
                fontSize: '1.4rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                borderColor: digit ? 'var(--accent)' : undefined,
                background: digit ? 'rgba(56, 189, 248, 0.08)' : undefined,
                boxShadow: digit ? '0 0 12px rgba(56, 189, 248, 0.2)' : undefined,
              }}
            />
          ))}
        </div>

        <motion.button
          className="btn btn-primary btn-full btn-lg"
          onClick={() => triggerVerify(otp.join(''))}
          disabled={loading || !isComplete}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="dna-loader" style={{ height: 20 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />
              ))}
            </div>
          ) : (
            'Verify & Continue'
          )}
        </motion.button>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Didn't receive the email?{' '}
            {countdown > 0 ? (
              <span style={{ color: 'var(--text-secondary)' }}>Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <RotateCcw size={14} /> Resend Code
              </button>
            )}
          </p>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 16 }}
            onClick={() => navigate('/signup')}
          >
            <ArrowLeft size={14} /> Use Different Email
          </button>
        </div>
      </motion.div>
    </div>
  );
}
