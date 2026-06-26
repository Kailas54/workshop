import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NODE_DEFINITIONS, CATEGORIES } from './nodeDefinitions';

// ─── Custom Node Component ────────────────────────────────────────────────────
// IMPORTANT: React Flow connections only work with <Handle> components.
// Using plain <div> elements for handles causes the whole node to drag instead.
function FlowLabNode({ id, data, selected }) {
  const def = NODE_DEFINITIONS[data.type] || {};
  const category = CATEGORIES[def.category] || {};
  const isRunning = data.executionState === 'running';
  const isDone    = data.executionState === 'done';
  const isSkipped = data.executionState === 'skipped';
  const isError   = data.executionState === 'error';
  const nodeColor = def.color || category.color || '#6366f1';

  const handleBaseStyle = {
    width: 13,
    height: 13,
    borderRadius: '50%',
    border: `2px solid ${nodeColor}`,
    background: 'rgba(18,18,30,0.95)',
    cursor: 'crosshair',
  };

  return (
    <div
      className={[
        'flow-node',
        selected  ? 'flow-node--selected' : '',
        isRunning ? 'flow-node--running'  : '',
        isDone    ? 'flow-node--done'     : '',
        isSkipped ? 'flow-node--skipped'  : '',
        isError   ? 'flow-node--error'    : '',
      ].join(' ')}
      style={{ '--node-color': nodeColor }}
    >
      {/* ── Target handle — left side (input) ── */}
      {def.maxInputs !== 0 && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={handleBaseStyle}
        />
      )}

      {/* ── Node header ── */}
      <div className="flow-node__header">
        <span className="flow-node__icon">{def.icon || '◆'}</span>
        <span className="flow-node__label">{data.label || def.label}</span>
        {isRunning && <span className="flow-node__spinner" />}
        {isDone    && <span className="flow-node__badge flow-node__badge--done">✓</span>}
        {isError   && <span className="flow-node__badge flow-node__badge--error">!</span>}
      </div>

      {/* ── Output preview after execution ── */}
      {isDone && data.output && (
        <div className="flow-node__output-preview">
          <code>
            {JSON.stringify(data.output).slice(0, 60)}
            {JSON.stringify(data.output).length > 60 ? '…' : ''}
          </code>
        </div>
      )}

      {/* ── Source handles — right side (output) ── */}
      {data.type === 'if_else' ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ ...handleBaseStyle, top: '32%', background: '#10b981', borderColor: '#10b981' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ ...handleBaseStyle, top: '68%', background: '#ef4444', borderColor: '#ef4444' }}
          />
          <div className="flow-node__branches">
            <span className="flow-node__branch-label branch-true">TRUE</span>
            <span className="flow-node__branch-label branch-false">FALSE</span>
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          style={{ ...handleBaseStyle, background: nodeColor, borderColor: nodeColor }}
        />
      )}
    </div>
  );
}

// ─── Animated Edge Component ──────────────────────────────────────────────────
function AnimatedEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });
  const isActive = data?.active;
  const label    = data?.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: isActive ? '#a855f7' : 'rgba(255,255,255,0.2)',
          strokeWidth: isActive ? 2.5 : 1.5,
          filter: isActive ? 'drop-shadow(0 0 4px #a855f7)' : 'none',
          transition: 'stroke 0.3s, stroke-width 0.3s',
          ...style,
        }}
      />
      {isActive && (
        <circle r="5" fill="#a855f7" filter="drop-shadow(0 0 6px #a855f7)">
          <animateMotion dur="0.8s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <span style={{
              background: 'rgba(30,30,40,0.85)',
              color: '#a855f7',
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700,
            }}>
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// ─── Type registries (defined outside component to avoid re-render churn) ────
const NODE_TYPES = { flowLabNode: FlowLabNode };
const EDGE_TYPES = { animated: AnimatedEdge };

const CONNECTION_LINE_STYLE = { stroke: '#a855f7', strokeWidth: 2, strokeDasharray: '6 3' };
const DEFAULT_EDGE_OPTIONS  = {
  type: 'animated',
  data: { active: false },
  markerEnd: { type: 'ArrowClosed', color: 'rgba(255,255,255,0.35)' },
};

// ─── FlowCanvas ───────────────────────────────────────────────────────────────
export default function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect: externalOnConnect,
  onNodeClick,
  onPaneClick,
  onDrop,
  onDragOver,
  reactFlowWrapper,
}) {
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback((params) => {
    externalOnConnect({
      ...params,
      type: 'animated',
      data: { active: false },
      markerEnd: { type: 'ArrowClosed', color: 'rgba(255,255,255,0.35)' },
    });
  }, [externalOnConnect]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    onDrop(type, position);
  }, [screenToFlowPosition, onDrop]);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={handleDrop}
        onDragOver={onDragOver}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        connectionLineStyle={CONNECTION_LINE_STYLE}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background variant="dots" gap={20} size={1} color="rgba(255,255,255,0.08)" />
        <Controls
          style={{
            background: 'rgba(20,20,30,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
        <MiniMap
          style={{
            background: 'rgba(15,15,25,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          nodeColor={n => NODE_DEFINITIONS[n.data?.type]?.color || '#6366f1'}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>
    </div>
  );
}
