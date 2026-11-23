import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Clock,
  HeartPulse,
  Calendar,
  Pill,
  FileText,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  aiAPI,
  type AIRegistryResponse,
  type SymptomTriageResult,
  type SafetyCheckResult,
  type CarePlanResult,
  type AppointmentAssistantResult,
  type ClinicalSummarizerResult,
} from '../api/ai';
import { prescriptionsAPI } from '../api/prescriptions';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';

export default function AIAgentsHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDoctor = user?.role === 'doctor';

  const [registry, setRegistry] = useState<AIRegistryResponse['data'] | null>(null);
  const [activeTab, setActiveTab] = useState<string>(isDoctor ? 'safety' : 'triage');

  // --- Doctor: Safety Check State ---
  const [doctorPatients, setDoctorPatients] = useState<any[]>([]);
  const [safetyPatientId, setSafetyPatientId] = useState<number | ''>('');
  const [safetyDiagnosis, setSafetyDiagnosis] = useState('');
  const [safetyMeds, setSafetyMeds] = useState([
    { medicine_name: '', dosage: '500mg', dosage_frequency: 'twice_daily' },
  ]);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [safetyResult, setSafetyResult] = useState<SafetyCheckResult | null>(null);

  // --- Triage State ---
  const [triageSymptoms, setTriageSymptoms] = useState('');
  const [triageSeverity, setTriageSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [triageDuration, setTriageDuration] = useState<number>(3);
  const [triageVitals, setTriageVitals] = useState({
    temperature_f: '',
    heart_rate: '',
    spo2: '',
    blood_pressure: '',
  });
  const [triageCity, setTriageCity] = useState('');
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<SymptomTriageResult | null>(null);

  // --- Care Plan State ---
  const [carePlanLoading, setCarePlanLoading] = useState(false);
  const [carePlanResult, setCarePlanResult] = useState<CarePlanResult | null>(null);

  // --- Appointment Assistant State ---
  const [apptPrefDate, setApptPrefDate] = useState('');
  const [apptTimeOfDay, setApptTimeOfDay] = useState<'any' | 'morning' | 'afternoon'>('any');
  const [apptSpecialization, setApptSpecialization] = useState('');
  const [apptReason, setApptReason] = useState('');
  const [apptLoading, setApptLoading] = useState(false);
  const [apptResult, setApptResult] = useState<AppointmentAssistantResult | null>(null);

  // --- Summarizer State ---
  const [summaryMode, setSummaryMode] = useState<'clinical_soap' | 'patient_friendly'>(
    isDoctor ? 'clinical_soap' : 'patient_friendly'
  );
  const [summaryComplaint, setSummaryComplaint] = useState('');
  const [summaryDiagnosis, setSummaryDiagnosis] = useState('');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<ClinicalSummarizerResult | null>(null);

  useEffect(() => {
    aiAPI
      .getRegistry()
      .then((res) => setRegistry(res.data?.data || null))
      .catch(() => {});

    if (isDoctor) {
      prescriptionsAPI
        .getDoctorPatients()
        .then((res) => {
          const list = res.data || [];
          setDoctorPatients(list);
          if (list.length > 0) setSafetyPatientId(list[0].id);
        })
        .catch(() => {});
    } else {
      // Auto-load patient care plan on initial open if in patient tab
      aiAPI
        .getCarePlan()
        .then((res) => setCarePlanResult(res.data?.data || null))
        .catch(() => {});
    }
  }, [isDoctor]);

  // Handle Safety Check Submit
  const handleSafetySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyPatientId) return toast.error('Select a patient to run safety check');
    const validMeds = safetyMeds.filter((m) => m.medicine_name.trim());
    if (validMeds.length === 0) return toast.error('Enter at least one medication name');

    setSafetyLoading(true);
    setSafetyResult(null);
    try {
      const res = await aiAPI.checkSafety({
        patient_id: Number(safetyPatientId),
        diagnosis: safetyDiagnosis.trim(),
        medications: validMeds,
      });
      setSafetyResult(res.data.data);
      if (res.data.data.status === 'BLOCKED') {
        toast.error('SAFETY ALERT: Critical contraindication detected!');
      } else if (res.data.data.status === 'WARNING') {
        toast('Caution: Potential interactions flagged', { icon: '⚠️' });
      } else {
        toast.success('Clinical safety verified! Prescription is safe.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Safety evaluation failed');
    } finally {
      setSafetyLoading(false);
    }
  };

  // Handle Triage Submit
  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageSymptoms.trim() || triageSymptoms.trim().length < 3) {
      return toast.error('Describe symptoms in at least 3 characters');
    }

    const vitalsPayload: any = {};
    if (triageVitals.temperature_f) vitalsPayload.temperature_f = parseFloat(triageVitals.temperature_f);
    if (triageVitals.heart_rate) vitalsPayload.heart_rate = parseInt(triageVitals.heart_rate, 10);
    if (triageVitals.spo2) vitalsPayload.spo2 = parseInt(triageVitals.spo2, 10);
    if (triageVitals.blood_pressure) vitalsPayload.blood_pressure = triageVitals.blood_pressure.trim();

    setTriageLoading(true);
    setTriageResult(null);
    try {
      const res = await aiAPI.triageSymptoms({
        symptoms: triageSymptoms.trim(),
        severity: triageSeverity,
        duration_days: triageDuration,
        preferred_city: triageCity.trim() || undefined,
        vitals: Object.keys(vitalsPayload).length > 0 ? vitalsPayload : undefined,
      });
      setTriageResult(res.data.data);
      if (res.data.data.urgency_level === 'EMERGENCY') {
        toast.error('EMERGENCY RED FLAG: Immediate care required!', { duration: 6000 });
      } else {
        toast.success('Triage assessment complete');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Triage analysis failed');
    } finally {
      setTriageLoading(false);
    }
  };

  // Handle Care Plan Reload
  const handleLoadCarePlan = async () => {
    setCarePlanLoading(true);
    try {
      const res = await aiAPI.getCarePlan();
      setCarePlanResult(res.data.data);
      toast.success('Care plan updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load care plan');
    } finally {
      setCarePlanLoading(false);
    }
  };

  // Handle Appointment Assistant Submit
  const handleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApptLoading(true);
    setApptResult(null);
    try {
      const res = await aiAPI.getAppointmentAssistant({
        preferred_date: apptPrefDate || undefined,
        preferred_time_of_day: apptTimeOfDay,
        specialization: apptSpecialization.trim() || undefined,
        reason: apptReason.trim() || undefined,
      });
      setApptResult(res.data.data);
      toast.success('Smart scheduling analysis ready');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Scheduling assistant failed');
    } finally {
      setApptLoading(false);
    }
  };

  // Handle Summarizer Submit
  const handleSummarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryComplaint.trim() && !summaryDiagnosis.trim() && !summaryNotes.trim()) {
      return toast.error('Enter at least a complaint, diagnosis, or clinical note');
    }
    setSummaryLoading(true);
    setSummaryResult(null);
    try {
      const res = await aiAPI.summarize({
        mode: summaryMode,
        chief_complaint: summaryComplaint.trim(),
        diagnosis: summaryDiagnosis.trim(),
        clinical_notes: summaryNotes.trim(),
      });
      setSummaryResult(res.data.data);
      toast.success(summaryMode === 'clinical_soap' ? 'SOAP note generated' : 'Patient summary generated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Summarization failed');
    } finally {
      setSummaryLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 179, 237, 0.2)',
          borderRadius: 16,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Sparkles size={24} color="#60a5fa" />
            <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#f8fafc' }}>
              MedTrax AI Clinical Intelligence Suite
            </h1>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
            Multi-agent pharmacology safety checks, emergency triage, personalized care plans, and smart clinical notes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Badge variant={registry?.intelligence_mode === 'hybrid_llm' ? 'success' : 'default'} size="sm">
            {registry?.intelligence_mode === 'hybrid_llm'
              ? `Hybrid LLM Active (${registry?.llm_provider?.toUpperCase()})`
              : 'Deterministic Rules Engine (Safe Offline)'}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          marginBottom: 24,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {isDoctor && (
          <button
            className={`btn btn-sm ${activeTab === 'safety' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('safety')}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <ShieldAlert size={16} /> PharmaGuard Safety Check
          </button>
        )}
        <button
          className={`btn btn-sm ${activeTab === 'triage' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('triage')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <HeartPulse size={16} /> Symptom Triage & Red-Flag Checker
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'careplan' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('careplan');
            if (!carePlanResult) handleLoadCarePlan();
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Pill size={16} /> Daily Care Plan & Medication Adherence
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('appointments')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Calendar size={16} /> Smart Scheduling Assistant
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'summarizer' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('summarizer')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <FileText size={16} /> {isDoctor ? 'Clinical SOAP Note Generator' : 'Prescription Translator'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* TAB 1: PHARMAGUARD CLINICAL SAFETY CHECK (DOCTOR ONLY)                    */}
        {/* ========================================================================= */}
        {activeTab === 'safety' && isDoctor && (
          <motion.div
            key="safety"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={20} color="#34d399" /> Evaluate Prescription Safety
                </h3>
                <form onSubmit={handleSafetySubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Target Patient *
                    </label>
                    <select
                      className="form-control"
                      value={safetyPatientId}
                      onChange={(e) => setSafetyPatientId(Number(e.target.value))}
                      required
                    >
                      {doctorPatients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.first_name ? `${p.first_name} ${p.last_name || ''}` : `Patient #${p.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Clinical Diagnosis (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Acute Bronchitis, Hypertension"
                      value={safetyDiagnosis}
                      onChange={(e) => setSafetyDiagnosis(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Proposed Medications *</label>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setSafetyMeds([...safetyMeds, { medicine_name: '', dosage: '500mg', dosage_frequency: 'twice_daily' }])
                        }
                      >
                        + Add Drug
                      </button>
                    </div>

                    {safetyMeds.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Medicine name (e.g. Warfarin, Amoxicillin)"
                          value={m.medicine_name}
                          onChange={(e) => {
                            const updated = [...safetyMeds];
                            updated[idx].medicine_name = e.target.value;
                            setSafetyMeds(updated);
                          }}
                          required
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Dosage"
                          style={{ width: 110 }}
                          value={m.dosage}
                          onChange={(e) => {
                            const updated = [...safetyMeds];
                            updated[idx].dosage = e.target.value;
                            setSafetyMeds(updated);
                          }}
                        />
                        {safetyMeds.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSafetyMeds(safetyMeds.filter((_, i) => i !== idx))}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={safetyLoading}>
                    {safetyLoading ? 'Running Pharmacology Verification...' : 'Run PharmaGuard Safety Scan'}
                  </button>
                </form>
              </div>

              {/* Safety Result Display */}
              <div>
                {safetyResult ? (
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                          Safety Score
                        </span>
                        <h2
                          style={{
                            margin: '4px 0 0',
                            fontSize: '2.2rem',
                            color:
                              safetyResult.safety_score >= 80
                                ? '#34d399'
                                : safetyResult.safety_score >= 50
                                ? '#fbbf24'
                                : '#f87171',
                          }}
                        >
                          {safetyResult.safety_score} / 100
                        </h2>
                      </div>
                      <Badge
                        variant={
                          safetyResult.status === 'APPROVED'
                            ? 'success'
                            : safetyResult.status === 'WARNING'
                            ? 'warning'
                            : 'danger'
                        }
                        size="md"
                      >
                        {safetyResult.status} ({safetyResult.risk_level} RISK)
                      </Badge>
                    </div>

                    <div
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: 'rgba(30, 41, 59, 0.7)',
                        borderLeft: `4px solid ${
                          safetyResult.status === 'APPROVED'
                            ? '#34d399'
                            : safetyResult.status === 'WARNING'
                            ? '#fbbf24'
                            : '#f87171'
                        }`,
                        marginBottom: 18,
                        fontSize: '0.92rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {safetyResult.summary}
                    </div>

                    {safetyResult.interactions.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>
                          Detected Pharmacology Conflicts ({safetyResult.interactions.length})
                        </h4>
                        {safetyResult.interactions.map((it, i) => (
                          <div
                            key={i}
                            style={{
                              padding: 12,
                              borderRadius: 8,
                              backgroundColor: 'rgba(15, 23, 42, 0.8)',
                              border: '1px solid rgba(248, 113, 113, 0.25)',
                              marginBottom: 8,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>{it.type}</strong>
                              <Badge variant={it.severity === 'CRITICAL' ? 'danger' : 'warning'} size="sm">
                                {it.severity}
                              </Badge>
                            </div>
                            <p style={{ margin: '4px 0', fontSize: '0.88rem' }}>{it.explanation}</p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#60a5fa' }}>
                              💡 <strong>Recommendation:</strong> {it.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {safetyResult.patient_instructions.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Patient Precautions</h4>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.85rem', color: '#cbd5e1' }}>
                          {safetyResult.patient_instructions.map((ins, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>
                              {ins}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="card"
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      color: '#94a3b8',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 320,
                    }}
                  >
                    <ShieldAlert size={48} color="#64748b" style={{ marginBottom: 16 }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      Select a patient and medications to test drug-drug interactions, allergy cross-reactivity, and disease contraindications.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SYMPTOM TRIAGE & RED-FLAG CHECKER                                  */}
        {/* ========================================================================= */}
        {activeTab === 'triage' && (
          <motion.div
            key="triage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HeartPulse size={20} color="#f43f5e" /> Symptom Assessment
                </h3>
                <form onSubmit={handleTriageSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      What symptoms are you experiencing? *
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe what you feel (e.g. sharp headache, mild fever, dry cough, dizziness)..."
                      value={triageSymptoms}
                      onChange={(e) => setTriageSymptoms(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={365}
                        className="form-control"
                        value={triageDuration}
                        onChange={(e) => setTriageDuration(parseInt(e.target.value, 10) || 0)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                        Perceived Severity
                      </label>
                      <select
                        className="form-control"
                        value={triageSeverity}
                        onChange={(e: any) => setTriageSeverity(e.target.value)}
                      >
                        <option value="mild">Mild (Noticeable but easy)</option>
                        <option value="moderate">Moderate (Interferes with day)</option>
                        <option value="severe">Severe (Intense / Debilitating)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Recorded Vitals (Optional)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="BP (e.g. 120/80)"
                        value={triageVitals.blood_pressure}
                        onChange={(e) => setTriageVitals({ ...triageVitals, blood_pressure: e.target.value })}
                      />
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="Temp °F (e.g. 100.4)"
                        value={triageVitals.temperature_f}
                        onChange={(e) => setTriageVitals({ ...triageVitals, temperature_f: e.target.value })}
                      />
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Pulse (bpm)"
                        value={triageVitals.heart_rate}
                        onChange={(e) => setTriageVitals({ ...triageVitals, heart_rate: e.target.value })}
                      />
                      <input
                        type="number"
                        className="form-control"
                        placeholder="SpO2 % (e.g. 98)"
                        value={triageVitals.spo2}
                        onChange={(e) => setTriageVitals({ ...triageVitals, spo2: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Preferred City (for Doctor matching)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Delhi, Mumbai, Bengaluru"
                      value={triageCity}
                      onChange={(e) => setTriageCity(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={triageLoading}>
                    {triageLoading ? 'Evaluating Emergency Red Flags...' : 'Analyze Symptoms & Find Doctors'}
                  </button>
                </form>
              </div>

              {/* Triage Results */}
              <div>
                {triageResult ? (
                  <div className="card" style={{ padding: 24 }}>
                    {/* Emergency Alert Banner */}
                    {triageResult.seek_immediate_care && (
                      <div
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          border: '2px solid #ef4444',
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 18,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                      >
                        <AlertTriangle size={28} color="#ef4444" style={{ flexShrink: 0 }} />
                        <div>
                          <strong style={{ color: '#fca5a5', fontSize: '1.05rem', display: 'block', marginBottom: 4 }}>
                            EMERGENCY ACTION REQUIRED
                          </strong>
                          <p style={{ margin: 0, color: '#fee2e2', fontSize: '0.9rem', lineHeight: 1.4 }}>
                            Red-flag symptoms detected. Please call emergency services (911/112) or go to the nearest emergency room immediately. Do not drive yourself.
                          </p>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                          Urgency Level
                        </span>
                        <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem' }}>{triageResult.urgency_level}</h3>
                      </div>
                      <Badge
                        variant={
                          triageResult.urgency_level === 'EMERGENCY'
                            ? 'danger'
                            : triageResult.urgency_level === 'URGENT'
                            ? 'warning'
                            : 'success'
                        }
                        size="md"
                      >
                        {triageResult.recommended_timeframe}
                      </Badge>
                    </div>

                    <div
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: 'rgba(30, 41, 59, 0.7)',
                        marginBottom: 16,
                        fontSize: '0.92rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {triageResult.clinical_guidance}
                    </div>

                    {/* Recommended Specializations */}
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Recommended Specialty
                      </span>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                        {triageResult.recommended_specializations.map((spec, i) => (
                          <Badge key={i} variant="primary" size="md">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Matched Live Doctors */}
                    {triageResult.recommended_doctors.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>Recommended Doctors in MedTrax</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {triageResult.recommended_doctors.map((doc) => (
                            <div
                              key={doc.doctor_id}
                              style={{
                                padding: 12,
                                borderRadius: 10,
                                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(99, 179, 237, 0.2)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div>
                                <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{doc.name}</strong>
                                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
                                  {doc.specialization} • {doc.city} • {doc.years_of_experience || 5}+ yrs exp • ⭐{' '}
                                  {doc.average_rating ? doc.average_rating.toFixed(1) : 'New'} ({doc.review_count} reviews)
                                </div>
                              </div>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate(isDoctor ? '/doctor/appointments' : '/patient/appointments')}
                              >
                                Book Visit
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Questions for Doctor */}
                    {triageResult.questions_for_doctor.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#93c5fd' }}>
                          💡 Questions to Ask Your Doctor
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.85rem', color: '#cbd5e1' }}>
                          {triageResult.questions_for_doctor.map((q, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="card"
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      color: '#94a3b8',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 320,
                    }}
                  >
                    <HeartPulse size={48} color="#64748b" style={{ marginBottom: 16 }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      Enter your symptoms to check for emergency red flags, calculate urgency, and receive matching doctor recommendations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DAILY CARE PLAN & MEDICATION ADHERENCE                             */}
        {/* ========================================================================= */}
        {activeTab === 'careplan' && (
          <motion.div
            key="careplan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>Personalized Recovery & Daily Care Plan</h3>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Organized morning-to-bedtime pill schedules, active vs completed courses, and tailored monitoring.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLoadCarePlan} disabled={carePlanLoading}>
                {carePlanLoading ? 'Refreshing...' : '🔄 Refresh Care Plan'}
              </button>
            </div>

            {carePlanResult ? (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* Left: Daily Schedule Timeline */}
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={18} color="#60a5fa" /> Today's Dosing Schedule
                    </h4>
                    <Badge variant={carePlanResult.adherence_complexity === 'HIGH' ? 'warning' : 'primary'} size="sm">
                      Adherence Complexity: {carePlanResult.adherence_complexity}
                    </Badge>
                  </div>

                  {/* Morning, Afternoon, Evening, Bedtime Slots */}
                  {(['morning', 'afternoon', 'evening', 'bedtime', 'as_needed'] as const).map((slotKey) => {
                    const items = carePlanResult.daily_schedule[slotKey] || [];
                    const slotLabels = {
                      morning: '🌅 Morning (with breakfast / 8 AM)',
                      afternoon: '☀️ Afternoon (with lunch / 1 PM)',
                      evening: '🌆 Evening (with dinner / 7 PM)',
                      bedtime: '🌙 Bedtime (before sleep / 10 PM)',
                      as_needed: '⚡ As Needed (SOS for symptoms)',
                    };

                    if (items.length === 0) return null;

                    return (
                      <div
                        key={slotKey}
                        style={{
                          padding: 14,
                          borderRadius: 10,
                          backgroundColor: 'rgba(30, 41, 59, 0.5)',
                          border: '1px solid rgba(148, 163, 184, 0.1)',
                          marginBottom: 12,
                        }}
                      >
                        <strong style={{ fontSize: '0.9rem', color: '#93c5fd', display: 'block', marginBottom: 8 }}>
                          {slotLabels[slotKey]}
                        </strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {items.map((it, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.88rem',
                              }}
                            >
                              <span>
                                <strong>{it.medicine_name}</strong> ({it.dosage})
                              </span>
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{it.timing_note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Active vs Completed Summary */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                    <h5 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>Active Medication Courses</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {carePlanResult.active_medications.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: 10,
                            borderRadius: 8,
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(52, 211, 153, 0.2)',
                            fontSize: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{m.medicine_name}</strong>
                            <Badge variant="success" size="sm">
                              {m.days_remaining}d left
                            </Badge>
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>
                            {m.dosage} • {m.frequency.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Condition Guidance & Checklists */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Chronic Condition Tips */}
                  {carePlanResult.condition_guidance.map((cg, idx) => (
                    <div key={idx} className="card" style={{ padding: 18 }}>
                      <h4 style={{ margin: '0 0 8px', color: '#38bdf8', fontSize: '0.95rem' }}>
                        🏥 {cg.condition} Action Plan
                      </h4>
                      <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <strong>Monitoring:</strong> {cg.monitoring}
                      </p>
                      <ul style={{ margin: '0 0 8px', paddingLeft: 18, fontSize: '0.82rem', color: '#94a3b8' }}>
                        {cg.lifestyle.map((ls, i) => (
                          <li key={i}>{ls}</li>
                        ))}
                      </ul>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#f87171',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          padding: 6,
                          borderRadius: 6,
                        }}
                      >
                        ⚠️ {cg.warning_signs}
                      </div>
                    </div>
                  ))}

                  {/* Follow-up Reminders */}
                  {carePlanResult.follow_ups.length > 0 && (
                    <div className="card" style={{ padding: 18 }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem' }}>📅 Follow-up Reminders</h4>
                      {carePlanResult.follow_ups.map((fu, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8,
                            borderRadius: 6,
                            backgroundColor: fu.status === 'overdue' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: '0.85rem' }}>
                            <strong>{fu.follow_up_date}</strong> ({fu.diagnosis || 'Consultation'})
                          </span>
                          <Badge variant={fu.status === 'overdue' ? 'danger' : 'warning'} size="sm">
                            {fu.status === 'overdue' ? 'OVERDUE' : `${fu.days_until} days`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Adherence Tips */}
                  <div className="card" style={{ padding: 18 }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#fcd34d' }}>💡 Adherence Tips</h4>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {carePlanResult.adherence_tips.map((t, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                <p>Loading your active medication schedule and chronic care guidance...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SMART APPOINTMENT & FOLLOW-UP ASSISTANT                            */}
        {/* ========================================================================= */}
        {activeTab === 'appointments' && (
          <motion.div
            key="appointments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={20} color="#38bdf8" /> Smart Scheduling Assistant
                </h3>
                <form onSubmit={handleApptSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Preferred Consultation Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={apptPrefDate}
                      onChange={(e) => setApptPrefDate(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Preferred Time of Day
                    </label>
                    <select
                      className="form-control"
                      value={apptTimeOfDay}
                      onChange={(e: any) => setApptTimeOfDay(e.target.value)}
                    >
                      <option value="any">Any Time Window (9 AM - 5 PM)</option>
                      <option value="morning">Morning Only (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon Only (12 PM - 5 PM)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Medical Specialty
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Cardiology, Dermatology, General Physician"
                      value={apptSpecialization}
                      onChange={(e) => setApptSpecialization(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Reason for Visit (Helps generate prep checklist)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Fasting blood sugar check, routine follow-up"
                      value={apptReason}
                      onChange={(e) => setApptReason(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={apptLoading}>
                    {apptLoading ? 'Scanning Doctor Schedules & Queues...' : 'Find Optimal Open Slots'}
                  </button>
                </form>
              </div>

              {/* Assistant Results */}
              <div>
                {apptResult ? (
                  <div className="card" style={{ padding: 24 }}>
                    <h4 style={{ marginTop: 0, marginBottom: 12 }}>Scheduling Overview</h4>
                    <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 16 }}>
                      {apptResult.summary}
                    </p>

                    {/* Follow-up Alerts */}
                    {apptResult.follow_up_alerts.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <h5 style={{ margin: '0 0 8px', color: '#f87171' }}>⚠️ Unscheduled Follow-up Alerts</h5>
                        {apptResult.follow_up_alerts.map((alert, i) => (
                          <div
                            key={i}
                            style={{
                              padding: 10,
                              borderRadius: 8,
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              marginBottom: 6,
                              fontSize: '0.88rem',
                            }}
                          >
                            <strong>{alert.urgency}:</strong> {alert.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Conflict Warnings */}
                    {apptResult.conflict_warnings.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <h5 style={{ margin: '0 0 8px', color: '#fbbf24' }}>Notice: Potential Same-Day Conflicts</h5>
                        {apptResult.conflict_warnings.map((c, i) => (
                          <div
                            key={i}
                            style={{
                              padding: 8,
                              borderRadius: 6,
                              backgroundColor: 'rgba(251, 191, 36, 0.1)',
                              fontSize: '0.85rem',
                              marginBottom: 4,
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommended Slots */}
                    <div style={{ marginBottom: 16 }}>
                      <h5 style={{ margin: '0 0 10px' }}>Available Doctor Slots & Live Queues</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {apptResult.recommended_slots.map((docSlot) => (
                          <div
                            key={docSlot.doctor_id}
                            style={{
                              padding: 12,
                              borderRadius: 10,
                              backgroundColor: 'rgba(15, 23, 42, 0.7)',
                              border: '1px solid rgba(99, 179, 237, 0.2)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong>{docSlot.doctor_name}</strong>
                                <span style={{ color: '#94a3b8', fontSize: '0.82rem', marginLeft: 8 }}>
                                  ({docSlot.specialization})
                                </span>
                              </div>
                              <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                                Live Queue: {docSlot.today_queue_count} waiting (~{docSlot.estimated_wait_minutes} min wait)
                              </span>
                            </div>

                            <div style={{ marginTop: 8 }}>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                Slots for {docSlot.suggested_date}:
                              </span>
                              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                {docSlot.slots.map((s, idx) => (
                                  <button
                                    key={idx}
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => navigate(isDoctor ? '/doctor/appointments' : '/patient/appointments')}
                                    style={{ fontSize: '0.82rem', padding: '4px 10px' }}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pre-Visit Checklist */}
                    {apptResult.pre_visit_checklist.length > 0 && (
                      <div style={{ paddingTop: 12, borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                        <h5 style={{ margin: '0 0 8px', color: '#60a5fa' }}>📋 Pre-Visit Preparation Checklist</h5>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: '#cbd5e1' }}>
                          {apptResult.pre_visit_checklist.map((item, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="card"
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      color: '#94a3b8',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 320,
                    }}
                  >
                    <Calendar size={48} color="#64748b" style={{ marginBottom: 16 }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      Select a preferred window or specialty to find open slots, verify wait times, and prepare for your consultation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CLINICAL SOAP / PRESCIPTION SUMMARIZER                             */}
        {/* ========================================================================= */}
        {activeTab === 'summarizer' && (
          <motion.div
            key="summarizer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={20} color="#a78bfa" />{' '}
                  {isDoctor ? 'Clinical Note / SOAP Generator' : 'Prescription Plain-Language Translator'}
                </h3>
                <form onSubmit={handleSummarySubmit}>
                  {isDoctor && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                        Target Output Format
                      </label>
                      <select
                        className="form-control"
                        value={summaryMode}
                        onChange={(e: any) => setSummaryMode(e.target.value)}
                      >
                        <option value="clinical_soap">Professional Clinical SOAP Note (Doctor View)</option>
                        <option value="patient_friendly">Plain-Language Guide (Patient View)</option>
                      </select>
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Chief Complaint / Reported Symptoms
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Fever, persistent cough for 4 days"
                      value={summaryComplaint}
                      onChange={(e) => setSummaryComplaint(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Acute Viral Bronchitis"
                      value={summaryDiagnosis}
                      onChange={(e) => setSummaryDiagnosis(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                      Doctor's Clinical Notes / Consultation Context
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Enter raw clinical observations, physical exam notes, or instructions..."
                      value={summaryNotes}
                      onChange={(e) => setSummaryNotes(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={summaryLoading}>
                    {summaryLoading
                      ? 'Generating Structured Clinical Summary...'
                      : summaryMode === 'clinical_soap'
                      ? 'Generate SOAP Note'
                      : 'Translate Into Plain Language'}
                  </button>
                </form>
              </div>

              {/* Summary Results */}
              <div>
                {summaryResult ? (
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ margin: 0 }}>
                        {summaryResult.mode === 'clinical_soap' ? 'Clinical SOAP Note' : 'Patient-Friendly Summary'}
                      </h4>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          copyToClipboard(
                            summaryResult.soap_note
                              ? `S: ${summaryResult.soap_note.subjective}\nO: ${summaryResult.soap_note.objective}\nA: ${summaryResult.soap_note.assessment}\nP: ${summaryResult.soap_note.plan}`
                              : summaryResult.summary
                          )
                        }
                      >
                        <Copy size={14} /> Copy Note
                      </button>
                    </div>

                    <div
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: 'rgba(30, 41, 59, 0.7)',
                        marginBottom: 16,
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {summaryResult.summary}
                    </div>

                    {summaryResult.soap_note && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(15, 23, 42, 0.7)' }}>
                          <strong style={{ color: '#60a5fa', fontSize: '0.85rem' }}>Subjective (S)</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>{summaryResult.soap_note.subjective}</p>
                        </div>
                        <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(15, 23, 42, 0.7)' }}>
                          <strong style={{ color: '#34d399', fontSize: '0.85rem' }}>Objective (O)</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>{summaryResult.soap_note.objective}</p>
                        </div>
                        <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(15, 23, 42, 0.7)' }}>
                          <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>Assessment (A)</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>{summaryResult.soap_note.assessment}</p>
                        </div>
                        <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(15, 23, 42, 0.7)' }}>
                          <strong style={{ color: '#c084fc', fontSize: '0.85rem' }}>Plan (P)</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>{summaryResult.soap_note.plan}</p>
                        </div>
                      </div>
                    )}

                    {summaryResult.key_highlights.length > 0 && (
                      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                        <h5 style={{ margin: '0 0 8px', color: '#93c5fd' }}>Key Clinical Highlights</h5>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: '#cbd5e1' }}>
                          {summaryResult.key_highlights.map((h, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="card"
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      color: '#94a3b8',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 320,
                    }}
                  >
                    <FileText size={48} color="#64748b" style={{ marginBottom: 16 }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      Enter clinical consultation details to generate standardized SOAP documentation or a patient-friendly medication guide.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
