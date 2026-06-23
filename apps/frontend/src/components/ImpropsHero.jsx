import React, { useState } from 'react';
import { ArrowRight, Code, Terminal, CheckCircle2, Cpu } from 'lucide-react';
import { useStore } from '../services/store';

export default function ImpropsHero() {
  const setUser = useStore(state => state.setUser);
  const [showRoles, setShowRoles] = useState(false);

  const handleLogin = (role) => {
    setUser({ id: Math.random().toString(36).substr(2, 9), name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`, role });
  };

  const roles = [
    { role: 'student', label: '👩‍💻 Join as Student', cls: 'btn-primary', desc: 'Follow along, attempt challenges, earn badges' },
    { role: 'mentor', label: '🎓 Login as Mentor', cls: 'btn-secondary', desc: 'Broadcast code, push checkpoints, monitor class' },
    { role: 'admin', label: '⚙️ Login as Admin', cls: 'btn-secondary', desc: 'Manage workshops, view analytics' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
      {/* Background Dot Grid & Glows */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}></div>
      
      {/* Large Purple Glows */}
      <div style={{
        position: 'absolute', top: '10%', left: '10%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
        filter: 'blur(80px)', zIndex: 0, borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'absolute', bottom: '-10%', right: '5%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
        filter: 'blur(100px)', zIndex: 0, borderRadius: '50%'
      }}></div>

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 48px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 700 }}>
            <Cpu size={24} color="#a855f7" /> Improps
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', color: '#9ca3af', textTransform: 'uppercase' }}>
            <span style={{color: '#fff', cursor: 'pointer'}}>Courses</span>
            <span style={{cursor: 'pointer'}}>Placements</span>
            <span style={{cursor: 'pointer'}}>Mentors</span>
            <span style={{cursor: 'pointer'}}>About</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ 
            background: 'linear-gradient(135deg, #a855f7, #c084fc)', color: '#fff', 
            border: 'none', padding: '8px 16px', borderRadius: '16px', fontSize: '0.75rem', 
            fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 15px rgba(168,85,247,0.4)'
          }} onClick={() => setShowRoles(true)}>
            JOIN IMPROPS
          </button>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
            COMMUNITY <span style={{background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem'}}>SOON</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, marginLeft: '16px' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> 41.8K
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '80px 48px', maxWidth: '1400px', margin: '0 auto', gap: '64px' }}>
        
        {/* Left Content */}
        <div style={{ flex: 1, maxWidth: '600px' }}>
          {/* Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', padding: '4px 16px', gap: '12px', marginBottom: '32px' }}>
            <span style={{ background: '#a855f7', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>New Course</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: '#e5e7eb' }}>
              PYTHON MASTERY <ArrowRight size={14} />
            </span>
          </div>

          <h1 style={{ fontSize: '4.5rem', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px' }}>
            Improps Training Institute for creative developers
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#9ca3af', lineHeight: 1.6, marginBottom: '40px', maxWidth: '480px' }}>
            High-end training & development programs that drop you straight into top tech companies and instantly make your resume stand out.
          </p>
          
          <button style={{ 
            background: '#a855f7', color: '#fff', border: 'none', padding: '16px 32px', 
            borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s', boxShadow: '0 0 20px rgba(168,85,247,0.3)'
          }} onClick={() => setShowRoles(!showRoles)}>
            Explore Programs
          </button>

          {showRoles && (
            <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: '#fff' }}>Demo Mode — select a role to enter</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {roles.map(({ role, label, cls, desc }) => (
                  <button key={role} onClick={() => handleLogin(role)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px 16px',
                    background: role === 'student' ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${role === 'student' ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px', cursor: 'pointer', color: '#fff', textAlign: 'left', width: '100%'
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>{label}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Floating Code Window */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            background: 'rgba(15, 15, 17, 0.7)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}>
            {/* Window Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3f3f46' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3f3f46' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3f3f46' }}></div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                ImpropsMastery <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
            
            {/* Code Content */}
            <div style={{ padding: '24px', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.7, color: '#e5e7eb' }}>
              <div style={{ color: '#c084fc' }}><span style={{color: '#a855f7'}}>import</span> {'{'} ImpropsMastery {'}'} <span style={{color: '#a855f7'}}>from</span> <span style={{color: '#9ca3af'}}>'@components/Improps'</span>;</div>
              <br/>
              <div><span style={{color: '#a855f7'}}>function</span> <span style={{color: '#60a5fa'}}>Student</span>() {'{'}</div>
              <div style={{ paddingLeft: '24px' }}><span style={{color: '#a855f7'}}>return</span> (</div>
              <div style={{ paddingLeft: '48px' }}>{'<'}<span style={{color: '#c084fc'}}>ImpropsMastery</span></div>
              <div style={{ paddingLeft: '72px' }}><span style={{color: '#9ca3af'}}>course</span>=<span style={{color: '#e5e7eb'}}>{"{"}</span><span style={{color: '#a855f7'}}>Python Full-Stack</span><span style={{color: '#e5e7eb'}}>{"}"}</span></div>
              <div style={{ paddingLeft: '72px' }}><span style={{color: '#9ca3af'}}>duration</span>=<span style={{color: '#e5e7eb'}}>{"{"}</span><span style={{color: '#60a5fa'}}>6 Months</span><span style={{color: '#e5e7eb'}}>{"}"}</span></div>
              <div style={{ paddingLeft: '72px' }}><span style={{color: '#9ca3af'}}>mentorship</span>=<span style={{color: '#e5e7eb'}}>{"{"}</span><span style={{color: '#34d399'}}>true</span><span style={{color: '#e5e7eb'}}>{"}"}</span></div>
              <div style={{ paddingLeft: '72px' }}><span style={{color: '#9ca3af'}}>placements</span>=<span style={{color: '#e5e7eb'}}>{"{"}</span><span style={{color: '#60a5fa'}}>100% Assured</span><span style={{color: '#e5e7eb'}}>{"}"}</span></div>
              <div style={{ paddingLeft: '72px' }}><span style={{color: '#9ca3af'}}>intensity</span>=<span style={{color: '#e5e7eb'}}>{"{"}</span><span style={{color: '#fbbf24'}}>1.0</span><span style={{color: '#e5e7eb'}}>{"}"}</span></div>
              <div style={{ paddingLeft: '48px' }}>{'/>'}</div>
              <div style={{ paddingLeft: '24px' }}>)</div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
