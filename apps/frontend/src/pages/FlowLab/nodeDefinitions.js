// ─── Flow Lab Node Definitions ──────────────────────────────────────────────
// Each node is pure data — no React imports here, so this file can be used
// in both the canvas and the execution engine without circular deps.

export const CATEGORIES = {
  logic:         { label: 'Logic',         color: '#6366f1', emoji: '⚡' },
  communication: { label: 'Communication', color: '#ec4899', emoji: '💬' },
  data:          { label: 'Data',          color: '#10b981', emoji: '🗄️' },
  web:           { label: 'Web / API',     color: '#f59e0b', emoji: '🌐' },
  social:        { label: 'Social Media',  color: '#d946ef', emoji: '📱' },
  finance:       { label: 'Finance',       color: '#6366f1', emoji: '💳' },
  ai:            { label: 'AI & ML',       color: '#10b981', emoji: '🤖' },
};

// ─── Config field types ───────────────────────────────────────────────────────
// text | textarea | select | condition | code
// Each field: { key, label, type, placeholder?, options?, default? }

export const NODE_DEFINITIONS = {

  // ── Logic ──────────────────────────────────────────────────────────────────

  trigger: {
    category: 'logic',
    label: 'Trigger',
    description: 'Starts the workflow. Can be a manual click or a simulated webhook event.',
    icon: '▶',
    color: '#6366f1',
    maxInputs: 0,
    configFields: [
      {
        key: 'mode',
        label: 'Trigger Mode',
        type: 'select',
        options: ['Manual Click', 'Simulate Webhook'],
        default: 'Manual Click',
      },
      {
        key: 'webhookPayload',
        label: 'Webhook Payload (JSON)',
        type: 'code',
        placeholder: '{"event": "form_submitted", "name": "Alice", "rating": 4}',
        default: '{"event": "form_submitted", "name": "Alice", "email": "alice@example.com", "rating": 4}',
        showWhen: { key: 'mode', value: 'Simulate Webhook' },
      },
    ],
    mockOutput: (input, config) => {
      if (config.mode === 'Simulate Webhook') {
        try { return JSON.parse(config.webhookPayload || '{}'); } catch { return {}; }
      }
      return {
        triggeredAt: new Date().toISOString(),
        source: 'manual',
        name: 'Alice',
        email: 'alice@example.com',
        rating: 4,
      };
    },
    visualEffect: null,
  },

  webhook: {
    category: 'logic',
    label: 'Webhook (Incoming)',
    description: 'Simulates an external system sending an event to your workflow.',
    icon: '🔗',
    color: '#818cf8',
    maxInputs: 0,
    configFields: [
      {
        key: 'payload',
        label: 'Incoming Payload (JSON)',
        type: 'code',
        placeholder: '{"name": "Alice", "email": "alice@example.com", "score": 95}',
        default: '{"name": "Alice", "email": "alice@example.com", "score": 95}',
      },
    ],
    mockOutput: (input, config) => {
      try { return JSON.parse(config.payload || '{}'); } catch { return {}; }
    },
    visualEffect: null,
  },

  if_else: {
    category: 'logic',
    label: 'If / Else',
    description: 'Splits the workflow into two branches based on a condition.',
    icon: '⑂',
    color: '#a855f7',
    maxInputs: 1,
    configFields: [
      { key: 'field',    label: 'Field to Check',  type: 'text',   placeholder: 'rating',  default: 'rating' },
      { key: 'operator', label: 'Operator',         type: 'select', options: ['==', '!=', '<', '>', '<=', '>=', 'contains', 'not contains'], default: '<' },
      { key: 'value',    label: 'Compare Value',    type: 'text',   placeholder: '3',       default: '3' },
    ],
    mockOutput: (input, config) => {
      const fieldVal = input?.[config.field];
      const compareVal = isNaN(config.value) ? config.value : Number(config.value);
      let result = false;
      switch (config.operator) {
        case '==': result = fieldVal == compareVal; break;
        case '!=': result = fieldVal != compareVal; break;
        case '<':  result = fieldVal < compareVal;  break;
        case '>':  result = fieldVal > compareVal;  break;
        case '<=': result = fieldVal <= compareVal; break;
        case '>=': result = fieldVal >= compareVal; break;
        case 'contains':     result = String(fieldVal).includes(String(compareVal)); break;
        case 'not contains': result = !String(fieldVal).includes(String(compareVal)); break;
      }
      return { ...input, _branch: result ? 'true' : 'false', _conditionResult: result };
    },
    visualEffect: null,
    outputs: ['true', 'false'], // two named outputs
  },

  set_fields: {
    category: 'logic',
    label: 'Set Fields',
    description: 'Add, rename, or transform fields on the data passing through.',
    icon: '✏',
    color: '#0ea5e9',
    maxInputs: 1,
    configFields: [
      {
        key: 'assignments',
        label: 'Field Assignments (JSON)',
        type: 'code',
        placeholder: '{"greeting": "Hello {{name}}!", "timestamp": "{{$now}}"}',
        default: '{"greeting": "Hello {{name}}!", "processed": true}',
      },
    ],
    mockOutput: (input, config) => {
      let assignments = {};
      try { assignments = JSON.parse(config.assignments || '{}'); } catch { return input; }
      const output = { ...input };
      for (const [key, val] of Object.entries(assignments)) {
        // Simple template interpolation: {{fieldName}} → input[fieldName]
        let resolved = String(val);
        resolved = resolved.replace(/\{\{(\w+)\}\}/g, (_, k) => {
          if (k === '$now') return new Date().toISOString();
          return input?.[k] !== undefined ? input[k] : `{{${k}}}`;
        });
        // Try to parse back to original type
        if (resolved === 'true') output[key] = true;
        else if (resolved === 'false') output[key] = false;
        else if (!isNaN(resolved) && resolved !== '') output[key] = Number(resolved);
        else output[key] = resolved;
      }
      return output;
    },
    visualEffect: null,
  },

  loop: {
    category: 'logic',
    label: 'Loop',
    description: 'Iterates over an array field, running downstream nodes once per item.',
    icon: '🔄',
    color: '#14b8a6',
    maxInputs: 1,
    configFields: [
      { key: 'arrayField', label: 'Array Field Name', type: 'text', placeholder: 'items', default: 'items' },
    ],
    mockOutput: (input, config) => {
      const arr = input?.[config.arrayField] || [
        { id: 1, name: 'Item A' },
        { id: 2, name: 'Item B' },
        { id: 3, name: 'Item C' },
      ];
      // Returns first item for linear preview; engine handles actual iteration
      return { ...arr[0], _loopIndex: 0, _loopTotal: arr.length, _loopItems: arr };
    },
    visualEffect: null,
    isLoop: true,
  },

  code_node: {
    category: 'logic',
    label: 'Code Node',
    description: 'Transform data with a JavaScript snippet. Access input via the `input` variable.',
    icon: '{ }',
    color: '#f97316',
    maxInputs: 1,
    configFields: [
      {
        key: 'code',
        label: 'JavaScript Transform',
        type: 'code',
        placeholder: 'return { ...input, fullName: input.firstName + " " + input.lastName };',
        default: '// Transform the input object\n// Use "input" to access incoming data\nreturn {\n  ...input,\n  processed: true,\n  summary: `Processed: ${input.name || "unknown"}`,\n};',
      },
    ],
    mockOutput: (input, config) => {
      try {
        // Sandboxed JS execution
        // eslint-disable-next-line no-new-func
        const fn = new Function('input', config.code || 'return input;');
        const result = fn(input);
        return result && typeof result === 'object' ? result : { result };
      } catch (err) {
        return { ...input, _codeError: err.message };
      }
    },
    visualEffect: null,
  },

  // ── Communication ──────────────────────────────────────────────────────────

  send_email: {
    category: 'communication',
    label: 'Send Email',
    description: 'Sends a fake email. Watch it appear in the mock inbox panel!',
    icon: '✉',
    color: '#ec4899',
    maxInputs: 1,
    configFields: [
      { key: 'to',      label: 'To',      type: 'text',     placeholder: '{{email}}',                 default: '{{email}}' },
      { key: 'subject', label: 'Subject', type: 'text',     placeholder: 'Thanks for your response!', default: 'Thanks for reaching out, {{name}}!' },
      { key: 'body',    label: 'Body',    type: 'textarea', placeholder: 'Hi {{name}}, ...',           default: 'Hi {{name}},\n\nThanks for your feedback with rating {{rating}}.\n\nBest,\nThe Team' },
    ],
    mockOutput: (input, config) => {
      const resolve = (str) => String(str || '').replace(/\{\{(\w+)\}\}/g, (_, k) => input?.[k] ?? `{{${k}}}`);
      return {
        emailSent: true,
        to: resolve(config.to),
        subject: resolve(config.subject),
        body: resolve(config.body),
        sentAt: new Date().toISOString(),
      };
    },
    visualEffect: 'inbox',
  },

  slack_message: {
    category: 'communication',
    label: 'Slack Message',
    description: 'Posts a fake message to a Slack-style channel.',
    icon: '#',
    color: '#4ade80',
    maxInputs: 1,
    configFields: [
      { key: 'channel', label: 'Channel',  type: 'text',     placeholder: 'general',      default: 'notifications' },
      { key: 'message', label: 'Message',  type: 'textarea', placeholder: 'Hello world!', default: '🔔 New submission from {{name}} — Rating: {{rating}}' },
    ],
    mockOutput: (input, config) => {
      const resolve = (str) => String(str || '').replace(/\{\{(\w+)\}\}/g, (_, k) => input?.[k] ?? `{{${k}}}`);
      return {
        slackSent: true,
        channel: `#${config.channel || 'general'}`,
        message: resolve(config.message),
        postedAt: new Date().toISOString(),
      };
    },
    visualEffect: 'slack',
  },

  // ── Data / Storage ─────────────────────────────────────────────────────────

  google_sheets: {
    category: 'data',
    label: 'Google Sheets',
    description: 'Appends a row to a fake spreadsheet. Watch it update live!',
    icon: '📊',
    color: '#34d399',
    maxInputs: 1,
    configFields: [
      { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Responses', default: 'Form Responses' },
      {
        key: 'columns',
        label: 'Columns to Write (JSON array)',
        type: 'code',
        placeholder: '["name", "email", "rating"]',
        default: '["name", "email", "rating"]',
      },
    ],
    mockOutput: (input, config) => {
      let cols = ['name', 'email', 'rating'];
      try { cols = JSON.parse(config.columns || '[]'); } catch { /* use default */ }
      const row = {};
      cols.forEach(c => { row[c] = input?.[c] ?? '—'; });
      return { rowAppended: true, sheet: config.sheetName || 'Sheet1', row, rowIndex: Math.floor(Math.random() * 50) + 2 };
    },
    visualEffect: 'spreadsheet',
  },

  // ── Web / API ──────────────────────────────────────────────────────────────

  http_request: {
    category: 'web',
    label: 'HTTP Request',
    description: 'Makes a fake API call and returns a canned JSON response after a mock delay.',
    icon: '🌐',
    color: '#f59e0b',
    maxInputs: 1,
    configFields: [
      { key: 'method',      label: 'Method',       type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
      { key: 'url',         label: 'URL',          type: 'text',   placeholder: 'https://api.example.com/data', default: 'https://api.example.com/submit' },
      {
        key: 'mockResponse',
        label: 'Mock Response (JSON)',
        type: 'code',
        placeholder: '{"success": true, "id": "abc123"}',
        default: '{"success": true, "id": "resp_{{$random}}", "message": "Data received"}',
      },
    ],
    mockOutput: (input, config) => {
      let resp = { success: true, id: `resp_${Math.random().toString(36).slice(2, 8)}` };
      try {
        const raw = (config.mockResponse || '{}').replace(/\{\{\$random\}\}/g, Math.random().toString(36).slice(2, 8));
        resp = JSON.parse(raw);
      } catch { /* use default */ }
      return {
        status: 200,
        statusText: 'OK',
        url: config.url || '',
        method: config.method || 'GET',
        response: resp,
      };
    },
    visualEffect: null,
  },

  // ── New Business Nodes ─────────────────────────────────────────────────────

  whatsapp_message: {
    category: 'communication',
    label: 'WhatsApp',
    description: 'Sends a simulated WhatsApp message.',
    icon: '💬',
    color: '#22c55e', // WhatsApp green
    maxInputs: 1,
    configFields: [
      { key: 'to',      label: 'To (Phone Number)', type: 'text',     placeholder: '+1234567890', default: '{{phone}}' },
      { key: 'message', label: 'Message',           type: 'textarea', placeholder: 'Hello!',      default: 'Hi {{name}}, your order is confirmed!' },
    ],
    mockOutput: (input, config) => {
      const resolve = (str) => String(str || '').replace(/\{\{(\w+)\}\}/g, (_, k) => input?.[k] ?? `{{${k}}}`);
      return {
        whatsappSent: true,
        to: resolve(config.to),
        message: resolve(config.message),
        deliveredAt: new Date().toISOString(),
      };
    },
    visualEffect: null,
  },

  instagram_post: {
    category: 'social',
    label: 'Instagram',
    description: 'Publishes a fake photo or reel to an Instagram account.',
    icon: '📷',
    color: '#d946ef', // Insta-ish pink/purple
    maxInputs: 1,
    configFields: [
      { key: 'imageUrl', label: 'Image URL', type: 'text',     placeholder: 'https://...',  default: 'https://example.com/photo.jpg' },
      { key: 'caption',  label: 'Caption',   type: 'textarea', placeholder: 'Loving this!', default: 'Check out our latest update! 🚀 #flowlab' },
    ],
    mockOutput: (input, config) => {
      const resolve = (str) => String(str || '').replace(/\{\{(\w+)\}\}/g, (_, k) => input?.[k] ?? `{{${k}}}`);
      return {
        posted: true,
        platform: 'Instagram',
        mediaUrl: resolve(config.imageUrl),
        caption: resolve(config.caption),
        likesCount: 0,
        postId: `ig_${Math.random().toString(36).slice(2, 10)}`,
      };
    },
    visualEffect: null,
  },

  hubspot_crm: {
    category: 'data',
    label: 'HubSpot CRM',
    description: 'Creates or updates a contact in the fake HubSpot CRM.',
    icon: '📇',
    color: '#ff7a59', // HubSpot orange
    maxInputs: 1,
    configFields: [
      { key: 'action', label: 'Action',         type: 'select', options: ['Create Contact', 'Update Contact', 'Add Deal'], default: 'Create Contact' },
      { key: 'email',  label: 'Contact Email',  type: 'text',   placeholder: '{{email}}', default: '{{email}}' },
      { key: 'name',   label: 'Contact Name',   type: 'text',   placeholder: '{{name}}',  default: '{{name}}' },
    ],
    mockOutput: (input, config) => {
      const resolve = (str) => String(str || '').replace(/\{\{(\w+)\}\}/g, (_, k) => input?.[k] ?? `{{${k}}}`);
      return {
        crmActionCompleted: true,
        action: config.action,
        contact: {
          name: resolve(config.name),
          email: resolve(config.email),
        },
        hubspotId: Math.floor(Math.random() * 1000000),
      };
    },
    visualEffect: null,
  },

  stripe_payment: {
    category: 'finance',
    label: 'Stripe',
    description: 'Creates a fake Stripe payment intent or charge.',
    icon: '💳',
    color: '#6366f1', // Stripe blurple
    maxInputs: 1,
    configFields: [
      { key: 'amount',   label: 'Amount (cents)', type: 'text', placeholder: '9900', default: '{{amount}}' },
      { key: 'currency', label: 'Currency',       type: 'text', placeholder: 'usd',  default: 'usd' },
      { key: 'customer', label: 'Customer Email', type: 'text', placeholder: '{{email}}', default: '{{email}}' },
    ],
    mockOutput: (input, config) => {
      const resolve = (str) => String(str || '').replace(/\{\{(\w+)\}\}/g, (_, k) => input?.[k] ?? `{{${k}}}`);
      return {
        paymentIntentCreated: true,
        amount: resolve(config.amount),
        currency: config.currency,
        customer: resolve(config.customer),
        clientSecret: `pi_${Math.random().toString(36).slice(2, 12)}_secret`,
      };
    },
    visualEffect: null,
  },

  openai_chat: {
    category: 'ai',
    label: 'OpenAI (AI)',
    description: 'Generates a fake AI response using a simulated language model.',
    icon: '🤖',
    color: '#10b981', // OpenAI teal/green
    maxInputs: 1,
    configFields: [
      { key: 'model',  label: 'Model',  type: 'select', options: ['gpt-4o', 'gpt-3.5-turbo'], default: 'gpt-4o' },
      { key: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Summarize this...', default: 'Write a polite welcome message for {{name}}.' },
    ],
    mockOutput: (input, config) => {
      const resolve = (str) => String(str || '').replace(/\{\{(\w+)\}\}/g, (_, k) => input?.[k] ?? `{{${k}}}`);
      const resolvedPrompt = resolve(config.prompt);
      
      // Simple mock AI response logic based on prompt keywords
      let mockReply = `Here is a generated response based on: "${resolvedPrompt.substring(0, 30)}..."`;
      if (resolvedPrompt.toLowerCase().includes('welcome')) {
        mockReply = `Welcome aboard! We are thrilled to have you here. Let us know if you need any help.`;
      } else if (resolvedPrompt.toLowerCase().includes('summarize')) {
        mockReply = `Summary: The provided text discusses various key points briefly and concisely.`;
      }

      return {
        aiGenerated: true,
        modelUsed: config.model,
        promptTokens: Math.floor(Math.random() * 50) + 10,
        completionTokens: Math.floor(Math.random() * 100) + 20,
        message: mockReply,
      };
    },
    visualEffect: null,
  },
};

// Ordered list for palette display
export const PALETTE_ORDER = [
  'trigger', 'webhook', 'if_else', 'set_fields', 'loop', 'code_node',
  'send_email', 'slack_message', 'whatsapp_message', 'instagram_post',
  'hubspot_crm', 'google_sheets', 'stripe_payment', 'http_request', 'openai_chat'
];
