import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  User,
  FileText,
  Users,
  LogOut,
  HeartPulse,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';
import Badge from './Badge';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDoctor = user?.role === 'doctor';
  const prefix = isDoctor ? '/doctor' : '/patient';

  const handleLogout = async () => {
    onCloseMobile?.();
    await logout();
    navigate('/login');
  };

  const doctorLinks = [
    { to: `${prefix}/dashboard`, icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
    { to: `${prefix}/appointments`, icon: <Calendar size={19} />, label: 'Appointments' },
    { to: `${prefix}/ai-agents`, icon: <Sparkles size={19} />, label: 'AI Clinical Suite' },
    { to: `${prefix}/chat`, icon: <MessageSquare size={19} />, label: 'Consultation Chat' },
    { to: `${prefix}/prescriptions`, icon: <FileText size={19} />, label: 'Prescriptions' },
    { to: `${prefix}/community`, icon: <Users size={19} />, label: 'Medical Forum' },
    { to: `${prefix}/profile`, icon: <User size={19} />, label: 'Faculty Profile' },
  ];

  const patientLinks = [
    { to: `${prefix}/dashboard`, icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
    { to: `${prefix}/appointments`, icon: <Calendar size={19} />, label: 'Appointments' },
    { to: `${prefix}/ai-agents`, icon: <Sparkles size={19} />, label: 'AI Health Suite' },
    { to: `${prefix}/chat`, icon: <MessageSquare size={19} />, label: 'Doctor Messages' },
    { to: `${prefix}/prescriptions`, icon: <FileText size={19} />, label: 'My Prescriptions' },
    { to: `${prefix}/community`, icon: <Users size={19} />, label: 'Health Community' },
    { to: `${prefix}/profile`, icon: <User size={19} />, label: 'Patient Profile' },
  ];

  const links = isDoctor ? doctorLinks : patientLinks;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <HeartPulse size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                MedTrax
              </h2>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {isDoctor ? 'Physician Portal' : 'Patient Care Portal'}
              </span>
            </div>
          </div>

          {/* Close button visible only on mobile/tablet */}
          {onCloseMobile && (
            <button
              type="button"
              className="sidebar-mobile-close"
              onClick={onCloseMobile}
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <p className="sidebar-section-title">Navigation</p>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                end={link.to.endsWith('dashboard')}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username || 'User'}
              </p>
              <div style={{ marginTop: 3 }}>
                <Badge variant={isDoctor ? 'doctor' : 'patient'} size="sm">
                  {isDoctor ? 'Doctor' : 'Patient'}
                </Badge>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-full btn-sm"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
