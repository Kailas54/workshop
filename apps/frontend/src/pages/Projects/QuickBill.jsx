import React, { useState } from 'react';
import { Coffee, Plus, Minus, Receipt, CheckCircle } from 'lucide-react';

const MENU = [
  { id: 'm1', name: 'Cappuccino', price: 150 },
  { id: 'm2', name: 'Latte', price: 160 },
  { id: 'm3', name: 'Espresso', price: 120 },
  { id: 'm4', name: 'Blueberry Muffin', price: 180 },
  { id: 'm5', name: 'Croissant', price: 140 },
  { id: 'm6', name: 'Avocado Toast', price: 250 },
];

export default function QuickBill({ executeFunction, isExecuting }) {
  const [customerName, setCustomerName] = useState('Alice');
  const [tableNumber, setTableNumber] = useState(4);
  const [cart, setCart] = useState({});
  const [receipt, setReceipt] = useState(null);

  const updateQuantity = (id, delta) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const newCart = { ...prev };
      if (next === 0) delete newCart[id];
      else newCart[id] = next;
      return newCart;
    });
  };

  const handleGenerateBill = async () => {
    const items = Object.entries(cart).map(([id, qty]) => {
      const item = MENU.find(m => m.id === id);
      return { name: item.name, price: item.price, quantity: qty };
    });

    const res = await executeFunction('generate_bill', {
      customer_name: customerName,
      table_number: tableNumber,
      items: items
    });

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
            <input 
              type="number" 
              placeholder="Table" 
              value={tableNumber}
              onChange={e => setTableNumber(Number(e.target.value))}
              style={{ width: '80px', padding: '8px 12px', border: '1px solid #d6d3d1', borderRadius: '6px', fontSize: '0.9rem' }}
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', alignContent: 'start' }}>
          {MENU.map(item => (
            <div key={item.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e7e5e4', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
                <div style={{ color: '#78716c', fontSize: '0.85rem' }}>Rs. {item.price}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', background: '#f5f5f4', padding: '4px', borderRadius: '8px' }}>
                <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '4px', border: 'none', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', width: '30px', textAlign: 'center' }}>{cart[item.id] || 0}</span>
                <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '4px', border: 'none', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
            </div>
          ))}
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
                <div style={{ fontSize: '0.75rem', color: '#78716c' }}>Table {receipt.table_number} • {receipt.customer_name}</div>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #e7e5e4', paddingBottom: '16px', marginBottom: '16px' }}>
                {(receipt.line_items || []).map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716c' }}>Subtotal</span>
                  <span>Rs. {receipt.subtotal?.toFixed(2)}</span>
                </div>
                {receipt.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Discount</span>
                    <span>-Rs. {receipt.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716c' }}>Tax (5%)</span>
                  <span>Rs. {receipt.tax?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e7e5e4' }}>
                  <span>Total</span>
                  <span>Rs. {receipt.total?.toFixed(2)}</span>
                </div>
              </div>

              {receipt.is_vip && (
                <div style={{ marginTop: '20px', padding: '8px', background: '#fef3c7', color: '#b45309', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                  <CheckCircle size={14} /> VIP Customer
                </div>
              )}
              
              {receipt.message && (
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', fontStyle: 'italic', color: '#78716c' }}>
                  "{receipt.message}"
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#a8a29e', textAlign: 'center' }}>
              <Receipt size={48} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
              <div>No bill generated yet. Add items and run the code.</div>
            </div>
          )}
        </div>
        
        <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <button 
            style={{ width: '100%', padding: '14px', background: '#c2410c', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: isExecuting ? 'wait' : 'pointer', opacity: isExecuting ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={handleGenerateBill}
            disabled={isExecuting || Object.keys(cart).length === 0}
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
