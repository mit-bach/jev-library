import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateRun } from '../src/application/evaluate.js';
import type { EvalInput, Judgment } from '../src/domain/types.js';
import { modelMetrics } from '../src/infrastructure/telemetry/metrics.js';
import { escapeHtml } from '../src/infrastructure/reporting/html.js';

const input: EvalInput = {
  commands: ['Abra o resultado'],
  actions: [],
  finalObservation: {
    url: 'https://example.com/result',
    title: 'Resultado',
    text: 'Concluído',
    elements: [],
    scroll: { y: 0, height: 900, viewport: 900 },
    truncated: false,
  },
};

test('eval diferencia evidência positiva, negativa e incerteza', async () => {
  for (const [choice, confidence, verdict] of [
    ['complete', 0.95, 'passed'],
    ['incomplete', 0.95, 'failed'],
    ['unknown', 0.95, 'inconclusive'],
    ['complete', 0.5, 'inconclusive'],
  ] as const) {
    assert.equal((await evaluateRun(input, async () => ({ choice, confidence }))).verdict, verdict);
  }
});

test('checks explícitos reprovam mesmo quando o juiz aprova', async () => {
  const result = await evaluateRun(input, async () => ({ choice: 'complete', confidence: 1 }), {
    text: 'Outro texto',
    url: '/result',
  });
  assert.equal(result.verdict, 'failed');
  assert.deepEqual(
    result.checks.map((c) => c.passed),
    [false, true],
  );
});

test('falta de observação não chama juiz nem aprova', async () => {
  assert.equal(
    (
      await evaluateRun(null, async () => {
        throw new Error('Não deve chamar');
      })
    ).verdict,
    'inconclusive',
  );
});

test('falha e resposta inválida do juiz nunca viram aprovação', async () => {
  assert.equal(
    (
      await evaluateRun(input, async () => {
        throw new Error('API offline');
      })
    ).verdict,
    'error',
  );
  assert.equal(
    (await evaluateRun(input, async () => ({ choice: 'complete', confidence: NaN }))).verdict,
    'error',
  );
  assert.equal(
    (
      await evaluateRun(
        input,
        async () => ({ choice: 'inventada', confidence: 1 }) as unknown as Judgment,
      )
    ).verdict,
    'error',
  );
});

test('métricas distinguem consumo conhecido, erros e total de chamadas', () => {
  const events = [
    { type: 'jev.start', data: {} },
    {
      type: 'jev.end',
      data: { durationMs: 12, output: { usage: { inputTokens: 100, outputTokens: 5 } } },
    },
    { type: 'jev.start', data: {} },
    { type: 'jev.error', data: { durationMs: 30 } },
  ].map((e, seq) => ({ ...e, seq, time: '' }));
  assert.deepEqual(modelMetrics(events).jev, {
    calls: 2,
    errors: 1,
    durationMs: 42,
    inputTokens: 100,
    outputTokens: 5,
    callsWithUsage: 1,
  });
});

test('conteúdo capturado não vira HTML executável no relatório', () => {
  assert.equal(
    escapeHtml('<script>alert("x")</script>'),
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
  );
});
