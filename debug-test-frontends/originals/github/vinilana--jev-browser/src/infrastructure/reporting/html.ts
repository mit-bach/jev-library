import type { RunResult, Step } from '../../domain/types.js';

const STYLES = `
body{font:16px system-ui;max-width:1200px;margin:40px auto;padding:0 24px;color:#18202c;background:#f5f7fa}
table{border-collapse:collapse;width:100%;background:white}
td,th{padding:12px;border:1px solid #ddd;text-align:left;vertical-align:top}
pre{white-space:pre-wrap;overflow-wrap:anywhere}
small{overflow-wrap:anywhere}
img{max-width:100%;border:1px solid #ddd}
a{color:#155caa}`;

export const escapeHtml = (value: unknown) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );

export function renderReport(result: RunResult): string {
  return `<!doctype html>
<html lang="pt-BR">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'">
<title>Jev Browser — relatório</title>
<style>${STYLES}</style>
<h1>Relatório da execução</h1>
${renderSummary(result)}
${renderArtifactLinks(result)}
<h2>Ações e evidências</h2>
${renderSteps(result.history)}
<h2>Estado final</h2>
<a href="final.observation.json">Observação final usada pelo avaliador</a>
<p><img src="final.png" alt="Screenshot final"></p>
<h2>Métricas dos modelos</h2>
<pre>${escapeHtml(JSON.stringify(result.metrics, null, 2))}</pre>
<p>Tokens são os reportados pelos provedores; chamadas sem usage não têm consumo conhecido. A avaliação é probabilística e não garante efeitos fora das evidências capturadas.</p>
<h2>Falhas de captura</h2>
<pre>${escapeHtml(result.warnings.join('\n') || 'Nenhuma')}</pre>
</html>`;
}

function renderSummary(result: RunResult): string {
  const goal = result.goal ? `<p>Objetivo: <strong>${escapeHtml(result.goal)}</strong></p>` : '';
  const plan = result.plan
    ? `<p>Plano: ${escapeHtml(result.plan.reason)} <small>(${escapeHtml(result.plan.model)})</small></p>`
    : '';
  return `${goal}${plan}<ol>${result.commands.map((command, index) => `<li>${escapeHtml(command)} — <strong>${escapeHtml(result.commandResults.find((item) => item.commandIndex === index)?.status ?? 'not_started')}</strong></li>`).join('')}</ol>
<p>Executor: <strong>${escapeHtml(result.status)}</strong> · Eval: <strong>${escapeHtml(result.evaluation.verdict)}</strong> · ${result.durationMs} ms</p>
<p>${escapeHtml(result.evaluation.reason)}</p>
<p>URL final: ${escapeHtml(result.url)}</p>
${result.error ? `<pre>${escapeHtml(result.error)}</pre>` : ''}`;
}

function renderArtifactLinks(result: RunResult): string {
  const plan = result.plan ? ' · <a href="plan.json">Plano do objetivo</a>' : '';
  return `<p><a href="result.json">Resultado completo</a>${plan} · <a href="eval.json">Avaliação</a> · <a href="events.jsonl">Eventos e chamadas</a> · <a href="steps.jsonl">Passos</a> · <a href="trace.zip">Trace Playwright</a></p>`;
}

function renderSteps(steps: Step[]): string {
  const rows = steps.map(renderStep).join('');
  return `<table><thead><tr><th>Passo</th><th>Ação</th><th>Resultado</th><th>Confiança</th><th>Tempo</th><th>Evidências</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderStep(step: Step): string {
  const prefix = `evidence/step-${String(step.step).padStart(3, '0')}`;
  const generation = step.generation
    ? `<pre>${escapeHtml(JSON.stringify(step.generation, null, 2))}</pre>`
    : '';
  return `<tr>
<td>${step.step}</td>
<td><strong>Comando ${step.commandIndex + 1}:</strong> ${escapeHtml(step.command)}<br>${escapeHtml(step.candidate.description)}<br><small>${escapeHtml(step.url)}</small>${generation}</td>
<td>${escapeHtml(step.outcome)}<br>${escapeHtml(step.error ?? '')}<br>${escapeHtml(step.policyReason ?? '')}</td>
<td>${step.confidence.toFixed(2)}</td>
<td>${step.durationMs} ms</td>
<td><a href="${prefix}-before.png">Antes</a> · <a href="${prefix}-after.png">Depois</a><br><a href="${prefix}-before.observation.json">DOM antes</a> · <a href="${prefix}-after.observation.json">DOM depois</a></td>
</tr>`;
}
