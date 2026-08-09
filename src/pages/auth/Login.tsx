import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { validation } from '../../utils/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('medtrax_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) {
      e.email = 'Email address is required';
    } else if (!validation.isValidEmail(email)) {
      e.email = 'Please enter a valid email address (e.g. name@domain.com)';
    }

    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem('medtrax_saved_email', email.trim());
    } else {
      localStorage.removeItem('medtrax_saved_email');
    }

    try {
      const res = await authAPI.login({ email: email.trim().toLowerCase(), password });
      const data = res.data;
      if (data.success) {
        if (data.is_profile_complete === false) {
          sessionStorage.setItem('medtrax_pending_email', data.email || email);
          sessionStorage.setItem('medtrax_pending_role', data.role);
          toast('Please complete your profile to continue.', { icon: '📋' });
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
      const msg =
        d?.errors?.non_field_errors?.[0] ||
        d?.error ||
        d?.errors?.email?.[0] ||
        d?.detail ||
        'Invalid credentials. Please verify your email and password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = email.length > 3 && validation.isValidEmail(email);

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          style={{ textAlign: 'center', marginBottom: 12 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
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
        </motion.div>

        <h1 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800 }}>Welcome Back</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>
          Access your MedTrax clinical portal
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="doctor@hospital.org or patient@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
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
            placeholder="Enter your security password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
            }}
            error={errors.password}
            required
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              fontSize: '0.82rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              Remember my email
            </label>

            <Link to="/forgot-password" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Forgot Password?
            </Link>
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
              'Sign In to Dashboard'
            )}
          </motion.button>
        </form>

        <p className="auth-footer" style={{ marginTop: 24, textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
