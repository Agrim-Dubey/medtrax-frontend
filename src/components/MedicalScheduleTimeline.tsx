import React from 'react';
import { Sun, Sunset, Moon, Coffee, AlertCircle, CheckCircle2 } from 'lucide-react';
import Badge from './Badge';

export interface DosageSlot {
  label: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime';
  time: string;
  active: boolean;
  taken?: boolean;
}

export interface MedicationScheduleProps {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  timing?: 'before_food' | 'after_food' | 'with_food' | 'anytime';
  instructions?: string;
  slots?: DosageSlot[];
}

export const MedicalScheduleTimeline: React.FC<MedicationScheduleProps> = ({
  medicationName,
  dosage,
  frequency,
  duration,
  timing = 'after_food',
  instructions,
  slots = [
    { label: 'Morning', time: '08:00 AM', active: true, taken: true },
    { label: 'Afternoon', time: '01:00 PM', active: false },
    { label: 'Evening', time: '07:00 PM', active: true, taken: false },
    { label: 'Bedtime', time: '10:00 PM', active: false },
  ],
}) => {
  const getSlotIcon = (label: DosageSlot['label']) => {
    switch (label) {
      case 'Morning':
        return <Sun size={14} className="text-amber-400" />;
      case 'Afternoon':
        return <Sun size={14} className="text-orange-400" />;
      case 'Evening':
        return <Sunset size={14} className="text-indigo-400" />;
      case 'Bedtime':
        return <Moon size={14} className="text-purple-400" />;
    }
  };

  const getTimingBadge = () => {
    switch (timing) {
      case 'before_food':
        return <Badge variant="warning" size="sm">Take 30m before food</Badge>;
      case 'after_food':
        return <Badge variant="info" size="sm">Take after food</Badge>;
      case 'with_food':
        return <Badge variant="primary" size="sm">Take with food</Badge>;
      default:
        return <Badge variant="default" size="sm">Anytime</Badge>;
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {medicationName}
            </h4>
            <Badge variant="primary" size="sm">{dosage}</Badge>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Frequency: {frequency} {duration ? `• For ${duration}` : ''}
          </p>
        </div>
        {getTimingBadge()}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${slots.length}, 1fr)`,
          gap: '8px',
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        {slots.map((slot, index) => (
          <div
            key={index}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              background: slot.active ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
              border: slot.active ? '1px solid rgba(14, 165, 233, 0.25)' : '1px dashed rgba(255, 255, 255, 0.06)',
              opacity: slot.active ? 1 : 0.4,
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              {getSlotIcon(slot.label)}
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {slot.label}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {slot.time}
            </div>
            {slot.active && (
              <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
                {slot.taken ? (
                  <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle2 size={10} /> Logged
                  </span>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Coffee size={10} /> Scheduled
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {instructions && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <AlertCircle size={12} className="text-amber-400" />
          <span>Note: {instructions}</span>
        </div>
      )}
    </div>
  );
};

export default MedicalScheduleTimeline;
