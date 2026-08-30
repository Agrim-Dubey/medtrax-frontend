import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Heart, Shield, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientDashboardAPI } from '../../api/dashboard';
import Badge from '../../components/Badge';
import { validation } from '../../utils/validation';

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
    // Regex validation checks
    if (form.phone_number && !validation.isValidPhone(form.phone_number)) {
      return toast.error('Please enter a valid phone number');
    }
    if (form.emergency_contact && !validation.isValidPhone(form.emergency_contact)) {
      return toast.error('Please enter a valid emergency contact phone number');
    }
    if (form.emergency_email && !validation.isValidEmail(form.emergency_email)) {
      return toast.error('Please enter a valid emergency contact email');
    }
    if (form.is_insurance && form.ins_policy_number && !/^[A-Z0-9-]{4,25}$/i.test(form.ins_policy_number.trim())) {
      return toast.error('Insurance policy number must be 4-25 alphanumeric characters');
    }

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

      {/* Patient Identity Banner */}
      <motion.div
        className="glass-card"
        style={{
          marginBottom: 24,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(30, 41, 59, 0.5) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            }}
          >
            {(profile.first_name?.[0] || profile.username?.[0] || 'P').toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                {profile.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile.username}
              </h2>
              <Badge variant="patient">Registered Patient</Badge>
              {profile.is_insurance && <Badge variant="success">Active Insurance</Badge>}
            </div>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={15} color="var(--success)" />
              Blood Group: <strong style={{ color: 'var(--text-primary)' }}>{profile.blood_group || 'Unrecorded'}</strong>
              {profile.city ? ` • City: ${profile.city}` : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Gender</span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{profile.gender || '—'}</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Insurance Carrier</span>
            <strong style={{ fontSize: '1.05rem', color: profile.is_insurance ? 'var(--success)' : 'var(--text-muted)' }}>
              {profile.is_insurance ? profile.ins_company_name || 'Covered' : 'None'}
            </strong>
          </div>
        </div>
      </motion.div>

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
