import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Pill, FlaskConical } from 'lucide-react';
import { prescriptionsAPI } from '../api/prescriptions';
import { useAuth } from '../context/AuthContext';

export default function Prescriptions() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = isDoctor ? await prescriptionsAPI.getDoctorPrescriptions() : await prescriptionsAPI.getPatientPrescriptions();
        setPrescriptions(res.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, [isDoctor]);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  if (selected) {
    return (
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div><h1>Prescription Details</h1><p>#{selected.id}</p></div>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>← Back</button>
        </div>
        <div className="content-grid">
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 16 }}>Diagnosis</h3>
            <div className="profile-grid">
              <div><label className="form-label">Chief Complaint</label><p>{selected.chief_complaint}</p></div>
              <div><label className="form-label">Diagnosis</label><p>{selected.diagnosis}</p></div>
              {selected.blood_pressure && <div><label className="form-label">BP</label><p>{selected.blood_pressure}</p></div>}
              {selected.temperature && <div><label className="form-label">Temp</label><p>{selected.temperature}°F</p></div>}
              {selected.pulse_rate && <div><label className="form-label">Pulse</label><p>{selected.pulse_rate} bpm</p></div>}
              {selected.weight && <div><label className="form-label">Weight</label><p>{selected.weight} kg</p></div>}
            </div>
            {selected.additional_notes && <div style={{ marginTop: 16 }}><label className="form-label">Notes</label><p>{selected.additional_notes}</p></div>}
            {selected.follow_up_date && <div style={{ marginTop: 12 }}><label className="form-label">Follow-up</label><p style={{ color: 'var(--accent)' }}>{selected.follow_up_date}</p></div>}
          </motion.div>
          <div>
            {selected.medications?.length > 0 && (
              <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Pill size={18} /> Medications</h3>
                {selected.medications.map((m: any, i: number) => (
                  <div key={i} style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: 8, border: '1px solid var(--border-primary)' }}>
                    <strong>{m.medicine_name}</strong> — {m.dosage}
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.frequency_display || m.frequency} • {m.duration} {m.duration_unit}</p>
                    {m.instructions && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{m.instructions}</p>}
                  </div>
                ))}
              </motion.div>
            )}
            {selected.lab_tests?.length > 0 && (
              <motion.div className="glass-card" style={{ marginTop: 16 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FlaskConical size={18} /> Lab Tests</h3>
                {selected.lab_tests.map((t: any, i: number) => (
                  <div key={i} style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: 8, border: '1px solid var(--border-primary)' }}>
                    <strong>{t.test_name}</strong>
                    {t.instructions && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.instructions}</p>}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h1>Prescriptions</h1><p>{isDoctor ? 'Prescriptions you created' : 'Your medical prescriptions'}</p></div>
      {prescriptions.length === 0 ? <div className="empty-state"><FileText size={48} /><h3>No prescriptions</h3></div> :
        <div style={{ display: 'grid', gap: 12 }}>
          {prescriptions.map((p: any, i: number) => (
            <motion.div key={p.id} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setSelected(p)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{isDoctor ? p.patient_name : p.doctor_name}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.diagnosis?.slice(0, 60) || p.chief_complaint?.slice(0, 60)}{(p.diagnosis || p.chief_complaint || '').length > 60 ? '...' : ''}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{p.created_at?.split('T')[0]}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.medications_count || p.medications?.length || 0} meds</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      }
    </div>
  );
}
