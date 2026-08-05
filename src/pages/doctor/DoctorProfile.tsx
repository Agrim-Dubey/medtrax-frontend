import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorDashboardAPI } from '../../api/dashboard';

interface FieldProps {
  label: string;
  field: string;
  readonly?: boolean;
  editing: boolean;
  form: any;
  profile: any;
  onChange: (k: string, v: any) => void;
}

function ProfileField({ label, field, readonly, editing, form, profile, onChange }: FieldProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {editing && !readonly ? (
        <input className="form-input" value={form[field] || ''} onChange={e => onChange(field, e.target.value)} />
      ) : (
        <p style={{ fontSize: '0.95rem', padding: '10px 0', color: profile?.[field] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {profile?.[field] || '—'}
        </p>
      )}
    </div>
  );
}

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

  const renderField = (label: string, field: string, readonly?: boolean) => (
    <ProfileField
      key={field}
      label={label}
      field={field}
      readonly={readonly}
      editing={editing}
      form={form}
      profile={profile}
      onChange={set}
    />
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
            {renderField("First Name", "first_name")}
            {renderField("Last Name", "last_name")}
            {renderField("Email", "email", true)}
            {renderField("Date of Birth", "date_of_birth", true)}
            {renderField("Gender", "gender", true)}
            {renderField("Blood Group", "blood_group", true)}
            {renderField("Marital Status", "marital_status")}
          </div>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Professional</h3>
          <div className="profile-grid">
            {renderField("Specialization", "specialization", true)}
            {renderField("Registration No.", "registration_number", true)}
            {renderField("Qualification", "qualification")}
            {renderField("Department", "department")}
            {renderField("Experience (yrs)", "years_of_experience")}
            {renderField("Clinic Name", "clinic_name")}
          </div>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)' }}>Contact</h3>
          <div className="profile-grid">
            {renderField("Phone", "phone_number")}
            {renderField("Alt. Phone", "alternate_phone_number")}
            {renderField("Alt. Email", "alternate_email")}
            {renderField("Address", "address")}
            {renderField("City", "city")}
            {renderField("State", "state")}
            {renderField("Pincode", "pincode")}
            {renderField("Country", "country")}
          </div>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)' }}>Emergency</h3>
          <div className="profile-grid">
            {renderField("Contact Person", "emergency_contact_person")}
            {renderField("Contact Number", "emergency_contact_number")}
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
