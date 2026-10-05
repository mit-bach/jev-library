import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer, type Server } from 'node:http';
import { chromium, type Browser, type Page } from 'playwright';
import { inputValues } from '../src/domain/input-values.js';
import { runHarness as run } from '../src/application/harness.js';
import type { Decider } from '../src/domain/types.js';

import { browserFromPage } from '../src/infrastructure/browser/playwright.js';

const runHarness = ({
  page,
  ...options
}: Omit<Parameters<typeof run>[0], 'generateText' | 'browser'> & { page: Page } & Partial<
    Pick<Parameters<typeof run>[0], 'generateText'>
  >) =>
  run({
    browser: browserFromPage(page),
    generateText: async () => {
      throw new Error('Não deveria chamar o LLM nesta ação');
    },
    ...options,
  });

let browser: Browser;
let server: Server;
let url: string;
before(async () => {
  server = createServer((_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><title>Busca local</title>
      <label>Pesquisar<input id="query" type="search"></label>
      <button onclick="document.querySelector('#result').textContent='Resultado: '+document.querySelector('#query').value">Buscar</button>
      <button onclick="throw new Error('Unused')">Sem efeito</button>
      <input type="password" aria-label="Senha"><button hidden>Oculto</button>
      <p id="result"></p>`);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');
  url = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
  if (server)
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
});

test('extrai valores literais sem inventar argumentos', () => {
  assert.deepEqual(inputValues('Busque "Jev" e “browser”', ['Jev']), ['Jev', 'browser']);
  assert.deepEqual(inputValues('Busque alguma coisa'), []);
});

test('aguarda formulário SPA inicialmente vazio e só então preenche e envia', async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(`<body><script>
      setTimeout(() => {
        document.body.innerHTML = '<label>Email<input></label><button>Registrar</button><p></p>';
        document.querySelector('button').onclick = () => document.querySelector('p').textContent = 'Conta criada';
      }, 400);
    </script></body>`);
    const result = await runHarness({
      page,
      task: 'Cadastre o usuário',
      values: ['email=test@example.com'],
      decide: async ({ observation, candidates }) => {
        assert(observation.elements.length > 0);
        const kind = observation.text.includes('Conta criada')
          ? 'done'
          : observation.elements.some((item) => item.type === 'editable' && !item.value)
            ? 'fill'
            : 'click';
        return { choice: candidates.find((item) => item.action.kind === kind)!.id, confidence: 1 };
      },
      generateText: async () => ({ text: 'test@example.com', reason: '', model: 'fixture' }),
    });
    assert.equal(result.status, 'done');
    assert.equal(result.history[0]?.decisionSource, 'readiness');
    assert.equal(await page.locator('p').innerText(), 'Conta criada');
  } finally {
    await page.close();
  }
});

test('marcador de privacidade nunca é digitado', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(url);
    const result = await runHarness({
      page,
      task: 'Preencher',
      values: [],
      decide: async ({ candidates }) => ({
        choice: candidates.find((item) => item.action.kind === 'fill')!.id,
        confidence: 1,
      }),
      generateText: async () => ({ text: '<provided>', reason: '', model: 'fixture' }),
    });
    assert.equal(result.status, 'generation_error');
    assert.equal(await page.locator('#query').inputValue(), '');
  } finally {
    await page.close();
  }
});

test('observa DOM real, preenche, clica e só conclui após observar resultado', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(url);
    const decide: Decider = async ({ observation, candidates, history }) => {
      assert(!observation.elements.some((e) => e.label === 'Oculto'));
      assert.equal(
        observation.elements.find((element) => element.label === 'Senha')?.sensitive,
        true,
      );
      const candidate = observation.text.includes('Resultado: Jev')
        ? candidates.find((c) => c.action.kind === 'done')
        : history.length === 0
          ? candidates.find((c) => c.action.kind === 'fill')
          : candidates.find((c) => c.action.kind === 'click' && c.description.endsWith('Buscar'));
      assert(candidate);
      return { choice: candidate.id, confidence: 0.95 };
    };
    let calls = 0;
    const result = await runHarness({
      page,
      task: 'Pesquise Jev',
      values: [],
      decide,
      generateText: async (input) => {
        calls++;
        assert.equal(input.field.label, 'Pesquisar');
        assert.equal(input.task, 'Pesquise Jev');
        return { text: 'Jev', reason: '', model: 'mock:free' };
      },
    });
    assert.equal(calls, 1);
    assert.equal(result.history.at(0)?.generation?.text, 'Jev');
    assert.equal(result.status, 'done');
    assert.equal(result.steps, 3);
    assert.equal(await page.locator('#result').innerText(), 'Resultado: Jev');
  } finally {
    await page.close();
  }
});

test('preenche senha via LLM sem expor o valor no histórico', async () => {
  const page = await browser.newPage();
  const password = 'segredo-super-secreto';
  try {
    await page.goto(url);
    const result = await runHarness({
      page,
      task: 'Preencha a senha fornecida',
      values: [`senha=${password}`],
      decide: async ({ observation, candidates, history }) => {
        const passwordField = observation.elements.find((element) => element.label === 'Senha');
        assert(passwordField);
        assert.equal(passwordField.sensitive, true);
        const candidate =
          history.length === 0
            ? candidates.find(
                (item) => item.action.kind === 'fill' && item.action.target === passwordField.id,
              )
            : candidates.find((item) => item.action.kind === 'done');
        assert(candidate);
        return { choice: candidate.id, confidence: 1 };
      },
      generateText: async ({ field, values }) => {
        assert.equal(field.sensitive, true);
        assert.deepEqual(values, [`senha=${password}`]);
        return { text: password, reason: '', model: 'mock/model' };
      },
    });
    assert.equal(result.status, 'done');
    assert.equal(await page.locator('[aria-label="Senha"]').inputValue(), password);
    assert.equal(result.history[0]?.generation?.text, '[REDACTED]');
    const action = result.history[0]?.executedAction;
    assert(action?.kind === 'fill');
    assert.equal(action.value, '[REDACTED]');
    assert(!JSON.stringify(result).includes(password));
  } finally {
    await page.close();
  }
});

test('baixa confiança impede a execução', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(url);
    let calls = 0;
    const result = await runHarness({
      page,
      task: 'Buscar',
      values: [],
      generateText: async () => {
        calls++;
        throw new Error('Não deve gerar');
      },
      decide: async ({ candidates }) => ({
        choice: candidates.find((c) => c.action.kind === 'fill')!.id,
        confidence: 0.1,
      }),
    });
    assert.equal(calls, 0);
    assert.equal(result.status, 'low_confidence');
    assert.equal(await page.locator('#result').innerText(), '');
  } finally {
    await page.close();
  }
});

for (const failure of ['missing_input', 'generation_error']) {
  test(`não preenche nem continua após ${failure}`, async () => {
    const page = await browser.newPage();
    try {
      await page.goto(url);
      const result = await runHarness({
        page,
        task: 'Teste',
        values: [],
        decide: async ({ candidates }) => ({
          choice: candidates.find((c) => c.action.kind === 'fill')!.id,
          confidence: 1,
        }),
        generateText: async () => {
          if (failure === 'generation_error') throw new Error('OpenRouter HTTP 429');
          return { text: null, reason: 'Falta um dado', model: 'mock:free' };
        },
      });
      assert.equal(result.status, failure);
      assert.equal(result.steps, 1);
      assert.equal(await page.locator('#query').inputValue(), '');
    } finally {
      await page.close();
    }
  });
}

test('interrompe ações repetidas sem progresso', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(url);
    const result = await runHarness({
      page,
      task: 'Teste',
      values: [],
      decide: async ({ candidates }) => ({
        choice: candidates.find((c) => c.description.endsWith('Sem efeito'))!.id,
        confidence: 0.99,
      }),
    });
    assert.equal(result.status, 'loop_detected');
    assert.equal(result.steps, 3);
  } finally {
    await page.close();
  }
});

test('rejeita escolha fora das opções fornecidas', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(url);
    await assert.rejects(
      runHarness({
        page,
        task: 'Teste',
        values: [],
        decide: async () => ({ choice: 'inventada', confidence: 1 }),
      }),
      /decisão inválida/,
    );
  } finally {
    await page.close();
  }
});

test('limite de passos não é reportado como sucesso', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(url);
    const result = await runHarness({
      page,
      task: 'Teste',
      values: [],
      maxSteps: 1,
      decide: async ({ candidates }) => ({
        choice: candidates.find((c) => c.description.endsWith('Sem efeito'))!.id,
        confidence: 1,
      }),
    });
    assert.equal(result.status, 'max_steps');
    assert.equal(result.steps, 1);
  } finally {
    await page.close();
  }
});
