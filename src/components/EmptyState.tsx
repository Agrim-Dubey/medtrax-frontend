import React from 'react';
import { motion } from 'framer-motion';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <motion.div
      className={`empty-state ${className}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-primary)',
        margin: '16px 0',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--accent-dim)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          boxShadow: '0 0 24px rgba(56, 189, 248, 0.15)',
        }}
      >
        {icon}
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
        {title}
      </h3>

      {description && (
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.6, margin: '0 0 20px 0' }}>
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && (
            <button className="btn btn-primary btn-sm" onClick={onAction}>
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && (
            <button className="btn btn-secondary btn-sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
