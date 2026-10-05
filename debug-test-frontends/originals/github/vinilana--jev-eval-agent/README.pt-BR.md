# jev-eval-agent

🇺🇸 [Read this in English](README.md) · 🇧🇷 Português

Agente de assistente pessoal construído com [eve](https://eve.dev) (Vercel), com **100 tools**
mockadas, rodando **Gemini 3.8 Flash via OpenRouter**. O repositório existe para responder
uma pergunta: *quantos passos o agente precisa para concluir a mesma tarefa quando quem escolhe
a tool é o próprio LLM vs. quando é o [Jev](https://docs.typesafe.ai) (classificador da TypeSafe)?*

| `AGENT_MODE` | Quem escolhe a tool | Reasoning do modelo |
|---|---|---|
| `llm-direct` (padrão) | o LLM, vendo as 100 tools em todo passo | ligado (`DIRECT_REASONING`, padrão do preset) |
| `jev-classifier` | Jev, chamado antes de **cada** passo do modelo com o estado da conversa; só a tool escolhida é exposta ao LLM, que apenas preenche os argumentos | o mínimo que o endpoint aceita (`JEV_REASONING`) ou desligado |

Tudo vive em `main`; o modo é só uma variável de ambiente. Instruções, catálogo, evals e UI são idênticos nos dois modos.

## Como funciona

```
agent/
  agent.ts              modelo (OpenRouter), reasoning e providerOptions dependem do MODE
  mode.ts               lê AGENT_MODE (llm-direct | jev-classifier)
  instructions.md       system prompt comum
  instructions/mode.ts  orientação extra por modo (session.started)
  lib/models.ts         presets de modelo (EVAL_MODEL)
  lib/catalog.ts        100 tools: nome, descrição, schema zod e executor mock
  lib/world.ts          "mundo" determinístico (agenda, contatos, voos, gastos…)
  lib/jev-router.ts     monta o estado a partir de ctx.messages e pergunta ao Jev (choice com 101 opções)
  lib/trace.ts          grava as decisões do Jev em eval-results/jev-trace.jsonl
  tools/catalog.ts      defineDynamic: session.started → 100 tools | step.started → 1 tool escolhida pelo Jev
evals/
  prompts.ts            os 3 prompts de benchmark + tool families obrigatórias
  shared.ts             extrai métricas do stream de eventos e grava eval-results/<mode>/<prompt>.json
  assistant.eval.ts     um eval por prompt
eval-ui/index.html      dashboard comparativo
scripts/serve-ui.mjs    serve o dashboard e agrega eval-results/**/*.json
scripts/run-all.sh      roda o eval para modos × modelos em sequência
```

No modo `jev-classifier` a chamada ao Jev leva duas perguntas sobre o mesmo estado
(`{ user_request, actions_taken[], assistant_said[] }`, derivado do histórico de mensagens do eve):

- `next_tool`: uma `choice` com 100 tools + `respond_to_user` ("já terminei, responda");
- `done`: um `noul` ("toda ação pedida já aparece em actions_taken?").

Se o Jev escolhe `respond_to_user` mas `done` fica abaixo de `JEV_DONE_THRESHOLD` (padrão 0,5), o
roteador barra a resposta e expõe a melhor tool seguinte (confidence-gated routing). Quando
`respond_to_user` passa, nenhuma tool é exposta e o modelo escreve a resposta final. Cada decisão
(escolha, confiança, `done`, top-5, latência e se o gate atuou) vai para `eval-results/jev-trace.jsonl`
e aparece na linha do tempo do dashboard.

## Modelos

Todos via OpenRouter; escolha com `EVAL_MODEL=<key>` (padrão `gemini-3.8-flash`). Presets em `agent/lib/models.ts`:

| key | modelo | reasoning em llm-direct | reasoning em jev-classifier |
|---|---|---|---|
| `gemini-3.8-flash` | google/gemini-3.8-flash | medium | low (obrigatório, não desliga) |
| `deepseek-v4.1-flash` | deepseek/deepseek-v4.1-flash | high | desligado |
| `gpt-5.6-luna` | openai/gpt-5.6-luna | medium | none |
| `gpt-5.6-sol` | openai/gpt-5.6-sol | medium | none |
| `opus-5` | anthropic/claude-opus-5 | medium | desligado |
| `fable-5.1` | anthropic/claude-fable-5.1 | medium | low (obrigatório) |
| `gpt-6-astra` | openai/gpt-6-astra | medium | low (obrigatório) |
| `qwen3.8-27b` | qwen/qwen3.8-27b | medium | desligado |

```bash
EVAL_MODEL=deepseek-v4.1-flash npm run eval           # um modo (AGENT_MODE), um modelo
MODELS="gemini-3.8-flash gpt-5.6-luna" npm run eval:all
MODELS=all npm run eval:all                           # os 8 modelos × 2 modos
```

Os resultados vão para `eval-results/<modo>/<modelo>/<tarefa>.json`.

## As 6 tarefas

Três básicas (3 tools cada) e três complexas (4 a 7 tools), todas com **tools distratoras** de nome
parecido no catálogo (`flights_hold` × `flights_book`, `calendar_block_time` × `calendar_create_event`
× `calendar_create_meeting`, `email_send_later` × `email_send` × `email_draft`,
`reminder_create_location` × `reminder_create`, `expenses_summary_by_merchant` × `expenses_summary`,
`task_create_subtask` × `task_create`, `transfer_money_scheduled` × `transfer_money`, …).
Chamar uma distratora conta como "tool errada" no report.

Os prompts são enviados ao agente **em português** (a persona do benchmark é brasileira: Rio, São Paulo,
R$, PIX). `evals/prompts.ts` guarda também `promptEn` e `title` em inglês, usados só para exibição no
dashboard e no deck; os resultados versionados foram gerados com os prompts em português.

### Básicas

1. **p1-marina** — "Amanhã de manhã eu tenho reunião com a Marina? Se sim, manda um email pra ela confirmando o horário e cria um lembrete pra mim 30 minutos antes." (ideal: 3 tools; o email da Marina já vem no evento da agenda, então buscar o contato é opcional)
2. **p2-voo-sp** — "Sexta-feira preciso estar em São Paulo pra uma reunião às 14h. Procura o voo mais barato saindo do Rio de manhã, reserva pra mim e coloca o voo na minha agenda." (ideal: 3 tools; há um voo mais barato à tarde como armadilha)
3. **p3-orcamento** — "Quanto eu gastei com restaurante esse mês? Se passou de R$ 800, cria uma tarefa pra eu revisar o orçamento e me manda um resumo por mensagem." (ideal: 3 tools; gasto real = R$ 942,50)

### Complexas
4. **p4-viagem-completa** — segurar (não comprar) o voo mais barato da manhã, hotel a < 2 km da reunião até R$ 500, reservar, bloquear a agenda das 8h às 18h e avisar a Marina por mensagem. (ideal: 6 tools)
5. **p5-reuniao-time** — achar horário livre, buscar os contatos, criar reunião com convites, criar subtarefa dentro de uma tarefa existente e agendar um email pra amanhã às 8h. (ideal: 7 tools)
6. **p6-financas** — gastos por restaurante, nota em formato checklist com o top 3, PIX agendado pro dia 25 e lembrete por localização ao chegar em casa. (ideal: 4 tools)

## Rodando

Requer Node 24+.

```bash
cp .env.example .env.local     # preencha OPENROUTER_API_KEY e TYPESAFE_API_KEY
npm install

# um modo por vez
npm run eval                                   # AGENT_MODE=llm-direct (padrão)
AGENT_MODE=jev-classifier npm run eval

# ou modos × modelos de uma vez
npm run eval:all
MODELS="gemini-3.8-flash opus-5" npm run eval:all

# dashboard + slides
npm run ui        # dashboard em http://localhost:4321 · deck em http://localhost:4321/slides.html
```

O dashboard e o deck abrem em **inglês por padrão**. Para ver em português use os botões **EN / PT** no
topo do dashboard, a tecla `L` no deck ou `?lang=pt` na URL; a escolha fica salva no navegador e vai
junto no HTML exportado.

Os dois têm exportação para um HTML único, com dados e gráficos embutidos, que abre sem servidor:
botão **exportar HTML** no dashboard (leva os filtros e o destaque atuais) e tecla `E` no deck.

O deck (`eval-ui/slides.html`) conta a história do caso de uso (problema → ideia → arquitetura →
catálogo e tarefas → traces e evals → resultados → onde tropeça → conclusão) com os números lidos
de `eval-results/`. Navegação: ← → / espaço, `F` tela cheia, `N` notas do apresentador, `D` volta ao
dashboard, chips trocam o modelo nos slides de resultado.

`eval-results/` é versionado, então o dashboard e o deck abrem com os números do repositório sem
precisar rodar nada. Cada rodada sobrescreve `<modo>/<modelo>/<tarefa>.json` e acrescenta uma linha
em `history.jsonl`.

### Smoke test sem chaves

```bash
AGENT_MODEL=mock npm run eval                                      # llm-direct
AGENT_MODE=jev-classifier AGENT_MODEL=mock JEV_STUB=1 npm run eval  # jev-classifier
```

Usa o `mockModel` do eve com um plano roteirizado e um stub do Jev; serve só para validar o pipeline.

## Métricas gravadas por execução

`modelSteps` (chamadas ao LLM), `toolCalls`, `extraToolCalls`, `distractorCalls` (tool errada de
nome parecido), `jevCalls`, `completion` (fração das etapas obrigatórias cobertas), `idealPath`,
`efficiency` (conclusão × ideal/chamadas × ½ se houve tool errada), `usage` (tokens in/out e
`estimatedCostUsd` pelo preço público do OpenRouter), `reasoningChars`, `durationMs`, a resposta
final e a linha do tempo passo a passo (decisão do Jev com confiança e top-3, chamada ao modelo,
tool e argumentos).

O dashboard (`npm run ui`) mostra tudo isso com filtros por modelo e por nível de tarefa: passos e
chamadas por tarefa, tokens e custo, distribuição por modelo (rosca), ranking de eficiência,
composição das chamadas (no caminho / extras / erradas), eficiência × tokens e as linhas do tempo.
