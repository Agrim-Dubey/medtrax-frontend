import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div
            className="modal-content"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 style={{ fontSize: '1.1rem', color: variant === 'danger' ? 'var(--danger)' : 'var(--text-primary)' }}>
                <AlertTriangle size={20} color={variant === 'danger' ? 'var(--danger)' : 'var(--warning)'} />
                {title}
              </h2>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ paddingTop: 12 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                {message}
              </p>
            </div>

            <div className="modal-footer" style={{ borderTop: 'none' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn btn-${variant === 'danger' ? 'danger' : 'primary'} btn-sm`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
