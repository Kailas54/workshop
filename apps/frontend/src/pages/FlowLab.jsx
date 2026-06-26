import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../services/store';
import { socket } from '../services/socket';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';

import FlowCanvas from './FlowLab/FlowCanvas';
import NodePalette from './FlowLab/NodePalette';
import NodeConfigPanel from './FlowLab/NodeConfigPanel';
import LevelPanel, { LEVELS } from './FlowLab/LevelPanel';
import FakeInbox from './FlowLab/MockUIs/FakeInbox';
import FakeSlack from './FlowLab/MockUIs/FakeSlack';
import FakeSpreadsheet from './FlowLab/MockUIs/FakeSpreadsheet';

import { NODE_DEFINITIONS } from './FlowLab/nodeDefinitions';
import { runWorkflow, validateWorkflow } from './FlowLab/executionEngine';

import './FlowLab/FlowLab.css';

// ─── Handle IDs for React Flow ─────────────────────────────────────────────────
// React Flow v12 uses sourceHandle / targetHandle on edges.
// We encode If/Else branches as sourceHandle 'true' | 'false'.

let nodeCounter = 0;
function makeNodeId() {
  return `node-${++nodeCounter}-${Date.now()}`;
}

function createNode(type, position) {
  const def = NODE_DEFINITIONS[type];
  if (!def) return null;

  // Pre-populate config with defaults
  const config = {};
  (def.configFields || []).forEach(f => {
    config[f.key] = f.default ?? '';
  });

  return {
    id: makeNodeId(),
    type: 'flowLabNode',   // maps to our custom node component
    position,
    data: {
      type,
      label: def.label,
      config,
      executionState: 'idle', // idle | running | done | skipped | error
      input: null,
      output: null,
    },
  };
}

// ─── Inner App (needs ReactFlowProvider context) ──────────────────────────────
function FlowLabInner() {
  const user = useStore(state => state.user);
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logEntries, setLogEntries] = useState([]);
  const [errors, setErrors] = useState([]);

  // Mock UI state
  const [emails, setEmails] = useState([]);
  const [slackMessages, setSlackMessages] = useState([]);
  const [sheetRows, setSheetRows] = useState([]);

  // Level state
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [executionDone, setExecutionDone] = useState(false);
  const [showN8nModal, setShowN8nModal] = useState(false);

  // Socket connection for mentor push
  const [connected, setConnected] = useState(false);
  const reactFlowWrapper = useRef(null);

  const addLog = useCallback((type, message) => {
    setLogEntries(prev => [...prev.slice(-30), { type, message, ts: Date.now() }]);
  }, []);

  const resetExecutionState = useCallback(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, executionState: 'idle', input: null, output: null },
    })));
    setEdges(eds => eds.map(e => ({ ...e, data: { ...e.data, active: false } })));
    setExecutionDone(false);
    setEmails([]);
    setSlackMessages([]);
    setSheetRows([]);
  }, [setNodes, setEdges]);

  // ── Socket Setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      socket.emit('joinSession', {
        sessionId: 'demo-session-123',
        role: 'student',
        userId: user?.id,
        name: user?.name,
      });
    };

    const onPushFlowWorkflow = ({ nodes: newNodes, edges: newEdges, levelId }) => {
      setNodes(newNodes);
      setEdges(newEdges);
      resetExecutionState();
      // Find the level index from the levelId
      const idx = LEVELS.findIndex(l => l.id === levelId);
      if (idx >= 0) setCurrentLevelIndex(idx);
      addLog('info', `📥 Mentor pushed a starter workflow for "${LEVELS[idx]?.title || levelId}"!`);
    };

    socket.on('connect', onConnect);
    socket.on('mentor:pushFlowWorkflow', onPushFlowWorkflow);

    if (socket.connected) { onConnect(); }
    else { socket.connect(); }

    return () => {
      socket.off('connect', onConnect);
      socket.off('mentor:pushFlowWorkflow', onPushFlowWorkflow);
      socket.disconnect();
      setConnected(false);
    };
  }, [user?.id, user?.name]);

  // ── Load saved workflow on level change or mount ───────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const levelId = LEVELS[currentLevelIndex]?.id;
    if (!levelId) return;

    const loadWorkflow = async () => {
      try {
        const docRef = doc(db, 'flowWorkflows', `${user.id}_${levelId}`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.nodes && data.nodes.length > 0) {
            setNodes(data.nodes);
            setEdges(data.edges || []);
            addLog('info', `📂 Loaded saved workflow for this level`);
          }
        }
      } catch (err) {
        console.error('Failed to load workflow:', err);
      }
    };
    
    // Clear first to prevent brief flash of old layout
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    resetExecutionState();
    setLogEntries([]);
    setErrors([]);

    loadWorkflow();
  }, [user?.id, currentLevelIndex, setNodes, setEdges, resetExecutionState]);

  const handleLevelChange = useCallback((idx) => {
    setCurrentLevelIndex(idx);
    // the useEffect above will handle loading the new level's nodes
  }, []);

  // ── Node dropped onto canvas ────────────────────────────────────────────────
  const onDrop = useCallback((type, position) => {
    const node = createNode(type, position);
    if (node) setNodes(nds => [...nds, node]);
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ── Edge connection ─────────────────────────────────────────────────────────
  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge(params, eds));
  }, []);

  // ── Node selection ──────────────────────────────────────────────────────────
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // ── Config change ───────────────────────────────────────────────────────────
  const onConfigChange = useCallback((nodeId, newConfig) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, config: newConfig } } : n
    ));
    // Keep selectedNode in sync
    setSelectedNode(prev => prev?.id === nodeId
      ? { ...prev, data: { ...prev.data, config: newConfig } }
      : prev
    );
  }, []);

  // ── Auto-save workflow to Firestore ─────────────────────────────────────────
  const saveWorkflow = useCallback(async (currentNodes, currentEdges) => {
    if (!user?.id) return;
    const levelId = LEVELS[currentLevelIndex]?.id;
    if (!levelId) return;
    
    try {
      const docRef = doc(db, 'flowWorkflows', `${user.id}_${levelId}`);
      await setDoc(docRef, {
        userId: user.id,
        levelId,
        nodes: currentNodes,
        edges: currentEdges,
        updatedAt: new Date().toISOString()
      });
      addLog('info', `💾 Workflow auto-saved`);
    } catch (err) {
      console.error('Failed to save workflow:', err);
    }
  }, [user?.id, currentLevelIndex, addLog]);

  // ── RUN ─────────────────────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (isRunning) return;

    // Validate
    const errs = validateWorkflow(nodes, edges);
    if (errs.length > 0) {
      setErrors(errs);
      setTimeout(() => setErrors([]), 4000);
      return;
    }

    // Auto-save on run
    saveWorkflow(nodes, edges);

    setIsRunning(true);
    setExecutionDone(false);
    resetExecutionState();
    setLogEntries([]);
    setErrors([]);

    // Give React a frame to re-render (reset the node states) before starting
    await new Promise(r => setTimeout(r, 50));

    // Helper to update a node's visual state
    const setNodeState = (nodeId, state, extra = {}) => {
      setNodes(nds => nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, executionState: state, ...extra } } : n
      ));
    };

    const setEdgeActive = (edgeIds) => {
      setEdges(eds => eds.map(e =>
        edgeIds.includes(e.id) ? { ...e, data: { ...e.data, active: true } } : e
      ));
    };

    // Run the engine
    for await (const event of runWorkflow(nodes, edges)) {
      switch (event.type) {
        case 'node_start': {
          const def = NODE_DEFINITIONS[nodes.find(n => n.id === event.nodeId)?.data?.type];
          setNodeState(event.nodeId, 'running');
          addLog('running', `⚙ Running: ${def?.label || event.nodeId}`);
          break;
        }
        case 'node_done': {
          const def = NODE_DEFINITIONS[nodes.find(n => n.id === event.nodeId)?.data?.type];
          setNodeState(event.nodeId, 'done', { input: event.input, output: event.output });
          setEdgeActive(event.edgeIds || []);
          addLog('done', `✓ ${def?.label || event.nodeId} → ${JSON.stringify(event.output).slice(0, 60)}`);
          // Keep selectedNode I/O in sync
          setSelectedNode(prev => prev?.id === event.nodeId
            ? { ...prev, data: { ...prev.data, executionState: 'done', input: event.input, output: event.output } }
            : prev
          );
          break;
        }
        case 'node_skipped': {
          setNodeState(event.nodeId, 'skipped');
          addLog('skipped', `↷ Skipped (${event.reason})`);
          break;
        }
        case 'visual_effect': {
          if (event.effect === 'inbox') {
            setEmails(prev => [...prev, event.data]);
            addLog('effect', `📧 Email sent to ${event.data.to}`);
          } else if (event.effect === 'slack') {
            setSlackMessages(prev => [...prev, event.data]);
            addLog('effect', `💬 Slack message → ${event.data.channel}`);
          } else if (event.effect === 'spreadsheet') {
            setSheetRows(prev => [...prev, event.data]);
            addLog('effect', `📊 Row added to "${event.data.sheet}"`);
          }
          break;
        }
        case 'loop_item': {
          addLog('loop', `🔄 Loop item ${event.index + 1}/${event.total}: ${JSON.stringify(event.item).slice(0, 40)}`);
          break;
        }
        case 'error': {
          if (event.nodeId) setNodeState(event.nodeId, 'error');
          addLog('error', `✗ ${event.message}`);
          setErrors([event.message]);
          setTimeout(() => setErrors([]), 5000);
          break;
        }
        case 'done': {
          addLog('success', `✅ Workflow complete!`);
          setExecutionDone(true);
          // Emit completion to mentor
          socket.emit('student:flowStatus', {
            levelId: LEVELS[currentLevelIndex]?.id,
            status: 'passed',
            runOutput: event.allOutputs,
          });
          break;
        }
      }
    }

    setIsRunning(false);
  }, [nodes, edges, isRunning, currentLevelIndex, resetExecutionState, addLog]);

  // ── RESET ────────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    resetExecutionState();
    setLogEntries([]);
    setErrors([]);
  }, [resetExecutionState, setNodes, setEdges]);

  // ── Export Canvas as Image ──────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    const element = document.querySelector('.react-flow');
    if (!element) return;
    try {
      addLog('info', '📸 Generating screenshot...');
      const canvas = await html2canvas(element, { backgroundColor: '#0f0f19', scale: 2 });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `flow-lab-${LEVELS[currentLevelIndex]?.id || 'export'}.png`;
      a.click();
      addLog('success', '🖼 Screenshot downloaded!');
    } catch (err) {
      console.error(err);
      addLog('error', '✗ Failed to export screenshot');
    }
  }, [currentLevelIndex, addLog]);

  const level = LEVELS[currentLevelIndex];

  return (
    <div className="flow-lab-page">
      {/* ── Header Toolbar ─────────────────────────────────────────────────── */}
      <header className="flow-lab-header">
        <div className="flow-lab-logo">
          <div className="flow-lab-logo__icon">⚙</div>
          <span className="flow-lab-logo__text">Flow Lab</span>
          <span className="flow-lab-logo__beta">BETA</span>
        </div>

        <div className="flow-lab-header__divider" />

        <button
          className="btn-flow btn-flow--primary"
          onClick={handleRun}
          disabled={isRunning || nodes.length === 0}
          id="flow-run-btn"
        >
          {isRunning ? '⟳ Running…' : '▶ Run Workflow'}
        </button>

        <button
          className="btn-flow btn-flow--danger"
          onClick={handleReset}
          disabled={isRunning}
          id="flow-reset-btn"
        >
          ↺ Reset
        </button>

        <button
          className="btn-flow btn-flow--secondary"
          onClick={handleExport}
          title="Export Canvas Image"
          style={{ marginLeft: '12px' }}
        >
          📷 Export
        </button>

        <div className="flow-lab-header__spacer" />

        {/* Node count */}
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
          {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {edges.length} edge{edges.length !== 1 ? 's' : ''}
        </span>

        <div className="flow-lab-header__status">
          <div className="flow-lab-header__status-dot" style={{ background: connected ? '#10b981' : '#6b7280' }} />
          {connected ? 'Session Live' : 'Offline'}
        </div>

        <div className="flow-lab-header__divider" />

        <button
          className="btn-flow btn-flow--secondary btn-flow--sm"
          onClick={() => navigate('/dashboard')}
          id="flow-exit-btn"
        >
          ← Dashboard
        </button>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flow-lab-body">

        {/* Left palette */}
        <NodePalette disabled={isRunning} />

        {/* Canvas */}
        <div className="flow-canvas-area">
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            reactFlowWrapper={reactFlowWrapper}
          />

          {/* Level HUD (floats over canvas) */}
          <LevelPanel
            currentLevelIndex={currentLevelIndex}
            onLevelChange={handleLevelChange}
            executionDone={executionDone}
            onShowN8n={() => setShowN8nModal(true)}
            showN8nModal={showN8nModal}
            onCloseN8nModal={() => setShowN8nModal(false)}
          />

          {/* Error snackbar */}
          {errors.length > 0 && (
            <div className="flow-error-snack">
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          {/* Execution Log */}
          {logEntries.length > 0 && (
            <div className="flow-log" id="flow-exec-log">
              {logEntries.map((entry, i) => (
                <div key={i} className={`flow-log__entry flow-log__entry--${entry.type}`}>
                  <span className="flow-log__dot" />
                  {entry.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right config panel */}
        <NodeConfigPanel
          selectedNode={selectedNode}
          onConfigChange={onConfigChange}
          onClose={() => setSelectedNode(null)}
        />
      </div>

      {/* ── Mock UI Overlays ───────────────────────────────────────────────── */}
      <FakeInbox emails={emails} />
      <FakeSlack messages={slackMessages} />
      <FakeSpreadsheet rows={sheetRows} />
    </div>
  );
}

// ─── Export wrapped in ReactFlowProvider ─────────────────────────────────────
export default function FlowLab() {
  return (
    <ReactFlowProvider>
      <FlowLabInner />
    </ReactFlowProvider>
  );
}
