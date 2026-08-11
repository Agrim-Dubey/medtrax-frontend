import React from 'react';

export type BadgeVariant =
  | 'confirmed'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'doctor'
  | 'patient'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string; dot: string }> = {
  confirmed: { bg: 'rgba(52, 211, 153, 0.12)', color: '#34d399', border: 'rgba(52, 211, 153, 0.25)', dot: '#34d399' },
  completed: { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.25)', dot: '#38bdf8' },
  pending: { bg: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.25)', dot: '#fbbf24' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.25)', dot: '#f87171' },
  doctor: { bg: 'rgba(129, 140, 248, 0.14)', color: '#818cf8', border: 'rgba(129, 140, 248, 0.3)', dot: '#818cf8' },
  patient: { bg: 'rgba(52, 211, 153, 0.14)', color: '#34d399', border: 'rgba(52, 211, 153, 0.3)', dot: '#34d399' },
  success: { bg: 'rgba(52, 211, 153, 0.12)', color: '#34d399', border: 'rgba(52, 211, 153, 0.25)', dot: '#34d399' },
  warning: { bg: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.25)', dot: '#fbbf24' },
  danger: { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.25)', dot: '#f87171' },
  info: { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.25)', dot: '#38bdf8' },
  default: { bg: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: 'rgba(255, 255, 255, 0.15)', dot: '#94a3b8' },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  pulse = false,
  size = 'md',
  style,
  className = '',
  ...props
}) => {
  const normVariant = (variant.toLowerCase() in variantStyles ? variant.toLowerCase() : 'default') as BadgeVariant;
  const config = variantStyles[normVariant];

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '0.7rem' : '0.78rem',
        fontWeight: 600,
        borderRadius: 100,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        textTransform: 'capitalize',
        letterSpacing: '0.02em',
        ...style,
      }}
      {...props}
    >
      {pulse && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: config.dot,
            boxShadow: `0 0 8px ${config.dot}`,
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
