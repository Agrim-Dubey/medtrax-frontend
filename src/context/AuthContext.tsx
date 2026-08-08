import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../api/auth';

interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'doctor' | 'patient';
  is_profile_complete?: boolean;
  profile_id?: number;
  specialization?: string;
  department?: string;
  is_approved?: boolean;
  gender?: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const verifySession = useCallback(async () => {
    try {
      const stored = localStorage.getItem('medtrax_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      const res = await authAPI.verifyToken();
      if (res.data.success && res.data.user) {
        const userData = res.data.user;
        setUser(userData);
        localStorage.setItem('medtrax_user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('medtrax_user');
      }
    } catch {
      const stored = localStorage.getItem('medtrax_user');
      if (stored) {
        try {
          await authAPI.refreshToken();
          const res = await authAPI.verifyToken();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('medtrax_user', JSON.stringify(res.data.user));
            return;
          }
        } catch {
          // refresh also failed
        }
      }
      setUser(null);
      localStorage.removeItem('medtrax_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();

    // Synchronize authentication across multiple browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'medtrax_user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [verifySession]);

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('medtrax_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // silent fail
    }
    setUser(null);
    localStorage.removeItem('medtrax_user');
    localStorage.removeItem('medtrax_token');
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem('medtrax_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}