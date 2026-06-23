import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Hand, Loader2, Eye, X } from 'lucide-react';
import { usePyodide } from './usePyodide';

export function CodeEditor({ 
  initialCode = '# Write your Python code here\nprint("Hello, World!")', 
  readOnly = false,
  isSynced = false,
  onCodeChange = () => {},
  onRunAttempt = () => {},
  onRaiseHand = () => {}
}) {
  const [code, setCode] = useState(initialCode);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const { isLoading, loadMsg, output, runCode, clearOutput } = usePyodide();

  // Update editor content when synced code changes from mentor
  useEffect(() => {
    if (isSynced) {
      setCode(initialCode);
    }
  }, [initialCode, isSynced]);

  const handleEditorChange = (value) => {
    const v = value || '';
    setCode(v);
    onCodeChange(v);
  };

  const handleRun = async () => {
    clearOutput();
    const result = await runCode(code);
    onRunAttempt({ code, success: result.success, error: result.error });
  };

  const handleReset = () => {
    setCode(initialCode);
    clearOutput();
  };

  return (
    <div className="editor-container">
      {/* Editor Toolbar */}
      <div className="editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>main.py</span>
          {isSynced && (
            <span style={{ fontSize: '0.72rem', color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="pulse-indicator"></span> Live from Mentor
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button id="btn-raise-hand" className="btn btn-secondary" onClick={() => onRaiseHand(code, output)} title="Send your code & error to the mentor">
            <Hand size={14} /> Raise Hand
          </button>
          {!readOnly && (
            <button id="btn-reset" className="btn btn-secondary" onClick={handleReset} disabled={isLoading}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setShowVisualizer(true)} title="Visualize execution step-by-step">
            <Eye size={14} /> Visualize
          </button>
          <button id="btn-run" className="btn btn-primary" onClick={handleRun} disabled={isLoading} title={isLoading ? loadMsg : 'Run code (Ctrl+Enter)'}>
            {isLoading
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading Python...</>
              : <><Play size={14} /> Run</>
            }
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="monaco-wrapper">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: readOnly,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontLigatures: true,
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            padding: { top: 12 },
          }}
        />
      </div>

      {/* Terminal Output */}
      <div className="terminal-container">
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            <span>{loadMsg}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(~10–20s on first load)</span>
          </div>
        ) : (
          <>
            <div className="terminal-system">$ python main.py</div>
            {output.length === 0 && (
              <div className="terminal-system" style={{ marginTop: '6px' }}>No output yet — press Run ▶</div>
            )}
            {output.map((out, idx) => (
              <div key={idx} className={out.type === 'stderr' ? 'terminal-error' : ''} style={{ whiteSpace: 'pre-wrap', marginTop: '2px' }}>
                {out.text}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Visualizer Modal */}
      {showVisualizer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', width: '90%', height: '90%',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 24px', borderBottom: '1px solid #e5e7eb',
              background: '#f8fafc'
            }}>
              <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} /> Python Execution Visualizer
              </h3>
              <button 
                onClick={() => setShowVisualizer(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={24} />
              </button>
            </div>
            <iframe 
              src={`https://pythontutor.com/iframe-embed.html#code=${encodeURIComponent(code)}&codeDivHeight=400&codeDivWidth=350&cumulative=false&curInstr=0&heapPrimitives=nevernest&origin=opt-frontend.js&py=3&rawInputLstJSON=%5B%5D&textReferences=false`}
              style={{ flex: 1, width: '100%', border: 'none' }}
              title="Python Visualizer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
