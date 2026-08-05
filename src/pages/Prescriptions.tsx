import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Pill,
  FlaskConical,
  Plus,
  Printer,
  X,
  Search,
  Activity,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { prescriptionsAPI } from '../api/prescriptions';
import { useAuth } from '../context/AuthContext';

interface MedicationItem {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: number;
  duration_unit: 'days' | 'weeks' | 'months';
  instructions: string;
}

interface LabTestItem {
  test_name: string;
  instructions: string;
}

const FREQUENCY_OPTIONS = [
  { value: 'once_daily', label: 'Once Daily (1-0-0)' },
  { value: 'twice_daily', label: 'Twice Daily (1-0-1)' },
  { value: 'thrice_daily', label: 'Three Times Daily (1-1-1)' },
  { value: 'four_times_daily', label: 'Four Times Daily (1-1-1-1)' },
  { value: 'as_needed', label: 'As Needed (SOS)' },
  { value: 'before_meals', label: 'Before Meals' },
  { value: 'after_meals', label: 'After Meals' },
  { value: 'at_bedtime', label: 'At Bedtime' },
];

export default function Prescriptions() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');

  // Doctor: Create Prescription Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [doctorPatients, setDoctorPatients] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [weight, setWeight] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      medicine_name: '',
      dosage: '',
      frequency: 'twice_daily',
      duration: 5,
      duration_unit: 'days',
      instructions: '',
    },
  ]);

  const [labTests, setLabTests] = useState<LabTestItem[]>([]);

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = isDoctor
        ? await prescriptionsAPI.getDoctorPrescriptions()
        : await prescriptionsAPI.getPatientPrescriptions();
      setPrescriptions(res.data?.results || res.data || []);
    } catch {
      // silent
    }
    setLoading(false);
  }, [isDoctor]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  const openCreateModal = async () => {
    setIsCreateOpen(true);
    try {
      const res = await prescriptionsAPI.getDoctorPatients();
      setDoctorPatients(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedPatientId(res.data[0].id);
      }
    } catch {
      toast.error('Could not load patient list');
    }
  };

  const addMedicationRow = () => {
    setMedications([
      ...medications,
      {
        medicine_name: '',
        dosage: '',
        frequency: 'once_daily',
        duration: 7,
        duration_unit: 'days',
        instructions: '',
      },
    ]);
  };

  const removeMedicationRow = (index: number) => {
    if (medications.length <= 1) {
      toast.error('Prescription must have at least one medication');
      return;
    }
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof MedicationItem, val: any) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: val };
    setMedications(updated);
  };

  const addLabTestRow = () => {
    setLabTests([...labTests, { test_name: '', instructions: '' }]);
  };

  const removeLabTestRow = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  const updateLabTest = (index: number, field: keyof LabTestItem, val: string) => {
    const updated = [...labTests];
    updated[index] = { ...updated[index], [field]: val };
    setLabTests(updated);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      return toast.error('Please select a patient');
    }
    if (!chiefComplaint.trim() || !diagnosis.trim()) {
      return toast.error('Chief complaint and diagnosis are required');
    }

    const validMeds = medications.filter(m => m.medicine_name.trim() && m.dosage.trim());
    if (validMeds.length === 0) {
      return toast.error('At least one medication with name and dosage is required');
    }

    const payload: any = {
      patient: selectedPatientId,
      chief_complaint: chiefComplaint.trim(),
      diagnosis: diagnosis.trim(),
      medications: validMeds,
    };

    if (bloodPressure.trim()) payload.blood_pressure = bloodPressure.trim();
    if (temperature.trim()) payload.temperature = parseFloat(temperature);
    if (pulseRate.trim()) payload.pulse_rate = parseInt(pulseRate, 10);
    if (weight.trim()) payload.weight = parseFloat(weight);
    if (additionalNotes.trim()) payload.additional_notes = additionalNotes.trim();
    if (followUpDate) payload.follow_up_date = followUpDate;

    const validTests = labTests.filter(t => t.test_name.trim());
    if (validTests.length > 0) {
      payload.lab_tests = validTests;
    }

    setSubmitting(true);
    try {
      await prescriptionsAPI.createPrescription(payload);
      toast.success('Prescription created successfully!');
      setIsCreateOpen(false);
      // reset form
      setChiefComplaint('');
      setDiagnosis('');
      setBloodPressure('');
      setTemperature('');
      setPulseRate('');
      setWeight('');
      setAdditionalNotes('');
      setFollowUpDate('');
      setMedications([
        {
          medicine_name: '',
          dosage: '',
          frequency: 'twice_daily',
          duration: 5,
          duration_unit: 'days',
          instructions: '',
        },
      ]);
      setLabTests([]);
      loadPrescriptions();
    } catch (err: any) {
      const errData = err.response?.data;
      const msg =
        errData?.error ||
        errData?.patient?.[0] ||
        errData?.medications?.[0] ||
        'Failed to create prescription';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const q = search.toLowerCase();
    const name = (isDoctor ? p.patient_name : p.doctor_name) || '';
    const diag = p.diagnosis || '';
    const chief = p.chief_complaint || '';
    return name.toLowerCase().includes(q) || diag.toLowerCase().includes(q) || chief.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  // Prescription Detail & Print View
  if (selected) {
    return (
      <div>
        <div
          className="page-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <h1>Prescription Details</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Rx Ref #{selected.id} • Issued on {selected.created_at?.split('T')[0]}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Printer size={16} /> Print / Save PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>
              ← Back to List
            </button>
          </div>
        </div>

        {/* Printable Letterhead Paper */}
        <div id="printable-prescription" className="prescription-paper" style={{ marginBottom: 32 }}>
          <div className="rx-header">
            <div className="rx-brand">
              <Activity size={32} color="#0284c7" />
              <div>
                <h2>MedTrax Healthcare</h2>
                <p>Digital Telehealth & Clinical Management System</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="rx-badge">Rx</div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Date: {selected.created_at?.split('T')[0]}
              </p>
            </div>
          </div>

          <div className="rx-meta-grid">
            <div>
              <strong style={{ color: '#0369a1' }}>Doctor:</strong> Dr. {selected.doctor_name || user?.username}
              <br />
              <span style={{ color: '#64748b' }}>License Verified • MedTrax Network</span>
            </div>
            <div>
              <strong style={{ color: '#0369a1' }}>Patient:</strong> {selected.patient_name || 'Patient'}
              <br />
              <span style={{ color: '#64748b' }}>Prescription ID: #{selected.id}</span>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '0.95rem' }}>Clinical Diagnosis</h4>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
              <p style={{ margin: '0 0 4px 0' }}>
                <strong>Chief Complaint:</strong> {selected.chief_complaint || 'N/A'}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Diagnosis:</strong> {selected.diagnosis || 'N/A'}
              </p>
            </div>
          </div>

          {/* Vitals Row */}
          {(selected.blood_pressure || selected.temperature || selected.pulse_rate || selected.weight) && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
              {selected.blood_pressure && (
                <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, fontSize: '0.85rem' }}>
                  <strong>BP:</strong> {selected.blood_pressure} mmHg
                </div>
              )}
              {selected.temperature && (
                <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, fontSize: '0.85rem' }}>
                  <strong>Temp:</strong> {selected.temperature} °F
                </div>
              )}
              {selected.pulse_rate && (
                <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, fontSize: '0.85rem' }}>
                  <strong>Pulse:</strong> {selected.pulse_rate} bpm
                </div>
              )}
              {selected.weight && (
                <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, fontSize: '0.85rem' }}>
                  <strong>Weight:</strong> {selected.weight} kg
                </div>
              )}
            </div>
          )}

          {/* Medications Table */}
          <h4 style={{ margin: '16px 0 8px 0', color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pill size={16} color="#0284c7" /> Prescribed Medications
          </h4>
          <table className="rx-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {selected.medications?.length > 0 ? (
                selected.medications.map((m: any, idx: number) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td><strong>{m.medicine_name}</strong></td>
                    <td>{m.dosage}</td>
                    <td>{m.frequency_display || m.frequency}</td>
                    <td>{m.duration} {m.duration_unit || 'days'}</td>
                    <td style={{ color: '#475569' }}>{m.instructions || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>
                    No specific medications prescribed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Lab Tests */}
          {selected.lab_tests?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FlaskConical size={16} color="#0284c7" /> Ordered Diagnostic / Lab Tests
              </h4>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {selected.lab_tests.map((t: any, idx: number) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      <strong>{t.test_name}</strong>
                      {t.instructions ? <span style={{ color: '#64748b' }}> — {t.instructions}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Follow-up & Additional Advice */}
          {(selected.additional_notes || selected.follow_up_date) && (
            <div style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 6, fontSize: '0.88rem' }}>
              {selected.additional_notes && (
                <p style={{ margin: '0 0 6px 0', color: '#166534' }}>
                  <strong>Doctor's Notes & Advice:</strong> {selected.additional_notes}
                </p>
              )}
              {selected.follow_up_date && (
                <p style={{ margin: 0, color: '#15803d' }}>
                  <strong>Recommended Next Follow-up:</strong> {selected.follow_up_date}
                </p>
              )}
            </div>
          )}

          <div className="rx-footer">
            <div>
              <p style={{ margin: 0 }}>This is an authenticated electronic prescription generated via MedTrax HMS.</p>
              <p style={{ margin: '4px 0 0 0' }}>Scan or present this at authorized pharmacies and diagnostic laboratories.</p>
            </div>
            <div className="rx-signature">
              <div className="rx-signature-line" />
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                Dr. {selected.doctor_name || user?.username}
              </p>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Authorized Medical Practitioner</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prescriptions List Screen
  return (
    <div>
      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <h1>Prescriptions</h1>
          <p>{isDoctor ? 'Manage and issue patient medical prescriptions' : 'Your medical records & active prescriptions'}</p>
        </div>

        {isDoctor && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> New Prescription
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 40 }}
            placeholder={isDoctor ? 'Search by patient name, diagnosis...' : 'Search by doctor, diagnosis...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredPrescriptions.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No prescriptions found</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {isDoctor
              ? 'Click "New Prescription" to issue a prescription to an existing patient.'
              : 'Prescriptions issued by your consulting doctors will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filteredPrescriptions.map((p: any, i: number) => (
            <motion.div
              key={p.id}
              className="glass-card"
              style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
              onClick={() => setSelected(p)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                    }}
                  >
                    <Pill size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
                      {isDoctor ? p.patient_name || 'Patient' : `Dr. ${p.doctor_name || 'Doctor'}`}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      <strong>Diagnosis:</strong> {p.diagnosis || p.chief_complaint || 'General Checkup'}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--accent)',
                      borderRadius: '100px',
                      fontWeight: 600,
                    }}
                  >
                    {p.medications_count || p.medications?.length || 0} medications
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6, margin: 0 }}>
                    {p.created_at?.split('T')[0]}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Doctor Create Prescription Modal ─── */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
            <motion.div
              className="modal-content"
              style={{ maxWidth: 760 }}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h2>
                  <FileText size={20} color="var(--accent)" /> Create New Prescription
                </h2>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                <div className="modal-body">
                  {/* Select Patient */}
                  <div className="form-group">
                    <label className="form-label">
                      Select Patient <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select
                      className="form-input"
                      value={selectedPatientId}
                      onChange={e => setSelectedPatientId(Number(e.target.value))}
                      required
                    >
                      <option value="">-- Choose confirmed/completed patient --</option>
                      {doctorPatients.map((pt: any) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.patient_name} (Age: {pt.patient_age ?? 'N/A'}, {pt.patient_gender})
                        </option>
                      ))}
                    </select>
                    {doctorPatients.length === 0 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: 4 }}>
                        Notice: You can only prescribe for patients who have had confirmed or completed appointments with you.
                      </p>
                    )}
                  </div>

                  {/* Chief Complaint & Diagnosis */}
                  <div className="profile-grid" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Chief Complaint *</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Acute headache, sore throat"
                        value={chiefComplaint}
                        onChange={e => setChiefComplaint(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Diagnosis *</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Upper Respiratory Tract Infection"
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Patient Vitals */}
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={16} color="var(--accent)" /> Patient Vitals (Optional)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                    <div>
                      <input
                        className="form-input"
                        placeholder="BP (120/80)"
                        value={bloodPressure}
                        onChange={e => setBloodPressure(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className="form-input"
                        placeholder="Temp (°F)"
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={e => setTemperature(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className="form-input"
                        placeholder="Pulse (bpm)"
                        type="number"
                        value={pulseRate}
                        onChange={e => setPulseRate(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className="form-input"
                        placeholder="Weight (kg)"
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Medications Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Pill size={16} color="var(--accent)" /> Medications *
                    </label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addMedicationRow}>
                      <Plus size={14} /> Add Medicine
                    </button>
                  </div>

                  {medications.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-primary)',
                        padding: 12,
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: 8, marginBottom: 8 }}>
                        <input
                          className="form-input"
                          placeholder="Medicine Name (e.g. Amoxicillin)"
                          value={m.medicine_name}
                          onChange={e => updateMedication(idx, 'medicine_name', e.target.value)}
                          required
                        />
                        <input
                          className="form-input"
                          placeholder="Dosage (500mg)"
                          value={m.dosage}
                          onChange={e => updateMedication(idx, 'dosage', e.target.value)}
                          required
                        />
                        <select
                          className="form-input"
                          value={m.frequency}
                          onChange={e => updateMedication(idx, 'frequency', e.target.value)}
                        >
                          {FREQUENCY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeMedicationRow(idx)}
                          title="Remove medicine"
                          style={{ padding: '0 10px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 8 }}>
                        <input
                          className="form-input"
                          type="number"
                          min={1}
                          placeholder="Duration"
                          value={m.duration}
                          onChange={e => updateMedication(idx, 'duration', parseInt(e.target.value, 10) || 1)}
                          required
                        />
                        <select
                          className="form-input"
                          value={m.duration_unit}
                          onChange={e => updateMedication(idx, 'duration_unit', e.target.value as any)}
                        >
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </select>
                        <input
                          className="form-input"
                          placeholder="Instructions (e.g. Take after breakfast)"
                          value={m.instructions}
                          onChange={e => updateMedication(idx, 'instructions', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Lab Tests Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 10 }}>
                    <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FlaskConical size={16} color="var(--accent)" /> Diagnostic Lab Tests (Optional)
                    </label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addLabTestRow}>
                      <Plus size={14} /> Add Test
                    </button>
                  </div>

                  {labTests.map((t, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr auto', gap: 8, marginBottom: 8 }}>
                      <input
                        className="form-input"
                        placeholder="Test Name (e.g. Complete Blood Count)"
                        value={t.test_name}
                        onChange={e => updateLabTest(idx, 'test_name', e.target.value)}
                      />
                      <input
                        className="form-input"
                        placeholder="Instructions (e.g. Fasting required)"
                        value={t.instructions}
                        onChange={e => updateLabTest(idx, 'instructions', e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeLabTestRow(idx)}
                        style={{ padding: '0 10px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Follow-up & Additional Advice */}
                  <div className="profile-grid" style={{ marginTop: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Follow-up Date</label>
                      <input
                        className="form-input"
                        type="date"
                        value={followUpDate}
                        onChange={e => setFollowUpDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Additional Instructions / Advice</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Drink 2-3 liters of water, avoid cold items"
                        value={additionalNotes}
                        onChange={e => setAdditionalNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Issue Prescription'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
