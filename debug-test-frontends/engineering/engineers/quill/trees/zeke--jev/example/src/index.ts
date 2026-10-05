export interface Env {
  AI: Ai;
}

interface JevAnswer {
  type: "noul" | "choice" | "score";
  noul?: number;
  choice?: string;
  score?: number;
  legend?: Record<string, string>;
  probabilities?: Record<string, number>;
  confidence?: number;
}

interface JevResponse {
  model: string;
  answers: Record<string, JevAnswer>;
  usage: { input_tokens: number; output_tokens: number };
}

const QUESTIONS = {
  department: {
    type: "choice" as const,
    instructions: "Which team should handle this support message?",
    criteria: {
      billing: "Payments, invoicing, refunds, subscriptions",
      technical: "Bugs, outages, integrations",
      sales: "Pricing, upgrades, new accounts",
      other: "Anything that does not fit the other departments",
    },
  },
  urgency: {
    type: "noul" as const,
    instructions: "Does this message convey urgency?",
    criteria: {
      true: "Explicitly time-sensitive, asks for action today, or mentions losing money or customers",
      false: "No deadline and no consequence is mentioned",
    },
  },
  frustration: {
    type: "score" as const,
    instructions: "How frustrated is the author of this message?",
    criteria: ["Calm, just stating facts", "Frustrated but civil", "Very angry or threatening to leave"],
  },
};

async function handleAnalyze(request: Request, env: Env): Promise<Response> {
  const { message } = await request.json<{ message: string }>();
  if (!message || typeof message !== "string" || message.length > 2000) {
    return Response.json({ error: "Provide a message (max 2000 chars)." }, { status: 400 });
  }

  const start = Date.now();
  const result = (await env.AI.run(
    "typesafe/jev",
    { state: message, questions: QUESTIONS },
    { gateway: { id: "default" } }
  )) as { result: JevResponse };
  const latencyMs = Date.now() - start;

  return Response.json({ ...result.result, latencyMs });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/analyze" && request.method === "POST") {
      try {
        return await handleAnalyze(request, env);
      } catch (err) {
        return Response.json({ error: String(err) }, { status: 500 });
      }
    }

    return new Response(PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  },
} satisfies ExportedHandler<Env>;

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Jev Triage Playground</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #0b0d10;
    --panel: #14171b;
    --border: #262b31;
    --text: #e7eaee;
    --muted: #8a929e;
    --accent: #f6821f;
    --high: #3fb950;
    --med: #d29922;
    --low: #f85149;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 2rem 1rem 4rem;
  }
  .wrap { max-width: 760px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  .sub { color: var(--muted); margin-top: 0; margin-bottom: 1.75rem; font-size: 0.95rem; }
  .sub a { color: var(--accent); }
  textarea {
    width: 100%;
    min-height: 90px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    padding: 0.75rem 0.9rem;
    font-size: 0.95rem;
    resize: vertical;
    font-family: inherit;
  }
  .presets { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.75rem 0; }
  .preset {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    border-radius: 999px;
    padding: 0.3rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .preset:hover { border-color: var(--accent); color: var(--text); }
  button.run {
    background: var(--accent);
    color: #14171b;
    border: none;
    border-radius: 10px;
    padding: 0.65rem 1.4rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
  }
  button.run:disabled { opacity: 0.5; cursor: default; }
  .meta { color: var(--muted); font-size: 0.8rem; margin-left: 0.75rem; }
  .results { margin-top: 2rem; display: none; }
  .card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
  }
  .card h3 {
    margin: 0 0 0.6rem;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .confidence-tag {
    font-size: 0.7rem;
    text-transform: none;
    letter-spacing: 0;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
  }
  .bar-row { display: flex; align-items: center; gap: 0.6rem; margin: 0.35rem 0; font-size: 0.9rem; }
  .bar-label { width: 90px; flex-shrink: 0; color: var(--text); }
  .bar-track { flex: 1; background: #1d2127; border-radius: 6px; height: 10px; overflow: hidden; }
  .bar-fill { height: 100%; background: var(--accent); border-radius: 6px; transition: width 0.4s ease; }
  .bar-fill.winner { background: var(--high); }
  .bar-pct { width: 42px; text-align: right; color: var(--muted); font-size: 0.8rem; }
  .verdict {
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-top: 1.5rem;
    border: 1px solid var(--border);
  }
  .verdict.auto { border-color: var(--high); background: rgba(63, 185, 80, 0.08); }
  .verdict.confirm { border-color: var(--med); background: rgba(210, 153, 34, 0.08); }
  .verdict.human { border-color: var(--low); background: rgba(248, 81, 73, 0.08); }
  .verdict h3 { margin: 0 0 0.3rem; font-size: 1rem; }
  .verdict p { margin: 0; color: var(--muted); font-size: 0.88rem; }
  details { margin-top: 1.5rem; }
  summary { color: var(--muted); cursor: pointer; font-size: 0.85rem; }
  pre {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
  footer { margin-top: 3rem; color: var(--muted); font-size: 0.8rem; text-align: center; }
  footer a { color: var(--accent); }
</style>
</head>
<body>
<div class="wrap">
  <h1>Jev Triage Playground</h1>
  <p class="sub">
    Type a support message and hand it to <a href="https://developers.cloudflare.com/ai/models/typesafe/jev/" target="_blank">Jev</a>,
    running through Cloudflare AI Gateway. It answers three typed questions in one parallel call.
    No text generation, just calibrated probabilities your code can branch on.
  </p>

  <textarea id="message" placeholder="e.g. My payouts have been failing for 3 days and I'm losing customers.">My payouts have been failing for 3 days and I'm losing customers. This is urgent, please help ASAP.</textarea>

  <div class="presets">
    <button class="preset" data-msg="My payouts have been failing for 3 days and I'm losing customers. This is urgent, please help ASAP.">Urgent outage</button>
    <button class="preset" data-msg="I was charged twice for order A-104. Please refund the duplicate charge, this is ridiculous.">Angry billing</button>
    <button class="preset" data-msg="Hey, just wondering if you offer a discount for annual plans? Thinking about upgrading.">Casual sales</button>
    <button class="preset" data-msg="idk something feels off with my account maybe? not sure who to ask">Vague / ambiguous</button>
  </div>

  <div>
    <button class="run" id="run">Analyze with Jev</button>
    <span class="meta" id="meta"></span>
  </div>

  <div class="results" id="results">
    <div class="card" id="department-card">
      <h3>Department <span></span></h3>
      <div id="department-bars"></div>
    </div>
    <div class="card" id="urgency-card">
      <h3>Urgency</h3>
      <div id="urgency-bars"></div>
    </div>
    <div class="card" id="frustration-card">
      <h3>Frustration <span></span></h3>
      <div id="frustration-bars"></div>
    </div>

    <div class="verdict" id="verdict">
      <h3 id="verdict-title"></h3>
      <p id="verdict-body"></p>
    </div>

    <details>
      <summary>Raw Jev response</summary>
      <pre id="raw"></pre>
    </details>
  </div>
</div>

<footer>
  Built to see what Jev actually feels like to use. Model: typesafe/jev, served through Cloudflare AI Gateway.
</footer>

<script>
const messageEl = document.getElementById('message');
const runBtn = document.getElementById('run');
const metaEl = document.getElementById('meta');
const resultsEl = document.getElementById('results');
const rawEl = document.getElementById('raw');

document.querySelectorAll('.preset').forEach(btn => {
  btn.addEventListener('click', () => {
    messageEl.value = btn.dataset.msg;
  });
});

function confClass(c) {
  if (c >= 0.8) return 'high';
  if (c >= 0.5) return 'med';
  return 'low';
}
function confColor(c) {
  if (c >= 0.8) return 'var(--high)';
  if (c >= 0.5) return 'var(--med)';
  return 'var(--low)';
}

function renderBars(container, probs, winnerKey, labels) {
  container.innerHTML = '';
  Object.entries(probs).sort((a, b) => b[1] - a[1]).forEach(([key, val]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = labels ? (labels[key] ?? key) : key;
    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill' + (key === winnerKey ? ' winner' : '');
    fill.style.width = Math.round(val * 100) + '%';
    track.appendChild(fill);
    const pct = document.createElement('div');
    pct.className = 'bar-pct';
    pct.textContent = Math.round(val * 100) + '%';
    row.append(label, track, pct);
    container.appendChild(row);
  });
}

function confidenceTag(confidence) {
  const span = document.createElement('span');
  span.className = 'confidence-tag';
  span.style.background = confColor(confidence);
  span.style.color = '#0b0d10';
  span.textContent = 'confidence ' + Math.round(confidence * 100) + '%';
  return span;
}

async function analyze() {
  const message = messageEl.value.trim();
  if (!message) return;
  runBtn.disabled = true;
  runBtn.textContent = 'Asking Jev...';
  metaEl.textContent = '';
  resultsEl.style.display = 'none';

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const { department, urgency, frustration } = data.answers;

    // Department
    const deptCard = document.getElementById('department-card');
    deptCard.querySelector('h3 span').innerHTML = '';
    deptCard.querySelector('h3 span').appendChild(confidenceTag(department.confidence));
    renderBars(document.getElementById('department-bars'), department.probabilities, department.choice);

    // Urgency (noul -> single probability)
    renderBars(document.getElementById('urgency-bars'), { urgent: urgency.noul, ['not urgent']: 1 - urgency.noul }, urgency.noul > 0.5 ? 'urgent' : 'not urgent');

    // Frustration
    const frusCard = document.getElementById('frustration-card');
    frusCard.querySelector('h3 span').innerHTML = '';
    frusCard.querySelector('h3 span').appendChild(confidenceTag(frustration.confidence));
    const legendLabels = {};
    Object.entries(frustration.legend).forEach(([k, v]) => { legendLabels[k] = v; });
    const winnerLevel = Object.entries(frustration.probabilities).sort((a,b) => b[1]-a[1])[0][0];
    renderBars(document.getElementById('frustration-bars'), frustration.probabilities, winnerLevel, legendLabels);

    // Verdict: confidence-gated routing, mirrors the pattern from Jev's docs
    const verdictEl = document.getElementById('verdict');
    const titleEl = document.getElementById('verdict-title');
    const bodyEl = document.getElementById('verdict-body');
    verdictEl.className = 'verdict';

    if (department.confidence < 0.5) {
      verdictEl.classList.add('human');
      titleEl.textContent = '\u{1F464} Send this to a human';
      bodyEl.textContent = 'Confidence is under 0.5. Jev genuinely doesn\u2019t know, so the code shouldn\u2019t pretend it does.';
    } else if (department.confidence < 0.8 || (urgency.noul > 0.6 && urgency.noul < 0.9)) {
      verdictEl.classList.add('confirm');
      titleEl.textContent = '\u26A0\uFE0F Route to ' + department.choice + ', but flag it';
      bodyEl.textContent = 'Confidence is decent, not great. Send it to ' + department.choice + ' and tag it for a second look.';
    } else {
      verdictEl.classList.add('auto');
      titleEl.textContent = '\u2705 Route straight to ' + department.choice;
      bodyEl.textContent = (urgency.noul > 0.7 ? 'Marked urgent. ' : '') + 'Confidence is ' + Math.round(department.confidence * 100) + '%, high enough to act on without a human in the loop.';
    }

    rawEl.textContent = JSON.stringify(data, null, 2);
    resultsEl.style.display = 'block';
    metaEl.textContent = data.model + ' \u00b7 ' + data.latencyMs + 'ms \u00b7 ' + data.usage.input_tokens + ' input tokens';
  } catch (err) {
    metaEl.textContent = 'Error: ' + err.message;
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = 'Analyze with Jev';
  }
}

runBtn.addEventListener('click', analyze);
</script>
</body>
</html>`;
