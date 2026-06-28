import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { useStore } from '../services/store';
import { CodeEditor } from '../components/Editor/CodeEditor';
import { CheckCircle2, Circle, Users, HelpCircle, Activity, GitBranch } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { logOut } from '../services/auth';

const QUESTIONS = [
  {
    title: "Divisible by 9",
    instructions: "Write a program to display “Hello” if the number entered is divisible by 9 else print “Bye”.",
    starter_code: "# Write your code below\n"
  },
  {
    title: "Last Digit Divisible by 3",
    instructions: "Write a program to check whether the last digit of a given number is divisible by 3.",
    starter_code: "# Write your code below\n"
  },
  {
    title: "Grade Calculator",
    instructions: "Write a program to accept the total marks (out of 500) of a student. Then calculate the percentage of marks. Calculate the grade based on the following criteria:\nMarks\t\t         Grade\n> 80\t\t           A\n> 70 and ≤ 80\t           B\n> 60 and ≤ 70\t           C\n> 40 and ≤ 60              D\nBelow 50\t           F",
    starter_code: "# Write your code below\n"
  },
  {
    title: "Leap Year",
    instructions: "Write a program to check whether given year is leap year or not.",
    starter_code: "# Write your code below\n"
  },
  {
    title: "Day of Week",
    instructions: "Write a program to accept a number from 1 to 7 and display the name of the day like 1 for Sunday, 2 for Monday and so on.",
    starter_code: "# Write your code below\n"
  },
  {
    title: "Simple Calculator",
    instructions: "Create a simple calculator. Perform the calculations by entering the operands and operator.",
    starter_code: "# Write your code below\n"
  },
  {
    title: "Lowest Number",
    instructions: "Write a program to find the lowest number out of two numbers.",
    starter_code: "# Write your code below\n"
  },
  {
    title: "Wages Calculator",
    instructions: "Accept the age, sex (M/F), number of days, and display the wages accordingly:\nAge\t   \t\tSex\t\t\tWage/Day\n>= 18 and <= 30\t\tM\t\t\t700\n>= 18 and <= 30\t\tF\t\t\t750\n> 30 and <= 40\t\tM\t                800\n> 30 and <= 40\t\tF\t                850\n\nIf age does not fall in any range, then display the following message:\n\"Enter appropriate age\"",
    starter_code: "# Write your code below\n"
  },
  {
    title: "Library Charges",
    instructions: "Accept the number of days from the user and calculate library charges:\nDays\tCharges\nTill five days\tRs 2/day\nSix to ten days\tRs 3/day\n11 to 15 days\tRs 4/day\nAfter 15 days\tRs 5/day",
    starter_code: "# Write your code below\n"
  },
  {
    title: "Perfect Square",
    instructions: "Check a given number is a perfect square.\n(16, 25, 36… are perfect squares 4*4 =16, 5*5 =25, 6*6 =36)\nIf it is a perfect square then check the number is odd or even.\nIf it is odd you need to print \"it is perfect square and odd\"\nOtherwise need to print \"perfect square and even\"\nIf the number is not a perfect square then also you need to check it is odd and even and display corresponding outputs.\ninput: 16\noutput: It is perfect square and odd\ninput: 10\noutput: It is not perfect square and even",
    starter_code: "# Write your code below\n"
  }
];

export default function MentorDashboard() {
  const user = useStore(state => state.user);
  const clearUser = useStore(state => state.clearUser);
  const [session] = useState({ id: 'demo-session-123' });
  const [students, setStudents] = useState({});
  const [raisedHands, setRaisedHands] = useState([]);
  const [broadcastCode, setBroadcastCode] = useState('# Mentor Broadcast\nprint("Hello, Class!")');
  const [connected, setConnected] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [gamesEnabled, setGamesEnabled] = useState(false);
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [dbStudents, setDbStudents] = useState({});
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'flowlab'
  const [flowStudentStatuses, setFlowStudentStatuses] = useState({}); // { userId: { name, levelId, status } }
  const [selectedFlowLevel, setSelectedFlowLevel] = useState('level-1');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbData = {};
      snapshot.forEach((doc) => {
        dbData[doc.id] = doc.data();
      });
      setDbStudents(dbData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Connect first, then join the session room only after the connection is confirmed.
    // Emitting before 'connect' fires means the server never receives the event.
    const onConnect = () => {
      setConnected(true);
      socket.emit('joinSession', { sessionId: session.id, role: 'mentor', userId: user.id, name: user.name });
    };

    const onStudentJoined = ({ userId, name }) => {
      setStudents(prev => ({ ...prev, [userId]: { name, status: 'not_started' } }));
    };

    const onStatusUpdate = ({ userId, status, error }) => {
      setStudents(prev => ({
        ...prev,
        [userId]: { ...prev[userId], status, lastError: error }
      }));
    };

    const onFocusUpdate = ({ userId, eventType }) => {
      setStudents(prev => {
        const student = prev[userId];
        if (!student) return prev;
        
        let nextFocusCounts = student.focusCounts || { blur: 0, idle: 0 };
        let currentFocusState = student.focusState || 'active'; // 'active', 'idle', 'blur'

        if (eventType === 'blur') {
          if (currentFocusState !== 'blur') {
            nextFocusCounts = { ...nextFocusCounts, blur: nextFocusCounts.blur + 1 };
          }
          currentFocusState = 'blur';
        } else if (eventType === 'focus') {
          currentFocusState = 'active';
        } else if (eventType === 'idle') {
          if (currentFocusState !== 'idle') {
            nextFocusCounts = { ...nextFocusCounts, idle: nextFocusCounts.idle + 1 };
          }
          currentFocusState = 'idle';
        } else if (eventType === 'active') {
          currentFocusState = 'active';
        }

        return {
          ...prev,
          [userId]: { ...student, focusCounts: nextFocusCounts, focusState: currentFocusState }
        };
      });
    };

    const onRaiseHand = (data) => {
      setRaisedHands(prev => [...prev, { ...data, message: 'Default feedback message' }]);
    };

    const onStudentLeft = ({ userId }) => {
      setStudents(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    const onToggleGames = ({ gamesEnabled }) => {
      setGamesEnabled(gamesEnabled);
    };

    const onToggleAssessment = ({ assessmentMode }) => {
      setAssessmentMode(assessmentMode);
    };

    const onFlowStatus = ({ userId, name, levelId, status }) => {
      setFlowStudentStatuses(prev => ({ ...prev, [userId]: { name, levelId, status } }));
    };

    socket.on('connect', onConnect);
    socket.on('studentJoined', onStudentJoined);
    socket.on('student:statusUpdate', onStatusUpdate);
    socket.on('student:focusUpdate', onFocusUpdate);
    socket.on('student:raiseHand', onRaiseHand);
    socket.on('studentLeft', onStudentLeft);
    socket.on('mentor:toggleGames', onToggleGames);
    socket.on('mentor:toggleAssessment', onToggleAssessment);
    socket.on('student:flowStatus', onFlowStatus);

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('studentJoined', onStudentJoined);
      socket.off('student:statusUpdate', onStatusUpdate);
      socket.off('student:focusUpdate', onFocusUpdate);
      socket.off('student:raiseHand', onRaiseHand);
      socket.off('studentLeft', onStudentLeft);
      socket.off('mentor:toggleGames', onToggleGames);
      socket.off('mentor:toggleAssessment', onToggleAssessment);
      socket.off('student:flowStatus', onFlowStatus);
      setConnected(false);
      socket.disconnect();
    };
  }, [session.id, user.id, user.name]);

  const handleBroadcastChange = (code) => {
    setBroadcastCode(code);
    socket.emit('mentor:broadcast', { code });
  };

  const pushCheckpoint = () => {
    const q = QUESTIONS[selectedQuestionIndex];
    socket.emit('mentor:pushCheckpoint', {
      id: `cp-${Date.now()}`,
      title: q.title,
      instructions: q.instructions,
      starter_code: q.starter_code
    });
    // Reset all student statuses for this new checkpoint
    setStudents(prev => {
      const next = {};
      Object.keys(prev).forEach(k => {
        next[k] = { ...prev[k], status: 'not_started', lastError: null };
      });
      return next;
    });
  };

  const resolveHand = (index) => {
    const hand = raisedHands[index];
    socket.emit('mentor:resolveHand', { userId: hand.userId });
    setRaisedHands(prev => prev.filter((_, i) => i !== index));
  };

  const replyHand = (index) => {
    const hand = raisedHands[index];
    if (!hand.message || hand.message.trim() === '') {
      alert("Please type a feedback message before sending the reply!");
      return;
    }
    console.log('Sending mentor:replyHand:', JSON.stringify({ userId: hand.userId, code: hand.code, message: hand.message }));
    socket.emit('mentor:replyHand', { userId: hand.userId, code: hand.code, message: hand.message });
    setRaisedHands(prev => prev.filter((_, i) => i !== index));
  };

  const handleHandCodeChange = (index, newCode) => {
    setRaisedHands(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], code: newCode };
      return copy;
    });
  };

  const handleHandMessageChange = (index, newMessage) => {
    setRaisedHands(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], message: newMessage };
      return copy;
    });
  };

  const FLOW_LEVELS = [
    { id: 'level-1', title: 'Level 1: Your First Automation', description: 'Trigger → Send Email' },
    { id: 'level-2', title: 'Level 2: Data Flows',           description: 'Webhook → Set Fields → Send Email' },
    { id: 'level-3', title: 'Level 3: If/Else Branching',    description: 'Trigger → If/Else → Slack/Email' },
  ];

  const pushFlowWorkflow = () => {
    const levelDef = FLOW_LEVELS.find(l => l.id === selectedFlowLevel);
    // Push a minimal starter: just a trigger node, student fills the rest
    const starterNodes = [
      { id: 'starter-n1', type: 'flowLabNode', position: { x: 100, y: 200 }, data: { type: 'trigger', label: 'Trigger', config: { mode: 'Manual Click' }, executionState: 'idle', input: null, output: null } },
    ];
    socket.emit('mentor:pushFlowWorkflow', { nodes: starterNodes, edges: [], levelId: selectedFlowLevel });
    alert(`Pushed starter workflow for "${levelDef?.title}" to all students!`);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Live Session: <span style={{color: 'var(--text-primary)'}}>{session.id}</span></h1>
        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: connected ? 'var(--status-green)' : 'var(--status-red)'}}>
            <span className="pulse-indicator" style={{background: connected ? 'var(--status-green)' : 'var(--status-red)', boxShadow: `0 0 8px ${connected ? 'var(--status-green)' : 'var(--status-red)'}`}}></span>
            {connected ? 'Live' : 'Connecting...'}
          </span>
          <span style={{color: 'var(--text-secondary)'}}>Mentor: {user.name}</span>
          <button className="btn btn-secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={async () => { socket.disconnect(); await logOut(); clearUser(); window.location.href = '/'; }}>Exit</button>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px'}}>
            <button 
              className={`btn ${gamesEnabled ? 'btn-primary' : 'btn-secondary'}`}
              style={{padding: '4px 10px', fontSize: '0.75rem', background: gamesEnabled ? 'var(--status-green)' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none'}}
              onClick={() => {
                const nextState = !gamesEnabled;
                setGamesEnabled(nextState);
                socket.emit('mentor:toggleGames', { gamesEnabled: nextState });
              }}
            >
              {gamesEnabled ? 'Games Enabled' : 'Enable Games'}
            </button>
            <button 
              className={`btn ${assessmentMode ? 'btn-primary' : 'btn-secondary'}`}
              style={{padding: '4px 10px', fontSize: '0.75rem', background: assessmentMode ? 'var(--status-red)' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none'}}
              onClick={() => {
                const nextState = !assessmentMode;
                setAssessmentMode(nextState);
                socket.emit('mentor:toggleAssessment', { assessmentMode: nextState });
              }}
            >
              {assessmentMode ? 'Assessment Mode ON' : 'Assessment Mode OFF'}
            </button>
            <select 
              className="btn btn-secondary" 
              style={{padding: '4px 8px', fontSize: '0.75rem', maxWidth: '200px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-glass)'}}
              value={selectedQuestionIndex}
              onChange={e => setSelectedQuestionIndex(Number(e.target.value))}
            >
              {QUESTIONS.map((q, i) => <option key={i} value={i} style={{background: '#000'}}>{q.title}</option>)}
            </select>
            <button className="btn btn-primary" onClick={pushCheckpoint} disabled={!connected}>Push Checkpoint</button>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        {/* Tab switcher */}
        <div style={{display: 'flex', gap: '0', marginBottom: '0', alignSelf: 'flex-start', flexDirection: 'column', width: '100%'}}>
          <div style={{display: 'flex', gap: '8px', padding: '0 0 16px 0'}}>
            <button
              className={`btn ${activeTab === 'code' ? 'btn-primary' : 'btn-secondary'}`}
              style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.82rem'}}
              onClick={() => setActiveTab('code')}
            >
              <Activity size={14} /> Code Session
            </button>
            <button
              className={`btn ${activeTab === 'flowlab' ? 'btn-primary' : 'btn-secondary'}`}
              style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.82rem', background: activeTab === 'flowlab' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : undefined}}
              onClick={() => setActiveTab('flowlab')}
            >
              <GitBranch size={14} /> Flow Lab
            </button>
          </div>
        </div>

        {activeTab === 'flowlab' ? (
          /* ── Flow Lab Tab ────────────────────────────────────────── */
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', width: '100%'}}>
            {/* Push Flow Workflow */}
            <div className="glass-panel" style={{padding: '20px'}}>
              <h2 style={{marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <GitBranch size={20} /> Push Flow Lab Workflow
              </h2>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap'}}>
                <select
                  style={{padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '0.85rem', flex: 1, minWidth: '200px'}}
                  value={selectedFlowLevel}
                  onChange={e => setSelectedFlowLevel(e.target.value)}
                >
                  {FLOW_LEVELS.map(l => (
                    <option key={l.id} value={l.id} style={{background: '#111'}}>
                      {l.title} — {l.description}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-primary"
                  style={{background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', gap: '6px'}}
                  onClick={pushFlowWorkflow}
                  disabled={!connected}
                >
                  <GitBranch size={14} /> Push to Students
                </button>
              </div>
              <p style={{fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '12px', marginBottom: 0}}>
                Pushes a starter Trigger node to student canvases. Students complete the rest to reach the level goal.
              </p>
            </div>

            {/* Student Flow Status Grid */}
            <div className="glass-panel" style={{padding: '16px', flex: 1}}>
              <h2 style={{marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Users size={20} /> Student Flow Lab Status
              </h2>
              <div className="grid-container student-grid">
                {Object.entries(students).map(([id, s]) => {
                  const flowS = flowStudentStatuses[id];
                  const dbInfo = dbStudents[id] || {};
                  const displayName = dbInfo.name || s.name;
                  const statusColor = flowS?.status === 'passed' ? 'var(--status-green)' : flowS?.status === 'failed' ? 'var(--status-red)' : 'var(--status-yellow)';
                  return (
                    <div key={id} className="card glass-panel" style={{borderLeft: `4px solid ${statusColor}`}}>
                      <div style={{fontWeight: 500}}>{displayName}</div>
                      <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
                        {flowS ? `${flowS.levelId} → ${flowS.status}` : 'Not started'}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(students).length === 0 && (
                  <div style={{color: 'var(--text-secondary)'}}>No students joined yet.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
        <>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div className="glass-panel" style={{flex: 1, padding: '16px', display: 'flex', flexDirection: 'column'}}>
              <h2 style={{marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Users size={20}/> Student Progress
            </h2>
            <div className="grid-container student-grid">
              {Object.entries(students).map(([id, s]) => {
                const dbInfo = dbStudents[id] || {};
                const displayName = dbInfo.name || s.name;
                const displayEmail = dbInfo.email;

                return (
                <div key={id} className="card glass-panel" style={{
                  borderLeft: `4px solid var(--status-${s.status === 'passed' ? 'green' : s.status === 'attempted_error' ? 'yellow' : 'red'})`
                }}>
                  <div style={{fontWeight: 500}}>{displayName}</div>
                  {displayEmail && <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{displayEmail}</div>}
                  <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
                    {s.status === 'passed' ? 'Completed Checkpoint' : s.status === 'attempted_error' ? 'Stuck (Has Error)' : 'Not Started'}
                  </div>
                  <div style={{fontSize: '0.75rem', marginTop: '8px', color: 'var(--text-secondary)'}}>
                    {s.focusState === 'blur' ? '🔴 Switched tabs' : s.focusState === 'idle' ? '🟡 Idle' : '🟢 Active'}
                    {(s.focusCounts?.blur > 0) && ` • ${s.focusCounts.blur} tab switches`}
                  </div>
                </div>
              )})}
              {Object.keys(students).length === 0 && (
                <div style={{color: 'var(--text-secondary)'}}>No students joined yet.</div>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', overflowY: 'auto'}}>
            <h2 style={{marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <HelpCircle size={20}/> Raised Hands queue ({raisedHands.length})
            </h2>
            <div className="grid-container">
              {raisedHands.map((hand, idx) => (
                <div key={idx} className="card glass-panel">
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center'}}>
                    <span style={{fontWeight: 500}}>{hand.name}</span>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button className="btn btn-primary" style={{fontSize: '0.75rem', padding: '4px 8px'}} onClick={() => replyHand(idx)}>Send Reply</button>
                      <button className="btn btn-secondary" style={{fontSize: '0.75rem', padding: '4px 8px'}} onClick={() => resolveHand(idx)}>Dismiss</button>
                    </div>
                  </div>
                  <textarea 
                    value={hand.message || ''}
                    onChange={(e) => handleHandMessageChange(idx, e.target.value)}
                    placeholder="Type feedback message to student..."
                    style={{
                      width: '100%', minHeight: '60px', fontSize: '0.875rem', 
                      background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '8px', 
                      borderRadius: '4px', border: '1px solid var(--border-glass)', 
                      marginBottom: '8px', fontFamily: 'var(--font-sans)', resize: 'vertical'
                    }}
                  />
                  <textarea 
                    value={hand.code}
                    onChange={(e) => handleHandCodeChange(idx, e.target.value)}
                    style={{
                      width: '100%', minHeight: '100px', fontSize: '0.75rem', 
                      background: '#000', color: '#a3bea8', padding: '8px', 
                      borderRadius: '4px', border: '1px solid var(--border-glass)', 
                      fontFamily: 'var(--font-mono)', resize: 'vertical'
                    }}
                  />
                </div>
              ))}
              {raisedHands.length === 0 && (
                <div style={{color: 'var(--text-secondary)'}}>No raised hands.</div>
              )}
            </div>
            </div>
          </div>

          <CodeEditor 
            initialCode={broadcastCode} 
            onCodeChange={handleBroadcastChange}
            readOnly={false}
          />
        </>
        )}
      </main>
    </div>
  );
}
