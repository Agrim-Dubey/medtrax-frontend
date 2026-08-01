import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorDashboardAPI } from '../../api/dashboard';

export default function DoctorProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorDashboardAPI.getCompleteProfile().then(r => { setProfile(r.data); setForm(r.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const editable = ['first_name','last_name','phone_number','alternate_phone_number','alternate_email','address','city','state','pincode','country','marital_status','qualification','years_of_experience','department','clinic_name','emergency_contact_person','emergency_contact_number'];
      const data: any = {};
      editable.forEach(k => { if (form[k] !== undefined) data[k] = form[k]; });
      const res = await doctorDashboardAPI.updateProfile(data);
      setProfile(res.data.data);
      setForm(res.data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
    setSaving(false);
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!profile) return <div className="empty-state"><User size={48} /><h3>Profile not found</h3></div>;

  const Field = ({ label, field, readonly }: { label: string; field: string; readonly?: boolean }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {editing && !readonly ? <input className="form-input" value={form[field] || ''} onChange={e => set(field, e.target.value)} /> :
        <p style={{ fontSize: '0.95rem', padding: '10px 0', color: profile[field] ? 'var(--text-primary)' : 'var(--text-muted)' }}>{profile[field] || '—'}</p>}
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>My Profile</h1><p>Manage your professional information</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editing ? <>
            <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(false); setForm(profile); }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save'}</button>
          </> : <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>}
        </div>
      </div>

      <div className="content-grid">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Personal</h3>
          <div className="profile-grid">
            <Field label="First Name" field="first_name" />
            <Field label="Last Name" field="last_name" />
            <Field label="Email" field="email" readonly />
            <Field label="Date of Birth" field="date_of_birth" readonly />
            <Field label="Gender" field="gender" readonly />
            <Field label="Blood Group" field="blood_group" readonly />
            <Field label="Marital Status" field="marital_status" />
          </div>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Professional</h3>
          <div className="profile-grid">
            <Field label="Specialization" field="specialization" readonly />
            <Field label="Registration No." field="registration_number" readonly />
            <Field label="Qualification" field="qualification" />
            <Field label="Department" field="department" />
            <Field label="Experience (yrs)" field="years_of_experience" />
            <Field label="Clinic Name" field="clinic_name" />
          </div>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)' }}>Contact</h3>
          <div className="profile-grid">
            <Field label="Phone" field="phone_number" />
            <Field label="Alt. Phone" field="alternate_phone_number" />
            <Field label="Alt. Email" field="alternate_email" />
            <Field label="Address" field="address" />
            <Field label="City" field="city" />
            <Field label="State" field="state" />
            <Field label="Pincode" field="pincode" />
            <Field label="Country" field="country" />
          </div>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)' }}>Emergency</h3>
          <div className="profile-grid">
            <Field label="Contact Person" field="emergency_contact_person" />
            <Field label="Contact Number" field="emergency_contact_number" />
          </div>
          <div style={{ marginTop: 16, padding: 12, background: profile.is_approved ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)', borderRadius: 'var(--radius-md)', border: `1px solid ${profile.is_approved ? 'var(--success)' : 'var(--warning)'}` }}>
            <p style={{ fontSize: '0.85rem', color: profile.is_approved ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
              {profile.is_approved ? '✓ Account Approved' : '⏳ Pending Admin Approval'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
