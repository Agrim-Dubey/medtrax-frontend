import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Clock,
  ShieldCheck,
  Video,
  FileText,
  Activity,
  Award,
  PhoneCall,
  Search,
  MapPin,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HeartPulse,
  Brain,
  Baby,
  Bone,
  CheckCircle2,
  Users,
  AlertTriangle,
  Building2,
  Lock,
  Star,
  Menu,
  X,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  RefreshCw,
  QrCode,
  Calendar,
  Check,
} from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Care Finder states
  const [careMode, setCareMode] = useState<'video' | 'inclinic' | 'ai'>('video');
  const [selectedSpecialty, setSelectedSpecialty] = useState('cardiology');
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive showcase tab state
  const [activeShowcase, setActiveShowcase] = useState<'queue' | 'ai' | 'rx' | 'telehealth'>('queue');

  // Interactive Queue Simulator state
  const [currentToken, setCurrentToken] = useState(28);
  const [yourToken, setYourToken] = useState(31);

  // Interactive AI Triage Simulator state
  const [triageScenario, setTriageScenario] = useState(0);

  // Interactive Prescription state
  const [rxVerified, setRxVerified] = useState(false);

  // Interactive Telehealth HUD state
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isPipFlipped, setIsPipFlipped] = useState(false);
  const [snapshotFlash, setSnapshotFlash] = useState(false);

  // Doctor Consultation Modal state
  interface DoctorModalData {
    name: string;
    qualification: string;
    role: string;
    city: string;
    rating: number;
    reviews: number;
    experience: string;
  }
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<DoctorModalData | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState('11:30 AM');
  const [selectedSlotDate, setSelectedSlotDate] = useState('Today');

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSearchAction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAuthenticated) {
      navigate('/patient/appointments');
    } else {
      navigate('/signup');
    }
  };

  const symptomQuickChips = [
    { label: 'Chest Tightness', spec: 'cardiology', query: 'Exertional pressure or discomfort' },
    { label: 'Pediatric High Fever', spec: 'pediatrics', query: 'Child high grade fever & chills' },
    { label: 'Migraine & Aura', spec: 'neurology', query: 'Unilateral pulsating head pain' },
    { label: 'Sprained Ankle', spec: 'orthopedics', query: 'Joint swelling and weight-bearing pain' },
    { label: 'Skin Allergy / Rash', spec: 'general', query: 'Acute erythematous rash' },
    { label: 'Diabetes Follow-up', spec: 'general', query: 'HbA1c & fasting glucose review' },
  ];

  const handleSymptomChipClick = (chip: typeof symptomQuickChips[0]) => {
    setSelectedSpecialty(chip.spec);
    setSearchQuery(chip.query);
  };

  const triageScenarios = [
    {
      symptoms: 'Exertional chest pressure radiating to left shoulder, resolved after 5 mins of rest.',
      urgency: 'HIGH ACUITY (LEVEL 2 EMERGENT)',
      urgencyColor: '#f87171',
      urgencyBg: 'rgba(239, 68, 68, 0.15)',
      specialty: 'Interventional Cardiology',
      diagnostic: 'Immediate 12-lead ECG, Troponin I, Lipid Profile',
      contraindication: '0 Interactions with current medications',
      actionPrompt: 'Schedule Priority Cardiology Slot',
    },
    {
      symptoms: 'Toddler (2 yrs) with 102.8°F fever, dry cough, mild lethargy for 24 hours.',
      urgency: 'URGENT CARE (LEVEL 3 URGENT)',
      urgencyColor: '#fbbf24',
      urgencyBg: 'rgba(251, 191, 36, 0.15)',
      specialty: 'Pediatrics & Child Wellness',
      diagnostic: 'Pediatric clinical examination & rapid antigen',
      contraindication: 'Weight-adjusted Paracetamol dosage verified',
      actionPrompt: 'Connect with Pediatrician On-Duty',
    },
    {
      symptoms: 'Persistent bilateral tension-type headache with neck stiffness for 4 days.',
      urgency: 'ROUTINE CARE (LEVEL 4 NON-URGENT)',
      urgencyColor: '#34d399',
      urgencyBg: 'rgba(52, 211, 153, 0.15)',
      specialty: 'Neurology & Internal Medicine',
      diagnostic: 'Routine neurological screening & ergonomic evaluation',
      contraindication: 'Safe for NSAID short-course therapy',
      actionPrompt: 'Book Video Teleconsult Today',
    },
    {
      symptoms: 'Acute lateral ankle twisting injury while jogging, severe local edema.',
      urgency: 'URGENT EVALUATION (LEVEL 4)',
      urgencyColor: '#60a5fa',
      urgencyBg: 'rgba(96, 165, 250, 0.15)',
      specialty: 'Orthopedics & Sports Medicine',
      diagnostic: 'Weight-bearing bilateral ankle radiographs (X-Ray)',
      contraindication: 'R.I.C.E. protocol initiated',
      actionPrompt: 'Reserve Orthopedic OPD Token',
    },
  ];

  const specialtiesList = [
    {
      id: 'cardiology',
      name: 'Cardiology & Heart Care',
      icon: <HeartPulse size={26} />,
      lead: 'Dr. Vikramaditya Sharma, DM (Cardio)',
      conditions: ['Hypertension', 'Chest Pain', 'Arrhythmia', 'Heart Failure'],
      doctorsAvailable: 4,
    },
    {
      id: 'neurology',
      name: 'Neurology & Brain Spine',
      icon: <Brain size={26} />,
      lead: 'Dr. Ananya Sen, MD, MRCP',
      conditions: ['Migraines', 'Stroke Rehab', 'Epilepsy', 'Nerve Pain'],
      doctorsAvailable: 3,
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics & Child Wellness',
      icon: <Baby size={26} />,
      lead: 'Dr. Priyadarshini Mehta, MD, DCH',
      conditions: ['Child Vaccines', 'Growth Tracking', 'Fever & Asthma', 'Infant Care'],
      doctorsAvailable: 5,
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics & Joint Care',
      icon: <Bone size={26} />,
      lead: 'Dr. Rajesh Kulkarni, MS, MCh',
      conditions: ['Joint Pain', 'Sports Injuries', 'Fractures', 'Spine Disorders'],
      doctorsAvailable: 3,
    },
    {
      id: 'general',
      name: 'Internal & Preventive Care',
      icon: <Stethoscope size={26} />,
      lead: 'Dr. Rohan Mehra, MD (General Med)',
      conditions: ['Diabetes Care', 'Viral Illnesses', 'Thyroid', 'Routine Checkups'],
      doctorsAvailable: 6,
    },
    {
      id: 'emergency',
      name: 'Acute Triage & Critical Care',
      icon: <Activity size={26} />,
      lead: 'Emergency Medicine Specialists',
      conditions: ['Acute Trauma', 'Severe Dyspnea', 'Dehydration', 'Urgent Vitals'],
      doctorsAvailable: 2,
    },
  ];

  const featuredPhysicians = [
    {
      name: 'Dr. Vikramaditya Sharma',
      qualification: 'MBBS, MD, DM (Cardiology - AIIMS)',
      role: 'Chief of Interventional Cardiology',
      experience: '18+ Years',
      rating: 4.96,
      reviews: 1420,
      nextSlot: 'Today, 11:30 AM',
      city: 'Mumbai',
    },
    {
      name: 'Dr. Ananya Sen',
      qualification: 'MBBS, MD (Medicine), MRCP (UK)',
      role: 'Head of Neurology & Stroke Unit',
      experience: '14+ Years',
      rating: 4.93,
      reviews: 980,
      nextSlot: 'Today, 2:15 PM',
      city: 'Bengaluru',
    },
    {
      name: 'Dr. Rajesh Kulkarni',
      qualification: 'MBBS, MS (Ortho), MCh (Joint Surgery)',
      role: 'Lead Robotic Orthopedic Surgeon',
      experience: '16+ Years',
      rating: 4.91,
      reviews: 1150,
      nextSlot: 'Tomorrow, 10:00 AM',
      city: 'Delhi NCR',
    },
    {
      name: 'Dr. Priyadarshini Mehta',
      qualification: 'MBBS, MD (Pediatrics), DCH, Fellowship PICU',
      role: 'Director of Pediatric Intensive Care',
      experience: '12+ Years',
      rating: 4.98,
      reviews: 1840,
      nextSlot: 'Today, 12:45 PM',
      city: 'Pune',
    },
  ];

  const faqs = [
    {
      q: 'How does the MedTrax Live Virtual Queue work?',
      a: 'When you book an in-clinic consultation or walk into our OPD, you receive a dynamic virtual token. Our real-time queue algorithm tracks physician consultation times, notifies you via SMS and dashboard alerts when you are 2 slots away, allowing you to relax comfortably instead of sitting in crowded hospital waiting rooms.',
    },
    {
      q: 'Are MedTrax video teleconsultations and digital prescriptions legally recognized?',
      a: 'Yes. All consultations and prescriptions generated through MedTrax comply with the Medical Council / National Medical Commission Telemedicine Practice Guidelines (TPG). Prescriptions feature verified digital doctor signatures, tamper-evident verification codes, registration numbers, and can be dispensed at any licensed pharmacy.',
    },
    {
      q: 'How does the AI Clinical Symptom Triage agent assist patients?',
      a: 'Our AI agent evaluates your reported symptoms, duration, and vitals against clinical safety heuristics and medical guidelines. It determines whether your case is routine, urgent, or emergency, recommends the precise medical specialty, and checks for potential drug-drug interactions before doctor review.',
    },
    {
      q: 'What should I do if I am experiencing an acute medical emergency?',
      a: 'If you are experiencing severe chest pain, paralysis symptoms, uncontrolled bleeding, or extreme respiratory distress, do not wait for an online appointment. Call our 24/7 Emergency Dispatch Helpline immediately at 1800-MEDTRAX (1800-633-8729) or visit the nearest MedTrax Emergency Trauma Center.',
    },
    {
      q: 'Is my health data and medical consultation encrypted?',
      a: 'Absolutely. MedTrax utilizes AES-256 military-grade encryption in transit and at rest, peer-to-peer WebRTC encryption for live video consults, and complies with HIPAA and ISO 27001 medical data security regulations.',
    },
  ];

  // Queue simulation logic
  const handleStepQueue = () => {
    if (currentToken < yourToken) {
      setCurrentToken((prev) => prev + 1);
    } else {
      setCurrentToken(28);
      setYourToken(31);
    }
  };

  const handleResetQueue = () => {
    setCurrentToken(28);
    setYourToken(31);
  };

  const tokensAhead = Math.max(0, yourToken - currentToken);
  const estimatedWaitMins = tokensAhead * 3;

  return (
    <div className="page-container">
      <ThreeBackground />

      {/* Top Emergency & Accreditation Triage Bar */}
      <div className="hospital-topbar">
        <div className="hospital-topbar-left">
          <span className="emergency-pill">
            <PhoneCall size={12} /> 24/7 Emergency Dispatch: 1800-MED-TRAX (1800-633-8729)
          </span>
          <span className="pulse-badge">
            <span className="pulse-dot" /> 14 Board-Certified Specialists On-Call
          </span>
        </div>
        <div className="hospital-topbar-right">
          <span>NABH Accredited Tertiary Network</span>
          <span>•</span>
          <span>ISO 27001 Certified Infrastructure</span>
        </div>
      </div>

      {/* Glassmorphic Hospital Header / Navbar */}
      <nav className="hospital-navbar">
        <div className="hospital-nav-inner">
          <div className="hospital-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="hospital-logo-icon">
              <HeartPulse size={22} />
            </div>
            <div className="hospital-brand-text">
              <h1>MedTrax</h1>
              <span>Hospital System & Telehealth</span>
            </div>
          </div>

          <ul className="hospital-nav-links">
            <li className="hospital-nav-link" onClick={() => document.getElementById('care-finder')?.scrollIntoView({ behavior: 'smooth' })}>
              Find Care
            </li>
            <li className="hospital-nav-link" onClick={() => document.getElementById('specialties')?.scrollIntoView({ behavior: 'smooth' })}>
              Specialties
            </li>
            <li className="hospital-nav-link" onClick={() => document.getElementById('clinical-showcase')?.scrollIntoView({ behavior: 'smooth' })}>
              Live Queue & Tech
            </li>
            <li className="hospital-nav-link" onClick={() => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })}>
              Physicians
            </li>
            <li className="hospital-nav-link" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}>
              Patient FAQs
            </li>
          </ul>

          <div className="hospital-nav-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>
              Book Appointment <ArrowRight size={14} />
            </button>
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="mobile-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
                  <div className="hospital-brand">
                    <div className="hospital-logo-icon" style={{ width: 32, height: 32 }}>
                      <HeartPulse size={18} />
                    </div>
                    <div className="hospital-brand-text">
                      <h1 style={{ fontSize: '1.1rem' }}>MedTrax</h1>
                      <span style={{ fontSize: '0.62rem' }}>Mobile Care</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="mobile-drawer-nav">
                  <div
                    className="mobile-nav-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      document.getElementById('care-finder')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Stethoscope size={18} color="var(--accent)" /> Find Care & Doctors
                  </div>
                  <div
                    className="mobile-nav-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      document.getElementById('specialties')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <HeartPulse size={18} color="var(--success)" /> Clinical Specialties
                  </div>
                  <div
                    className="mobile-nav-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      document.getElementById('clinical-showcase')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Clock size={18} color="var(--warning)" /> Live Queue & Telehealth
                  </div>
                  <div
                    className="mobile-nav-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Award size={18} color="#818cf8" /> Medical Faculty
                  </div>
                  <div
                    className="mobile-nav-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <FileText size={18} color="var(--info)" /> Patient FAQs
                  </div>
                  <a
                    href="tel:18006338729"
                    className="mobile-nav-item"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
                  >
                    <PhoneCall size={18} color="#f87171" /> 24/7 Emergency Line
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-secondary btn-full" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                  Sign In
                </button>
                <button className="btn btn-primary btn-full" onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}>
                  Book Appointment <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Emergency Helpline Ribbon */}
      <div className="mobile-sticky-emergency">
        <a href="tel:18006338729">
          <PhoneCall size={16} /> 24/7 Trauma: 1800-MED-TRAX
        </a>
        <button
          className="btn btn-sm"
          style={{ background: '#ffffff', color: '#991b1b', fontWeight: 700, padding: '4px 10px', fontSize: '0.78rem' }}
          onClick={() => navigate('/signup')}
        >
          Book Now
        </button>
      </div>

      {/* Hero Section */}
      <section className="hospital-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="hero-badge-wrap">
            <div className="hospital-pill-badge">
              <Sparkles size={14} /> Next-Gen Clinical Care & Telehealth Platform
            </div>
            <div className="hospital-pill-badge" style={{ borderColor: 'rgba(52, 211, 153, 0.3)', color: '#34d399' }}>
              <Star size={13} fill="#34d399" /> 4.95 / 5 Patient Satisfaction (12,000+ Consults)
            </div>
          </div>

          <h1 className="hospital-hero-title">
            Exceptional Medical Care, <br />
            <span className="text-gradient">Instant Telehealth & Zero-Wait Clinics.</span>
          </h1>

          <p className="hospital-hero-sub">
            Seamlessly book appointments with board-certified physicians, monitor real-time virtual queue tokens, access HD encrypted WebRTC teleconsults, and receive verified digital prescriptions instantly.
          </p>

          {/* Consumer-Grade Care Finder Widget */}
          <div className="care-finder-card" id="care-finder">
            <div className="care-finder-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Stethoscope size={18} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Instant Care Finder & Slot Booking</span>
              </div>
              <div className="care-finder-tabs">
                <button
                  type="button"
                  className={`care-tab-btn ${careMode === 'video' ? 'active' : ''}`}
                  onClick={() => setCareMode('video')}
                >
                  <Video size={14} /> Video Teleconsult
                </button>
                <button
                  type="button"
                  className={`care-tab-btn ${careMode === 'inclinic' ? 'active' : ''}`}
                  onClick={() => setCareMode('inclinic')}
                >
                  <Building2 size={14} /> In-Hospital Visit
                </button>
                <button
                  type="button"
                  className={`care-tab-btn ${careMode === 'ai' ? 'active' : ''}`}
                  onClick={() => {
                    setCareMode('ai');
                    document.getElementById('clinical-showcase')?.scrollIntoView({ behavior: 'smooth' });
                    setActiveShowcase('ai');
                  }}
                >
                  <Sparkles size={14} /> AI Symptom Triage
                </button>
              </div>
            </div>

            <form onSubmit={handleSearchAction} className="care-finder-grid">
              <div className="care-finder-field">
                <label>
                  <HeartPulse size={13} /> Clinical Specialty
                </label>
                <select
                  className="care-finder-select"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option value="cardiology">Cardiology & Heart Care</option>
                  <option value="neurology">Neurology & Stroke Unit</option>
                  <option value="pediatrics">Pediatrics & Neonatology</option>
                  <option value="orthopedics">Orthopedics & Joint Care</option>
                  <option value="general">Internal & General Medicine</option>
                  <option value="emergency">Acute Triage & Urgent Care</option>
                </select>
              </div>

              <div className="care-finder-field">
                <label>
                  <MapPin size={13} /> Hospital Center / City
                </label>
                <select
                  className="care-finder-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="Mumbai">Mumbai — Central Hospital</option>
                  <option value="Delhi">Delhi NCR — Medical Center</option>
                  <option value="Bengaluru">Bengaluru — Health Tech Campus</option>
                  <option value="Pune">Pune — Specialty Clinic</option>
                  <option value="Virtual">Virtual Care (Online Anywhere)</option>
                </select>
              </div>

              <div className="care-finder-field">
                <label>
                  <Search size={13} /> Doctor / Symptom
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chest pain, Dr. Sharma, Fever..."
                  className="care-finder-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ height: 46 }}>
                Find Available Care <ArrowRight size={15} />
              </button>
            </form>

            {/* Quick Symptom Suggestion Chips */}
            <div className="symptom-chips-row">
              <span className="symptom-chip-label">Quick Symptoms:</span>
              {symptomQuickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`symptom-chip ${selectedSpecialty === chip.spec && searchQuery === chip.query ? 'active' : ''}`}
                  onClick={() => handleSymptomChipClick(chip)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Metrics Strip */}
          <div className="trust-proof-row">
            <div className="trust-item">
              <CheckCircle2 size={16} color="var(--success)" />
              <span><strong>Zero Wait:</strong> Live OPD Queue Tokens</span>
            </div>
            <div className="trust-item">
              <ShieldCheck size={16} color="var(--accent)" />
              <span><strong>HIPAA & NABH:</strong> Verified Hospital Standards</span>
            </div>
            <div className="trust-item">
              <Lock size={16} color="var(--info)" />
              <span><strong>256-Bit:</strong> End-to-End Encrypted Telehealth</span>
            </div>
            <div className="trust-item">
              <Clock size={16} color="var(--warning)" />
              <span><strong>Sub-15m:</strong> Average Consultation Wait</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Emergency Alert Banner */}
      <div className="emergency-triage-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: 10, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#ffffff', fontWeight: 700 }}>
              Experiencing an Acute Medical Emergency?
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              For sudden severe chest pain, acute stroke signs, breathing failure, or trauma, contact our 24/7 Rapid Ambulance Unit immediately.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => window.open('tel:18006338729')}
          >
            <PhoneCall size={14} /> Call Emergency (1800-MED-TRAX)
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setActiveShowcase('ai');
              document.getElementById('clinical-showcase')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Instant AI Triage
          </button>
        </div>
      </div>

      {/* Interactive Clinical System Showcase */}
      <section className="showcase-section" id="clinical-showcase">
        <div className="section-header-center">
          <div className="section-tag">
            <Activity size={14} /> Interactive Technology Architecture
          </div>
          <h2 className="section-title">Engineered for Frictionless Healthcare</h2>
          <p className="section-subtitle">
            Explore interactive live demonstrations of MedTrax&apos;s real-time queue tokens, clinical AI diagnostics, and cryptographic prescription security.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="showcase-tabs-nav">
          <button
            type="button"
            className={`showcase-tab ${activeShowcase === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveShowcase('queue')}
          >
            <Clock size={16} /> Live OPD Virtual Queue
          </button>
          <button
            type="button"
            className={`showcase-tab ${activeShowcase === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveShowcase('ai')}
          >
            <Sparkles size={16} /> AI Symptom Triage & Safety
          </button>
          <button
            type="button"
            className={`showcase-tab ${activeShowcase === 'rx' ? 'active' : ''}`}
            onClick={() => setActiveShowcase('rx')}
          >
            <FileText size={16} /> Tamper-Evident Digital Rx
          </button>
          <button
            type="button"
            className={`showcase-tab ${activeShowcase === 'telehealth' ? 'active' : ''}`}
            onClick={() => setActiveShowcase('telehealth')}
          >
            <Video size={16} /> Encrypted WebRTC Telehealth
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="showcase-display-box">
          <AnimatePresence mode="wait">
            {activeShowcase === 'queue' && (
              <motion.div
                key="queue"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'center' }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Live Queue Telemetry Simulator
                  </span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 12px 0' }}>
                    Eliminating Crowded Hospital Waiting Rooms
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 20 }}>
                    Experience our dynamic virtual queue. Test the interactive simulation below to see real-time token progression and automated cabin-entry notifications.
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="interactive-action-btn"
                      onClick={handleStepQueue}
                      style={{ background: 'var(--accent-gradient)', color: '#030712', borderColor: 'transparent' }}
                    >
                      <RefreshCw size={14} /> Advance Queue Token ({currentToken} → {currentToken >= yourToken ? 28 : currentToken + 1})
                    </button>
                    <button
                      type="button"
                      className="interactive-action-btn"
                      onClick={handleResetQueue}
                    >
                      Reset Token
                    </button>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Live queue position synced over WebSockets
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Automatic SMS & push alerts at 2 tokens away
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Zero double-booking with doctor calendar locks
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    background: 'rgba(10, 15, 30, 0.9)',
                    padding: 24,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Department: Cardiology OPD</span>
                    <span className="pulse-badge">
                      <span className="pulse-dot" /> Live Telemetry
                    </span>
                  </div>

                  {currentToken >= yourToken ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        padding: '16px',
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid #34d399',
                        borderRadius: 10,
                        textAlign: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
                        🎉 NOW CALLING TOKEN #{yourToken}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#f1f5f9', marginTop: 4 }}>
                        Please proceed to Cabin 4B (Dr. Vikramaditya Sharma).
                      </div>
                    </motion.div>
                  ) : null}

                  <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                    <div style={{ flex: 1, padding: 16, background: 'rgba(56, 189, 248, 0.08)', borderRadius: 10, border: '1px solid rgba(56, 189, 248, 0.2)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CURRENT TOKEN</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8' }}>#{currentToken}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Inside Cabin</div>
                    </div>
                    <div style={{ flex: 1, padding: 16, background: 'rgba(52, 211, 153, 0.08)', borderRadius: 10, border: '1px solid rgba(52, 211, 153, 0.2)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>YOUR TOKEN</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399' }}>#{yourToken}</div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399' }}>{tokensAhead} Patients Ahead</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Physician:</span>
                    <span style={{ fontWeight: 600 }}>Dr. Vikramaditya Sharma</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', marginTop: 8, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Estimated Cabin Entry:</span>
                    <span style={{ fontWeight: 600, color: tokensAhead === 0 ? '#34d399' : 'var(--warning)' }}>
                      {tokensAhead === 0 ? 'Now Serving!' : `~ ${estimatedWaitMins} mins`}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeShowcase === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'center' }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
                    Clinical Safety & Triage Engine
                  </span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 12px 0' }}>
                    Interactive Symptom Case Assessment
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 16 }}>
                    Select different clinical test cases to observe how our AI agent evaluates urgency, assigns medical specialties, and verifies drug-safety contraindications in real time:
                  </p>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {['Chest Discomfort', 'Child High Fever', 'Chronic Headache', 'Ankle Injury'].map((title, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`interactive-action-btn ${triageScenario === i ? 'selected' : ''}`}
                        onClick={() => setTriageScenario(i)}
                        style={triageScenario === i ? { background: '#818cf8', color: '#0a0f1e', borderColor: '#818cf8' } : {}}
                      >
                        {title}
                      </button>
                    ))}
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Pre-consultation SOAP note generation
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Real-time drug interaction matrix verification
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Clinical red-flag detection & immediate referral
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    background: 'rgba(10, 15, 30, 0.9)',
                    padding: 24,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(129, 140, 248, 0.3)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 600 }}>Triage Report #TRG-902{triageScenario + 1}</span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: triageScenarios[triageScenario].urgencyBg,
                        color: triageScenarios[triageScenario].urgencyColor,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {triageScenarios[triageScenario].urgency}
                    </span>
                  </div>
                  <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PATIENT REPORTED SYMPTOMS</div>
                    <div style={{ fontSize: '0.88rem', color: '#fff', marginTop: 4 }}>
                      &ldquo;{triageScenarios[triageScenario].symptoms}&rdquo;
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px', background: 'rgba(56, 189, 248, 0.06)', borderRadius: 8, border: '1px solid rgba(56, 189, 248, 0.15)', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>CLINICAL AI ASSESSMENT</div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      Suggested Specialty: <strong>{triageScenarios[triageScenario].specialty}</strong>
                      <br />
                      Recommended Diagnostic: {triageScenarios[triageScenario].diagnostic}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#34d399' }}>
                      <ShieldCheck size={16} /> {triageScenarios[triageScenario].contraindication}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/signup')}
                    >
                      {triageScenarios[triageScenario].actionPrompt} →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeShowcase === 'rx' && (
              <motion.div
                key="rx"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'center' }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                    Digital Therapeutics
                  </span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 12px 0' }}>
                    Tamper-Evident Digital Prescriptions & PDF Letterhead
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 16 }}>
                    Every prescription issued on MedTrax is cryptographically verifiable, complete with doctor licensing registration, QR verification codes, detailed dosage frequencies, and automated pill reminder schedules.
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <button
                      type="button"
                      className="interactive-action-btn"
                      onClick={() => setRxVerified(!rxVerified)}
                    >
                      <QrCode size={14} /> {rxVerified ? 'Hide Verification Ledger' : 'Simulate Pharmacy QR Verification'}
                    </button>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Instant high-resolution PDF download with official hospital letterhead
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Pharmacy QR verification to prevent counterfeit dispensing
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Integrated lab test orders with home sample pickup options
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    background: 'rgba(10, 15, 30, 0.95)',
                    padding: 24,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(52, 211, 153, 0.25)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>MEDTRAX HOSPITAL & CLINICAL RX</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Reg: MCI/MH/2018/00912</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rx #MTX-2026-8812</div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>VERIFIED DIGITAL SIGNATURE</div>
                    </div>
                  </div>

                  {rxVerified && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ padding: '10px 14px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid #34d399', borderRadius: 8, marginBottom: 14, fontSize: '0.78rem', color: '#34d399' }}
                    >
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Check size={14} /> Cryptographic Proof Validated
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 3 }}>
                        Hash: `sha256-9a4f21b7e...` • Dispensed Status: 1/1 Available • State Pharmacy Council Compliant
                      </div>
                    </motion.div>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                    <strong>Diagnosis:</strong> Essential Hypertension (ICD-10: I10)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>1. Telmisartan 40mg (PO)</span>
                      <span style={{ color: 'var(--accent)' }}>Once Daily (Morning) x 30 Days</span>
                    </div>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>2. Atorvastatin 10mg (PO)</span>
                      <span style={{ color: 'var(--accent)' }}>Once Daily (Bedtime) x 30 Days</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Physician: Dr. Vikramaditya Sharma (MD, DM)</span>
                    <span
                      style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => navigate('/signup')}
                    >
                      Generate Your Rx →
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeShowcase === 'telehealth' && (
              <motion.div
                key="telehealth"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'center' }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                    WebRTC Telehealth Engine
                  </span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 12px 0' }}>
                    Ultra-Low Latency Encrypted Video Consults
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 16 }}>
                    Experience HD teleconsultations without downloading third-party apps. Built on modern WebSockets and WebRTC standards for seamless audio/video clarity and clinical telemetry.
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <button
                      type="button"
                      className="interactive-action-btn"
                      onClick={() => setIsPipFlipped(!isPipFlipped)}
                    >
                      <RefreshCw size={14} /> Toggle Doctor / Patient View
                    </button>
                    <button
                      type="button"
                      className="interactive-action-btn"
                      onClick={() => {
                        setSnapshotFlash(true);
                        setTimeout(() => setSnapshotFlash(false), 500);
                      }}
                    >
                      <Camera size={14} /> Clinical Snapshot
                    </button>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> In-call synchronous prescription writing & note taking
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> End-to-end peer encrypted stream (Zero middleman recording)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Instant fallback to chat messaging in low-bandwidth areas
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    background: 'rgba(10, 15, 30, 0.95)',
                    padding: 24,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: 190, background: snapshotFlash ? '#ffffff' : 'rgba(15, 23, 42, 0.8)', borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: isPipFlipped ? 'linear-gradient(135deg, #10b981, #3b82f6)' : 'linear-gradient(135deg, #0284c7, #38bdf8)', margin: '0 auto 10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#030712', fontWeight: 800, fontSize: '1.4rem' }}>
                        {isPipFlipped ? 'YOU' : 'VS'}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {isPipFlipped ? 'Patient Perspective (Live)' : 'Dr. Vikramaditya Sharma'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {isPipFlipped ? 'Encrypted Video Stream' : 'Chief of Cardiology • 1080p HD'}
                      </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 10, right: 10, width: 70, height: 50, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {isPipFlipped ? 'Dr. Sharma' : 'You (PIP)'}
                    </div>
                    <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span className="pulse-dot" style={{ background: '#f87171', boxShadow: '0 0 8px #f87171' }} /> 14:22 REC
                    </div>

                    {/* In-Call Controls Overlay */}
                    <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setIsMicMuted(!isMicMuted)}
                        style={{ background: isMicMuted ? '#ef4444' : 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: 6, borderRadius: '50%', cursor: 'pointer' }}
                        title={isMicMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCameraOff(!isCameraOff)}
                        style={{ background: isCameraOff ? '#ef4444' : 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: 6, borderRadius: '50%', cursor: 'pointer' }}
                        title={isCameraOff ? 'Start Video' : 'Stop Video'}
                      >
                        {isCameraOff ? <CameraOff size={14} /> : <Camera size={14} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14, textAlign: 'center' }}>
                    <div style={{ padding: '8px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HEART RATE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171' }}>72 bpm</div>
                    </div>
                    <div style={{ padding: '8px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BLOOD PRESSURE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>120/80</div>
                    </div>
                    <div style={{ padding: '8px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SPO2 LEVEL</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>99%</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Centers of Excellence / Specialties */}
      <section className="showcase-section" id="specialties">
        <div className="section-header-center">
          <div className="section-tag">
            <HeartPulse size={14} /> Centers of Excellence
          </div>
          <h2 className="section-title">Specialized Clinical Departments</h2>
          <p className="section-subtitle">
            From preventive lifestyle medicine to complex robotic surgeries, our tertiary care hospital network is equipped with world-class faculty.
          </p>
        </div>

        <div className="specialties-grid">
          {specialtiesList.map((spec) => (
            <div key={spec.id} className="specialty-card">
              <div>
                <div className="specialty-icon-box">{spec.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>{spec.name}</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Lead: {spec.lead}
                </p>
                <div className="specialty-tags">
                  {spec.conditions.map((c, i) => (
                    <span key={i} className="specialty-tag">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>
                  ● {spec.doctorsAvailable} Doctors On Duty
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedSpecialty(spec.id);
                    document.getElementById('care-finder')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Book Slot →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works: The 4-Step Patient Journey */}
      <section className="showcase-section">
        <div className="section-header-center">
          <div className="section-tag">
            <Users size={14} /> Streamlined Flow
          </div>
          <h2 className="section-title">How Your Care Works with MedTrax</h2>
          <p className="section-subtitle">
            A frictionless digital care path designed to respect your time and provide complete clinical continuity.
          </p>
        </div>

        <div className="journey-grid">
          {[
            {
              num: '01',
              title: 'Discover & Triage',
              desc: 'Select your symptoms, hospital department, or preferred doctor. Utilize our AI triage tool for guidance if unsure.',
            },
            {
              num: '02',
              title: 'Reserve Slot or Token',
              desc: 'Choose an exact telehealth time slot or claim an OPD virtual queue token for in-person clinic visits.',
            },
            {
              num: '03',
              title: 'Consult Specialist',
              desc: 'Meet your physician in our clinical cabin or connect via high-definition encrypted WebRTC video.',
            },
            {
              num: '04',
              title: 'Digital Rx & Care Plan',
              desc: 'Access verifiable digital prescriptions, automated dosage reminders, and scheduled follow-ups right on your dashboard.',
            },
          ].map((step, idx) => (
            <div key={idx} className="journey-card">
              <div className="journey-number">{step.num}</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{step.title}</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Accreditations & Compliance Banner */}
      <div className="accreditations-banner">
        <div className="accreditations-inner">
          <div className="accreditation-item">
            <div className="accreditation-icon">
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>NABH Accredited</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>National Hospital Quality Standards</div>
            </div>
          </div>
          <div className="accreditation-item">
            <div className="accreditation-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>HIPAA Compliant</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>256-Bit Encrypted Patient Records</div>
            </div>
          </div>
          <div className="accreditation-item">
            <div className="accreditation-icon">
              <Lock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>ISO 27001 Certified</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Information Security Management</div>
            </div>
          </div>
          <div className="accreditation-item">
            <div className="accreditation-icon">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>TPG 2020 Validated</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Telemedicine Practice Guidelines</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Physicians / Doctors Network */}
      <section className="showcase-section" id="doctors">
        <div className="section-header-center">
          <div className="section-tag">
            <Stethoscope size={14} /> Medical Faculty
          </div>
          <h2 className="section-title">Consult Board-Certified Specialists</h2>
          <p className="section-subtitle">
            Our department heads and consultant physicians bring decades of clinical excellence from leading international and national medical institutions.
          </p>
        </div>

        <div className="doctors-grid">
          {featuredPhysicians.map((doc, idx) => (
            <div key={idx} className="doctor-card">
              <div className="doctor-header">
                <div className="doctor-avatar">
                  {doc.name.split(' ').map((n) => n[0]).slice(1, 3).join('')}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{doc.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: 2 }}>{doc.role}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                {doc.qualification}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.8rem', marginBottom: 14 }}>
                <span>Exp: <strong>{doc.experience}</strong></span>
                <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={13} fill="#fbbf24" /> {doc.rating} ({doc.reviews})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Next Slot: <strong style={{ color: 'var(--success)' }}>{doc.nextSlot}</strong></span>
                <span>{doc.city}</span>
              </div>

              <button
                className="btn btn-primary btn-full btn-sm"
                onClick={() => setSelectedDoctorForModal(doc)}
              >
                Book Consultation <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor Slot Booking Modal */}
      <AnimatePresence>
        {selectedDoctorForModal && (
          <div className="modal-overlay" onClick={() => setSelectedDoctorForModal(null)}>
            <motion.div
              className="modal-content"
              style={{ maxWidth: 480, width: '100%' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Schedule with {selectedDoctorForModal.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{selectedDoctorForModal.role}</div>
                </div>
                <button
                  onClick={() => setSelectedDoctorForModal(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Select Consultation Day
                </label>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  {['Today', 'Tomorrow'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`btn btn-sm ${selectedSlotDate === day ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                      onClick={() => setSelectedSlotDate(day)}
                    >
                      <Calendar size={13} /> {day}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Available Time Slots
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
                  {['10:00 AM', '11:30 AM', '02:15 PM', '03:45 PM', '05:00 PM', '06:30 PM'].map((time) => (
                    <div
                      key={time}
                      className={`slot-pill ${selectedSlotTime === time ? 'selected' : ''}`}
                      onClick={() => setSelectedSlotTime(time)}
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-secondary btn-full"
                  onClick={() => setSelectedDoctorForModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => {
                    setSelectedDoctorForModal(null);
                    navigate(isAuthenticated ? '/patient/appointments' : '/signup');
                  }}
                >
                  Confirm Slot ({selectedSlotTime}) →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Frequently Asked Questions */}
      <section className="showcase-section" id="faq">
        <div className="section-header-center">
          <div className="section-tag">
            <FileText size={14} /> Clarity & Guidelines
          </div>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about booking, telemedicine regulations, virtual queues, and emergency hospital care.
          </p>
        </div>

        <div className="faq-wrap">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="faq-box"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={18} color="var(--accent)" /> : <ChevronDown size={18} />}
              </div>
              {openFaq === idx && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Hospital Footer */}
      <footer className="hospital-footer">
        <div className="hospital-footer-inner">
          <div className="footer-col">
            <div className="hospital-brand" style={{ marginBottom: 16 }}>
              <div className="hospital-logo-icon">
                <HeartPulse size={20} />
              </div>
              <div className="hospital-brand-text">
                <h1>MedTrax</h1>
                <span>Health System & Telehealth</span>
              </div>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 320 }}>
              MedTrax Healthcare Network connects patients, accredited physicians, and clinical laboratories through intelligent scheduling, live queues, and telemetry teleconsultations.
            </p>
            <div style={{ marginTop: 16, fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>
              24/7 Acute Emergency: 1800-MED-TRAX (1800-633-8729)
            </div>
          </div>

          <div className="footer-col">
            <h4>Clinical Centers</h4>
            <ul>
              <li><span>Cardiology & Heart Care</span></li>
              <li><span>Neurology & Stroke Center</span></li>
              <li><span>Pediatrics & Neonatology</span></li>
              <li><span>Orthopedics & Joint Care</span></li>
              <li><span>Emergency Trauma Unit</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Patient Services</h4>
            <ul>
              <li><a onClick={() => navigate('/signup')}>Book Appointment</a></li>
              <li><a onClick={() => navigate('/login')}>Patient Portal Login</a></li>
              <li><a onClick={() => navigate('/signup')}>Doctor Partner Program</a></li>
              <li><a onClick={() => document.getElementById('care-finder')?.scrollIntoView({ behavior: 'smooth' })}>AI Symptom Triage</a></li>
              <li><a onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}>Help & FAQs</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hospital Locations</h4>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><strong>Mumbai:</strong> Bandra Kurla Complex, Hospital Campus 1</li>
              <li><strong>Delhi NCR:</strong> Connaught Health District, Tower B</li>
              <li><strong>Bengaluru:</strong> Whitefield Tech & Medical Park</li>
              <li><strong>Pune:</strong> Shivaji Nagar Specialist Clinic</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} MedTrax Healthcare System. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span>HIPAA Compliant</span>
            <span>NABH Accredited</span>
            <span>Terms of Clinical Service</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
