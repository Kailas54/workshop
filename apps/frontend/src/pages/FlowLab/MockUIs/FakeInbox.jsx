import React, { useState, useEffect } from 'react';

// ─── FakeInbox — Email Mock UI ────────────────────────────────────────────────
export default function FakeInbox({ emails, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (emails.length > 0) setVisible(true);
  }, [emails.length]);

  if (!visible || emails.length === 0) return null;

  return (
    <div className="mock-ui mock-ui--inbox">
      {/* Title bar */}
      <div className="mock-ui__titlebar">
        <div className="mock-ui__titlebar-dots">
          <span style={{ background: '#ef4444' }} />
          <span style={{ background: '#f59e0b' }} />
          <span style={{ background: '#10b981' }} />
        </div>
        <div className="mock-ui__titlebar-title">✉ Mock Inbox</div>
        <button className="mock-ui__close" onClick={() => setVisible(false)}>✕</button>
      </div>

      {/* Sidebar + message list layout */}
      <div className="mock-inbox__layout">
        {/* Left sidebar */}
        <div className="mock-inbox__sidebar">
          <div className="mock-inbox__sidebar-item mock-inbox__sidebar-item--active">
            📥 Inbox <span className="mock-inbox__badge">{emails.length}</span>
          </div>
          <div className="mock-inbox__sidebar-item">📤 Sent</div>
          <div className="mock-inbox__sidebar-item">🗑 Trash</div>
        </div>

        {/* Emails list */}
        <div className="mock-inbox__list">
          {emails.map((email, i) => (
            <EmailCard key={i} email={email} isNew={i === emails.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmailCard({ email, isNew }) {
  const [expanded, setExpanded] = useState(isNew);
  const initials = (email.to || 'U').slice(0, 2).toUpperCase();

  return (
    <div
      className={`mock-inbox__email ${isNew ? 'mock-inbox__email--new' : ''}`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="mock-inbox__email-header">
        <div className="mock-inbox__avatar" style={{ background: isNew ? '#a855f7' : '#374151' }}>
          {initials}
        </div>
        <div className="mock-inbox__meta">
          <div className="mock-inbox__subject">
            {isNew && <span className="mock-inbox__new-dot" />}
            {email.subject}
          </div>
          <div className="mock-inbox__to">To: {email.to}</div>
        </div>
        <div className="mock-inbox__time">
          {new Date(email.sentAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {expanded && (
        <div className="mock-inbox__body">
          <pre>{email.body}</pre>
        </div>
      )}
    </div>
  );
}
