import React, { useState, useEffect } from 'react';
import { BookOpen, Check, X, RefreshCw } from 'lucide-react';

const QUESTIONS = [
  { id: 'q1', text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
  { id: 'q2', text: 'What is the largest mammal in the world?', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'], answer: 'Blue Whale' },
  { id: 'q3', text: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], answer: 'William Shakespeare' }
];

export default function QuizFlow({ executeScript, isExecuting }) {
  const [answers, setAnswers] = useState({});
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [result, setResult] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);

  const handleSelect = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const submitQuiz = async () => {
    const res = await executeScript(
      {
        q1_ans: answers['q1'] || '',
        q1_correct: QUESTIONS[0].answer,
        q2_ans: answers['q2'] || '',
        q2_correct: QUESTIONS[1].answer,
        q3_ans: answers['q3'] || '',
        q3_correct: QUESTIONS[2].answer,
        attempt_number: attemptNumber
      },
      ['score', 'percentage', 'grade_band', 'q1_is_correct', 'q2_is_correct', 'q3_is_correct', 'review_tip']
    );

    if (res.success && res.data) {
      setResult(res.data);
    }
  };

  const handleRetry = () => {
    setAttemptNumber(prev => prev + 1);
    setAnswers({});
    setResult(null);
  };

  useEffect(() => {
    if (result && result.percentage !== undefined) {
      setDisplayScore(0);
      const target = result.percentage;
      const duration = 1000;
      const steps = 20;
      const stepValue = target / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += stepValue;
        if (current >= target) {
          setDisplayScore(target);
          clearInterval(interval);
        } else {
          setDisplayScore(current);
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }
  }, [result]);

  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  return (
    <div style={{ display: 'flex', height: '100%', background: '#faf5ff', color: '#3b0764', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '32px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', color: '#7e22ce', marginBottom: '32px' }}>
          <BookOpen size={32} />
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>QuizFlow</h1>
        </div>

        {!result ? (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontWeight: 600, color: '#6b21a8' }}>General Knowledge Assessment</div>
              <div style={{ background: '#f3e8ff', color: '#7e22ce', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700 }}>
                Attempt {attemptNumber}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {QUESTIONS.map((q, i) => (
                <div key={q.id} style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(126, 34, 206, 0.05)', border: '1px solid #f3e8ff' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '16px', color: '#4c1d95' }}>
                    {i + 1}. {q.text}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map(opt => (
                      <label 
                        key={opt} 
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                          borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                          border: answers[q.id] === opt ? '2px solid #9333ea' : '1px solid #e9d5ff',
                          background: answers[q.id] === opt ? '#faf5ff' : '#fff'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={q.id} 
                          value={opt} 
                          checked={answers[q.id] === opt} 
                          onChange={() => handleSelect(q.id, opt)}
                          style={{ accentColor: '#9333ea', width: '18px', height: '18px' }}
                        />
                        <span style={{ fontWeight: answers[q.id] === opt ? 600 : 400, color: answers[q.id] === opt ? '#6b21a8' : '#334155' }}>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <button 
                style={{ 
                  padding: '16px 48px', background: allAnswered ? '#7e22ce' : '#d8b4fe', color: '#fff', 
                  border: 'none', borderRadius: '32px', fontSize: '1.1rem', fontWeight: 700, 
                  cursor: (isExecuting || !allAnswered) ? 'not-allowed' : 'pointer', 
                  boxShadow: allAnswered ? '0 10px 25px rgba(126, 34, 206, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={submitQuiz}
                disabled={isExecuting || !allAnswered}
              >
                {isExecuting ? 'Grading...' : 'Submit Answers'}
              </button>
              {!allAnswered && <div style={{ fontSize: '0.8rem', color: '#a855f7', marginTop: '12px' }}>Please answer all questions before submitting.</div>}
            </div>
          </div>
        ) : (
          <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            {/* Results Screen */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 30px rgba(126, 34, 206, 0.1)', textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', color: '#4c1d95' }}>Assessment Complete</h2>
              <div style={{ fontSize: '1.1rem', color: '#7e22ce', fontWeight: 600, marginBottom: '32px' }}>{result.grade_band}</div>
              
              <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 32px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3e8ff"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={result.percentage >= 50 ? '#10b981' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${displayScore}, 100`}
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4c1d95', lineHeight: 1 }}>{Math.round(displayScore)}%</div>
                  <div style={{ fontSize: '0.9rem', color: '#6b21a8', marginTop: '4px' }}>{result.score} / 3</div>
                </div>
              </div>

              {result.review_tip && (
                <div style={{ background: '#fffbeb', color: '#b45309', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'left', border: '1px solid #fde68a' }}>
                  <strong>💡 Tip:</strong> {result.review_tip}
                </div>
              )}

              {result.percentage < 100 && (
                <button 
                  onClick={handleRetry}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#f3e8ff', color: '#7e22ce', border: 'none', borderRadius: '24px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <RefreshCw size={16} /> Try Again
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ color: '#4c1d95', margin: '0 0 8px 0' }}>Detailed Review</h3>
              {QUESTIONS.map((q, i) => {
                const isCorrectVar = `q${i+1}_is_correct`;
                const isCorrect = result[isCorrectVar] === true;
                const submitted = answers[q.id];
                return (
                  <div key={q.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ marginTop: '2px' }}>
                        {isCorrect ? <Check size={20} color="#10b981" /> : <X size={20} color="#ef4444" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#334155', marginBottom: '8px' }}>{q.text}</div>
                        <div style={{ fontSize: '0.9rem', color: isCorrect ? '#10b981' : '#ef4444', marginBottom: '4px' }}>
                          Your answer: <strong>{submitted}</strong>
                        </div>
                        {!isCorrect && (
                          <div style={{ fontSize: '0.9rem', color: '#10b981' }}>
                            Correct answer: <strong>{q.answer}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
