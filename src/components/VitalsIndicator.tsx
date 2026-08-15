import React from 'react';
import { Heart, Activity, Thermometer, Droplets, Wind } from 'lucide-react';
import Badge from './Badge';

export type VitalType = 'heart_rate' | 'blood_pressure' | 'spo2' | 'temperature' | 'glucose' | 'respiratory_rate';

export interface VitalsIndicatorProps {
  type: VitalType;
  value: string | number;
  unit: string;
  recordedAt?: string;
  isAbnormal?: boolean;
  targetRange?: string;
}

export const VitalsIndicator: React.FC<VitalsIndicatorProps> = ({
  type,
  value,
  unit,
  recordedAt,
  isAbnormal,
  targetRange,
}) => {
  const getVitalMeta = () => {
    switch (type) {
      case 'heart_rate':
        return {
          title: 'Heart Rate',
          icon: <Heart size={18} className="text-rose-400" />,
          accent: 'rgba(244, 63, 94, 0.1)',
          defaultRange: '60 - 100 bpm',
        };
      case 'blood_pressure':
        return {
          title: 'Blood Pressure',
          icon: <Activity size={18} className="text-cyan-400" />,
          accent: 'rgba(6, 182, 212, 0.1)',
          defaultRange: '90/60 - 120/80 mmHg',
        };
      case 'spo2':
        return {
          title: 'Blood Oxygen (SpO2)',
          icon: <Wind size={18} className="text-emerald-400" />,
          accent: 'rgba(16, 185, 129, 0.1)',
          defaultRange: '95 - 100%',
        };
      case 'temperature':
        return {
          title: 'Body Temp',
          icon: <Thermometer size={18} className="text-amber-400" />,
          accent: 'rgba(245, 158, 11, 0.1)',
          defaultRange: '97.8 - 99.1 °F',
        };
      case 'glucose':
        return {
          title: 'Blood Glucose',
          icon: <Droplets size={18} className="text-violet-400" />,
          accent: 'rgba(139, 92, 246, 0.1)',
          defaultRange: '70 - 140 mg/dL',
        };
      case 'respiratory_rate':
        return {
          title: 'Respiration',
          icon: <Wind size={18} className="text-teal-400" />,
          accent: 'rgba(20, 184, 166, 0.1)',
          defaultRange: '12 - 20 bpm',
        };
    }
  };

  const meta = getVitalMeta();
  const range = targetRange || meta.defaultRange;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: isAbnormal ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: meta.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {meta.icon}
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {meta.title}
            </span>
            {recordedAt && (
              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                {recordedAt}
              </span>
            )}
          </div>
        </div>

        {isAbnormal ? (
          <Badge variant="danger" pulse size="sm">Alert</Badge>
        ) : (
          <Badge variant="success" size="sm">Normal</Badge>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {unit}
        </span>
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Normal range:</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{range}</span>
      </div>
    </div>
  );
};

export default VitalsIndicator;
