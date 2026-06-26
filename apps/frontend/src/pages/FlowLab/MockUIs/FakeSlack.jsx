import React, { useState, useEffect, useRef } from 'react';

const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa'];
function colorForChannel(ch) {
  let h = 0;
  for (let i = 0; i < ch.length; i++) h += ch.charCodeAt(i);
  return COLORS[h % COLORS.length];
}

// ─── FakeSlack ────────────────────────────────────────────────────────────────
export default function FakeSlack({ messages, onClose }) {
  const [visible, setVisible] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      setVisible(true);
      setActiveChannel(messages[messages.length - 1].channel);
    }
  }, [messages.length]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  if (!visible || messages.length === 0) return null;

  // Unique channels
  const channels = [...new Set(messages.map(m => m.channel))];
  const filtered = activeChannel
    ? messages.filter(m => m.channel === activeChannel)
    : messages;

  return (
    <div className="mock-ui mock-ui--slack">
      {/* Title bar */}
      <div className="mock-ui__titlebar">
        <div className="mock-ui__titlebar-dots">
          <span style={{ background: '#ef4444' }} />
          <span style={{ background: '#f59e0b' }} />
          <span style={{ background: '#10b981' }} />
        </div>
        <div className="mock-ui__titlebar-title">
          <svg width="14" height="14" viewBox="0 0 2447.6 2452.5" style={{ marginRight: '6px' }}><path fill="#e01e5a" d="M897.4 0C762.1 0 649.8 112.3 649.8 247.6c0 135.3 112.3 247.6 247.6 247.6h247.6V247.6C1145 112.3 1032.7 0 897.4 0zm0 661.8H246.6C111.3 661.8-1 774.1-1 909.4c0 135.3 112.3 247.6 247.6 247.6h650.8c135.3 0 247.6-112.3 247.6-247.6-.1-135.3-112.4-247.6-247.6-247.6z"/><path fill="#36c5f0" d="M2447.6 909.4c0-135.3-112.3-247.6-247.6-247.6-135.3 0-247.6 112.3-247.6 247.6v247.6h247.6c135.3.1 247.6-112.2 247.6-247.6zm-661.8 0V246.6c0-135.3-112.3-247.6-247.6-247.6-135.3 0-247.6 112.3-247.6 247.6v662.8c0 135.3 112.3 247.6 247.6 247.6 135.3 0 247.6-112.3 247.6-247.6z"/><path fill="#2eb67d" d="M1537.8 2452.5c135.3 0 247.6-112.3 247.6-247.6s-112.3-247.6-247.6-247.6h-247.6v247.6c0 135.4 112.3 247.6 247.6 247.6zm0-663.1h650.8c135.3 0 247.6-112.3 247.6-247.6s-112.3-247.6-247.6-247.6h-650.8c-135.3 0-247.6 112.3-247.6 247.6s112.3 247.6 247.6 247.6z"/><path fill="#ecb22e" d="M-1 1541.8c0 135.3 112.3 247.6 247.6 247.6s247.6-112.3 247.6-247.6v-247.6H246.5C111.2 1294.2-1 1406.5-1 1541.8zm661.8 0v652.8c0 135.3 112.3 247.6 247.6 247.6s247.6-112.3 247.6-247.6v-652.8c0-135.3-112.3-247.6-247.6-247.6-135.3 0-247.6 112.3-247.6 247.6z"/></svg>
          Mock Slack
        </div>
        <button className="mock-ui__close" onClick={() => setVisible(false)}>✕</button>
      </div>

      <div className="mock-slack__layout">
        {/* Channels sidebar */}
        <div className="mock-slack__sidebar">
          <div className="mock-slack__workspace">
            <span className="mock-slack__workspace-name">Improps Workspace</span>
          </div>
          <div className="mock-slack__section-title">Channels</div>
          {channels.map(ch => (
            <button
              key={ch}
              className={`mock-slack__channel ${activeChannel === ch ? 'mock-slack__channel--active' : ''}`}
              onClick={() => setActiveChannel(ch)}
              style={{ '--ch-color': colorForChannel(ch) }}
            >
              <span>#</span> {ch.replace('#', '')}
              {messages.filter(m => m.channel === ch).length > 0 && (
                <span className="mock-slack__unread">{messages.filter(m => m.channel === ch).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Message area */}
        <div className="mock-slack__main">
          <div className="mock-slack__channel-header">
            <strong># {(activeChannel || 'general').replace('#', '')}</strong>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
              {filtered.length} message{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="mock-slack__messages" ref={listRef}>
            {filtered.map((msg, i) => (
              <SlackMessage key={i} message={msg} isNew={i === filtered.length - 1} />
            ))}
          </div>
          <div className="mock-slack__input-bar">
            <div className="mock-slack__input-placeholder">
              Message #{(activeChannel || 'general').replace('#', '')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlackMessage({ message, isNew }) {
  const initial = (message.channel || 'B').replace('#', '')[0].toUpperCase();
  return (
    <div className={`mock-slack__message ${isNew ? 'mock-slack__message--new' : ''}`}>
      <div className="mock-slack__avatar" style={{ background: colorForChannel(message.channel || '') }}>
        {initial}
      </div>
      <div className="mock-slack__msg-body">
        <div className="mock-slack__msg-header">
          <span className="mock-slack__username">Flow Bot</span>
          <span className="mock-slack__timestamp">
            {new Date(message.postedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="mock-slack__msg-text">{message.message}</div>
      </div>
    </div>
  );
}
