import React, { useState } from 'react';

// ─── Level Definitions ────────────────────────────────────────────────────────
export const LEVELS = [
  {
    id: 'level-1',
    number: 1,
    title: 'Your First Automation',
    objective: 'Build a simple workflow: when triggered, send a fake email.',
    hint: 'Drag a Trigger node, then a Send Email node. Connect them. Click Run!',
    requiredNodes: ['trigger', 'send_email'],
    requiredEffect: 'inbox',
    n8nEquivalent: {
      title: 'This in real n8n',
      description: 'In real n8n, you\'d use a "Manual Trigger" node connected to a "Send Email" (Gmail/Outlook) node with your OAuth credentials. The concept is identical — n8n just connects to real email servers.',
      steps: [
        'Manual Trigger → executes the workflow on demand',
        'Gmail node → sends real email via Google OAuth',
        'You configure To/Subject/Body the same way as here!',
      ],
      emoji: '📧',
    },
  },
  {
    id: 'level-2',
    number: 2,
    title: 'Data Flows Between Nodes',
    objective: 'Use a Webhook trigger to receive data, transform it with Set Fields, then send a formatted email.',
    hint: 'Try Webhook → Set Fields → Send Email. In Set Fields, use {{name}} to reference the webhook data.',
    requiredNodes: ['webhook', 'set_fields', 'send_email'],
    requiredEffect: 'inbox',
    n8nEquivalent: {
      title: 'This in real n8n',
      description: 'In real n8n, a Webhook node listens at a real URL. When your app POSTs to it, the data flows through. The "Edit Fields" node (n8n\'s version of Set Fields) lets you reshape data using expressions like {{ $json.name }}.',
      steps: [
        'Webhook node → receives HTTP POST from any external app',
        'Edit Fields node → transforms/renames fields with expressions',
        'Gmail/Email node → sends formatted email with the transformed data',
      ],
      emoji: '🔗',
    },
  },
  {
    id: 'level-3',
    number: 3,
    title: 'Branching with If / Else',
    objective: 'Route data based on a condition: if rating < 3, create a support ticket (Slack alert); else send a thank-you email.',
    hint: 'Trigger → If/Else (field: "rating", op: "<", value: "3") → True branch: Slack Message, False branch: Send Email.',
    requiredNodes: ['trigger', 'if_else'],
    requiredEffect: null,
    n8nEquivalent: {
      title: 'This in real n8n',
      description: 'The "IF" node in n8n works identically — it routes data to one of two output connectors based on conditions. You can chain multiple IF nodes for complex routing, or use the "Switch" node for multi-branch logic.',
      steps: [
        'IF node → evaluates {{ $json.rating < 3 }}',
        'True branch → Slack node sends alert to #support-alerts channel',
        'False branch → Gmail node sends "Thanks for the 5-star review!" email',
      ],
      emoji: '⑂',
    },
  },
  {
    id: 'level-4',
    number: 4,
    title: 'Loops and Arrays',
    objective: 'Loop over a list of items and execute actions for each one.',
    hint: 'Trigger → Loop → Send Email. The loop will pass each item to the Email node one by one.',
    requiredNodes: ['trigger', 'loop', 'send_email'],
    requiredEffect: 'inbox',
    n8nEquivalent: {
      title: 'This in real n8n',
      description: 'The "Split In Batches" node (or the newer "Loop" node) in n8n takes an array of items and runs the downstream nodes once for each item.',
      steps: [
        'Loop node → takes an array and yields 1 item',
        'Gmail node → sends email for that specific item',
        'Loop node → loops back around for the next item until done',
      ],
      emoji: '🔄',
    },
  },
  {
    id: 'level-5',
    number: 5,
    title: 'Full Pipeline',
    objective: 'Combine Webhooks, Branches, and Mock APIs into a full pipeline.',
    hint: 'Webhook → If/Else (score > 90) → True: Google Sheets + Slack. False: Send Email.',
    requiredNodes: ['webhook', 'if_else', 'slack_message', 'send_email'],
    requiredEffect: null,
    n8nEquivalent: {
      title: 'This in real n8n',
      description: 'In n8n, you can build massive graphs. A single webhook can fan out to update your CRM (Google Sheets), notify your team (Slack), and email the customer simultaneously.',
      steps: [
        'Webhook node → catches event',
        'IF node → routes based on score',
        'Google Sheets node → appends row to CRM',
        'Slack node → alerts team',
      ],
      emoji: '🚀',
    },
  },
];

// ─── n8n Equivalent Modal ─────────────────────────────────────────────────────
function N8nModal({ level, onClose }) {
  const eq = level.n8nEquivalent;
  return (
    <div className="flow-modal-overlay" onClick={onClose}>
      <div className="flow-modal flow-modal--n8n" onClick={e => e.stopPropagation()}>
        <div className="flow-modal__header">
          <span style={{ fontSize: '2rem' }}>{eq.emoji}</span>
          <div>
            <div className="flow-modal__title">{eq.title}</div>
            <div className="flow-modal__subtitle">Level {level.number}: {level.title}</div>
          </div>
          <button className="flow-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="flow-modal__body">
          <div className="n8n-modal__bridge">
            <div className="n8n-modal__toy-label">🧪 Flow Lab (Simulator)</div>
            <div className="n8n-modal__arrow">→</div>
            <div className="n8n-modal__real-label">⚡ Real n8n</div>
          </div>
          <p className="n8n-modal__desc">{eq.description}</p>
          <div className="n8n-modal__steps">
            <div className="n8n-modal__steps-title">Real n8n workflow steps:</div>
            {eq.steps.map((step, i) => (
              <div key={i} className="n8n-modal__step">
                <span className="n8n-modal__step-num">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className="n8n-modal__cta">
            <span>🚀 You already understand the concept — n8n is just this, with real API keys.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Level Complete Modal ─────────────────────────────────────────────────────
function LevelCompleteModal({ level, onNext, onClose, isLast }) {
  return (
    <div className="flow-modal-overlay" onClick={onClose}>
      <div className="flow-modal flow-modal--complete" onClick={e => e.stopPropagation()}>
        <div className="flow-modal__confetti">🎉</div>
        <h2 className="flow-modal__title" style={{ textAlign: 'center' }}>Level {level.number} Complete!</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
          You've mastered <strong>{level.title}</strong>. Your workflow executed successfully.
        </p>
        <div className="flow-modal__actions">
          {!isLast && (
            <button className="btn-flow btn-flow--primary" onClick={onNext}>
              Next Level →
            </button>
          )}
          <button className="btn-flow btn-flow--secondary" onClick={onClose}>
            {isLast ? 'Finish' : 'Stay Here'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LevelPanel ───────────────────────────────────────────────────────────────
export default function LevelPanel({
  currentLevelIndex,
  onLevelChange,
  executionDone,
  onShowN8n,
  showN8nModal,
  onCloseN8nModal,
}) {
  const [showComplete, setShowComplete] = useState(false);
  const [prevExecDone, setPrevExecDone] = useState(false);

  // Show complete modal when execution finishes
  React.useEffect(() => {
    if (executionDone && !prevExecDone) {
      setShowComplete(true);
    }
    setPrevExecDone(executionDone);
  }, [executionDone]);

  const level = LEVELS[currentLevelIndex];
  if (!level) return null;

  const isLast = currentLevelIndex === LEVELS.length - 1;

  const handleNext = () => {
    setShowComplete(false);
    if (!isLast) onLevelChange(currentLevelIndex + 1);
  };

  return (
    <>
      {/* Level HUD — floating top bar */}
      <div className="flow-level-hud">
        <div className="flow-level-hud__level">
          <span className="flow-level-hud__badge">LVL {level.number}</span>
          <span className="flow-level-hud__title">{level.title}</span>
        </div>

        {/* Progress dots */}
        <div className="flow-level-hud__dots">
          {LEVELS.map((l, i) => (
            <button
              key={l.id}
              className={`flow-level-hud__dot ${i === currentLevelIndex ? 'active' : ''} ${i < currentLevelIndex ? 'done' : ''}`}
              onClick={() => onLevelChange(i)}
              title={`Level ${l.number}: ${l.title}`}
            />
          ))}
        </div>

        <button
          className="btn-flow btn-flow--ghost btn-flow--sm"
          onClick={onShowN8n}
          title="See the equivalent real n8n workflow"
        >
          ⚡ Real n8n Equivalent
        </button>
      </div>

      {/* Objective card — bottom left of canvas area */}
      <div className="flow-objective">
        <div className="flow-objective__label">🎯 Objective</div>
        <div className="flow-objective__text">{level.objective}</div>
        <div className="flow-objective__hint">💡 {level.hint}</div>
      </div>

      {/* Modals */}
      {showN8nModal && (
        <N8nModal level={level} onClose={onCloseN8nModal} />
      )}
      {showComplete && (
        <LevelCompleteModal
          level={level}
          onNext={handleNext}
          onClose={() => setShowComplete(false)}
          isLast={isLast}
        />
      )}
    </>
  );
}
