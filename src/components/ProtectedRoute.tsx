import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'doctor' | 'patient' }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader variant="heartbeat" text="Verifying session..." />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }

  return <>{children}</>;
}