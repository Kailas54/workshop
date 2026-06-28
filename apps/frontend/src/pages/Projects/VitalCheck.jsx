import React, { useState, useEffect } from 'react';
import { Activity, Heart, ArrowRight } from 'lucide-react';

export default function VitalCheck({ executeFunction, isExecuting }) {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(25);
  const [activity, setActivity] = useState('Light');
  
  const [result, setResult] = useState(null);
  const [displayBmi, setDisplayBmi] = useState(0);

  const calculateHealth = async () => {
    const res = await executeFunction('assess_health', {
      height_cm: height,
      weight_kg: weight,
      age: age,
      activity_level: activity
    });

    if (res.success && res.data) {
      setResult(res.data);
    }
  };

  // Animate the gauge
  useEffect(() => {
    if (result && result.bmi) {
      setDisplayBmi(0);
      const timer = setTimeout(() => {
        setDisplayBmi(result.bmi);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const getCategoryColor = (category) => {
    if (!category) return '#94a3b8';
    const c = category.toLowerCase();
    if (c.includes('normal')) return '#10b981';
    if (c.includes('under')) return '#f59e0b';
    if (c.includes('over')) return '#f59e0b';
    if (c.includes('obese')) return '#ef4444';
    return '#10b981';
  };

  const getRotation = (bmi) => {
    // Range 10 to 40 roughly maps to -90deg to 90deg
    let val = Math.max(10, Math.min(40, bmi));
    let pct = (val - 10) / 30; // 0 to 1
    return -90 + (pct * 180);
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f0fdfa', color: '#0f172a', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', color: '#0d9488' }}>
          <Heart size={32} fill="#0d9488" />
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>VitalCheck</h1>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Form */}
          <div style={{ flex: 1, minWidth: '300px', background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155' }}>Your Details</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Height (cm): {height}</label>
                <input type="range" min="100" max="250" value={height} onChange={e => setHeight(Number(e.target.value))} style={{ width: '100%', accentColor: '#0d9488' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Weight (kg): {weight}</label>
                <input type="range" min="30" max="150" value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ width: '100%', accentColor: '#0d9488' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Age</label>
                  <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Activity</label>
                  <select value={activity} onChange={e => setActivity(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}>
                    <option value="Sedentary">Sedentary</option>
                    <option value="Light">Light</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>

              <button 
                style={{ width: '100%', padding: '14px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: isExecuting ? 'wait' : 'pointer', marginTop: '8px', opacity: isExecuting ? 0.7 : 1 }}
                onClick={calculateHealth}
                disabled={isExecuting}
              >
                {isExecuting ? 'Analyzing...' : 'Assess Health'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ flex: 1, minWidth: '300px', background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {result ? (
              <div style={{ width: '100%', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                {/* Gauge */}
                <div style={{ position: 'relative', width: '200px', height: '100px', overflow: 'hidden', margin: '0 auto 20px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '200px', height: '200px', border: '20px solid #e2e8f0', borderRadius: '50%', borderBottomColor: 'transparent', borderRightColor: 'transparent', transform: 'rotate(45deg)' }}></div>
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, width: '200px', height: '200px', 
                    border: `20px solid ${getCategoryColor(result.category)}`, borderRadius: '50%', 
                    borderBottomColor: 'transparent', borderRightColor: 'transparent', 
                    transform: `rotate(${getRotation(displayBmi)}deg)`,
                    transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}></div>
                  <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#334155', lineHeight: 1 }}>{displayBmi.toFixed(1)}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>BMI</div>
                  </div>
                </div>

                <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '24px', background: `${getCategoryColor(result.category)}20`, color: getCategoryColor(result.category), fontWeight: 700, fontSize: '1.1rem', marginBottom: '24px' }}>
                  {result.category}
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={16} /> Recommendation
                  </h3>
                  <p style={{ margin: 0, color: '#334155', lineHeight: 1.5, fontSize: '0.95rem' }}>
                    {result.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                <Activity size={48} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                <div>Fill your details and run the assessment.</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
