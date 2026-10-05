import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createOpenRouterGenerator,
  createOpenRouterPlanner,
} from '../src/infrastructure/models/openrouter.js';
import type { TextInput } from '../src/domain/types.js';
import type { BrowserElement } from '../src/domain/types.js';

const field: BrowserElement = {
  id: 0,
  label: 'Pesquisar',
  type: 'editable',
  value: '',
  options: [],
};
const input: TextInput = {
  task: 'Pesquise Alan Turing',
  values: [],
  field,
  history: [],
  observation: {
    url: 'https://example.com',
    title: 'Busca',
    text: 'Pesquisar',
    elements: [field],
    scroll: { y: 0, height: 900, viewport: 900 },
    truncated: false,
  },
};
const completion = (content: string, finish_reason = 'stop') =>
  Response.json({
    model: 'example/model:free',
    choices: [{ finish_reason, message: { content } }],
  });

test('envia campo e tarefa, exige JSON e preserva o texto retornado', async () => {
  const generate = createOpenRouterGenerator({
    apiKey: 'test-key',
    model: 'openrouter/free',
    fetchImpl: async (url, init) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
      const body = JSON.parse(init!.body as string);
      assert.equal(body.model, 'openrouter/free');
      assert.equal(body.response_format.type, 'json_schema');
      assert.equal(body.provider.require_parameters, true);
      assert.equal(JSON.parse(body.messages[1].content).selectedField.label, 'Pesquisar');
      assert.equal(JSON.parse(body.messages[1].content).userTask, input.task);
      return completion(JSON.stringify({ text: 'Alan Turing\n', reason: '' }));
    },
  });
  assert.deepEqual(await generate(input), {
    text: 'Alan Turing\n',
    reason: '',
    model: 'example/model:free',
  });
});

for (const [name, response] of [
  ['JSON inválido', () => completion('texto solto')],
  ['tipo incorreto', () => completion('{"text":12,"reason":""}')],
  ['resposta truncada', () => completion('{"text":"Alan","reason":""}', 'length')],
  ['rate limit', () => new Response('', { status: 429 })],
  ['erro no corpo', () => Response.json({ error: { message: 'Unavailable' } })],
] as const) {
  test(`rejeita ${name}`, async () => {
    const generate = createOpenRouterGenerator({
      apiKey: 'test',
      model: 'openrouter/free',
      fetchImpl: async () => response(),
    });
    await assert.rejects(generate(input), /OpenRouter/);
  });
}

test('permite informar dado ausente sem inventar conteúdo', async () => {
  const generate = createOpenRouterGenerator({
    apiKey: 'test',
    model: 'openrouter/free',
    fetchImpl: async () => completion('{"text":null,"reason":"Informe o email"}'),
  });
  assert.equal((await generate(input)).text, null);
});

test('aceita qualquer modelo configurado, incluindo modelos sem sufixo free', async () => {
  let requestedModel = '';
  const generate = createOpenRouterGenerator({
    apiKey: 'test',
    model: 'meta/muse-spark-1.3-contributor',
    fetchImpl: async (_url, init) => {
      requestedModel = JSON.parse(init!.body as string).model;
      return completion('{"text":"Jev","reason":""}');
    },
  });
  await generate(input);
  assert.equal(requestedModel, 'meta/muse-spark-1.3-contributor');
});

test('exige chave apenas quando gerar', async () => {
  const generate = createOpenRouterGenerator({ apiKey: '', model: 'openrouter/free' });
  await assert.rejects(generate(input), /OPENROUTER_API_KEY/);
});

test('planeja um objetivo em comandos atômicos usando o mesmo modelo configurável', async () => {
  const plan = createOpenRouterPlanner({
    apiKey: 'test-key',
    model: 'meta/muse-spark-1.3-contributor',
    fetchImpl: async (url, init) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
      const body = JSON.parse(init!.body as string);
      assert.equal(body.model, 'meta/muse-spark-1.3-contributor');
      assert.equal(body.response_format.json_schema.name, 'browser_goal_plan');
      assert.equal(body.response_format.json_schema.schema.properties.commands.maxItems, 20);
      const payload = JSON.parse(body.messages[1].content);
      assert.equal(payload.userGoal, 'Cadastre um usuário na example.com');
      assert.deepEqual(payload.suppliedValues, ['email=user@example.com']);
      return Response.json({
        model: 'meta/muse-spark-1.3-contributor',
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content: JSON.stringify({
                commands: [
                  'Abra o fluxo de cadastro da example.com',
                  'Preencha os dados fornecidos no cadastro da example.com',
                  'Envie o cadastro e confirme que a conta foi criada',
                ],
                reason: 'Separar descoberta, preenchimento e confirmação.',
              }),
            },
          },
        ],
        usage: { prompt_tokens: 30, completion_tokens: 12 },
      });
    },
  });
  assert.deepEqual(
    await plan({
      goal: 'Cadastre um usuário na example.com',
      values: ['email=user@example.com'],
      maxCommands: 20,
    }),
    {
      goal: 'Cadastre um usuário na example.com',
      commands: [
        'Abra o fluxo de cadastro da example.com',
        'Preencha os dados fornecidos no cadastro da example.com',
        'Envie o cadastro e confirme que a conta foi criada',
      ],
      reason: 'Separar descoberta, preenchimento e confirmação.',
      model: 'meta/muse-spark-1.3-contributor',
      usage: { inputTokens: 30, outputTokens: 12 },
    },
  );
});

test('rejeita plano vazio ou acima do limite solicitado', async () => {
  for (const commands of [[], ['um', 'dois']]) {
    const plan = createOpenRouterPlanner({
      apiKey: 'test',
      fetchImpl: async () => completion(JSON.stringify({ commands, reason: 'teste' })),
    });
    await assert.rejects(
      plan({ goal: 'Teste', values: [], maxCommands: 1 }),
      /pelo menos um|mais de 1/,
    );
  }
});
