import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, RotateCcw, ChevronRight, Sword, AlertTriangle } from 'lucide-react';
import { usePyodide } from '../components/Editor/usePyodide';
import { DungeonCanvas } from '../dungeon/DungeonCanvas';
import { LEVELS, TILE } from '../dungeon/levels';

// ── Hero State Machine ────────────────────────────────────────────────────────
function useHeroState(levelData) {
  const [heroState, setHeroState] = useState({
    col: levelData.startPos.col,
    row: levelData.startPos.row,
    facing: levelData.startPos.facing || 'down',
    isMoving: false,
    gateJustOpened: false,
    killedEnemy: null,
  });

  const stateRef = useRef(heroState);
  useEffect(() => { stateRef.current = heroState; }, [heroState]);
  const gridRef = useRef(levelData.grid.map(r => [...r]));

  const reset = useCallback((ld) => {
    gridRef.current = ld.grid.map(r => [...r]);
    setHeroState({
      col: ld.startPos.col,
      row: ld.startPos.row,
      facing: ld.startPos.facing || 'down',
      isMoving: false,
      gateJustOpened: false,
      killedEnemy: null,
    });
  }, []);

  return { heroState, setHeroState, stateRef, gridRef, reset };
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CodeDungeon() {
  const navigate = useNavigate();
  const [levelIdx, setLevelIdx] = useState(0);
  const level = LEVELS[levelIdx];

  const [code, setCode] = useState(level.starterCode);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [levelComplete, setLevelComplete] = useState(false);

  const { heroState, setHeroState, stateRef, gridRef, reset } = useHeroState(level);
  const commandQueue = useRef([]);
  const processingRef = useRef(false);
  const onLevelCompleteRef = useRef(null);
  const onErrorRef = useRef(null);

  const { isLoading, output, runCode, clearOutput } = usePyodide();

  // ── Process command queue with animation timing ──────────────────────────
  const processQueue = useCallback(() => {
    if (processingRef.current) return;
    processingRef.current = true;

    const step = () => {
      if (commandQueue.current.length === 0) {
        processingRef.current = false;
        setHeroState(s => ({ ...s, isMoving: false }));
        return;
      }

      const cmd = commandQueue.current.shift();
      const cur = stateRef.current;

      const facingToOffset = (f) => ({ up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] }[f] || [0,1]);

      if (cmd.type === 'turn') {
        const order = ['up','right','down','left'];
        const idx = order.indexOf(cur.facing);
        const newFacing = cmd.dir === 'right' ? order[(idx+1)%4] : order[(idx+3)%4];
        setHeroState(s => ({ ...s, facing: newFacing, gateJustOpened: false, killedEnemy: null }));
        stateRef.current = { ...stateRef.current, facing: newFacing };
        setTimeout(step, 80);

      } else if (cmd.type === 'move') {
        const steps = cmd.steps || 1;
        const [dc, dr] = facingToOffset(cur.facing);
        const nc = cur.col + dc;
        const nr = cur.row + dr;
        const rows = gridRef.current.length;
        const cols = gridRef.current[0].length;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
          onErrorRef.current?.('❌ Out of bounds!');
          processingRef.current = false;
          return;
        }
        if (gridRef.current[nr][nc] === TILE.WALL) {
          onErrorRef.current?.('💥 There\'s a wall there!');
          processingRef.current = false;
          return;
        }
        if (level.gatePos && nc === level.gatePos.col && nr === level.gatePos.row && !stateRef.current.gateJustOpened) {
          onErrorRef.current?.('🔒 The gate is locked!');
          processingRef.current = false;
          return;
        }

        setHeroState(s => ({ ...s, col: nc, row: nr, isMoving: true, gateJustOpened: false, killedEnemy: null }));
        stateRef.current = { ...stateRef.current, col: nc, row: nr };

        // Check exit
        if (nc === level.exitPos.col && nr === level.exitPos.row) {
          setTimeout(() => {
            processingRef.current = false;
            onLevelCompleteRef.current?.();
          }, 400);
          return;
        }

        // Chain more steps
        if (steps > 1) {
          commandQueue.current.unshift({ type: 'move', steps: steps - 1 });
        }
        setTimeout(step, 220);

      } else if (cmd.type === 'attack') {
        const [dc, dr] = facingToOffset(cur.facing);
        const tc = cur.col + dc;
        const tr = cur.row + dr;
        if (tr >= 0 && tr < gridRef.current.length && tc >= 0 && tc < gridRef.current[0].length) {
          if (gridRef.current[tr][tc] === TILE.ENEMY) {
            gridRef.current[tr][tc] = TILE.FLOOR;
            setHeroState(s => ({ ...s, killedEnemy: { row: tr, col: tc }, gateJustOpened: false }));
          }
        }
        setTimeout(step, 200);

      } else if (cmd.type === 'open_gate') {
        if (String(cmd.answer) === String(level.gateAnswer)) {
          setHeroState(s => ({ ...s, gateJustOpened: true, killedEnemy: null }));
          stateRef.current = { ...stateRef.current, gateJustOpened: true };
          setStatusMsg('🔓 Gate unlocked!');
          setStatusType('info');
        } else {
          onErrorRef.current?.('🔒 Wrong answer! Gate stays locked.');
          processingRef.current = false;
          return;
        }
        setTimeout(step, 300);
      } else {
        setTimeout(step, 50);
      }
    };

    step();
  }, [level, stateRef, gridRef]);

  // ── Python bridge ─────────────────────────────────────────────────────────
  const buildInjectGlobals = useCallback(() => {
    const queue = commandQueue.current;
    return {
      move_forward: () => queue.push({ type: 'move', steps: 1 }),
      turn_left:    () => queue.push({ type: 'turn', dir: 'left' }),
      turn_right:   () => queue.push({ type: 'turn', dir: 'right' }),
      move:         (n) => queue.push({ type: 'move', steps: Math.round(n) || 1 }),
      get_gate_code: () => level.gateCode || 0,
      open_gate:    (ans) => queue.push({ type: 'open_gate', answer: ans }),
      get_room_info: () => 'enemy',
      attack:        () => queue.push({ type: 'attack' }),
    };
  }, [level]);

  const handleLevelComplete = useCallback(() => {
    setStatusMsg('🎉 You reached the exit! Level complete!');
    setStatusType('success');
    setLevelComplete(true);
  }, []);

  const handleError = useCallback((msg) => {
    setStatusMsg(msg);
    setStatusType('error');
    commandQueue.current = [];
    processingRef.current = false;
  }, []);

  useEffect(() => {
    onLevelCompleteRef.current = handleLevelComplete;
    onErrorRef.current = handleError;
  }, [handleLevelComplete, handleError]);

  const handleRun = async () => {
    commandQueue.current = [];
    processingRef.current = false;
    clearOutput();
    setStatusMsg('Running your code...');
    setStatusType('info');
    setLevelComplete(false);
    reset(level);

    const injectGlobals = buildInjectGlobals();
    const result = await runCode(code, injectGlobals);

    if (!result.success) {
      setStatusMsg(`Python error: ${result.error}`);
      setStatusType('error');
    } else {
      setTimeout(() => processQueue(), 200);
    }
  };

  const handleReset = () => {
    commandQueue.current = [];
    processingRef.current = false;
    clearOutput();
    setCode(level.starterCode);
    setStatusMsg('');
    setStatusType('info');
    setLevelComplete(false);
    reset(level);
  };

  const goNextLevel = () => {
    const next = levelIdx + 1;
    if (next < LEVELS.length) {
      setLevelIdx(next);
      setCode(LEVELS[next].starterCode);
      setStatusMsg('');
      setStatusType('info');
      setLevelComplete(false);
      commandQueue.current = [];
      processingRef.current = false;
      reset(LEVELS[next]);
    } else {
      setStatusMsg('🏆 You have conquered the entire Code Dungeon!');
      setStatusType('success');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
        <button onClick={() => navigate('/workspace')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem' }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sword size={20} color="#f77f00" />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Code <span style={{ color: '#f77f00' }}>Dungeon</span>
          </span>
        </div>

        {/* Level pip indicators */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {LEVELS.map((_, i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, background: i < levelIdx ? '#10b981' : i === levelIdx ? '#f77f00' : 'rgba(255,255,255,0.07)', color: i <= levelIdx ? '#fff' : '#64748b', border: `2px solid ${i === levelIdx ? '#f77f00' : 'transparent'}`, transition: 'all 0.3s' }}>
              {i < levelIdx ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </header>

      {/* ── Main Layout ────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Left: 2D Game Canvas */}
        <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f77f00', textTransform: 'uppercase', letterSpacing: '1px' }}>{level.concept}</span>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <DungeonCanvas
              key={levelIdx}
              levelData={level}
              heroState={heroState}
            />
          </div>

          {/* Status bar */}
          {statusMsg && (
            <div style={{ padding: '10px 16px', background: statusType === 'error' ? 'rgba(230,57,70,0.12)' : statusType === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', borderTop: `1px solid ${statusType === 'error' ? 'rgba(230,57,70,0.25)' : statusType === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`, color: statusType === 'error' ? '#f87171' : statusType === 'success' ? '#34d399' : '#94a3b8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {statusType === 'error' && <AlertTriangle size={14} />}
              {statusMsg}
              {levelComplete && (
                <button onClick={goNextLevel} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                  {levelIdx < LEVELS.length - 1 ? <><ChevronRight size={13} /> Next Level</> : '🏆 Complete!'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Instructions + Editor */}
        <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Mission */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f77f00', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Mission</div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6, fontFamily: 'inherit' }}>{level.instruction}</pre>
          </div>

          {/* Editor */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{ minimap: { enabled: false }, fontSize: 13, fontFamily: '"JetBrains Mono", monospace', scrollBeyondLastLine: false, padding: { top: 14 } }}
            />
          </div>

          {/* Toolbar */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
            <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '7px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}>
              <RotateCcw size={13} /> Reset
            </button>
            <button onClick={handleRun} disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: isLoading ? 'rgba(247,127,0,0.3)' : '#f77f00', border: 'none', borderRadius: '7px', padding: '7px 18px', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 700, boxShadow: isLoading ? 'none' : '0 0 16px rgba(247,127,0,0.35)' }}>
              <Play size={13} /> {isLoading ? 'Loading Python...' : 'Run Code ▶'}
            </button>
          </div>

          {/* Python output */}
          {output.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: '#0d1117', padding: '8px 14px', fontFamily: 'monospace', fontSize: '0.75rem', maxHeight: '90px', overflowY: 'auto', flexShrink: 0 }}>
              {output.map((o, i) => <div key={i} style={{ color: o.type === 'stderr' ? '#f87171' : '#64748b', whiteSpace: 'pre-wrap' }}>{o.text}</div>)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
