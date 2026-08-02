import { Heart } from 'lucide-react';

type LoaderVariant = 'spinner' | 'dna' | 'pulse' | 'heartbeat';

export default function Loader({ variant = 'dna', text }: { variant?: LoaderVariant; text?: string }) {
  return (
    <div className="loading-container">
      {variant === 'spinner' && <div className="spinner" />}
      {variant === 'dna' && (
        <div className="dna-loader">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="bar" />)}
        </div>
      )}
      {variant === 'pulse' && <div className="pulse-loader" />}
      {variant === 'heartbeat' && <div className="heartbeat-loader"><Heart size={40} fill="currentColor" /></div>}
      {text && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{text}</p>}
    </div>
  );
}
