import React, { useState } from 'react';
import { NODE_DEFINITIONS } from './nodeDefinitions';

// ─── Condition Builder for If/Else ────────────────────────────────────────────
function ConditionBuilder({ config, onChange }) {
  return (
    <div className="config-condition">
      <div className="config-condition__row">
        <input
          className="config-field__input"
          value={config.field || ''}
          onChange={e => onChange({ ...config, field: e.target.value })}
          placeholder="Field (e.g. rating)"
        />
        <select
          className="config-field__select"
          value={config.operator || '<'}
          onChange={e => onChange({ ...config, operator: e.target.value })}
        >
          {['==', '!=', '<', '>', '<=', '>=', 'contains', 'not contains'].map(op => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
        <input
          className="config-field__input"
          value={config.value || ''}
          onChange={e => onChange({ ...config, value: e.target.value })}
          placeholder="Value (e.g. 3)"
        />
      </div>
      <div className="config-condition__preview">
        <code>if {config.field || 'field'} {config.operator || '<'} {config.value || 'value'}</code>
      </div>
    </div>
  );
}

// ─── Single Config Field ──────────────────────────────────────────────────────
function ConfigField({ field, value, onChange }) {
  const handleChange = (newVal) => onChange(field.key, newVal);

  switch (field.type) {
    case 'text':
      return (
        <div className="config-field">
          <label className="config-field__label">{field.label}</label>
          <input
            className="config-field__input"
            type="text"
            value={value ?? field.default ?? ''}
            onChange={e => handleChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="config-field">
          <label className="config-field__label">{field.label}</label>
          <textarea
            className="config-field__textarea"
            value={value ?? field.default ?? ''}
            onChange={e => handleChange(e.target.value)}
            placeholder={field.placeholder || ''}
            rows={4}
          />
          {field.key === 'body' && (
            <p className="config-field__hint">Use <code>{'{{fieldName}}'}</code> to insert data from previous nodes.</p>
          )}
        </div>
      );

    case 'select':
      return (
        <div className="config-field">
          <label className="config-field__label">{field.label}</label>
          <select
            className="config-field__select"
            value={value ?? field.default ?? field.options[0]}
            onChange={e => handleChange(e.target.value)}
          >
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );

    case 'code':
      return (
        <div className="config-field">
          <label className="config-field__label">{field.label}</label>
          <textarea
            className="config-field__textarea config-field__textarea--code"
            value={value ?? field.default ?? ''}
            onChange={e => handleChange(e.target.value)}
            placeholder={field.placeholder || ''}
            rows={6}
            spellCheck={false}
          />
          {field.key === 'code' && (
            <p className="config-field__hint">Access upstream data via the <code>input</code> variable. Use <code>return {'{ ... }'}</code>.</p>
          )}
        </div>
      );

    case 'condition':
      return <ConditionBuilder config={value || {}} onChange={newConfig => handleChange(newConfig)} />;

    default:
      return null;
  }
}

// ─── NodeConfigPanel ──────────────────────────────────────────────────────────
export default function NodeConfigPanel({ selectedNode, onConfigChange, onClose }) {
  const [activeTab, setActiveTab] = useState('config');

  if (!selectedNode) {
    return (
      <aside className="flow-config-panel flow-config-panel--empty">
        <div className="flow-config-panel__empty-state">
          <span style={{ fontSize: '2.5rem' }}>👆</span>
          <p>Click any node on the canvas to configure it.</p>
        </div>
      </aside>
    );
  }

  const nodeType = selectedNode.data?.type;
  const def = NODE_DEFINITIONS[nodeType];
  if (!def) return null;

  const config = selectedNode.data?.config || {};
  const output = selectedNode.data?.output;
  const input  = selectedNode.data?.input;

  const handleFieldChange = (key, value) => {
    onConfigChange(selectedNode.id, { ...config, [key]: value });
  };

  // Filter config fields based on showWhen condition
  const visibleFields = def.configFields.filter(f => {
    if (!f.showWhen) return true;
    return config[f.showWhen.key] === f.showWhen.value;
  });

  return (
    <aside className="flow-config-panel" style={{ '--node-color': def.color }}>
      {/* Header */}
      <div className="flow-config-panel__header">
        <div className="flow-config-panel__title">
          <span className="flow-config-panel__icon">{def.icon}</span>
          <div>
            <div className="flow-config-panel__name">{def.label}</div>
            <div className="flow-config-panel__desc">{def.description}</div>
          </div>
        </div>
        <button className="flow-config-panel__close" onClick={onClose}>✕</button>
      </div>

      {/* Tabs: Config | I/O Inspector */}
      <div className="flow-config-panel__tabs">
        <button
          className={`flow-config-panel__tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configure
        </button>
        <button
          className={`flow-config-panel__tab ${activeTab === 'io' ? 'active' : ''}`}
          onClick={() => setActiveTab('io')}
          disabled={!output && !input}
        >
          Data Inspector {(output || input) ? '●' : ''}
        </button>
      </div>

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="flow-config-panel__body">
          {visibleFields.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>No configuration needed.</p>
          ) : (
            visibleFields.map(field => (
              <ConfigField
                key={field.key}
                field={field}
                value={config[field.key]}
                onChange={handleFieldChange}
              />
            ))
          )}
        </div>
      )}

      {/* I/O Inspector Tab */}
      {activeTab === 'io' && (
        <div className="flow-config-panel__body flow-config-panel__io">
          {input && (
            <div className="io-block">
              <div className="io-block__label">📥 Input Data</div>
              <pre className="io-block__json">{JSON.stringify(input, null, 2)}</pre>
            </div>
          )}
          {output && (
            <div className="io-block">
              <div className="io-block__label">📤 Output Data</div>
              <pre className="io-block__json">{JSON.stringify(output, null, 2)}</pre>
            </div>
          )}
          {!input && !output && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Run the workflow to see data flowing through this node.</p>
          )}
        </div>
      )}
    </aside>
  );
}
