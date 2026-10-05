import { parseArgs } from 'node:util';
import { loadEnvFile } from 'node:process';
import { resolve } from 'node:path';
import { inputValues } from './domain/input-values.js';
import { validateLimits, DEFAULT_LIMITS } from './domain/config.js';
import { runSession } from './session.js';
import { errorMessage } from './domain/errors.js';
import { inferInitialUrl, parseCommandsJson } from './domain/commands.js';

async function main() {
  try {
    loadEnvFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      url: { type: 'string' },
      goal: { type: 'string' },
      commands: { type: 'string' },
      value: { type: 'string', multiple: true },
      'max-steps': { type: 'string', default: String(DEFAULT_LIMITS.maxSteps) },
      'min-confidence': { type: 'string', default: String(DEFAULT_LIMITS.minConfidence) },
      headed: { type: 'boolean', default: false },
      'expect-text': { type: 'string' },
      'expect-url': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(
      "Uso:\n  npm start -- --goal 'cadastre um usuário na example.com' --value 'email=user@example.com'\n  npm start -- --url https://example.com 'Tarefa direta'\n  npm start -- --commands '[\"acesse google.com\",\"pesquise Example Academy\"]'\nOpções: [--value texto] [--headed] [--max-steps 20 por comando] [--min-confidence 0.55] [--expect-text texto] [--expect-url trecho]\n--goal usa o OpenRouter para criar um plano antes do Jev executar. Eval e observabilidade sempre habilitados. Relatório: runs/<execução>/report.html",
    );
    return;
  }
  const positionalInput = positionals.join(' ').trim();
  const work = parseWorkInput(values.goal, values.commands, positionalInput);
  const workText =
    work.kind === 'batch' ? work.commands : [work.kind === 'goal' ? work.goal : work.task];
  const initialUrl = values.url ?? inferInitialUrl(workText);
  if (!initialUrl) {
    throw new Error('Informe --url ou inclua uma URL/domínio no objetivo ou nos comandos.');
  }
  const url = new URL(initialUrl);
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('A URL precisa usar HTTP ou HTTPS.');
  const maxSteps = Number(values['max-steps']);
  const minConfidence = Number(values['min-confidence']);
  validateLimits({ maxSteps, minConfidence });
  const fillValues = inputValues(workText.join('\n'), values.value);
  const directory = resolve(
    'runs',
    new Date().toISOString().replaceAll(':', '-') + `-${process.pid}`,
  );
  const result = await runSession({
    directory,
    url: url.href,
    ...(work.kind === 'batch'
      ? { commands: work.commands }
      : work.kind === 'goal'
        ? { goal: work.goal }
        : { task: work.task }),
    values: fillValues,
    maxSteps,
    minConfidence,
    headed: values.headed,
    expected: {
      ...(values['expect-text'] === undefined ? {} : { text: values['expect-text'] }),
      ...(values['expect-url'] === undefined ? {} : { url: values['expect-url'] }),
    },
    onPlan: async (plan) => {
      console.log(`Plano (${plan.model}):`);
      plan.commands.forEach((command, index) => console.log(`  ${index + 1}. ${command}`));
    },
    onStep: async (step) => {
      console.log(
        `[${step.step}] comando=${step.commandIndex + 1} ${step.candidate.description} | confiança=${step.confidence.toFixed(2)} | ${step.outcome}`,
      );
      if (step.generation)
        console.log(
          `  LLM: ${step.generation.model} | ${step.generation.text === null ? step.generation.reason : JSON.stringify(step.generation.text)}`,
        );
      if (step.error) console.error(`  ${step.error}`);
      if (step.policyReason) console.log(`  Política: ${step.policyReason}`);
    },
  });
  console.log(
    `\nExecutor: ${result.status}\nEval: ${result.evaluation.verdict} — ${result.evaluation.reason}\nURL: ${result.url}\nRelatório: ${resolve(directory, 'report.html')}`,
  );
  if (result.error) console.error(result.error);
  process.exitCode = result.exitCode;
}

type WorkInput =
  | { kind: 'goal'; goal: string }
  | { kind: 'single'; task: string }
  | { kind: 'batch'; commands: string[] };

function parseWorkInput(
  goalOption: string | undefined,
  commandsOption: string | undefined,
  positionalInput: string,
): WorkInput {
  const suppliedInputs = [goalOption, commandsOption, positionalInput || undefined].filter(
    (value) => value !== undefined,
  );
  if (suppliedInputs.length > 1) {
    throw new Error('Use --goal, --commands ou uma tarefa posicional, não mais de um deles.');
  }
  if (goalOption?.trim()) return { kind: 'goal', goal: goalOption.trim() };
  if (goalOption !== undefined) throw new Error('O objetivo não pode ser vazio.');
  const commandsJson =
    commandsOption ?? (positionalInput.startsWith('[') ? positionalInput : undefined);
  if (commandsJson) return { kind: 'batch', commands: parseCommandsJson(commandsJson) };
  if (positionalInput) return { kind: 'single', task: positionalInput };
  throw new Error('Informe --goal, uma tarefa direta ou --commands. Use --help para exemplos.');
}

main().catch((error) => {
  console.error(errorMessage(error));
  process.exitCode = 1;
});
