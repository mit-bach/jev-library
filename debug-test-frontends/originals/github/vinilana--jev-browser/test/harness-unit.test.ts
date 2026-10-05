import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runHarness } from '../src/application/harness.js';
import type { BrowserPort } from '../src/domain/ports.js';
import type { Observation } from '../src/domain/types.js';

test('página permanentemente vazia tem recuperação limitada e não consulta o modelo', async () => {
  let waits = 0;
  let releases = 0;
  const observation: Observation = {
    url: 'https://example.com/sign-up',
    title: 'Cadastro',
    text: '',
    elements: [],
    scroll: { y: 0, viewport: 900, height: 900 },
    truncated: false,
  };
  const browser: BrowserPort = {
    url: () => observation.url,
    navigate: async () => {},
    screenshot: async () => {},
    stopTrace: async () => {},
    close: async () => {},
    observe: async () => ({
      observation,
      execute: async (action) => {
        assert.equal(action.kind, 'wait');
        waits++;
      },
      release: async () => {
        releases++;
      },
    }),
  };
  const result = await runHarness({
    browser,
    task: 'Abrir cadastro',
    values: [],
    decide: async () => {
      throw new Error('Não consultar modelo sem conteúdo');
    },
    generateText: async () => {
      throw new Error('Não preencher');
    },
  });
  assert.equal(result.status, 'page_not_ready');
  assert.equal(waits, 5);
  assert.equal(releases, 6);
  assert.equal(result.history[0]?.decisionSource, 'readiness');
  assert.equal(result.history.at(-1)?.executedAction, undefined);
});

test('espera de baixa confiança recupera; clique de baixa confiança continua bloqueado', async () => {
  let waits = 0;
  const observation: Observation = {
    url: 'https://example.com',
    title: 'Cadastro',
    text: 'Carregando',
    elements: [{ id: 0, type: 'clickable', label: 'Enviar', value: '', options: [] }],
    scroll: { y: 0, viewport: 900, height: 900 },
    truncated: false,
  };
  const browser: BrowserPort = {
    url: () => observation.url,
    navigate: async () => {},
    screenshot: async () => {},
    stopTrace: async () => {},
    close: async () => {},
    observe: async () => ({
      observation,
      execute: async (action) => {
        assert.equal(action.kind, 'wait');
        waits++;
      },
      release: async () => {},
    }),
  };
  const result = await runHarness({
    browser,
    task: 'Cadastrar',
    values: [],
    decide: async ({ candidates, history }) => ({
      choice: candidates.find((item) => item.action.kind === (history.length ? 'click' : 'wait'))!
        .id,
      confidence: 0.46,
    }),
    generateText: async () => {
      throw new Error('Não preencher');
    },
  });
  assert.equal(waits, 1);
  assert.equal(result.status, 'low_confidence');
  assert.equal(result.history[0]?.outcome, 'executed');
  assert(result.history[0]?.policyReason);
});

test('o loop roda sem Playwright e libera o snapshot quando a decisão falha', async () => {
  let released = false;
  const observation: Observation = {
    url: 'https://example.com',
    title: 'Teste',
    text: 'Página carregada',
    scroll: { y: 0, viewport: 900, height: 900 },
    elements: [],
    truncated: false,
  };
  const browser: BrowserPort = {
    url: () => observation.url,
    navigate: async () => {},
    screenshot: async () => {},
    stopTrace: async () => {},
    close: async () => {},
    observe: async () => ({
      observation,
      execute: async () => {
        assert.fail('Não deve executar');
      },
      release: async () => {
        released = true;
      },
    }),
  };
  await assert.rejects(
    runHarness({
      browser,
      task: 'Teste',
      values: [],
      decide: async () => {
        throw new Error('offline');
      },
      generateText: async () => {
        throw new Error('unused');
      },
    }),
    /offline/,
  );
  assert.equal(released, true);
});

test('erro ao executar tem outcome tipado e preserva a mensagem separadamente', async () => {
  let releases = 0;
  const observation: Observation = {
    url: 'https://example.com',
    title: 'Teste',
    text: '',
    scroll: { y: 0, viewport: 900, height: 900 },
    elements: [{ id: 0, label: 'Falhar', type: 'clickable', value: '', options: [] }],
    truncated: false,
  };
  const browser: BrowserPort = {
    url: () => observation.url,
    navigate: async () => {},
    screenshot: async () => {},
    stopTrace: async () => {},
    close: async () => {},
    observe: async () => ({
      observation,
      execute: async () => {
        throw new Error('Elemento mudou');
      },
      release: async () => {
        releases++;
      },
    }),
  };
  const result = await runHarness({
    browser,
    task: 'Clique',
    values: [],
    maxSteps: 1,
    decide: async ({ candidates }) => ({ choice: candidates[0]!.id, confidence: 1 }),
    generateText: async () => {
      throw new Error('unused');
    },
  });
  assert.equal(result.history.at(0)?.outcome, 'execution_error');
  assert.equal(result.history.at(0)?.error, 'Elemento mudou');
  assert.equal(result.history.at(0)?.executedAction?.kind, 'click');
  assert.equal(releases, 1);
});
