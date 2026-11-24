import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Calendar, FileText, Activity } from 'lucide-react';
import Badge from './Badge';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'prescription' | 'vitals' | 'system';
  read: boolean;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Upcoming Appointment',
    message: 'Teleconsultation scheduled in 15 minutes with Dr. Sarah Smith.',
    time: '15m ago',
    type: 'appointment',
    read: false,
  },
  {
    id: '2',
    title: 'Prescription Renewed',
    message: 'Your Metformin Rx #9281 has been countersigned by Dr. Jenkins.',
    time: '2h ago',
    type: 'prescription',
    read: false,
  },
  {
    id: '3',
    title: 'Vitals Alert Logged',
    message: 'Resting pulse 72 bpm recorded within normal parameters.',
    time: '1d ago',
    type: 'vitals',
    read: true,
  },
];

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar size={14} className="text-teal-400" />;
      case 'prescription':
        return <FileText size={14} className="text-blue-400" />;
      case 'vitals':
        return <Activity size={14} className="text-emerald-400" />;
      default:
        return <Bell size={14} className="text-amber-400" />;
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '8px 10px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              background: 'var(--danger, #ef4444)',
              color: '#ffffff',
              borderRadius: 9999,
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 8px rgba(239,68,68,0.5)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 90,
              }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: 360,
                maxWidth: 'calc(100vw - 32px)',
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                zIndex: 1000,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-primary)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Notifications
                  </h4>
                  {unreadCount > 0 && <Badge variant="info" size="sm">{unreadCount} new</Badge>}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Check size={12} /> Mark read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: n.read ? 'transparent' : 'rgba(14, 165, 233, 0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          marginTop: 2,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {getIcon(n.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{n.time}</span>
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div
                  style={{
                    padding: '8px 14px',
                    borderTop: '1px solid var(--border-primary)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'rgba(0,0,0,0.2)',
                  }}
                >
                  <button
                    onClick={clearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} /> Clear all
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
