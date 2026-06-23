import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Users, BookOpen, BarChart2, Settings, ChevronRight, Activity, TrendingUp, Award } from 'lucide-react';

const MOCK_WORKSHOPS = [
  { id: 'ws-1', title: 'Python Bootcamp - Batch 1', mentor: 'Priya Sharma', students: 24, status: 'live' },
  { id: 'ws-2', title: 'Python Bootcamp - Batch 2', mentor: 'Rahul Dev', students: 18, status: 'scheduled' },
  { id: 'ws-3', title: 'Data Structures with Python', mentor: 'Anita Roy', students: 30, status: 'ended' },
];

const MOCK_STUDENTS = [
  { id: 's-1', name: 'Aman Kumar', email: 'aman@example.com', batch: 'Batch 1', progress: 'completed' },
  { id: 's-2', name: 'Sonal Mehta', email: 'sonal@example.com', batch: 'Batch 1', progress: 'in_progress' },
  { id: 's-3', name: 'Dev Patel', email: 'dev@example.com', batch: 'Batch 2', progress: 'not_started' },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-panel card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ padding: '12px', borderRadius: '10px', background: `${color}22` }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</div>
      </div>
    </div>
  );
}

function WorkshopsTab() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>All Workshops</h2>
        <button className="btn btn-primary">+ Create Workshop</button>
      </div>
      <div className="grid-container">
        {MOCK_WORKSHOPS.map(ws => (
          <div key={ws.id} className="glass-panel card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{ws.title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mentor: {ws.mentor} · {ws.students} students</div>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600,
              background: ws.status === 'live' ? 'rgba(16,185,129,0.15)' : ws.status === 'scheduled' ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.15)',
              color: ws.status === 'live' ? 'var(--status-green)' : ws.status === 'scheduled' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}>
              {ws.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentsTab() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Student Management</h2>
        <button className="btn btn-secondary">Import CSV</button>
      </div>
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Email</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Batch</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_STUDENTS.map((s, idx) => (
              <tr key={s.id} style={{ borderTop: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{s.email}</td>
                <td style={{ padding: '12px 16px' }}>{s.batch}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                    background: s.progress === 'completed' ? 'rgba(16,185,129,0.15)' : s.progress === 'in_progress' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: s.progress === 'completed' ? 'var(--status-green)' : s.progress === 'in_progress' ? 'var(--status-yellow)' : 'var(--status-red)',
                  }}>
                    {s.progress.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Cohort Analytics</h2>
      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '24px' }}>
        <StatCard icon={TrendingUp} label="Avg. Completion Rate" value="72%" color="var(--status-green)" />
        <StatCard icon={Award} label="Certificates Issued" value="41" color="#a78bfa" />
      </div>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Most Common Error Types</h3>
        {[
          { type: 'SyntaxError', pct: 68, color: 'var(--status-red)' },
          { type: 'NameError', pct: 45, color: 'var(--status-yellow)' },
          { type: 'IndentationError', pct: 38, color: '#a78bfa' },
          { type: 'TypeError', pct: 22, color: 'var(--accent-primary)' },
        ].map(e => (
          <div key={e.type} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
              <span>{e.type}</span><span style={{ color: 'var(--text-secondary)' }}>{e.pct}% of students</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '6px' }}>
              <div style={{ width: `${e.pct}%`, background: e.color, height: '100%', borderRadius: '4px', transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS = [
  { id: 'workshops', label: 'Workshops', icon: BookOpen, component: WorkshopsTab },
  { id: 'students', label: 'Students', icon: Users, component: StudentsTab },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, component: AnalyticsTab },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('workshops');
  const clearUser = useStore(state => state.clearUser);
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || WorkshopsTab;

  return (
    <div className="app-container">
      <header className="header">
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Activity size={16} style={{ color: 'var(--status-green)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>1 Live Session</span>
          <button className="btn btn-secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={() => { clearUser(); window.location.href = '/'; }}>Exit</button>
        </div>
      </header>

      <main className="main-content">
        {/* Sidebar Nav */}
        <aside className="glass-panel" style={{ width: '200px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px',
                background: activeTab === tab.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, textAlign: 'left',
                transition: 'all 0.2s ease',
              }}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {/* Summary Stats */}
          <div className="grid-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
            <StatCard icon={BookOpen} label="Total Workshops" value={MOCK_WORKSHOPS.length} color="var(--accent-primary)" />
            <StatCard icon={Users} label="Registered Students" value="72" color="var(--status-green)" />
            <StatCard icon={Award} label="Badges Awarded" value="128" color="var(--status-yellow)" />
          </div>
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
