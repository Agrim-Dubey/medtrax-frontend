import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, Calendar, MapPin, Phone, Briefcase, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = sessionStorage.getItem('medtrax_pending_email') || '';
  const role = sessionStorage.getItem('medtrax_pending_role') || '';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({
    email,
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
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
      navigate('/signup');
    }
  }, [email, role, navigate]);

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const validate = () => {
    const required = ['first_name', 'last_name', 'date_of_birth', 'gender', 'blood_group', 'city', 'phone_number'];
    for (const f of required) {
      if (!form[f]?.trim()) {
        toast.error(`Please fill in ${f.replace(/_/g, ' ')}`);
        return false;
      }
    }
    if (!PHONE_REGEX.test(form.phone_number.trim())) {
      toast.error('Please enter a valid phone number (10 to 15 digits)');
      return false;
    }
    if (form.emergency_contact && !PHONE_REGEX.test(form.emergency_contact.trim())) {
      toast.error('Please enter a valid emergency contact phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const apiCall = role === 'doctor' ? authAPI.completeDoctorProfile : authAPI.completePatientProfile;
      const cleanForm = { ...form };
      if (role === 'doctor') {
        cleanForm.years_of_experience = cleanForm.years_of_experience ? parseInt(cleanForm.years_of_experience, 10) : 0;
      }
      const res = await apiCall(cleanForm);
      if (res.data.success) {
        login(res.data.user);
        sessionStorage.removeItem('medtrax_pending_email');
        sessionStorage.removeItem('medtrax_pending_role');
        toast.success('Profile completed successfully!');
        navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors).flat()[0];
        toast.error(typeof first === 'string' ? first : 'Validation error');
      } else {
        toast.error(err.response?.data?.error || 'Failed to complete profile');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div className="auth-card" style={{ maxWidth: 640 }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <motion.div style={{ textAlign: 'center', marginBottom: 8 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <Heart size={40} color="var(--accent)" strokeWidth={2.5} />
        </motion.div>
        <h1 style={{ textAlign: 'center' }}>Complete Profile</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>Fill in your details as a <span className={`badge badge-${role}`}>{role}</span></p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="John" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Doe" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="date" style={{ paddingLeft: 36 }} value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select className="form-select" value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} value={form.city} onChange={e => set('city', e.target.value)} placeholder="New York" />
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} value={form.phone_number} onChange={e => set('phone_number', e.target.value)} placeholder="e.g. +1234567890" />
              </div>
            </div>
            
            {role === 'doctor' && (
              <>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 36 }} value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="e.g. Cardiology" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <div style={{ position: 'relative' }}>
                    <Award size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 36 }} value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="e.g. MD, MBBS" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Cardiology Dept" />
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input className="form-input" type="number" min={0} value={form.years_of_experience} onChange={e => set('years_of_experience', e.target.value)} placeholder="e.g. 5" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Registration Number</label>
                  <input className="form-input" value={form.registration_number} onChange={e => set('registration_number', e.target.value)} placeholder="e.g. REG12345" />
                </div>
              </>
            )}

            {role === 'patient' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Emergency Contact Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" style={{ paddingLeft: 36 }} value={form.emergency_contact} onChange={e => set('emergency_contact', e.target.value)} placeholder="e.g. +1234567890" />
                </div>
              </div>
            )}
          </div>
          <motion.button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 12 }} whileTap={{ scale: 0.98 }}>
            {loading ? <div className="dna-loader" style={{ height: 22 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bar" style={{ background: '#0a0e1a', width: 3 }} />)}</div> : 'Complete Setup'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}