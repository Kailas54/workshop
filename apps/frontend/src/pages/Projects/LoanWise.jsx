import React, { useState } from 'react';
import { Landmark, CheckCircle, XCircle, DollarSign, Percent, Calendar, User } from 'lucide-react';

export default function LoanWise({ executeFunction, isExecuting }) {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [annualRate, setAnnualRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(5);
  const [monthlyIncome, setMonthlyIncome] = useState(60000);
  const [age, setAge] = useState(30);

  const [result, setResult] = useState(null);

  const calculateLoan = async () => {
    const res = await executeFunction('calculate_emi_and_eligibility', {
      loan_amount: loanAmount,
      annual_rate: annualRate,
      tenure_years: tenureYears,
      monthly_income: monthlyIncome,
      age: age
    });

    if (res.success && res.data) {
      setResult(res.data);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0f172a', color: '#f8fafc', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
        
        {/* Left Form */}
        <div style={{ flex: 1, minWidth: '320px', padding: '32px', background: '#1e293b', borderRight: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ background: '#3b82f6', padding: '10px', borderRadius: '12px' }}>
              <Landmark size={24} color="#fff" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>LoanWise</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>
                <DollarSign size={16} /> Loan Amount
              </label>
              <input type="range" min="100000" max="5000000" step="50000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '8px', color: '#fff' }}>{formatCurrency(loanAmount)}</div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <Percent size={16} /> Interest (p.a.)
                </label>
                <div style={{ position: 'relative' }}>
                  <input type="number" step="0.1" value={annualRate} onChange={e => setAnnualRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <Calendar size={16} /> Tenure (Yrs)
                </label>
                <input type="number" min="1" max="30" value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }} />
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid #334155', margin: '8px 0' }} />

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <DollarSign size={16} /> Monthly Income
                </label>
                <input type="number" step="1000" value={monthlyIncome} onChange={e => setMonthlyIncome(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <User size={16} /> Age
                </label>
                <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }} />
              </div>
            </div>

            <button 
              style={{ width: '100%', padding: '14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: isExecuting ? 'wait' : 'pointer', marginTop: '16px', opacity: isExecuting ? 0.7 : 1 }}
              onClick={calculateLoan}
              disabled={isExecuting}
            >
              {isExecuting ? 'Processing...' : 'Calculate Eligibility'}
            </button>
          </div>
        </div>

        {/* Right Dashboard */}
        <div style={{ flex: 1.5, minWidth: '400px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
          {result ? (
            <div style={{ animation: 'slideIn 0.4s ease-out', height: '100%', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ margin: 0, color: '#94a3b8', fontWeight: 500 }}>Application Status</h3>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '24px', fontWeight: 600,
                  background: result.eligible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: result.eligible ? '#10b981' : '#ef4444',
                  border: `1px solid ${result.eligible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                  {result.eligible ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  {result.eligible ? 'Approved' : 'Declined'}
                </div>
              </div>

              {!result.eligible && result.reason && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '16px', marginBottom: '32px', color: '#fca5a5', borderRadius: '4px' }}>
                  {result.reason}
                </div>
              )}

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                  <div style={{ color: '#94a3b8', marginBottom: '12px', fontSize: '1.1rem' }}>Monthly EMI</div>
                  <div style={{ fontSize: '4rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1, textShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
                    {formatCurrency(result.emi)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Principal Amount</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(loanAmount)}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '8px' }}>Total Interest</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>{formatCurrency(result.total_interest)}</div>
                  </div>
                </div>
                
                <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))', padding: '24px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#e2e8f0', fontSize: '1.1rem' }}>Total Amount Payable</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{formatCurrency(result.total_payable)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <Landmark size={64} style={{ opacity: 0.2, marginBottom: '24px' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>Awaiting Application</div>
              <div style={{ fontSize: '0.9rem', marginTop: '8px', maxWidth: '300px', textAlign: 'center' }}>Configure the loan parameters on the left and run your Python eligibility logic.</div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
