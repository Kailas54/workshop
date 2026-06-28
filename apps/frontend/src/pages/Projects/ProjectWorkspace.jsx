import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePyodide } from '../../components/Editor/usePyodide';
import { CodeEditor } from '../../components/Editor/CodeEditor';
import { ArrowLeft, Play, Layout, Loader2 } from 'lucide-react';

// We will import the project components lazily or directly.
import QuickBill from './QuickBill';
import VitalCheck from './VitalCheck';
import LoanWise from './LoanWise';
import QuizFlow from './QuizFlow';
import SimBank from './SimBank';

const PROJECT_REGISTRY = {
  quickbill: {
    title: 'QuickBill',
    Component: QuickBill,
    defaultCode: `def generate_bill(customer_name: str, table_number: int, items: list) -> dict:
    """
    items: list of {"name": str, "price": float, "quantity": int}

    TODO:
    1. Calculate subtotal (sum of price * quantity for each item)
    2. Apply discount: 10% off if subtotal > 500, else no discount
    3. Apply 5% tax on the discounted amount
    4. Flag is_vip = True if final total > 1000
    5. Build and return a receipt dict:
       {
         "customer_name": str,
         "table_number": int,
         "line_items": [f"{name} x{qty} - Rs.{line_total}", ...],
         "subtotal": float,
         "discount": float,
         "tax": float,
         "total": float,
         "is_vip": bool,
         "message": str
       }
    """
    # TODO: implement
    pass
`
  },
  vitalcheck: {
    title: 'VitalCheck',
    Component: VitalCheck,
    defaultCode: `def assess_health(height_cm: float, weight_kg: float, age: int, activity_level: str) -> dict:
    """
    TODO:
    1. Convert height to meters, calculate BMI = weight_kg / (height_m ** 2)
    2. Classify into category using if/elif/else:
       - BMI < 18.5: "Underweight"
       - 18.5 <= BMI < 25: "Normal"
       - 25 <= BMI < 30: "Overweight"
       - BMI >= 30: "Obese"
    3. Build a personalized recommendation string using logical operators
    4. Return:
       {
         "bmi": float,
         "category": str,
         "recommendation": str
       }
    """
    # TODO: implement
    pass
`
  },
  loanwise: {
    title: 'LoanWise',
    Component: LoanWise,
    defaultCode: `def calculate_emi_and_eligibility(loan_amount: float, annual_rate: float, tenure_years: int, monthly_income: float, age: int) -> dict:
    """
    TODO:
    1. Convert annual_rate to a monthly rate, tenure_years to months
    2. Calculate EMI using the standard formula:
       EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    3. Determine eligibility:
       - Eligible only if EMI <= 40% of monthly_income AND age < 60
    4. Return:
       {
         "emi": float,
         "total_payable": float,
         "total_interest": float,
         "eligible": bool,
         "reason": str
       }
    """
    # TODO: implement
    pass
`
  },
  quizflow: {
    title: 'QuizFlow',
    Component: QuizFlow,
    defaultCode: `def grade_quiz(submitted_answers: list, correct_answers: list, attempt_number: int) -> dict:
    """
    TODO:
    1. Loop through both lists together (for loop) comparing each pair
    2. Calculate score = number correct, percentage = score / total * 100
    3. Assign a grade band (>= 80%: "Excellent", >= 50%: "Pass", < 50%: "Needs Improvement")
    4. If percentage < 50 and attempt_number >= 2, add a "review_tip"
    5. Return:
       {
         "score": int,
         "total": int,
         "percentage": float,
         "grade_band": str,
         "per_question_results": [bool, bool, ...],
         "review_tip": str | None
       }
    """
    # TODO: implement
    pass
`
  },
  simbank: {
    title: 'SimBank',
    Component: SimBank,
    defaultCode: `def atm_action(action: str, pin_attempt: str, correct_pin: str, balance: float, amount: float, transaction_log: list) -> dict:
    """
    action: "check_pin", "balance", "deposit", "withdraw", "mini_statement"
    
    TODO:
    1. If action == "check_pin": compare pin_attempt to correct_pin
    2. If action == "deposit": add amount to balance
    3. If action == "withdraw": check amount <= 10000 and amount <= balance
    4. If action == "mini_statement": format last 5 entries from transaction_log
    5. Return:
       {
         "success": bool,
         "balance": float,
         "message": str,
         "statement_lines": list | None
       }
    """
    # TODO: implement
    pass
`
  }
};

export default function ProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isLoading, runCode } = usePyodide();
  
  const projectDef = PROJECT_REGISTRY[projectId];
  
  const [code, setCode] = useState(projectDef ? projectDef.defaultCode : '');
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!projectDef) {
    return <div style={{ padding: '24px' }}>Project not found</div>;
  }

  const ProjectComponent = projectDef.Component;

  // Bridge function passed to the UI component
  const executeFunction = async (funcName, kwargs) => {
    setIsExecuting(true);
    setErrorMsg(null);
    try {
      // 1. Evaluate the student's code to define the functions in Pyodide
      const evalRes = await runCode(code);
      if (!evalRes.success) {
        setErrorMsg(evalRes.error);
        return { success: false, error: evalRes.error };
      }

      // 2. Format kwargs for Python
      const argsStr = Object.entries(kwargs).map(([k, v]) => {
        // Simple serialization (works for primitives and simple arrays/dicts)
        if (typeof v === 'string') return `${k}="${v.replace(/"/g, '\\"')}"`;
        if (Array.isArray(v) || typeof v === 'object') return `${k}=${JSON.stringify(v)}`;
        return `${k}=${v}`;
      }).join(', ');

      const callCode = `${funcName}(${argsStr})`;
      
      // 3. Call the function
      const res = await runCode(callCode);
      if (!res.success) {
        setErrorMsg(res.error);
        return { success: false, error: res.error };
      }
      
      return { success: true, data: res.result };
    } catch (err) {
      setErrorMsg(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header" style={{ height: '60px', padding: '0 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => navigate('/projects')}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layout size={18} color="#a855f7" />
            <h1 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>{projectDef.title}</h1>
          </div>
        </div>
        <div>
          {isLoading && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Loader2 size={14} className="spin" /> Loading Python...</span>}
        </div>
      </header>

      <main className="main-content" style={{ display: 'flex', flexDirection: 'row', gap: '16px', padding: '16px', overflow: 'hidden' }}>
        {/* Left: Code Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>solution.py</h2>
            {errorMsg && (
              <span style={{ fontSize: '0.8rem', color: 'var(--status-red)', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                Error in code
              </span>
            )}
          </div>
          <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <CodeEditor 
              initialCode={code} 
              onCodeChange={setCode}
              readOnly={isLoading}
            />
          </div>
          {errorMsg && (
            <div className="terminal-container" style={{ height: '120px', flexShrink: 0, border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <div className="terminal-error">{errorMsg}</div>
            </div>
          )}
        </div>

        {/* Right: UI Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Live App Preview</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>UI updates when you run code</div>
          </div>
          <div className="glass-panel" style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)', position: 'relative' }}>
            <ProjectComponent executeFunction={executeFunction} isExecuting={isExecuting} />
          </div>
        </div>
      </main>
    </div>
  );
}
