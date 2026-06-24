import React from 'react';

export function StatBar({ label, value, type }) {
  const fillClass = `fill-${type}`; // hunger, energy, happiness
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600, color: '#4a4a68', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <span>{label}</span>
        <span>{Math.round(value)}/100</span>
      </div>
      <div className="clay-progress-track">
        <div 
          className={`clay-progress-fill ${fillClass}`} 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        ></div>
      </div>
    </div>
  );
}
