import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  circle = false,
  style,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width: circle ? height : width,
        height,
        borderRadius: circle ? '50%' : borderRadius,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.8s infinite ease-in-out',
        ...style,
      }}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`glass-card ${className}`} style={{ padding: 20 }}>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
      <Skeleton circle height={44} width={44} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width="40%" height={16} />
        <Skeleton width="25%" height={12} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={`${100 - i * 15}%`} height={12} />
      ))}
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} style={{ padding: '14px 12px' }}>
        <Skeleton width={`${60 + (i % 3) * 15}%`} height={14} />
      </td>
    ))}
  </tr>
);

export default Skeleton;
