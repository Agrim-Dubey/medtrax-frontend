import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, User, FileText, Users, LogOut, Heart, MessageSquare } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDoctor = user?.role === 'doctor';
  const prefix = isDoctor ? '/doctor' : '/patient';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const doctorLinks = [
    { to: `${prefix}/dashboard`, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: `${prefix}/appointments`, icon: <Calendar size={20} />, label: 'Appointments' },
    { to: `${prefix}/chat`, icon: <MessageSquare size={20} />, label: 'Messages' },
    { to: `${prefix}/prescriptions`, icon: <FileText size={20} />, label: 'Prescriptions' },
    { to: `${prefix}/community`, icon: <Users size={20} />, label: 'Community' },
    { to: `${prefix}/profile`, icon: <User size={20} />, label: 'Profile' },
  ];

  const patientLinks = [
    { to: `${prefix}/dashboard`, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: `${prefix}/appointments`, icon: <Calendar size={20} />, label: 'Appointments' },
    { to: `${prefix}/chat`, icon: <MessageSquare size={20} />, label: 'Messages' },
    { to: `${prefix}/prescriptions`, icon: <FileText size={20} />, label: 'Prescriptions' },
    { to: `${prefix}/community`, icon: <Users size={20} />, label: 'Community' },
    { to: `${prefix}/profile`, icon: <User size={20} />, label: 'Profile' },
  ];

  const links = isDoctor ? doctorLinks : patientLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Heart size={28} color="var(--accent)" />
        <h2>MedTrax</h2>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <p className="sidebar-section-title">Menu</p>
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end={link.to.endsWith('dashboard')}>
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
          <div className="sidebar-user-info">
            <p>{user?.username || 'User'}</p>
            <p>{isDoctor ? 'Doctor' : 'Patient'}</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-full btn-sm" onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
