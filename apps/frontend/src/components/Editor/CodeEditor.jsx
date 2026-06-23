import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Hand, Loader2 } from 'lucide-react';
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
    </div>
  );
}
