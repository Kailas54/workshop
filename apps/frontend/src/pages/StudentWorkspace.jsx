import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket';
import { useStore } from '../services/store';
import { CodeEditor } from '../components/Editor/CodeEditor';
import { logOut } from '../services/auth';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Target, Trophy, MessageSquare, BookOpen, Gamepad2, Sword, Info, ClipboardEdit, Save, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentWorkspace() {
  const user = useStore(state => state.user);
  const clearUser = useStore(state => state.clearUser);
  const [session] = useState({ id: 'demo-session-123' });
  const [code, setCode] = useState('# Waiting for mentor...\n');
  const [checkpoint, setCheckpoint] = useState(null);
  const [isSynced, setIsSynced] = useState(true);
  const [badges, setBadges] = useState([]);
  const [connected, setConnected] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [gamesEnabled, setGamesEnabled] = useState(false);
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [toastWarning, setToastWarning] = useState(null);
  
  // Notepad State
  const [showNotepad, setShowNotepad] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  const navigate = useNavigate();

  // Use refs so event handlers always read the latest value without re-registering
  const isSyncedRef = useRef(isSynced);
  const checkpointRef = useRef(checkpoint);
  const assessmentModeRef = useRef(assessmentMode);
  useEffect(() => { isSyncedRef.current = isSynced; }, [isSynced]);
  useEffect(() => { checkpointRef.current = checkpoint; }, [checkpoint]);
  useEffect(() => { assessmentModeRef.current = assessmentMode; }, [assessmentMode]);

  useEffect(() => {
    // Fetch user notes on mount
    const fetchNotes = async () => {
      try {
        const docRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setNotes(docSnap.data().notes || '');
      } catch (err) {
        console.error("Error fetching notes:", err);
      }
    };
    fetchNotes();
  }, [user.id]);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      socket.emit('joinSession', { sessionId: session.id, role: 'student', userId: user.id, name: user.name });
    };

    const onBroadcast = ({ code: newCode }) => {
      if (isSyncedRef.current && !checkpointRef.current) {
        setCode(newCode);
      }
    };

    const onPushCheckpoint = (cp) => {
      setCheckpoint(cp);
      setIsSynced(false);
      setCode(cp.starter_code);
    };

    const onResolveHand = () => {
      alert('✅ Your mentor has addressed your raised hand!');
    };

    const onMentorReply = ({ userId, code: repliedCode, message }) => {
      console.log('Received mentor:replyHand:', JSON.stringify({ userId, repliedCode, message, myUserId: user.id }));
      if (userId === user.id) {
        if (repliedCode) setCode(repliedCode);
        if (message) {
          setFeedback({ message, timestamp: new Date().toLocaleTimeString() });
        } else {
          console.log('No message provided in mentor reply');
        }
      } else {
        console.log('User ID mismatch!', userId, user.id);
      }
    };

    const onToggleGames = ({ gamesEnabled }) => {
      setGamesEnabled(gamesEnabled);
    };

    const onToggleAssessment = ({ assessmentMode }) => {
      setAssessmentMode(assessmentMode);
    };

    socket.on('connect', onConnect);
    socket.on('mentor:broadcast', onBroadcast);
    socket.on('mentor:pushCheckpoint', onPushCheckpoint);
    socket.on('mentor:resolveHand', onResolveHand);
    socket.on('mentor:replyHand', onMentorReply);
    socket.on('mentor:toggleGames', onToggleGames);
    socket.on('mentor:toggleAssessment', onToggleAssessment);

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    // Focus tracking and idle detection
    let idleTimer;
    let isIdle = false;

    const resetIdleTimer = () => {
      if (isIdle) {
        isIdle = false;
        socket.emit('student:focusUpdate', { eventType: 'active' });
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isIdle = true;
        socket.emit('student:focusUpdate', { eventType: 'idle' });
      }, 3 * 60 * 1000); // 3 minutes
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        socket.emit('student:focusUpdate', { eventType: 'blur' });
        if (assessmentModeRef.current) {
          setToastWarning('Warning: Please stay on this tab during the assessment.');
          setTimeout(() => setToastWarning(null), 5000);
        }
      } else {
        socket.emit('student:focusUpdate', { eventType: 'focus' });
        resetIdleTimer();
      }
    };

    const handleBlur = () => {
      socket.emit('student:focusUpdate', { eventType: 'blur' });
    };

    const handleFocus = () => {
      socket.emit('student:focusUpdate', { eventType: 'focus' });
      resetIdleTimer();
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(e => document.addEventListener(e, resetIdleTimer));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    resetIdleTimer();

    return () => {
      socket.off('connect', onConnect);
      socket.off('mentor:broadcast', onBroadcast);
      socket.off('mentor:pushCheckpoint', onPushCheckpoint);
      socket.off('mentor:resolveHand', onResolveHand);
      socket.off('mentor:replyHand', onMentorReply);
      socket.off('mentor:toggleGames', onToggleGames);
      socket.off('mentor:toggleAssessment', onToggleAssessment);
      
      activityEvents.forEach(e => document.removeEventListener(e, resetIdleTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      clearTimeout(idleTimer);

      setConnected(false);
      socket.disconnect();
    };
  }, [session.id, user.id, user.name]); // stable deps only

  const handleRunAttempt = ({ success, error }) => {
    if (checkpointRef.current) {
      const status = success ? 'passed' : 'attempted_error';
      socket.emit('student:statusUpdate', { checkpointId: checkpointRef.current.id, status, error });
      if (success && !badges.includes('Checkpoint Champion')) {
        setBadges(prev => [...prev, 'Checkpoint Champion']);
      }
    }
  };

  const handleRaiseHand = (currentCode, errorOutput) => {
    socket.emit('student:raiseHand', {
      checkpointId: checkpoint?.id,
      code: currentCode,
      error: errorOutput.length > 0 ? errorOutput[errorOutput.length-1].text : ''
    });
  };

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', user.id);
        await updateDoc(docRef, { notes: newNotes });
      } catch (err) {} finally { setIsSaving(false); }
    }, 1000);
  };

  return (
    <div className="app-container" style={{ 
      background: '#1a0b2e', fontFamily: "'Quicksand', sans-serif", color: '#e2e8f0', minHeight: '100vh', display: 'flex', flexDirection: 'column'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        
        /* Purple Workspace Overrides */
        .header {
          background: linear-gradient(135deg, #26163b, #150926);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 16px 24px;
        }
        
        .main-content {
          padding: 24px;
          gap: 24px;
        }
        
        .glass-panel {
          background: linear-gradient(160deg, #26163b, #150926);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.05);
        }
        
        .editor-container {
          border: 1px solid rgba(216, 180, 254, 0.2);
          box-shadow: 0 15px 40px rgba(0,0,0,0.5);
          border-radius: 20px;
        }
        
        .editor-header {
          background: #201136;
          border-bottom: 1px solid rgba(216, 180, 254, 0.1);
        }
        
        .terminal-container {
          background: #110524 !important;
          color: #d8b4fe !important;
          border-top: 1px solid rgba(216, 180, 254, 0.2) !important;
        }
      `}</style>

      <header className="header">
        <h1 style={{ fontWeight: 700, margin: 0, fontSize: '1.5rem', color: '#fff' }}>Workspace: <span style={{color: '#a855f7'}}>{session.id}</span></h1>
        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: connected ? '#10b981' : '#ef4444', fontWeight: 600}}>
            <span className="pulse-indicator" style={{background: connected ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${connected ? '#10b981' : '#ef4444'}`}}></span>
            {connected ? 'Live' : 'Connecting...'}
          </span>
          {badges.map(b => (
            <span key={b} style={{display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.2)', color: 'var(--status-yellow)', padding: '4px 8px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(245,158,11,0.3)'}}>
              <Trophy size={12}/> {b}
            </span>
          ))}
          <span style={{color: 'var(--text-secondary)'}}>Student: {user.name}</span>
          {gamesEnabled && (
            <>
              <button className="btn btn-primary" style={{padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #a855f7, #c084fc)', border: 'none', boxShadow: '0 0 10px rgba(168,85,247,0.3)'}} onClick={() => navigate('/code-a-pet')}>
                <Gamepad2 size={14} /> Code-a-Pet
              </button>
              <button className="btn btn-primary" style={{padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #f77f00, #e63946)', border: 'none', boxShadow: '0 0 10px rgba(247,127,0,0.3)'}} onClick={() => window.open('https://codecombat.com/play/level/dungeons-of-kithgard?&fromCampaign=dungeon', '_blank')}>
                <Sword size={14} /> Code Dungeon
              </button>
            </>
          )}
          <button className="btn btn-primary" style={{padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)'}} onClick={() => setShowNotepad(true)}>
            <ClipboardEdit size={14} /> Notes
          </button>
          <button className="btn btn-secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
          <button className="btn btn-secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={async () => { socket.disconnect(); await logOut(); clearUser(); window.location.href = '/'; }}>Exit</button>
        </div>
      </header>
      
      {showNotice && (
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} style={{ color: '#3b82f6' }} />
            This session tracks tab focus to help your mentor see who needs help — it's not graded.
          </div>
          <button onClick={() => setShowNotice(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Dismiss</button>
        </div>
      )}
      
      {toastWarning && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', background: 'var(--status-red)', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
          <Info size={18} /> {toastWarning}
        </div>
      )}

      <main className="main-content">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{flex: 1, padding: '16px', display: 'flex', flexDirection: 'column'}}>
            <h2 style={{marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Target size={20}/> {checkpoint ? checkpoint.title : 'Mentor Broadcast (Read Only)'}
            </h2>
            {checkpoint ? (
              <div style={{fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6}}>
                {checkpoint.instructions}
              </div>
            ) : (
              <div style={{color: 'var(--text-secondary)'}}>
                Follow along with the mentor. When an exercise is pushed, it will appear here.
              </div>
            )}
          </div>
          
          {feedback && (
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--status-green)' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} /> Mentor Feedback
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-green)', opacity: 0.8, marginBottom: '12px' }}>
                Received at {feedback.timestamp}
              </div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                {feedback.message}
              </div>
              <button className="btn btn-secondary" style={{ alignSelf: 'flex-start', padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => setFeedback(null)}>
                Dismiss
              </button>
            </div>
          )}
        </div>

        <CodeEditor 
          initialCode={code} 
          onCodeChange={setCode}
          readOnly={!checkpoint && isSynced} // Read only if following broadcast without checkpoint
          isSynced={!checkpoint && isSynced}
          onRunAttempt={handleRunAttempt}
          onRaiseHand={handleRaiseHand}
        />
      </main>

      {/* Floating Notepad Modal */}
      {showNotepad && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', padding: '24px' }} onClick={() => setShowNotepad(false)}>
          <div className="glass-panel" style={{ width: '400px', height: '500px', padding: '20px', display: 'flex', flexDirection: 'column', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardEdit size={18} /> Quick Notes
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isSaving ? <><Save size={12} className="pulse-indicator" /> Saving...</> : <><CheckCircle2 size={12} color="var(--status-green)" /> Saved</>}
                </span>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowNotepad(false)}>✕</button>
              </div>
            </div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Jot down concepts or copy-paste code snippets here. They auto-save and will be waiting in your dashboard!"
              style={{
                flex: 1, width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', color: '#e5e7eb', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', lineHeight: 1.6, resize: 'none', outline: 'none'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
