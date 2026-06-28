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

  return (
    <div className="app-container" style={{ padding: '24px', overflowY: 'auto' }}>
      <button 
        className="btn btn-secondary" 
        style={{ alignSelf: 'flex-start', marginBottom: '24px' }}
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Target size={36} color="#a855f7" /> Real-World Projects
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Build fully polished, real-world-feeling web apps. Write the underlying Python logic to power the applications and watch your code come to life.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {PROJECTS.map(proj => (
            <div 
              key={proj.id}
              className="glass-panel card"
              style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', border: `1px solid ${proj.border}` }}
              onClick={() => navigate(`/projects/${proj.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: proj.bg, padding: '12px', borderRadius: '12px' }}>
                  {proj.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{proj.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{proj.description}</div>
                </div>
              </div>
              <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Topics:</strong> {proj.topics}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
