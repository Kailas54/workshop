import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { Users, BookOpen, BarChart2, Settings, ChevronRight, Activity, TrendingUp, Award, GitBranch } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, getDocs } from 'firebase/firestore';
import { logOut } from '../services/auth';

const MOCK_WORKSHOPS = [
  { id: 'ws-1', title: 'Python Bootcamp - Batch 1', mentor: 'Priya Sharma', students: 24, status: 'live' },
  { id: 'ws-2', title: 'Python Bootcamp - Batch 2', mentor: 'Rahul Dev', students: 18, status: 'scheduled' },
  { id: 'ws-3', title: 'Data Structures with Python', mentor: 'Anita Roy', students: 30, status: 'ended' },
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
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentData = [];
      snapshot.forEach((doc) => studentData.push({ id: doc.id, ...doc.data() }));
      setStudents(studentData);
    });
    return () => unsubscribe();
  }, []);

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
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.id} style={{ borderTop: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{s.email}</td>
                <td style={{ padding: '12px 16px' }}>{s.batch || 'Batch 1'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                    background: s.progress === 'completed' ? 'rgba(16,185,129,0.15)' : s.progress === 'in_progress' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: s.progress === 'completed' ? 'var(--status-green)' : s.progress === 'in_progress' ? 'var(--status-yellow)' : 'var(--status-red)',
                  }}>
                    {(s.progress || 'not_started').replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button 
                    onClick={() => updateDoc(doc(db, 'users', s.id), { certificateGranted: !s.certificateGranted })}
                    style={{
                      padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, border: 'none',
                      background: s.certificateGranted ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      color: s.certificateGranted ? 'var(--status-red)' : 'var(--status-green)'
                    }}
                  >
                    {s.certificateGranted ? 'Revoke' : 'Grant'}
                  </button>
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

function FlowLabTab() {
  const NODE_OVERVIEW = [
    { key: 'trigger',      label: 'Trigger',        category: 'Logic',         color: '#6366f1' },
    { key: 'webhook',      label: 'Webhook',        category: 'Logic',         color: '#818cf8' },
    { key: 'if_else',      label: 'If / Else',      category: 'Logic',         color: '#a855f7' },
    { key: 'set_fields',   label: 'Set Fields',     category: 'Logic',         color: '#0ea5e9' },
    { key: 'loop',         label: 'Loop',           category: 'Logic',         color: '#14b8a6' },
    { key: 'code_node',    label: 'Code Node',      category: 'Logic',         color: '#f97316' },
    { key: 'send_email',   label: 'Send Email',     category: 'Communication', color: '#ec4899' },
    { key: 'slack_message',label: 'Slack Message',  category: 'Communication', color: '#4ade80' },
    { key: 'whatsapp_message', label: 'WhatsApp',   category: 'Communication', color: '#22c55e' },
    { key: 'instagram_post', label: 'Instagram',    category: 'Social',        color: '#d946ef' },
    { key: 'google_sheets',label: 'Google Sheets',  category: 'Data',          color: '#34d399' },
    { key: 'hubspot_crm',  label: 'HubSpot CRM',    category: 'Data',          color: '#ff7a59' },
    { key: 'stripe_payment', label: 'Stripe',       category: 'Finance',       color: '#6366f1' },
    { key: 'http_request', label: 'HTTP Request',   category: 'Web / API',     color: '#f59e0b' },
    { key: 'openai_chat',  label: 'OpenAI (AI)',    category: 'AI',            color: '#10b981' },
  ];

  const LEVELS_OVERVIEW = [
    { id: 'level-1', title: 'Level 1: Your First Automation', nodes: 'Trigger → Send Email',                    status: 'active' },
    { id: 'level-2', title: 'Level 2: Data Flows',           nodes: 'Webhook → Set Fields → Send Email',        status: 'active' },
    { id: 'level-3', title: 'Level 3: If/Else Branching',    nodes: 'Trigger → If/Else → Slack/Email',          status: 'active' },
    { id: 'level-4', title: 'Level 4: Loops',                nodes: 'Trigger → Loop → Send Email × N',          status: 'phase-2' },
    { id: 'level-5', title: 'Level 5: Full Pipeline',        nodes: 'Webhook → CRM → Email → Slack',            status: 'phase-2' },
  ];

  const [analytics, setAnalytics] = useState({ totalWorkflows: 0, nodeUsage: {} });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'flowWorkflows'));
        let total = 0;
        const nodeUsage = {};
        snapshot.forEach(docSnap => {
          total++;
          const data = docSnap.data();
          if (data.nodes) {
            data.nodes.forEach(n => {
              const type = n.data?.type;
              if (type) {
                nodeUsage[type] = (nodeUsage[type] || 0) + 1;
              }
            });
          }
        });
        setAnalytics({ totalWorkflows: total, nodeUsage });
      } catch (err) {
        console.error('Failed to fetch flow analytics', err);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <GitBranch size={20} color="#6366f1" /> Flow Lab Management
      </h2>

      {/* Analytics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Saved Workflows</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600 }}>{analytics.totalWorkflows}</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Most Popular Node</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 500, color: '#a855f7' }}>
            {Object.entries(analytics.nodeUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}
          </div>
        </div>
      </div>

      {/* Node Library */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem' }}>MVP Node Library (Phase 1)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Node</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Category</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Phase</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Usage Count</th>
              </tr>
            </thead>
            <tbody>
              {NODE_OVERVIEW.map(n => (
                <tr key={n.key} style={{ borderTop: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: n.color, display: 'inline-block', flexShrink: 0 }} />
                    {n.label}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{n.category}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(16,185,129,0.12)', color: 'var(--status-green)' }}>Phase 1</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                    {analytics.nodeUsage[n.key] || 0} uses
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Level Content */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem' }}>Curriculum Levels</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {LEVELS_OVERVIEW.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '3px' }}>{l.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{l.nodes}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
                background: l.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
                color: l.status === 'active' ? 'var(--status-green)' : 'var(--text-secondary)'
              }}>
                {l.status === 'active' ? 'Active' : 'Phase 2'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'workshops', label: 'Workshops', icon: BookOpen,  component: WorkshopsTab  },
  { id: 'students',  label: 'Students',  icon: Users,     component: StudentsTab   },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, component: AnalyticsTab  },
  { id: 'flowlab',   label: 'Flow Lab',  icon: GitBranch, component: FlowLabTab    },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('workshops');
  const [totalStudents, setTotalStudents] = useState(0);
  const clearUser = useStore(state => state.clearUser);
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || WorkshopsTab;

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTotalStudents(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Activity size={16} style={{ color: 'var(--status-green)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>1 Live Session</span>
          <button className="btn btn-secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={async () => { await logOut(); clearUser(); window.location.href = '/'; }}>Exit</button>
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
            <StatCard icon={Users} label="Registered Students" value={totalStudents} color="var(--status-green)" />
            <StatCard icon={Award} label="Badges Awarded" value="128" color="var(--status-yellow)" />
          </div>
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
