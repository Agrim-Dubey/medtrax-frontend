import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Heart, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientDashboardAPI } from '../../api/dashboard';

export default function PatientProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    patientDashboardAPI.getCompleteProfile().then(r => { setProfile(r.data); setForm(r.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const editable = ['first_name','last_name','phone_number','emergency_contact','emergency_email','city','is_insurance','ins_company_name','ins_policy_number','known_allergies','chronic_diseases','previous_surgeries','family_medical_history'];
      const data: any = {};
      editable.forEach(k => { if (form[k] !== undefined) data[k] = form[k]; });
      const res = await patientDashboardAPI.updateProfile(data);
      setProfile(res.data.data); setForm(res.data.data); setEditing(false);
      toast.success('Profile updated!');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Update failed'); }
    setSaving(false);
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!profile) return <div className="empty-state"><User size={48} /><h3>Profile not found</h3></div>;

  const Field = ({ label, field, readonly, type }: { label: string; field: string; readonly?: boolean; type?: string }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {editing && !readonly ? (
        type === 'textarea' ? <textarea className="form-textarea" value={form[field] || ''} onChange={e => set(field, e.target.value)} rows={2} /> :
        <input className="form-input" value={form[field] || ''} onChange={e => set(field, e.target.value)} />
      ) : <p style={{ fontSize: '0.95rem', padding: '10px 0', color: profile[field] ? 'var(--text-primary)' : 'var(--text-muted)' }}>{String(profile[field] || '—')}</p>}
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>My Profile</h1><p>Manage your personal information</p></div>
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
            <Field label="First Name" field="first_name" /><Field label="Last Name" field="last_name" />
            <Field label="Email" field="email" readonly /><Field label="DOB" field="date_of_birth" readonly />
            <Field label="Gender" field="gender" readonly /><Field label="Blood Group" field="blood_group" readonly />
            <Field label="City" field="city" /><Field label="Phone" field="phone_number" />
          </div>
        </motion.div>
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Emergency & Insurance</h3>
          <div className="profile-grid">
            <Field label="Emergency Contact" field="emergency_contact" /><Field label="Emergency Email" field="emergency_email" />
          </div>
          <div style={{ marginTop: 12 }}>
            {editing && <div className="form-group"><label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.is_insurance || false} onChange={e => set('is_insurance', e.target.checked)} /> Has Insurance
            </label></div>}
            {(form.is_insurance || profile.is_insurance) && <div className="profile-grid"><Field label="Company" field="ins_company_name" /><Field label="Policy No." field="ins_policy_number" /></div>}
          </div>
        </motion.div>
        <motion.div className="glass-card" style={{ gridColumn: '1 / -1' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}><Heart size={18} /> Medical History</h3>
          <div className="profile-grid">
            <Field label="Known Allergies" field="known_allergies" type="textarea" />
            <Field label="Chronic Diseases" field="chronic_diseases" type="textarea" />
            <Field label="Previous Surgeries" field="previous_surgeries" type="textarea" />
            <Field label="Family History" field="family_medical_history" type="textarea" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
