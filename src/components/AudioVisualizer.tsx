import React from 'react';
import { motion } from 'framer-motion';

export interface AudioVisualizerProps {
  isActive: boolean;
  barCount?: number;
  color?: string;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  barCount = 5,
  color = 'var(--accent, #0ea5e9)',
  className = '',
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        height: 20,
        padding: '0 4px',
      }}
      aria-label={isActive ? 'Microphone transmitting' : 'Microphone silent'}
    >
      {bars.map((bar) => {
        // Vary durations for realistic sound wave effect
        const duration = 0.4 + (bar % 3) * 0.2;
        const delay = (bar * 0.1) % 0.3;

        return (
          <motion.div
            key={bar}
            animate={
              isActive
                ? {
                    height: ['4px', `${12 + (bar % 3) * 6}px`, '4px'],
                  }
                : {
                    height: '4px',
                  }
            }
            transition={
              isActive
                ? {
                    duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay,
                  }
                : {
                    duration: 0.2,
                  }
            }
            style={{
              width: 3,
              borderRadius: 2,
              backgroundColor: isActive ? color : 'rgba(255, 255, 255, 0.2)',
              minHeight: 4,
            }}
          />
        );
      })}
    </div>
  );
};

export default AudioVisualizer;
