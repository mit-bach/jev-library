import type { CandidateAction, Candidate, Observation } from './types.js';

export function candidates(observation: Observation): Candidate[] {
  const result: Candidate[] = [];
  const add = (description: string, action: CandidateAction) =>
    result.push({ id: `a${result.length}`, description, action });
  for (const element of observation.elements) {
    const target = element.id;
    const name = `elemento ${target}: ${element.label}`;
    if (element.type === 'editable') {
      add(`Preencher ${name} com texto produzido por um LLM a partir da tarefa do usuário`, {
        kind: 'fill',
        target,
      });
      add(`Pressionar Enter em ${name}`, { kind: 'enter', target });
    } else if (element.type === 'select') {
      for (const option of element.options)
        add(`Selecionar ${JSON.stringify(option.label)} em ${name}`, {
          kind: 'select',
          target,
          value: option.value,
        });
    } else add(`Clicar em ${name}`, { kind: 'click', target });
  }
  if (observation.scroll.y + observation.scroll.viewport < observation.scroll.height - 2)
    add('Rolar a página para baixo', { kind: 'scroll', direction: 'down' });
  if (observation.scroll.y > 0)
    add('Rolar a página para cima', { kind: 'scroll', direction: 'up' });
  add('Voltar à página anterior', { kind: 'back' });
  add('Esperar a página atualizar', { kind: 'wait' });
  add('Concluir: o estado observado comprova que a tarefa foi cumprida', { kind: 'done' });
  add('Parar: não há ação adequada ou falta informação do usuário', { kind: 'blocked' });
  return result;
}
