import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowLeft, Target, HeartPulse, CreditCard, CheckSquare, Building2 } from 'lucide-react';

const PROJECTS = [
  {
    id: 'quickbill',
    title: 'QuickBill',
    description: 'Café Billing System',
    topics: 'Variables, Arithmetic, If/Else',
    icon: <Terminal size={24} color="#f97316" />,
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.2)'
  },
  {
    id: 'vitalcheck',
    title: 'VitalCheck',
    description: 'BMI & Health Risk Tool',
    topics: 'Type Conversion, Logical Operators',
    icon: <HeartPulse size={24} color="#14b8a6" />,
    bg: 'rgba(20,184,166,0.1)',
    border: 'rgba(20,184,166,0.2)'
  },
  {
    id: 'loanwise',
    title: 'LoanWise',
    description: 'Loan EMI Calculator',
    topics: 'Financial Formula, Advanced If/Else',
    icon: <CreditCard size={24} color="#3b82f6" />,
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.2)'
  },
  {
    id: 'quizflow',
    title: 'QuizFlow',
    description: 'Quiz Auto-Grading Portal',
    topics: 'Loops, Comparison Operators',
    icon: <CheckSquare size={24} color="#8b5cf6" />,
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.2)'
  },
  {
    id: 'simbank',
    title: 'SimBank',
    description: 'ATM Simulator',
    topics: 'Nested Logic, Running State',
    icon: <Building2 size={24} color="#f43f5e" />,
    bg: 'rgba(244,63,94,0.1)',
    border: 'rgba(244,63,94,0.2)'
  }
];

export default function ProjectsDashboard() {
  const navigate = useNavigate();

  // Pseudo-random data for the chart bars based on project id
  const getBars = (id) => {
    let seed = id.charCodeAt(0) + id.charCodeAt(id.length-1);
    const bars = [];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    for(let i=0; i<7; i++) {
      const heightPct = 30 + ((seed * (i+1) * 17) % 60); // random 30% to 90%
      bars.push({ label: days[i], height: heightPct });
    }
    return bars;
  };

  return (
    <div className="app-container" style={{ 
      padding: '32px', maxWidth: '100%', margin: 0, gap: '32px', overflowY: 'auto',
      background: '#1a0b2e', fontFamily: "'Quicksand', sans-serif", color: '#e2e8f0', minHeight: '100vh'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        
        .project-card {
          position: relative;
          width: 260px;
          height: 350px;
          flex-shrink: 0;
          border-radius: 28px;
          background: linear-gradient(160deg, #26163b, #150926);
          box-shadow: 
            0 20px 40px rgba(0,0,0,0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.06),
            inset 0 -20px 40px rgba(0,0,0,0.6);
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 24px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
          overflow: hidden;
          text-align: left;
        }

        .project-card:hover {
          transform: translateY(-8px);
          box-shadow: 
            0 30px 50px rgba(0,0,0,0.5),
            inset 0 3px 6px rgba(255, 255, 255, 0.08),
            inset 0 -20px 40px rgba(0,0,0,0.7);
        }

        .chart-bar-bg {
          width: 6px;
          height: 80px;
          background: rgba(255,255,255,0.03);
          border-radius: 3px;
          position: relative;
          display: flex;
          align-items: flex-end;
        }

        .chart-bar-fill {
          width: 100%;
          border-radius: 3px;
          position: relative;
        }

        .chart-bar-dot {
          width: 4px;
          height: 4px;
          background: rgba(255,255,255,0.8);
          border-radius: 50%;
          position: absolute;
          top: 1px;
          left: 1px;
        }

        .card-arrow {
          color: rgba(255,255,255,0.4);
          transition: transform 0.2s, color 0.2s;
        }

        .project-card:hover .card-arrow {
          transform: translateX(4px);
          color: #fff;
        }
      `}</style>

      <button 
        className="btn btn-secondary" 
        style={{ alignSelf: 'flex-start', marginBottom: '8px', background: '#252530', border: '1px solid rgba(255,255,255,0.05)', color: '#a0a0ab', borderRadius: '12px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
        onClick={() => navigate('/dashboard')}
        onMouseOver={e => e.currentTarget.style.background = '#2d2d3a'}
        onMouseOut={e => e.currentTarget.style.background = '#252530'}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#fff', fontWeight: 700 }}>
            <Target size={36} color="#a855f7" /> Real-World Projects
          </h1>
          <p style={{ color: '#a0a0ab', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
            Build fully polished, real-world-feeling web apps. Write the underlying Python logic to power the applications and watch your code come to life.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
          {PROJECTS.map(proj => {
            // Extract the core color from the icon for the chart
            const colorMatch = proj.icon.props.color;
            const themeColor = colorMatch || '#a855f7';
            const bars = getBars(proj.id);
            
            return (
              <div 
                key={proj.id}
                className="project-card"
                onClick={() => navigate(`/projects/${proj.id}`)}
              >
                <div style={{ marginBottom: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                      {proj.title}
                    </h3>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: themeColor, fontWeight: 700, border: '1px solid rgba(255,255,255,0.05)' }}>
                      {proj.icon.type.name} <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: themeColor, boxShadow: `0 0 6px ${themeColor}` }}></div>
                    </div>
                  </div>
                  <div style={{ color: '#a0a0ab', fontSize: '0.8rem', marginTop: '8px', fontWeight: 500 }}>
                    {proj.description}
                  </div>
                </div>

                {/* Abstract Bar Chart */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '80px', margin: '20px 8px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {bars.map((bar, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div className="chart-bar-bg">
                        <div className="chart-bar-fill" style={{ height: `${bar.height}%`, background: themeColor, boxShadow: `0 0 10px ${themeColor}80` }}>
                          <div className="chart-bar-dot"></div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.5rem', color: bar.height > 60 ? themeColor : '#a0a0ab', fontWeight: 700 }}>{bar.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Start Project</div>
                    <div style={{ fontSize: '0.55rem', color: '#a0a0ab', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {proj.topics}
                    </div>
                  </div>
                  <div className="card-arrow" style={{ fontSize: '1.25rem', fontWeight: 300, marginBottom: '2px' }}>
                    →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
