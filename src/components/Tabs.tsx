import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <div
      className={`tabs-container ${className}`}
      style={{
        display: 'inline-flex',
        gap: 6,
        padding: 4,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 20,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              color: isActive ? '#0a0e1a' : 'var(--text-secondary)',
              cursor: 'pointer',
              zIndex: 1,
              transition: 'color 0.2s ease',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'var(--accent)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 2px 10px rgba(56, 189, 248, 0.35)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}

            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>

            {tab.badge !== undefined && tab.badge !== 0 && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 100,
                  backgroundColor: isActive ? 'rgba(10, 14, 26, 0.2)' : 'var(--accent-dim)',
                  color: isActive ? '#0a0e1a' : 'var(--accent)',
                  fontWeight: 700,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
