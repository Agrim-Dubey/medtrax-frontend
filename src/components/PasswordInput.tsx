import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { validation } from '../utils/validation';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showStrength?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = 'Password',
  error,
  showStrength = false,
  value = '',
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const pwdString = String(value || '');
  const strength = validation.evaluatePasswordStrength(pwdString);

  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>
          {label} {props.required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </span>
        {showStrength && pwdString.length > 0 && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strength.color }}>
            {strength.label}
          </span>
        )}
      </label>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            position: 'absolute',
            left: 14,
            color: isFocused ? 'var(--accent)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <Lock size={18} />
        </div>

        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="form-input"
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={{
            paddingLeft: 42,
            paddingRight: 42,
            borderColor: error ? 'var(--danger)' : undefined,
          }}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: 12,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
            zIndex: 2,
          }}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Live Strength Bar */}
      {showStrength && pwdString.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              height: 4,
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
              transition={{ duration: 0.25 }}
              style={{ height: '100%' }}
            />
          </div>

          {/* Requirements Checklist */}
          {(isFocused || pwdString.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                marginTop: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {strength.requirements.map((req) => (
                <div
                  key={req.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.72rem',
                    color: req.met ? 'var(--success)' : 'var(--text-muted)',
                  }}
                >
                  {req.met ? <Check size={12} /> : <X size={12} opacity={0.5} />}
                  <span>{req.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

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
            }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PasswordInput;
