import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Heart, Stethoscope, UserCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import { authAPI } from '../../api/auth';
import { validation } from '../../utils/validation';

export default function Signup() {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'doctor' | 'patient' | ''>('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) {
      e.email = 'Email address is required';
    } else if (!validation.isValidEmail(email)) {
      e.email = 'Please provide a valid email (e.g. name@domain.com)';
    }

    if (!password1) {
      e.password1 = 'Password is required';
    } else {
      const strength = validation.evaluatePasswordStrength(password1);
      if (strength.score < 2) {
        e.password1 = 'Password is too weak. Please fulfill more requirements below.';
      }
    }

    if (!password2) {
      e.password2 = 'Please confirm your password';
    } else if (password1 !== password2) {
      e.password2 = 'Passwords do not match';
    }

    if (!agreeTerms) {
      e.agreeTerms = 'You must agree to the Terms of Service & Privacy Policy';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await authAPI.signup({
        email: email.trim().toLowerCase(),
        password1,
        password2,
        role: role as string,
      });

      if (res.data.success) {
        sessionStorage.setItem('medtrax_pending_email', email.trim().toLowerCase());
        sessionStorage.setItem('medtrax_pending_role', role);
        toast.success('Verification OTP sent to your email!');
        navigate('/verify-otp');
      }
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      const msg =
        errs?.email?.[0] ||
        errs?.password1?.[0] ||
        errs?.non_field_errors?.[0] ||
        err.response?.data?.error ||
        'Registration failed. Please check your information.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = email.length > 3 && validation.isValidEmail(email);

  if (step === 'role') {
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
              <Heart size={28} color="var(--accent)" strokeWidth={2.5} />
            </div>
          </div>

          <h1 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800 }}>Join MedTrax</h1>
          <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>
            Select how you would like to use the clinical platform
          </p>

          <div className="role-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
            <motion.div
              className={`role-card ${role === 'doctor' ? 'selected' : ''}`}
              onClick={() => setRole('doctor')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                cursor: 'pointer',
                padding: '24px 16px',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${role === 'doctor' ? 'var(--accent)' : 'var(--border-primary)'}`,
                background: role === 'doctor' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-input)',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--accent)',
                }}
              >
                <Stethoscope size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>Practitioner</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Doctor & Specialist access
              </p>
              {role === 'doctor' && (
                <div style={{ marginTop: 8, color: 'var(--accent)', display: 'flex', justifyContent: 'center' }}>
                  <Check size={18} />
                </div>
              )}
            </motion.div>

            <motion.div
              className={`role-card ${role === 'patient' ? 'selected' : ''}`}
              onClick={() => setRole('patient')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                cursor: 'pointer',
                padding: '24px 16px',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${role === 'patient' ? 'var(--success)' : 'var(--border-primary)'}`,
                background: role === 'patient' ? 'rgba(52, 211, 153, 0.12)' : 'var(--bg-input)',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(52, 211, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--success)',
                }}
              >
                <UserCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>Patient</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Appointments & Health tracking
              </p>
              {role === 'patient' && (
                <div style={{ marginTop: 8, color: 'var(--success)', display: 'flex', justifyContent: 'center' }}>
                  <Check size={18} />
                </div>
              )}
            </motion.div>
          </div>

          <motion.button
            className="btn btn-primary btn-full btn-lg"
            disabled={!role}
            onClick={() => setStep('form')}
            whileTap={{ scale: 0.98 }}
          >
            Continue as {role ? (role === 'doctor' ? 'Doctor' : 'Patient') : '...'}
          </motion.button>

          <p className="auth-footer" style={{ textAlign: 'center', marginTop: 20 }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div
        className="auth-card"
        style={{ maxWidth: 480 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '100px',
              background: role === 'doctor' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)',
              color: role === 'doctor' ? 'var(--accent)' : 'var(--success)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {role === 'doctor' ? 'Doctor Registration' : 'Patient Registration'}
          </span>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, marginTop: 8 }}>Create Account</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: 20 }}>
          Set your credentials to access your clinical dashboard
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: '' }));
            }}
            error={errors.email}
            success={isEmailValid}
            leftIcon={<Mail size={18} />}
            clearable
            onClear={() => setEmail('')}
            required
          />

          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            value={password1}
            onChange={(e) => {
              setPassword1(e.target.value);
              if (errors.password1) setErrors((p) => ({ ...p, password1: '' }));
            }}
            error={errors.password1}
            showStrength
            required
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={password2}
            onChange={(e) => {
              setPassword2(e.target.value);
              if (errors.password2) setErrors((p) => ({ ...p, password2: '' }));
            }}
            error={errors.password2}
            required
          />

          {/* Terms Agreement Checkbox */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) setErrors((p) => ({ ...p, agreeTerms: '' }));
                }}
                style={{ marginTop: 2, accentColor: 'var(--accent)' }}
              />
              <span>
                I agree to the MedTrax{' '}
                <a href="#terms" style={{ color: 'var(--accent)' }}>Terms of Service</a> and{' '}
                <a href="#privacy" style={{ color: 'var(--accent)' }}>HIPAA / Privacy Policy</a>.
              </span>
            </label>
            {errors.agreeTerms && (
              <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>
                {errors.agreeTerms}
              </p>
            )}
          </div>

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
              'Create Account & Send OTP'
            )}
          </motion.button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setStep('role')}
          >
            ← Change Role
          </button>

          <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
