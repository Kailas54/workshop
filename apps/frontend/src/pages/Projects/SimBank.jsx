import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, Building2, ChevronRight, Lock, History, IndianRupee } from 'lucide-react';

export default function SimBank({ executeScript, isExecuting }) {
  const [screen, setScreen] = useState('welcome'); // welcome, pin, menu, deposit, withdraw, processing, message
  const [pinAttempt, setPinAttempt] = useState('');
  const [amount, setAmount] = useState('');
  
  // Bank State (simulated in frontend, managed by Python backend logic per action)
  const [balance, setBalance] = useState(15000);
  
  const [actionMessage, setActionMessage] = useState('');

  const CORRECT_PIN = '1234';

  const handleAction = async (actionType) => {
    setScreen('processing');
    
    // Call Python script
    const res = await executeScript(
      {
        action: actionType,
        pin_attempt: pinAttempt,
        correct_pin: CORRECT_PIN,
        balance: balance,
        amount: Number(amount) || 0
      },
      ['success', 'new_balance', 'message']
    );

    setTimeout(() => {
      if (res.success && res.data) {
        if (actionType === 'check_pin') {
          if (res.data.success) {
            setScreen('menu');
          } else {
            setActionMessage('Incorrect PIN. Please try again.');
            setScreen('message');
          }
        } else {
          // Update bank state from backend response
          if (res.data.new_balance !== undefined) setBalance(res.data.new_balance);
          
          setActionMessage(res.data.message || (res.data.success ? 'Transaction Successful' : 'Transaction Failed'));
          setScreen('message');
        }
      } else {
        setActionMessage(res.error || 'Python Error! Check your code.');
        setScreen('message');
      }
      setAmount('');
      if (actionType !== 'check_pin') setPinAttempt('');
    }, 800); // Artificial delay to simulate ATM processing
  };

  const handleNumpad = (num) => {
    if (screen === 'pin') {
      if (pinAttempt.length < 4) setPinAttempt(prev => prev + num);
    } else if (screen === 'deposit' || screen === 'withdraw') {
      setAmount(prev => prev + num);
    }
  };

  const handleClear = () => {
    if (screen === 'pin') setPinAttempt('');
    else setAmount('');
  };

  const handleEnter = () => {
    if (screen === 'pin' && pinAttempt.length === 4) {
      handleAction('check_pin');
    } else if (screen === 'deposit' && amount) {
      handleAction('deposit');
    } else if (screen === 'withdraw' && amount) {
      handleAction('withdraw');
    } else if (screen === 'message') {
      setScreen(pinAttempt.length === 4 && actionMessage !== 'Incorrect PIN. Please try again.' ? 'menu' : 'welcome');
      if (screen === 'message' && actionMessage === 'Incorrect PIN. Please try again.') {
         setPinAttempt('');
      }
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
            <Building2 size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: '#fff' }}>Welcome to SimBank</h2>
            <div style={{ color: '#94a3b8', marginBottom: '32px' }}>Please insert your virtual card</div>
            <button 
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
              onClick={() => setScreen('pin')}
            >
              <CreditCard size={20} /> Insert Card
            </button>
          </div>
        );
      
      case 'pin':
        return (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
            <Lock size={32} color="#94a3b8" style={{ marginBottom: '16px' }} />
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: '#fff' }}>Enter your 4-digit PIN</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', background: pinAttempt.length > i ? '#fff' : 'transparent', border: '2px solid #334155' }}></div>
              ))}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Hint: PIN is 1234</div>
          </div>
        );

      case 'menu':
        return (
          <div style={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: '#fff', textAlign: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>Select Transaction</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="atm-btn" onClick={() => handleAction('balance')} style={{ flex: 1, textAlign: 'left' }}>Balance Enquiry</button>
                <ChevronRight color="#3b82f6" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="atm-btn" onClick={() => setScreen('deposit')} style={{ flex: 1, textAlign: 'left' }}>Deposit Cash</button>
                <ChevronRight color="#3b82f6" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="atm-btn" onClick={() => setScreen('withdraw')} style={{ flex: 1, textAlign: 'left' }}>Withdraw Cash</button>
                <ChevronRight color="#3b82f6" />
              </div>
            </div>
            <button style={{ alignSelf: 'center', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: 'auto' }} onClick={() => { setPinAttempt(''); setScreen('welcome'); }}>
              Cancel & Exit
            </button>
          </div>
        );

      case 'deposit':
      case 'withdraw':
        return (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: '#fff' }}>Enter Amount to {screen === 'deposit' ? 'Deposit' : 'Withdraw'}</h2>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', color: '#fff', background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              <IndianRupee size={24} color="#94a3b8" />
              {amount || '0'}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Press Enter to proceed</div>
          </div>
        );

      case 'processing':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', animation: 'fadeIn 0.3s' }}>
            <div className="atm-loader" style={{ marginBottom: '24px' }}></div>
            <div style={{ fontSize: '1.2rem', color: '#fff' }}>Processing Transaction...</div>
            <div style={{ color: '#94a3b8', marginTop: '8px' }}>Please wait</div>
          </div>
        );

      case 'message':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', animation: 'fadeIn 0.3s', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '24px', lineHeight: 1.5 }}>{actionMessage}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Press any key to continue</div>
          </div>
        );


      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#020617', color: '#f8fafc', fontFamily: 'var(--font-sans)', padding: '24px', gap: '32px', justifyContent: 'center' }}>
      
      {/* ATM Machine Wrapper */}
      <div style={{ width: '400px', background: '#1e293b', borderRadius: '24px', padding: '24px', border: '2px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ATM Screen */}
        <div style={{ height: '300px', background: '#020617', borderRadius: '12px', border: '8px solid #0f172a', padding: '24px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(59,130,246,0.1)' }}>
          {renderScreen()}
        </div>

        {/* ATM Keypad */}
        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {/* Numbers */}
            <div style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, ' '].map((num, i) => (
                <button 
                  key={i} 
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '16px 0', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 600, cursor: num === ' ' ? 'default' : 'pointer', transition: 'background 0.1s' }}
                  onClick={() => num !== ' ' && handleNumpad(num.toString())}
                  onMouseDown={e => e.currentTarget.style.background = '#334155'}
                  onMouseUp={e => e.currentTarget.style.background = '#1e293b'}
                >
                  {num}
                </button>
              ))}
            </div>
            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: '12px' }}>
              <button style={{ background: '#ef4444', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }} onClick={handleClear}>CLEAR</button>
              <button style={{ background: '#f59e0b', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setAmount(''); if(screen!=='pin') setScreen('menu') }}>CANCEL</button>
              <button style={{ background: '#10b981', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }} onClick={handleEnter} disabled={isExecuting}>ENTER</button>
              <button style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}></button>
            </div>
          </div>
        </div>
        
        {/* Card Slot */}
        <div style={{ height: '8px', width: '120px', background: '#020617', margin: '0 auto', borderRadius: '4px', border: '1px solid #334155', borderTop: '2px solid #000' }}></div>

      </div>

      <style>{`
        .atm-btn {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.1rem;
          padding: 12px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .atm-btn:hover { background: #1e293b; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .atm-loader {
          width: 48px;
          height: 48px;
          border: 4px solid #1e293b;
          border-bottom-color: #3b82f6;
          border-radius: 50%;
          display: inline-block;
          animation: rotation 1s linear infinite;
        }
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
