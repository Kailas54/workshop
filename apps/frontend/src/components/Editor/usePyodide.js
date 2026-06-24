import { useState, useEffect, useRef } from 'react';

export function usePyodide() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadMsg, setLoadMsg] = useState('Loading Python environment...');
  const [output, setOutput] = useState([]);
  const pyodideRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // window.loadPyodide is available because index.html loads pyodide.js synchronously
        setLoadMsg('Initializing Python runtime...');
        const py = await window.loadPyodide({
          stdout: (text) => {
            if (!cancelled) setOutput((prev) => [...prev, { type: 'stdout', text }]);
          },
          stderr: (text) => {
            if (!cancelled) setOutput((prev) => [...prev, { type: 'stderr', text }]);
          },
        });

        if (cancelled) return;
        pyodideRef.current = py;
        setIsLoading(false);
        setLoadMsg('');
      } catch (err) {
        if (!cancelled) {
          setIsLoading(false);
          setOutput([{ type: 'stderr', text: `Failed to load Python: ${err.message}` }]);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const runCode = async (code, injectGlobals = {}) => {
    if (!pyodideRef.current) return { success: false, error: 'Python not ready' };
    setOutput([]);
    try {
      Object.entries(injectGlobals).forEach(([key, val]) => {
        pyodideRef.current.globals.set(key, val);
      });
      await pyodideRef.current.runPythonAsync(code);
      return { success: true };
    } catch (err) {
      setOutput((prev) => [...prev, { type: 'stderr', text: err.message }]);
      return { success: false, error: err.message };
    }
  };

  const clearOutput = () => setOutput([]);

  return { isLoading, loadMsg, output, runCode, clearOutput };
}
