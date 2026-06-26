import React, { useState } from 'react';
import { NODE_DEFINITIONS, CATEGORIES, PALETTE_ORDER } from './nodeDefinitions';

const CATEGORY_KEYS = Object.keys(CATEGORIES);

export default function NodePalette({ disabled }) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState({});

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredByCategory = CATEGORY_KEYS.reduce((acc, cat) => {
    const nodes = PALETTE_ORDER
      .filter(key => {
        const def = NODE_DEFINITIONS[key];
        if (def.category !== cat) return false;
        if (!search) return true;
        return def.label.toLowerCase().includes(search.toLowerCase()) ||
               def.description.toLowerCase().includes(search.toLowerCase());
      });
    if (nodes.length > 0) acc[cat] = nodes;
    return acc;
  }, {});

  return (
    <aside className="flow-palette">
      <div className="flow-palette__header">
        <h3>Node Library</h3>
        <p>Drag nodes onto the canvas</p>
      </div>

      {/* Search */}
      <div className="flow-palette__search-wrap">
        <input
          className="flow-palette__search"
          type="text"
          placeholder="Search nodes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="flow-palette__search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Categories */}
      <div className="flow-palette__categories">
        {Object.entries(filteredByCategory).map(([catKey, nodeKeys]) => {
          const cat = CATEGORIES[catKey];
          const isCollapsed = collapsed[catKey];
          return (
            <div key={catKey} className="flow-palette__category">
              <button
                className="flow-palette__cat-header"
                onClick={() => setCollapsed(prev => ({ ...prev, [catKey]: !prev[catKey] }))}
                style={{ '--cat-color': cat.color }}
              >
                <span>{cat.emoji} {cat.label}</span>
                <span className={`flow-palette__chevron ${isCollapsed ? 'flow-palette__chevron--up' : ''}`}>▾</span>
              </button>

              {!isCollapsed && (
                <div className="flow-palette__nodes">
                  {nodeKeys.map(key => {
                    const def = NODE_DEFINITIONS[key];
                    return (
                      <div
                        key={key}
                        className={`flow-palette__node ${disabled ? 'flow-palette__node--disabled' : ''}`}
                        draggable={!disabled}
                        onDragStart={(e) => !disabled && onDragStart(e, key)}
                        title={def.description}
                        style={{ '--node-color': def.color }}
                      >
                        <span className="flow-palette__node-icon">{def.icon}</span>
                        <div className="flow-palette__node-info">
                          <span className="flow-palette__node-label">{def.label}</span>
                          <span className="flow-palette__node-desc">{def.description.slice(0, 50)}{def.description.length > 50 ? '…' : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(filteredByCategory).length === 0 && (
          <div className="flow-palette__empty">No nodes match "{search}"</div>
        )}
      </div>

      {/* Tips */}
      <div className="flow-palette__tips">
        <p>💡 <strong>Tip:</strong> Connect nodes by dragging from the circle on the right side of a node to the left side of the next.</p>
        <p>🗑 Press <kbd>Delete</kbd> to remove selected nodes/edges.</p>
      </div>
    </aside>
  );
}
