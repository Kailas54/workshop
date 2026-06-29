import React, { useState } from 'react';
import { Coffee, Plus, Minus, Receipt, CheckCircle } from 'lucide-react';

export default function QuickBill({ executeScript, isExecuting }) {
  const [customerName, setCustomerName] = useState('Alice');
  
  const [item1Qty, setItem1Qty] = useState(2);
  const [item2Qty, setItem2Qty] = useState(1);

  const item1Name = "Cappuccino";
  const item1Price = 150.0;

  const item2Name = "Blueberry Muffin";
  const item2Price = 180.0;

  const [receipt, setReceipt] = useState(null);

  const handleGenerateBill = async () => {
    const res = await executeScript(
      {
        item1_name: item1Name,
        item1_price: item1Price,
        item1_qty: item1Qty,
        item2_name: item2Name,
        item2_price: item2Price,
        item2_qty: item2Qty
      },
      ['subtotal', 'discount', 'tax', 'total', 'is_vip']
    );

    if (res.success && res.data) {
      setReceipt(res.data);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#fdfbf7', color: '#4a3f35', fontFamily: 'var(--font-sans)' }}>
      {/* Left: POS Menu */}
      <div style={{ flex: 1, borderRight: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c' }}>
            <Coffee size={24} /> QuickBill POS
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Customer Name" 
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #d6d3d1', borderRadius: '6px', fontSize: '0.9rem' }}
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item1Name}</div>
              <div style={{ color: '#78716c', fontSize: '0.9rem' }}>Rs. {item1Price}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f4', padding: '4px', borderRadius: '8px', gap: '8px' }}>
              <button onClick={() => setItem1Qty(Math.max(0, item1Qty - 1))} style={{ padding: '8px', border: 'none', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={16} /></button>
              <span style={{ fontWeight: 600, fontSize: '1.1rem', width: '30px', textAlign: 'center' }}>{item1Qty}</span>
              <button onClick={() => setItem1Qty(item1Qty + 1)} style={{ padding: '8px', border: 'none', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} /></button>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item2Name}</div>
              <div style={{ color: '#78716c', fontSize: '0.9rem' }}>Rs. {item2Price}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f4', padding: '4px', borderRadius: '8px', gap: '8px' }}>
              <button onClick={() => setItem2Qty(Math.max(0, item2Qty - 1))} style={{ padding: '8px', border: 'none', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={16} /></button>
              <span style={{ fontWeight: 600, fontSize: '1.1rem', width: '30px', textAlign: 'center' }}>{item2Qty}</span>
              <button onClick={() => setItem2Qty(item2Qty + 1)} style={{ padding: '8px', border: 'none', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} /></button>
            </div>
          </div>

        </div>
      </div>

      {/* Right: Summary & Receipt */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', background: '#f5f5f4' }}>
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {receipt ? (
            <div style={{ 
              background: '#fff', width: '100%', padding: '24px', position: 'relative', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
              borderTop: '4px dashed #e7e5e4', borderBottom: '4px dashed #e7e5e4',
              animation: 'slideUp 0.3s ease-out'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#c2410c' }}>Café Python</h3>
                <div style={{ fontSize: '0.75rem', color: '#78716c' }}>{customerName}</div>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #e7e5e4', paddingBottom: '16px', marginBottom: '16px' }}>
                {item1Qty > 0 && <div>{item1Name} x{item1Qty}</div>}
                {item2Qty > 0 && <div>{item2Name} x{item2Qty}</div>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716c' }}>Subtotal</span>
                  <span>Rs. {Number(receipt.subtotal || 0).toFixed(2)}</span>
                </div>
                {Number(receipt.discount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Discount</span>
                    <span>-Rs. {Number(receipt.discount).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716c' }}>Tax (5%)</span>
                  <span>Rs. {Number(receipt.tax || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e7e5e4' }}>
                  <span>Total</span>
                  <span>Rs. {Number(receipt.total || 0).toFixed(2)}</span>
                </div>
              </div>

              {receipt.is_vip && (
                <div style={{ marginTop: '20px', padding: '8px', background: '#fef3c7', color: '#b45309', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                  <CheckCircle size={14} /> VIP Customer
                </div>
              )}
              
            </div>
          ) : (
            <div style={{ color: '#a8a29e', textAlign: 'center' }}>
              <Receipt size={48} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
              <div>No bill generated yet. Set quantities and run code.</div>
            </div>
          )}
        </div>
        
        <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <button 
            style={{ width: '100%', padding: '14px', background: '#c2410c', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: isExecuting ? 'wait' : 'pointer', opacity: isExecuting ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={handleGenerateBill}
            disabled={isExecuting}
          >
            {isExecuting ? 'Processing...' : 'Generate Bill'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

