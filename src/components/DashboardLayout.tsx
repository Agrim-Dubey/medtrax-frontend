import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDoctor = user?.role === 'doctor';

  // Format breadcrumb title based on path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1] || 'Dashboard';
  const formattedSection = currentSection
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="dashboard-layout">
      {/* Sidebar with mobile drawer support */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main App Container */}
      <div className="dashboard-main-area">
        {/* Sticky Dashboard Topbar */}
        <header className="dashboard-topnav">
          <div className="dashboard-topnav-left">
            {/* Hamburger Button for Mobile / Tablet */}
            <button
              type="button"
              className="dashboard-hamburger-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb Hierarchy */}
            <div className="dashboard-breadcrumbs">
              <span className="breadcrumb-root">
                {isDoctor ? 'Clinical Portal' : 'Patient Care'}
              </span>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span className="breadcrumb-current">{formattedSection}</span>
            </div>
          </div>

          <div className="dashboard-topnav-right">
            {/* Real-time Health Telemetry Status */}
            <div className="clinical-status-pill">
              <span className="status-indicator-dot" />
              <span>Telemetry Connected</span>
            </div>

            {/* Contextual Quick Action */}
            {isDoctor ? (
              <button
                type="button"
                className="btn btn-primary btn-sm dashboard-quick-btn"
                onClick={() => navigate('/doctor/prescriptions')}
              >
                <Plus size={14} /> New Rx
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm dashboard-quick-btn"
                onClick={() => navigate('/patient/appointments')}
              >
                <Plus size={14} /> Book Care
              </button>
            )}

            {/* Notifications Popover - Perfectly aligned at top right */}
            <NotificationDropdown />

            {/* Mini User Profile Chip */}
            <div
              className="dashboard-user-chip"
              onClick={() => navigate(isDoctor ? '/doctor/profile' : '/patient/profile')}
              title="View Profile"
            >
              <div className="chip-avatar">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="chip-details">
                <span className="chip-name">{user?.username || 'User'}</span>
                <span className="chip-role">{isDoctor ? 'MD • Staff' : 'Patient'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
