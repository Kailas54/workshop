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
    defaultCode: `# Inputs provided:
# item1_name (str), item1_price (float), item1_qty (int)
# item2_name (str), item2_price (float), item2_qty (int)

# TODO:
# 1. Calculate subtotal
# 2. Apply discount: 10% off if subtotal > 500, else 0
# 3. Apply 5% tax on the discounted amount
# 4. Calculate total
# 5. Set is_vip to True if total > 1000, else False

# Write your code below:

subtotal = 0
discount = 0
tax = 0
total = 0
is_vip = False
`
  },
  vitalcheck: {
    title: 'VitalCheck',
    Component: VitalCheck,
    defaultCode: `# Inputs provided:
# height_cm (float), weight_kg (float), age (int), activity_level (str)

# TODO:
# 1. Convert height to meters, calculate bmi = weight_kg / (height_m ** 2)
# 2. Set category based on bmi:
#    - bmi < 18.5: "Underweight"
#    - 18.5 <= bmi < 25: "Normal"
#    - 25 <= bmi < 30: "Overweight"
#    - bmi >= 30: "Obese"
# 3. Set recommendation string

# Write your code below:

bmi = 0
category = "Unknown"
recommendation = ""
`
  },
  loanwise: {
    title: 'LoanWise',
    Component: LoanWise,
    defaultCode: `# Inputs provided:
# loan_amount (float), annual_rate (float), tenure_years (int), monthly_income (float), age (int)

# TODO:
# 1. Convert annual_rate to a monthly rate, tenure_years to months
# 2. Calculate emi = P * r * (1+r)^n / ((1+r)^n - 1)
# 3. Calculate total_payable and total_interest
# 4. Set eligible to True if emi <= 40% of monthly_income AND age < 60
# 5. Set reason if not eligible

# Write your code below:

emi = 0
total_payable = 0
total_interest = 0
eligible = False
reason = ""
`
  },
  quizflow: {
    title: 'QuizFlow',
    Component: QuizFlow,
    defaultCode: `# Inputs provided:
# q1_ans, q1_correct
# q2_ans, q2_correct
# q3_ans, q3_correct
# attempt_number

# TODO:
# 1. Set q1_is_correct, q2_is_correct, q3_is_correct (True/False)
# 2. Calculate score (0 to 3) and percentage (0 to 100)
# 3. Set grade_band (>=80: "Excellent", >=50: "Pass", <50: "Needs Improvement")
# 4. Set review_tip if percentage < 50 and attempt_number >= 2

# Write your code below:

q1_is_correct = False
q2_is_correct = False
q3_is_correct = False
score = 0
percentage = 0
grade_band = ""
review_tip = ""
`
  },
  simbank: {
    title: 'SimBank',
    Component: SimBank,
    defaultCode: `# Inputs provided:
# action (str): "check_pin", "balance", "deposit", "withdraw"
# pin_attempt (str), correct_pin (str), balance (float), amount (float)

# TODO:
# 1. If pin_attempt != correct_pin: set success = False, message = "Incorrect PIN"
# 2. If action == "deposit": add amount to balance, set success = True
# 3. If action == "withdraw": check amount <= 10000 and amount <= balance
# 4. Set new_balance = balance

# Write your code below:

success = False
message = ""
new_balance = balance
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
  const executeScript = async (kwargs, expectedOutputs) => {
    setIsExecuting(true);
    setErrorMsg(null);
    try {
      // 1. Format kwargs as variable assignments
      const assignments = Object.entries(kwargs).map(([k, v]) => {
        if (typeof v === 'string') return `${k} = "${v.replace(/"/g, '\\"')}"`;
        if (typeof v === 'boolean') return `${k} = ${v ? 'True' : 'False'}`;
        if (v === null || v === undefined) return `${k} = None`;
        return `${k} = ${v}`;
      }).join('\n');

      // 2. Build extraction dict
      const extractionDict = expectedOutputs.map(out => `"${out}": globals().get("${out}")`).join(', ');

      const fullCode = `
import json
${assignments}

${code}

_result = {${extractionDict}}
json.dumps(_result)
`;

      // 3. Run the code
      const res = await runCode(fullCode);
      if (!res.success) {
        setErrorMsg(res.error + "\n\n--- DEBUG FULL CODE ---\n" + fullCode);
        return { success: false, error: res.error };
      }
      
      // Try to parse the JSON output
      let parsedData;
      try {
        parsedData = JSON.parse(res.result);
      } catch (e) {
         // Fallback if the code doesn't evaluate cleanly to the string (e.g. syntax error in student code)
         return { success: false, error: "Failed to read output variables." };
      }

      return { success: true, data: parsedData };
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
            <ProjectComponent executeScript={executeScript} isExecuting={isExecuting} />
          </div>
        </div>
      </main>
    </div>
  );
}
