import assert from 'node:assert/strict';
import { test } from 'node:test';
import { navigationSatisfied } from '../src/domain/navigation.js';
import { runHarness } from '../src/application/harness.js';
import type { Observation } from '../src/domain/types.js';
import type { BrowserPort } from '../src/domain/ports.js';

const observation: Observation = {
  url: 'https://www.example.com/',
  title: 'Academy',
  text: 'Login',
  elements: [],
  scroll: { y: 0, height: 900, viewport: 900 },
  truncated: false,
};

test('reconhece navegação concluída incluindo redirect www e upgrade HTTPS', () => {
  assert(navigationSatisfied('Abra https://example.com', observation));
  assert(navigationSatisfied('Open http://example.com/', observation));
});

test('não confunde navegação com cadastro, outro domínio, rota ou página vazia', () => {
  for (const task of [
    'Abra https://example.com e cadastre um usuário',
    'Cadastre um usuário na https://example.com',
    'Abra https://membros.example.com',
    'Abra https://example.com/auth/sign-up',
    'Abra https://example.com?foo=1',
    'Abra https://example.com#signup',
    'Abra https://example.com.evil.example',
  ])
    assert.equal(navigationSatisfied(task, observation), false, task);
  assert.equal(
    navigationSatisfied('Abra https://example.com', { ...observation, text: '' }),
    false,
  );
  assert.equal(
    navigationSatisfied('Abra https://example.com', {
      ...observation,
      url: 'http://example.com/',
    }),
    false,
  );
});

test('regressão: URL já alcançada conclui sem depender do done com confiança 0.45', async () => {
  let calls = 0;
  let releases = 0;
  const browser: BrowserPort = {
    url: () => observation.url,
    navigate: async () => {},
    screenshot: async () => {},
    stopTrace: async () => {},
    close: async () => {},
    observe: async () => ({
      observation,
      execute: async () => {
        assert.fail('Sem ação necessária');
      },
      release: async () => {
        releases++;
      },
    }),
  };
  const result = await runHarness({
    browser,
    task: 'Abra https://example.com',
    values: [],
    decide: async ({ candidates }) => {
      calls++;
      return {
        choice: candidates.find((item) => item.action.kind === 'done')!.id,
        confidence: 0.45,
      };
    },
    generateText: async () => {
      throw new Error('Sem preenchimento');
    },
  });
  assert.equal(result.status, 'done');
  assert.equal(calls, 0);
  assert.equal(releases, 1);
  assert.equal(result.history[0]?.decisionSource, 'postcondition');
  assert(result.history[0]?.policyReason);
});
