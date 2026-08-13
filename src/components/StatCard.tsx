import React from 'react';
import { motion } from 'framer-motion';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color = 'var(--accent)',
  trend,
  subtitle,
  onClick,
}) => {
  return (
    <motion.div
      className="stat-card"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <div
          className="stat-icon"
          style={{
            background: `${color}18`,
            color: color,
            boxShadow: `0 0 16px ${color}20`,
          }}
        >
          {icon}
        </div>

        {trend && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 100,
              backgroundColor: trend.positive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: trend.positive ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {trend.value}
          </span>
        )}
      </div>

      <div className="stat-value" style={{ color: color, fontSize: '1.9rem', fontWeight: 800 }}>
        {value}
      </div>

      <div className="stat-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {label}
      </div>

      {subtitle && (
        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}

      {/* Subtle corner ambient light */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: color,
          opacity: 0.05,
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }}
      />
    </motion.div>
  );
};

export default StatCard;
