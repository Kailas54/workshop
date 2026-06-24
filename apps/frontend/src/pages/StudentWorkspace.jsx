import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket';
import { useStore } from '../services/store';
import { CodeEditor } from '../components/Editor/CodeEditor';
import { Target, Trophy, MessageSquare, BookOpen, Gamepad2, Sword } from 'lucide-react';
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
  const navigate = useNavigate();

  // Use refs so event handlers always read the latest value without re-registering
  const isSyncedRef = useRef(isSynced);
  const checkpointRef = useRef(checkpoint);
  useEffect(() => { isSyncedRef.current = isSynced; }, [isSynced]);
  useEffect(() => { checkpointRef.current = checkpoint; }, [checkpoint]);

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

    socket.on('connect', onConnect);
    socket.on('mentor:broadcast', onBroadcast);
    socket.on('mentor:pushCheckpoint', onPushCheckpoint);
    socket.on('mentor:resolveHand', onResolveHand);
    socket.on('mentor:replyHand', onMentorReply);

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('mentor:broadcast', onBroadcast);
      socket.off('mentor:pushCheckpoint', onPushCheckpoint);
      socket.off('mentor:resolveHand', onResolveHand);
      socket.off('mentor:replyHand', onMentorReply);
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

  return (
    <div className="app-container">
      <header className="header">
        <h1>Workspace: <span style={{color: 'var(--text-primary)'}}>{session.id}</span></h1>
        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: connected ? 'var(--status-green)' : 'var(--status-red)'}}>
            <span className="pulse-indicator" style={{background: connected ? 'var(--status-green)' : 'var(--status-red)', boxShadow: `0 0 8px ${connected ? 'var(--status-green)' : 'var(--status-red)'}`}}></span>
            {connected ? 'Live' : 'Connecting...'}
          </span>
          {badges.map(b => (
            <span key={b} style={{display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.2)', color: 'var(--status-yellow)', padding: '4px 8px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(245,158,11,0.3)'}}>
              <Trophy size={12}/> {b}
            </span>
          ))}
          <span style={{color: 'var(--text-secondary)'}}>Student: {user.name}</span>
          <button className="btn btn-primary" style={{padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #a855f7, #c084fc)', border: 'none', boxShadow: '0 0 10px rgba(168,85,247,0.3)'}} onClick={() => navigate('/code-a-pet')}>
            <Gamepad2 size={14} /> Code-a-Pet
          </button>
          <button className="btn btn-primary" style={{padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #f77f00, #e63946)', border: 'none', boxShadow: '0 0 10px rgba(247,127,0,0.3)'}} onClick={() => navigate('/code-dungeon')}>
            <Sword size={14} /> Code Dungeon
          </button>
          <button className="btn btn-primary" style={{padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px'}} onClick={() => navigate('/materials')}>
            <BookOpen size={14} /> Materials
          </button>
          <button className="btn btn-secondary" style={{padding: '4px 10px', fontSize: '0.75rem'}} onClick={() => { socket.disconnect(); clearUser(); window.location.href = '/'; }}>Exit</button>
        </div>
      </header>
      
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
    </div>
  );
}
