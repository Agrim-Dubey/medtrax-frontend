import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, Calendar, MapPin, Phone, Briefcase, Award, Shield, PhoneCall } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import Input from '../../components/Input';
import ErrorAlert from '../../components/ErrorAlert';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { validation } from '../../utils/validation';
import { parseApiError } from '../../utils/errorParser';
import type { ParsedError } from '../../utils/errorParser';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = sessionStorage.getItem('medtrax_pending_email') || localStorage.getItem('medtrax_pending_email') || '';
  const role = sessionStorage.getItem('medtrax_pending_role') || localStorage.getItem('medtrax_pending_role') || '';
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formAlert, setFormAlert] = useState<ParsedError | null>(null);

  const [form, setForm] = useState<Record<string, any>>({
    email,
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'M',
    blood_group: 'O+',
    city: '',
    phone_number: '',
    specialization: '',
    qualification: '',
    department: '',
    years_of_experience: '',
    registration_number: '',
    emergency_contact: '',
  });

  useEffect(() => {
    if (!email || !role) {
      toast.error('No pending registration found. Please sign up or log in.');
      navigate('/signup');
    } else {
      // Keep storage in sync
      sessionStorage.setItem('medtrax_pending_email', email);
      sessionStorage.setItem('medtrax_pending_role', role);
      localStorage.setItem('medtrax_pending_email', email);
      localStorage.setItem('medtrax_pending_role', role);
    }
  }, [email, role, navigate]);

  const set = (key: string, val: any) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) {
      setErrors(p => ({ ...p, [key]: '' }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.last_name.trim()) errs.last_name = 'Last name is required';
    if (!form.date_of_birth) errs.date_of_birth = 'Date of birth is required';
    if (!form.city.trim()) errs.city = 'City of residence is required';

    if (!form.phone_number.trim()) {
      errs.phone_number = 'Phone number is required';
    } else if (!validation.isValidPhone(form.phone_number)) {
      errs.phone_number = 'Enter valid phone number (10-15 digits)';
    }

    if (role === 'doctor') {
      if (!form.specialization.trim()) errs.specialization = 'Specialization is required';
      if (!form.qualification.trim()) errs.qualification = 'Medical qualification is required';
      if (!form.registration_number.trim()) {
        errs.registration_number = 'Medical license/registration number is required';
      } else if (!validation.isValidMedicalRegNumber(form.registration_number)) {
        errs.registration_number = 'Registration number format invalid (4-20 alphanumeric characters)';
      }
    }

    if (role === 'patient') {
      if (form.emergency_contact && !validation.isValidPhone(form.emergency_contact)) {
        errs.emergency_contact = 'Enter valid emergency contact phone (10-15 digits)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormAlert(null);
    if (!validate()) {
      toast.error('Please resolve the highlighted errors');
      return;
    }
    setLoading(true);

    try {
      const apiCall = role === 'doctor' ? authAPI.completeDoctorProfile : authAPI.completePatientProfile;
      const cleanForm = { ...form };
      if (role === 'doctor') {
        cleanForm.years_of_experience = cleanForm.years_of_experience
          ? parseInt(cleanForm.years_of_experience, 10)
          : 0;
      }
      if (cleanForm.gender) {
        const g = String(cleanForm.gender).toLowerCase();
        cleanForm.gender = g.startsWith('m') ? 'M' : g.startsWith('f') ? 'F' : 'O';
      }
      if (cleanForm.phone_number) {
        cleanForm.phone_number = cleanForm.phone_number.replace(/[\s\-()]/g, '');
        if (cleanForm.phone_number.startsWith('+')) {
          cleanForm.phone_number = cleanForm.phone_number.slice(1);
        }
      }
      if (cleanForm.emergency_contact) {
        cleanForm.emergency_contact = cleanForm.emergency_contact.replace(/[\s\-()]/g, '');
        if (cleanForm.emergency_contact.startsWith('+')) {
          cleanForm.emergency_contact = cleanForm.emergency_contact.slice(1);
        }
      }

      const res = await apiCall(cleanForm);
      if (res.data.success) {
        if (res.data.access_token) {
          localStorage.setItem('medtrax_token', res.data.access_token);
        }
        if (res.data.refresh_token) {
          localStorage.setItem('medtrax_refresh_token', res.data.refresh_token);
        }
        login(res.data.user);
        sessionStorage.removeItem('medtrax_pending_email');
        sessionStorage.removeItem('medtrax_pending_role');
        localStorage.removeItem('medtrax_pending_email');
        localStorage.removeItem('medtrax_pending_role');
        toast.success('Profile onboarded successfully!');
        navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (err: any) {
      const parsed = parseApiError(err);
      setFormAlert(parsed);
      if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...parsed.fieldErrors }));
      }
      toast.error(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div
        className="auth-card"
        style={{ maxWidth: 680 }}
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

        <h1 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800 }}>Complete Profile</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>
          Finish setting up your account as a{' '}
          <span className={`badge badge-${role}`} style={{ textTransform: 'capitalize' }}>
            {role}
          </span>
        </p>

        {formAlert && (
          <div style={{ marginBottom: 20 }}>
            <ErrorAlert
              title="Profile Submission Error"
              message={formAlert.message}
              fieldErrors={formAlert.fieldErrors}
              onClose={() => setFormAlert(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Section: Personal Information */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={16} /> Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input
                label="First Name"
                placeholder="Jane"
                value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
                error={errors.first_name}
                leftIcon={<User size={16} />}
                required
              />

              <Input
                label="Last Name"
                placeholder="Doe"
                value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
                error={errors.last_name}
                leftIcon={<User size={16} />}
                required
              />

              <Input
                label="Date of Birth"
                type="date"
                value={form.date_of_birth}
                onChange={e => set('date_of_birth', e.target.value)}
                error={errors.date_of_birth}
                leftIcon={<Calendar size={16} />}
                required
              />

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Gender *</label>
                <select
                  className="form-input"
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Blood Group *</label>
                <select
                  className="form-input"
                  value={form.blood_group}
                  onChange={e => set('blood_group', e.target.value)}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <Input
                label="City"
                placeholder="e.g. New York, Chicago"
                value={form.city}
                onChange={e => set('city', e.target.value)}
                error={errors.city}
                leftIcon={<MapPin size={16} />}
                required
              />

              <Input
                label="Phone Number"
                placeholder="+1234567890"
                value={form.phone_number}
                onChange={e => set('phone_number', e.target.value)}
                error={errors.phone_number}
                leftIcon={<Phone size={16} />}
                required
              />
            </div>
          </div>

          {/* Section: Role Specific Credentials */}
          {role === 'doctor' && (
            <div style={{ marginBottom: 16, borderTop: '1px solid var(--border-primary)', paddingTop: 16 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={16} /> Clinical & Medical Credentials
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Input
                  label="Specialization"
                  placeholder="e.g. Cardiology, Neurology"
                  value={form.specialization}
                  onChange={e => set('specialization', e.target.value)}
                  error={errors.specialization}
                  leftIcon={<Briefcase size={16} />}
                  required
                />

                <Input
                  label="Qualification"
                  placeholder="e.g. MBBS, MD, FACS"
                  value={form.qualification}
                  onChange={e => set('qualification', e.target.value)}
                  error={errors.qualification}
                  leftIcon={<Award size={16} />}
                  required
                />

                <Input
                  label="Department"
                  placeholder="e.g. Outpatient Cardiology"
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                />

                <Input
                  label="Years of Experience"
                  type="number"
                  min="0"
                  max="60"
                  placeholder="e.g. 8"
                  value={form.years_of_experience}
                  onChange={e => set('years_of_experience', e.target.value)}
                />

                <div style={{ gridColumn: '1 / -1' }}>
                  <Input
                    label="Medical Registration / License Number"
                    placeholder="e.g. REG-12345-MED"
                    value={form.registration_number}
                    onChange={e => set('registration_number', e.target.value)}
                    error={errors.registration_number}
                    helperText="Official medical council license ID"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'patient' && (
            <div style={{ marginBottom: 16, borderTop: '1px solid var(--border-primary)', paddingTop: 16 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} /> Emergency Contact
              </h3>

              <Input
                label="Emergency Contact Phone (Optional)"
                placeholder="e.g. +1987654321"
                value={form.emergency_contact}
                onChange={e => set('emergency_contact', e.target.value)}
                error={errors.emergency_contact}
                leftIcon={<PhoneCall size={16} />}
                helperText="Primary contact for clinical emergency notifications"
              />
            </div>
          )}

          <motion.button
            className="btn btn-primary btn-full btn-lg"
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: 10 }}
          >
            {loading ? (
              <div className="dna-loader" style={{ height: 20 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />
                ))}
              </div>
            ) : (
              'Complete Profile & Open Dashboard'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
