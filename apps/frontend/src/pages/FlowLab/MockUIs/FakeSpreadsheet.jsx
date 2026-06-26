import React, { useState, useEffect, useRef } from 'react';

// ─── FakeSpreadsheet ──────────────────────────────────────────────────────────
export default function FakeSpreadsheet({ rows, onClose }) {
  const [visible, setVisible] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState(null);
  const newRowRef = useRef(null);

  useEffect(() => {
    if (rows.length > 0) {
      setVisible(true);
      const latestIdx = rows.length - 1;
      setHighlightedRow(latestIdx);
      setTimeout(() => setHighlightedRow(null), 2000);
    }
  }, [rows.length]);

  useEffect(() => {
    if (newRowRef.current) {
      newRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [rows.length]);

  if (!visible || rows.length === 0) return null;

  // Collect all column keys
  const allCols = [...new Set(rows.flatMap(r => Object.keys(r.row || {})))];
  const colLetters = allCols.map((_, i) => String.fromCharCode(65 + i));

  return (
    <div className="mock-ui mock-ui--spreadsheet">
      {/* Title bar */}
      <div className="mock-ui__titlebar">
        <div className="mock-ui__titlebar-dots">
          <span style={{ background: '#ef4444' }} />
          <span style={{ background: '#f59e0b' }} />
          <span style={{ background: '#10b981' }} />
        </div>
        <div className="mock-ui__titlebar-title">
          <svg width="14" height="14" viewBox="0 0 48 48" style={{ marginRight: '6px' }}>
            <rect width="48" height="48" rx="8" fill="#0f9d58" />
            <rect x="8" y="8" width="32" height="4" rx="1" fill="white" opacity="0.8" />
            <rect x="8" y="16" width="32" height="4" rx="1" fill="white" opacity="0.6" />
            <rect x="8" y="24" width="32" height="4" rx="1" fill="white" opacity="0.6" />
            <rect x="8" y="32" width="20" height="4" rx="1" fill="white" opacity="0.6" />
          </svg>
          {rows[0]?.sheet || 'Sheet1'}
        </div>
        <button className="mock-ui__close" onClick={() => setVisible(false)}>✕</button>
      </div>

      {/* Toolbar */}
      <div className="mock-sheet__toolbar">
        <span className="mock-sheet__toolbar-btn">📊 {rows[0]?.sheet || 'Sheet1'}</span>
        <span className="mock-sheet__toolbar-btn">+ Add Sheet</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
          {rows.length} row{rows.length !== 1 ? 's' : ''} added
        </span>
      </div>

      {/* Grid */}
      <div className="mock-sheet__grid-wrap">
        <table className="mock-sheet__grid">
          <thead>
            <tr>
              <th className="mock-sheet__row-num" />
              {allCols.map((col, i) => (
                <th key={col} className="mock-sheet__col-header">
                  {colLetters[i]}
                </th>
              ))}
            </tr>
            {/* Header labels row */}
            <tr>
              <td className="mock-sheet__row-num" style={{ background: 'rgba(255,255,255,0.05)' }}>1</td>
              {allCols.map(col => (
                <td key={col} className="mock-sheet__cell mock-sheet__cell--header">
                  {col}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rowData, idx) => (
              <tr
                key={idx}
                ref={idx === rows.length - 1 ? newRowRef : null}
                className={`mock-sheet__row ${highlightedRow === idx ? 'mock-sheet__row--new' : ''}`}
              >
                <td className="mock-sheet__row-num">{idx + 2}</td>
                {allCols.map(col => (
                  <td key={col} className="mock-sheet__cell">
                    {String(rowData.row?.[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {/* Empty rows for visual padding */}
            {Array.from({ length: Math.max(0, 5 - rows.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="mock-sheet__row mock-sheet__row--empty">
                <td className="mock-sheet__row-num">{rows.length + i + 2}</td>
                {allCols.map(col => (
                  <td key={col} className="mock-sheet__cell" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
