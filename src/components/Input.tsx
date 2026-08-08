import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      success,
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      className = '',
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value !== undefined && value !== '' && value !== null;

    return (
      <div className={`form-group ${className}`} style={{ marginBottom: 16 }}>
        {label && (
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              {label} {props.required && <span style={{ color: 'var(--danger)' }}>*</span>}
            </span>
            {success && (
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> Verified
              </span>
            )}
          </label>
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s ease',
            boxShadow: focused ? '0 0 0 2px rgba(56, 189, 248, 0.25)' : 'none',
          }}
        >
          {leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: 14,
                color: focused ? 'var(--accent)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                transition: 'color 0.2s',
                zIndex: 2,
              }}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            value={value}
            disabled={disabled}
            className="form-input"
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            style={{
              paddingLeft: leftIcon ? 42 : 14,
              paddingRight: clearable || rightIcon || error ? 40 : 14,
              borderColor: error ? 'var(--danger)' : success ? 'var(--success)' : undefined,
              backgroundColor: disabled ? 'rgba(255, 255, 255, 0.02)' : undefined,
              cursor: disabled ? 'not-allowed' : undefined,
            }}
            {...props}
          />

          <div
            style={{
              position: 'absolute',
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 2,
            }}
          >
            {clearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={onClear}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 2,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Clear"
              >
                <X size={15} />
              </button>
            )}

            {rightIcon && !error && <div style={{ color: 'var(--text-muted)' }}>{rightIcon}</div>}

            {error && (
              <div style={{ color: 'var(--danger)' }}>
                <AlertCircle size={17} />
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{
                color: 'var(--danger)',
                fontSize: '0.8rem',
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {helperText && !error && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
