import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer, type Server } from 'node:http';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runSession } from '../src/session.js';
import type { Decider } from '../src/domain/types.js';

let server: Server;
let url: string;
before(async () => {
  server = createServer((_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(
      "<title>Fixture</title><label>Busca<input></label><button onclick=\"document.querySelector('p').textContent='Resultado: '+document.querySelector('input').value\">Buscar</button><p></p><label>Senha<input type=\"password\"></label>",
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');
  url = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const directory = () => mkdtemp(join(tmpdir(), 'jev-observability-'));
const done: Decider = async ({ candidates }) => ({
  choice: candidates.find((c) => c.action.kind === 'done')!.id,
  confidence: 1,
});
const noText = async () => {
  throw new Error('Unexpected generation');
};

test('sessão híbrida gera relatório, evidências, trace, eval e métricas por padrão', async () => {
  const dir = await directory();
  const result = await runSession({
    directory: dir,
    url,
    task: 'Busque Jev',
    values: [],
    decide: async ({ candidates, history }) => ({
      choice: candidates.find(
        (c) =>
          c.action.kind ===
          (history.length === 0 ? 'fill' : history.length === 1 ? 'click' : 'done'),
      )!.id,
      confidence: 1,
      model: 'mock-jev',
      usage: { inputTokens: 10, outputTokens: 1 },
    }),
    generateText: async () => ({
      text: 'Jev',
      reason: '',
      model: 'mock:free',
      usage: { inputTokens: 20, outputTokens: 2 },
    }),
    evaluator: async (input) => {
      assert(input.finalObservation.text.includes('Resultado: Jev'));
      assert.deepEqual(
        input.actions.map((action) => action.action.kind),
        ['fill', 'click'],
      );
      return { choice: 'complete', confidence: 0.99, model: 'mock-evaluator' };
    },
    expected: { text: 'Resultado: Jev' },
  });
  assert.equal(result.exitCode, 0);
  assert.equal(result.schemaVersion, 3);
  assert.equal(result.evaluation.verdict, 'passed');
  const jevMetrics = result.metrics.jev;
  const openRouterMetrics = result.metrics.openrouter;
  const evalMetrics = result.metrics.eval;
  assert(jevMetrics);
  assert(openRouterMetrics);
  assert(evalMetrics);
  assert.equal(jevMetrics.calls, 3);
  assert.equal(jevMetrics.inputTokens, 30);
  assert.equal(openRouterMetrics.calls, 1);
  assert.equal(evalMetrics.calls, 1);
  for (const file of [
    'report.html',
    'eval.json',
    'result.json',
    'events.jsonl',
    'steps.jsonl',
    'trace.zip',
    'final.png',
    'final.observation.json',
    'evidence/step-001-before.png',
    'evidence/step-001-after.png',
  ])
    assert((await stat(join(dir, file))).size > 0, file);
  assert.equal(result.warnings.length, 0);
  const events = (await readFile(join(dir, 'events.jsonl'), 'utf8'))
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.deepEqual(
    events.map((e) => e.seq),
    events.map((_, i) => i + 1),
  );
  assert(events.find((e) => e.type === 'openrouter.end').data.output.text === 'Jev');
});

test('executa comandos em batch, em ordem e no mesmo navegador', async () => {
  const commands = ['Pesquise Jev', 'Confirme que o resultado apareceu'];
  const result = await runSession({
    directory: await directory(),
    url,
    commands,
    values: [],
    decide: async ({ task, observation, candidates, history }) => {
      const kind =
        task === commands[1]
          ? 'done'
          : observation.text.includes('Resultado: Jev')
            ? 'done'
            : history.length === 0
              ? 'fill'
              : 'click';
      return {
        choice: candidates.find((candidate) => candidate.action.kind === kind)!.id,
        confidence: 1,
      };
    },
    generateText: async () => ({ text: 'Jev', reason: '', model: 'mock/model' }),
    evaluator: async (input) => {
      assert.deepEqual(input.commands, commands);
      assert.deepEqual(
        input.actions.map((action) => action.commandIndex),
        [0, 0],
      );
      return { choice: 'complete', confidence: 1 };
    },
  });
  assert.equal(result.status, 'done');
  assert.equal(result.exitCode, 0);
  assert.deepEqual(result.commands, commands);
  assert.deepEqual(
    result.commandResults.map(({ commandIndex, status }) => ({ commandIndex, status })),
    [
      { commandIndex: 0, status: 'done' },
      { commandIndex: 1, status: 'done' },
    ],
  );
  assert.deepEqual(
    result.history.map((step) => step.step),
    [1, 2, 3, 4],
  );
  assert.deepEqual(
    result.history.map((step) => step.commandIndex),
    [0, 0, 0, 1],
  );
});

test('planeja um objetivo, executa os subobjetivos com Jev e preserva o plano', async () => {
  const dir = await directory();
  const commands = ['Pesquise Jev', 'Confirme que o resultado apareceu'];
  let observedPlan: string[] = [];
  const result = await runSession({
    directory: dir,
    url,
    goal: 'Encontre Jev e confirme o resultado',
    values: ['Jev'],
    planGoal: async (input) => {
      assert.equal(input.goal, 'Encontre Jev e confirme o resultado');
      assert.deepEqual(input.values, ['<provided #1>']);
      assert.equal(input.maxCommands, 20);
      return {
        goal: input.goal,
        commands,
        reason: 'Pesquisar antes de verificar.',
        model: 'mock-planner',
        usage: { inputTokens: 15, outputTokens: 5 },
      };
    },
    onPlan: async (plan) => {
      observedPlan = plan.commands;
    },
    decide: async ({ task, observation, candidates, history }) => {
      const kind =
        task === commands[1]
          ? 'done'
          : observation.text.includes('Resultado: Jev')
            ? 'done'
            : history.length === 0
              ? 'fill'
              : 'click';
      return {
        choice: candidates.find((candidate) => candidate.action.kind === kind)!.id,
        confidence: 1,
      };
    },
    generateText: async () => ({ text: 'Jev', reason: '', model: 'mock/model' }),
    evaluator: async (input) => {
      assert.equal(input.goal, 'Encontre Jev e confirme o resultado');
      assert.deepEqual(input.commands, commands);
      return { choice: 'complete', confidence: 1 };
    },
  });
  assert.equal(result.status, 'done');
  assert.equal(result.exitCode, 0);
  assert.equal(result.goal, 'Encontre Jev e confirme o resultado');
  assert.deepEqual(result.commands, commands);
  assert.deepEqual(result.plan?.commands, commands);
  assert.deepEqual(observedPlan, commands);
  assert.equal(result.metrics.planner?.calls, 1);
  assert.equal(result.metrics.planner?.inputTokens, 15);
  assert.deepEqual(JSON.parse(await readFile(join(dir, 'plan.json'), 'utf8')).commands, commands);
  assert((await readFile(join(dir, 'report.html'), 'utf8')).includes('Plano do objetivo'));
});

test('redige valores sensíveis dos eventos, passos e resultado', async () => {
  const dir = await directory();
  const password = 'segredo-super-secreto';
  const result = await runSession({
    directory: dir,
    url,
    task: 'Preencha a senha fornecida',
    values: [`senha=${password}`],
    decide: async ({ observation, candidates, history, values }) => {
      assert.deepEqual(values, ['senha=<provided>']);
      const field = observation.elements.find((element) => element.label === 'Senha');
      assert(field);
      const candidate =
        history.length === 0
          ? candidates.find(
              (item) => item.action.kind === 'fill' && item.action.target === field.id,
            )
          : candidates.find((item) => item.action.kind === 'done');
      assert(candidate);
      return { choice: candidate.id, confidence: 1 };
    },
    generateText: async (input) => {
      assert.deepEqual(input.values, [`senha=${password}`]);
      return { text: password, reason: '', model: 'mock/model' };
    },
    evaluator: async (input) => {
      const action = input.actions[0]?.action;
      assert(action?.kind === 'fill');
      assert.equal(action.value, '[REDACTED]');
      assert.equal(
        input.finalObservation.elements.find((element) => element.label === 'Senha')?.value,
        '[REDACTED]',
      );
      return { choice: 'complete', confidence: 1 };
    },
  });
  assert.equal(result.exitCode, 0);
  const observableText = [
    await readFile(join(dir, 'events.jsonl'), 'utf8'),
    await readFile(join(dir, 'steps.jsonl'), 'utf8'),
    await readFile(join(dir, 'result.json'), 'utf8'),
  ].join('\n');
  assert(!observableText.includes(password));
  assert(observableText.includes('[REDACTED]'));
});

test('falha do planejador é observável e não abre o navegador', async () => {
  const dir = await directory();
  let opened = false;
  const result = await runSession({
    directory: dir,
    url,
    goal: 'Teste de planejamento',
    values: [],
    planGoal: async () => {
      throw new Error('Planner offline');
    },
    decide: done,
    generateText: noText,
    evaluator: async () => ({ choice: 'unknown', confidence: 1 }),
    launch: async () => {
      opened = true;
      throw new Error('Não deve abrir');
    },
  });
  assert.equal(opened, false);
  assert.equal(result.status, 'error');
  assert.equal(result.exitCode, 1);
  assert.equal(result.metrics.planner?.errors, 1);
  assert.equal(result.evaluation.verdict, 'inconclusive');
  assert((await readFile(join(dir, 'report.html'), 'utf8')).includes('Planner offline'));
});

test('done do executor não basta quando a avaliação reprova', async () => {
  const result = await runSession({
    directory: await directory(),
    url,
    task: 'Busque Jev',
    values: [],
    decide: done,
    generateText: noText,
    evaluator: async () => ({ choice: 'incomplete', confidence: 1 }),
  });
  assert.equal(result.status, 'done');
  assert.equal(result.evaluation.verdict, 'failed');
  assert.equal(result.exitCode, 2);
});

test('erro do Jev preserva observação final, erro da chamada e relatório', async () => {
  const dir = await directory();
  const result = await runSession({
    directory: dir,
    url,
    task: 'Teste',
    values: [],
    decide: async () => {
      throw new Error('Decision API offline');
    },
    generateText: noText,
    evaluator: async () => ({ choice: 'unknown', confidence: 1 }),
  });
  assert.equal(result.status, 'error');
  assert.equal(result.exitCode, 1);
  assert.equal(result.metrics.jev?.errors, 1);
  assert((await readFile(join(dir, 'report.html'), 'utf8')).includes('Decision API offline'));
  assert((await stat(join(dir, 'final.png'))).size > 0);
});

test('erro do avaliador preserva a execução e é visível no relatório', async () => {
  const dir = await directory();
  const result = await runSession({
    directory: dir,
    url,
    task: 'Teste',
    values: [],
    decide: done,
    generateText: noText,
    evaluator: async () => {
      throw new Error('Eval offline');
    },
  });
  assert.equal(result.status, 'done');
  assert.equal(result.evaluation.verdict, 'error');
  assert.equal(result.exitCode, 2);
  assert((await readFile(join(dir, 'report.html'), 'utf8')).includes('Eval offline'));
});

test('falha antes de abrir navegador ainda produz relatório sem fingir evidência', async () => {
  const dir = await directory();
  const result = await runSession({
    directory: dir,
    url,
    task: '<script>Teste</script>',
    values: [],
    decide: done,
    generateText: noText,
    launch: async () => {
      throw new Error('Launch failed');
    },
  });
  assert.equal(result.exitCode, 1);
  assert.equal(result.evaluation.verdict, 'inconclusive');
  const report = await readFile(join(dir, 'report.html'), 'utf8');
  assert(report.includes('&lt;script&gt;Teste&lt;/script&gt;'));
  assert(!report.includes('<script>Teste</script>'));
});
