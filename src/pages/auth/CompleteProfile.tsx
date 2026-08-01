import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import ThreeBackground from '../../components/ThreeBackground';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = sessionStorage.getItem('medtrax_pending_email') || '';
  const role = sessionStorage.getItem('medtrax_pending_role') || '';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({ email, first_name: '', last_name: '', date_of_birth: '', gender: '', blood_group: '', city: '', phone_number: '' });

  useEffect(() => { if (!email || !role) navigate('/signup'); }, [email, role, navigate]);

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ['first_name', 'last_name', 'date_of_birth', 'gender', 'blood_group', 'city', 'phone_number'];
    for (const f of required) { if (!form[f]) return toast.error(`Please fill in ${f.replace(/_/g, ' ')}`); }
    setLoading(true);
    try {
      const apiCall = role === 'doctor' ? authAPI.completeDoctorProfile : authAPI.completePatientProfile;
      const res = await apiCall(form);
      if (res.data.success) {
        login(res.data.user);
        sessionStorage.removeItem('medtrax_pending_email');
        sessionStorage.removeItem('medtrax_pending_role');
        toast.success('Profile created!');
        navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors).flat()[0];
        toast.error(typeof first === 'string' ? first : 'Validation error');
      } else {
        toast.error(err.response?.data?.error || 'Failed to create profile');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <ThreeBackground />
      <motion.div className="auth-card" style={{ maxWidth: 560 }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}><Heart size={36} color="var(--accent)" style={{ marginBottom: 12 }} /></div>
        <h1 style={{ textAlign: 'center' }}>Complete Profile</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>Fill in your details as a <span className={`badge badge-${role}`}>{role}</span></p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.first_name} onChange={e => set('first_name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.last_name} onChange={e => set('last_name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Date of Birth *</label><input className="form-input" type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Gender *</label>
              <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select</option><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Blood Group *</label>
              <select className="form-select" value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                <option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">City *</label><input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone_number} onChange={e => set('phone_number', e.target.value)} placeholder="10-15 digits" /></div>
            {role === 'doctor' && <>
              <div className="form-group"><label className="form-label">Specialization</label><input className="form-input" value={form.specialization || ''} onChange={e => set('specialization', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Qualification</label><input className="form-input" value={form.qualification || ''} onChange={e => set('qualification', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department || ''} onChange={e => set('department', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Years of Experience</label><input className="form-input" type="number" value={form.years_of_experience || ''} onChange={e => set('years_of_experience', parseInt(e.target.value) || '')} /></div>
              <div className="form-group"><label className="form-label">Registration No.</label><input className="form-input" value={form.registration_number || ''} onChange={e => set('registration_number', e.target.value)} /></div>
            </>}
            {role === 'patient' && <>
              <div className="form-group"><label className="form-label">Emergency Contact</label><input className="form-input" value={form.emergency_contact || ''} onChange={e => set('emergency_contact', e.target.value)} /></div>
            </>}
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Complete Profile'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}