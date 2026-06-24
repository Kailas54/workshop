import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { usePyodide } from '../components/Editor/usePyodide';
import { ClayPet } from '../components/Pet/ClayPet';
import { StatBar } from '../components/Pet/StatBar';
import '../styles/claymorphism.css';

const LEVELS = [
  {
    title: "Level 1: Function Calls",
    instruction: "Your pet is hungry! Call feed_pet() to raise hunger above 70.",
    starter_code: "# Type your code below\nfeed_pet()\n",
    check: (stats) => stats.hunger > 70
  },
  {
    title: "Level 2: Parameters",
    instruction: "Your pet is bored. Call play_with_pet(minutes) to raise happiness above 60.",
    starter_code: "# play_with_pet takes a number of minutes\n# Example: play_with_pet(10)\n\n",
    check: (stats) => stats.happiness > 60
  },
  {
    title: "Level 3: Conditionals",
    instruction: "Write an if/else statement. If hunger < 50, feed_pet(). Else, play_with_pet(10).",
    starter_code: "# Check status and decide what to do!\n\n",
    check: (stats) => stats.hunger >= 50 && stats.happiness >= 50
  },
  {
    title: "Level 4: Loops",
    instruction: "Use a loop to call play_with_pet(5) three times to max out happiness!",
    starter_code: "# Use a for loop or while loop\n\n",
    check: (stats) => stats.happiness >= 100
  }
];

export default function CodeAPet() {
  const navigate = useNavigate();
  const [levelIdx, setLevelIdx] = useState(0);
  const level = LEVELS[levelIdx];
  const [code, setCode] = useState(level.starter_code);
  const [stats, setStats] = useState({ hunger: 50, energy: 50, happiness: 50 });
  const [message, setMessage] = useState('');
  
  const { isLoading, output, runCode, clearOutput } = usePyodide();
  
  // Current stats mutator ref
  const statsRef = useRef({ ...stats });
  useEffect(() => {
    statsRef.current = { ...stats };
  }, [stats]);

  // When level changes, reset code and message
  useEffect(() => {
    setCode(level.starter_code);
    setMessage('');
    clearOutput();
  }, [levelIdx]);

  const handleRun = async () => {
    clearOutput();
    setMessage('');
    
    // Inject the API
    const injectGlobals = {
      feed_pet: () => {
        statsRef.current.hunger = Math.min(100, statsRef.current.hunger + 20);
      },
      play_with_pet: (mins) => {
        const m = typeof mins === 'number' ? mins : 5;
        statsRef.current.happiness = Math.min(100, statsRef.current.happiness + m * 2);
        statsRef.current.energy = Math.max(0, statsRef.current.energy - m);
      },
      check_status: () => {
        return `Hunger: ${statsRef.current.hunger}, Energy: ${statsRef.current.energy}, Happiness: ${statsRef.current.happiness}`;
      }
    };

    const res = await runCode(code, injectGlobals);
    
    // Sync state
    setStats({ ...statsRef.current });

    if (res.success) {
      if (level.check(statsRef.current)) {
        setMessage('✨ Great job! Level complete! ✨');
        setTimeout(() => {
          if (levelIdx < LEVELS.length - 1) {
            setLevelIdx(i => i + 1);
            setStats({ hunger: 50, energy: 50, happiness: 50 }); // Reset pet for next level
          } else {
            setMessage('🏆 You have mastered Code-a-Pet!');
          }
        }, 2000);
      } else {
        setMessage('Code ran successfully, but the goal is not met yet.');
      }
    }
  };

  const handleReset = () => {
    setCode(level.starter_code);
    setStats({ hunger: 50, energy: 50, happiness: 50 });
    clearOutput();
    setMessage('');
  };

  return (
    <div className="clay-container" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="clay-btn" onClick={() => navigate('/student')} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={18} /> Back to Workspace
        </button>
        <h1 className="clay-text-title" style={{ margin: 0, fontSize: '2rem' }}>Code-a-Pet</h1>
        <div style={{ fontWeight: 800, color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '8px 16px', borderRadius: '16px' }}>
          Level {levelIdx + 1} of 4
        </div>
      </header>

      <main style={{ display: 'flex', gap: '32px', flex: 1 }}>
        {/* Left: Pet Visuals & Stats */}
        <div className="clay-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
          <ClayPet stats={stats} />
          
          <div>
            <StatBar label="Hunger" value={stats.hunger} type="hunger" />
            <StatBar label="Energy" value={stats.energy} type="energy" />
            <StatBar label="Happiness" value={stats.happiness} type="happiness" />
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Hint: Use <code style={{background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px'}}>print(check_status())</code> to view raw stats!
          </div>
        </div>

        {/* Right: Code Editor & Instructions */}
        <div className="clay-card" style={{ flex: 2, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <h2 className="clay-text-title" style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.25rem' }}>{level.title}</h2>
            <p style={{ margin: 0, color: '#4a4a68', lineHeight: 1.5 }}>{level.instruction}</p>
          </div>

          <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="light"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 16 }
              }}
            />
          </div>

          <div style={{ padding: '16px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ flex: 1, fontWeight: 600, color: message.includes('✨') ? '#10b981' : '#64748b' }}>
              {message}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="clay-btn" onClick={handleReset} style={{ color: '#64748b', fontSize: '0.875rem' }}>
                <RotateCcw size={16} /> Reset
              </button>
              <button className="clay-btn" onClick={handleRun} disabled={isLoading} style={{ background: '#6366f1', color: '#fff', fontSize: '0.875rem' }}>
                <Play size={16} /> {isLoading ? 'Loading...' : 'Run Code'}
              </button>
            </div>
          </div>

          {/* Output Terminal */}
          {output.length > 0 && (
            <div style={{ padding: '16px 24px', background: '#1e293b', color: '#f8fafc', fontFamily: 'monospace', fontSize: '0.875rem', maxHeight: '150px', overflowY: 'auto' }}>
              <div style={{ color: '#94a3b8', marginBottom: '8px' }}>$ python output</div>
              {output.map((out, idx) => (
                <div key={idx} style={{ color: out.type === 'stderr' ? '#f87171' : '#f8fafc', whiteSpace: 'pre-wrap' }}>
                  {out.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
