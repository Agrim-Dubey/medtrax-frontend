import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Heart, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientDashboardAPI } from '../../api/dashboard';

interface PatientFieldProps {
  label: string;
  field: string;
  readonly?: boolean;
  type?: string;
  editing: boolean;
  form: any;
  profile: any;
  onChange: (k: string, v: any) => void;
}

function PatientProfileField({ label, field, readonly, type, editing, form, profile, onChange }: PatientFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {editing && !readonly ? (
        type === 'textarea' ? (
          <textarea className="form-textarea" value={form[field] || ''} onChange={e => onChange(field, e.target.value)} rows={2} />
        ) : (
          <input className="form-input" value={form[field] || ''} onChange={e => onChange(field, e.target.value)} />
        )
      ) : (
        <p style={{ fontSize: '0.95rem', padding: '10px 0', color: profile?.[field] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {String(profile?.[field] || '—')}
        </p>
      )}
    </div>
  );
}

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

  const renderField = (label: string, field: string, readonly?: boolean, type?: string) => (
    <PatientProfileField
      key={field}
      label={label}
      field={field}
      readonly={readonly}
      type={type}
      editing={editing}
      form={form}
      profile={profile}
      onChange={set}
    />
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
            {renderField("First Name", "first_name")}
            {renderField("Last Name", "last_name")}
            {renderField("Email", "email", true)}
            {renderField("DOB", "date_of_birth", true)}
            {renderField("Gender", "gender", true)}
            {renderField("Blood Group", "blood_group", true)}
            {renderField("City", "city")}
            {renderField("Phone", "phone_number")}
          </div>
        </motion.div>
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Emergency & Insurance</h3>
          <div className="profile-grid">
            {renderField("Emergency Contact", "emergency_contact")}
            {renderField("Emergency Email", "emergency_email")}
          </div>
          <div style={{ marginTop: 12 }}>
            {editing && <div className="form-group"><label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.is_insurance || false} onChange={e => set('is_insurance', e.target.checked)} /> Has Insurance
            </label></div>}
            {(form.is_insurance || profile.is_insurance) && <div className="profile-grid">{renderField("Company", "ins_company_name")}{renderField("Policy No.", "ins_policy_number")}</div>}
          </div>
        </motion.div>
        <motion.div className="glass-card" style={{ gridColumn: '1 / -1' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}><Heart size={18} /> Medical History</h3>
          <div className="profile-grid">
            {renderField("Known Allergies", "known_allergies", false, "textarea")}
            {renderField("Chronic Diseases", "chronic_diseases", false, "textarea")}
            {renderField("Previous Surgeries", "previous_surgeries", false, "textarea")}
            {renderField("Family History", "family_medical_history", false, "textarea")}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
