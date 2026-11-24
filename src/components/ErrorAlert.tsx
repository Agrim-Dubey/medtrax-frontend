import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, X, ArrowRight } from 'lucide-react';

export interface ErrorAlertProps {
  title?: string;
  message: string;
  fieldErrors?: Record<string, string>;
  actionLabel?: string;
  onAction?: () => void;
  action?: {
    label: string;
    onClick: () => void | Promise<void>;
  };
  variant?: 'danger' | 'warning' | 'info';
  onDismiss?: () => void;
  onClose?: () => void;
  className?: string;
}

export default function ErrorAlert({
  title,
  message,
  fieldErrors,
  actionLabel,
  onAction,
  action,
  variant = 'danger',
  onDismiss,
  onClose,
  className = '',
}: ErrorAlertProps) {
  const dismissHandler = onDismiss || onClose;
  const effectiveActionLabel = action?.label || actionLabel;
  const effectiveOnAction = action?.onClick || onAction;
  if (!message && (!fieldErrors || Object.keys(fieldErrors).length === 0)) {
    return null;
  }

  const colorStyles = {
    danger: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      text: '#f87171',
      icon: <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0 }} />,
    },
    warning: {
      bg: 'rgba(251, 191, 36, 0.12)',
      border: 'rgba(251, 191, 36, 0.35)',
      text: '#fbbf24',
      icon: <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink: 0 }} />,
    },
    info: {
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.35)',
      text: '#38bdf8',
      icon: <Info size={20} color="#38bdf8" style={{ flexShrink: 0 }} />,
    },
  }[variant];

  const hasSpecificFieldErrors = fieldErrors && Object.keys(fieldErrors).length > 0;

  return (
    <AnimatePresence>
      <motion.div
        className={`error-alert-box ${className}`}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        style={{
          background: colorStyles.bg,
          border: `1px solid ${colorStyles.border}`,
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          marginBottom: 20,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {colorStyles.icon}

          <div style={{ flex: 1 }}>
            {title && (
              <h5
                style={{
                  margin: '0 0 4px 0',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h5>
            )}

            <p
              style={{
                margin: 0,
                fontSize: '0.84rem',
                color: colorStyles.text,
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              {message}
            </p>

            {hasSpecificFieldErrors && (
              <ul
                style={{
                  margin: '8px 0 0 0',
                  paddingLeft: 18,
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                {Object.entries(fieldErrors).map(([field, err]) => (
                  <li key={field}>
                    <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                      {field.replace(/_/g, ' ')}:
                    </strong>{' '}
                    {err}
                  </li>
                ))}
              </ul>
            )}

            {effectiveActionLabel && effectiveOnAction && (
              <button
                type="button"
                onClick={effectiveOnAction}
                className="btn btn-sm"
                style={{
                  marginTop: 10,
                  background: colorStyles.border,
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {effectiveActionLabel} <ArrowRight size={13} />
              </button>
            )}
          </div>

          {dismissHandler && (
            <button
              type="button"
              onClick={dismissHandler}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
