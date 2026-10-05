# Jev Browser

[English](README.md) | Português (Brasil)

Harness híbrido de browser usage em TypeScript: um **LLM do OpenRouter transforma objetivos em subobjetivos verificáveis**, **Jev escolhe cada ação e campo no DOM**, o OpenRouter gera o texto sempre que a ação exige preenchimento, e o **Playwright executa**.

## Instalação

Node.js 22 ou superior:

```bash
npm install
npm run browser:install
```

Crie um `.env` seguindo `.env.example` e preencha `TYPESAFE_API_KEY`. A chave é obtida no [console TypeSafe](https://console.typesafe.ai). O modelo padrão é `jev-latest`; `TYPESAFE_MODEL` permite alterá-lo.

Para preenchimentos, configure também `OPENROUTER_API_KEY` com uma chave do [OpenRouter](https://openrouter.ai/settings/keys). `OPENROUTER_MODEL=openrouter/free` continua sendo o padrão, mas qualquer ID de modelo é aceito, gratuito ou pago, desde que o endpoint selecionado suporte saída estruturada. Exemplo: `OPENROUTER_MODEL=meta/muse-spark-1.3-contributor`. Custos, disponibilidade e limites pertencem ao modelo escolhido no OpenRouter; Jev continua usando sua conta TypeSafe.

O OpenRouter também é usado pelo modo `--goal` para criar o plano antes da abertura do navegador. Tarefas diretas e batches explícitos só usam o OpenRouter quando precisam preencher um campo.

## Uso

```bash
npm start -- --goal 'cadastre um usuário na example.com' \
  --value 'nome=Usuário de Teste' \
  --value 'email=usuario@example.com' \
  --value 'senha=uma-senha-de-teste' \
  --headed

npm start -- --url https://docs.typesafe.ai/introduction \
  'Abra a página Quick start' --headed

npm start -- --url https://www.wikipedia.org \
  'Pesquise Alan Turing e abra o artigo correspondente' --headed

npm start -- --url https://www.wikipedia.org \
  'Pesquise Alan Turing e abra o artigo correspondente' --value 'Alan Turing'

npm start -- --commands \
  '["acesse google.com","pesquise por Example Academy","mapeie os concorrentes"]' \
  --headed
```

`--goal` pede ao OpenRouter um plano curto de subobjetivos sequenciais e verificáveis. O plano não contém seletores nem inventa campos: cada subobjetivo é entregue ao Jev, que observa a página e escolhe uma ação concreta por vez. O plano aparece no terminal e fica salvo em `plan.json`, `result.json` e `report.html`. O objetivo original também é enviado ao eval final para impedir que um plano incompleto seja aprovado.

Use `--value` para fornecer dados necessários ao objetivo. Valores com rótulos, como `email=...` e `senha=...`, ajudam o gerador a escolher o dado correto. Se faltar uma informação obrigatória, o OpenRouter retorna `text: null` e a execução termina como `missing_input`, sem inventar o dado. Use contas e ambientes de teste ao executar ações com efeito externo.

`--commands` recebe um array JSON com até 20 comandos. Eles são executados em ordem, no mesmo contexto do navegador, e cada comando precisa chegar a `done` antes do próximo começar. O array JSON também pode ser passado diretamente como argumento posicional. `--max-steps` vale para cada comando. Se `--url` não for informado, o harness usa o primeiro domínio ou URL encontrado nos comandos; caso não encontre, solicita `--url`.

`--headed` mostra o navegador; sem essa opção, roda headless. `--max-steps` limita o loop por comando (padrão 20, máximo 100). `--min-confidence` define o piso de confiança para executar uma decisão (padrão 0.55, ajustável ao seu caso).

Jev faz decisões estruturadas, não gera texto livre. Quando escolhe preencher, o OpenRouter recebe o comando atual, o campo escolhido, a observação e os últimos passos; retorna JSON com `text` e `reason`. Aspas duplas e `--value` (repetível) fornecem valores exatos ao gerador; o planejador e o Jev recebem apenas hints redigidos de que esses valores existem. Todo preenchimento passa pelo LLM, mesmo com valor explícito. Cliques, Enter, seleção e rolagem não chamam o OpenRouter. A URL inicial vem de `--url` ou do primeiro domínio reconhecido na entrada.

## Planejamento e loop

Para comandos isolados como `Abra https://example.com`, o harness verifica a URL observada e a presença de conteúdo antes de consultar o Jev. Uma URL correspondente conclui a navegação de forma determinística, aceitando redirecionamento `www` ou troca de HTTP para HTTPS e preservando porta, caminho, query e fragmento. Tarefas compostas continuam passando pelo Jev. Esses passos registram `decisionSource: "postcondition"` e a razão da verificação; a confiança `1` representa a regra, não a certeza do modelo.

O Jev e o gerador recebem o objetivo original, a lista de comandos, o índice atual e os comandos concluídos. As instruções do planejador separam navegação, descoberta, preenchimento, envio e verificação; cada comando deve ter uma única condição de conclusão. Marcadores como `<provided>` são metadados: o gerador resolve os dados reais a partir de `--value`, e o executor rejeita esses marcadores como conteúdo de preenchimento.

Uma observação sem texto e sem elementos aciona uma espera automática, sem chamada ao Jev. A ação `wait` também pode executar abaixo do piso de confiança, pois apenas aguarda uma nova observação. Há no máximo cinco esperas consecutivas por comando; se ainda precisar esperar, a execução termina como `page_not_ready`. As esperas contam no limite de passos. As demais ações continuam sujeitas a `--min-confidence`. O terminal e o HTML mostram a razão da política; os passos registram `decisionSource` (`readiness` ou `jev`). A confiança `1` de uma espera automática representa uma regra determinística, não uma avaliação do modelo.

1. No modo `--goal`, solicita ao OpenRouter entre 1 e 20 subobjetivos autocontidos; `--commands` ignora esse planejamento e usa exatamente o batch informado.
2. Captura URL, título, até 12 mil caracteres do texto da página e até 60 elementos visíveis na viewport.
3. Cria opções concretas: clicar, preencher um campo, selecionar, Enter, rolar, voltar, esperar, concluir ou parar.
4. Envia o subobjetivo atual, a observação e os últimos passos ao Jev pelo SDK oficial TypeSafe.
5. Valida a escolha e a confiança; se for preenchimento, pede o texto ao OpenRouter e valida a resposta. Executa via Playwright e observa novamente.
6. Para ao concluir, faltar informação, encontrar baixa confiança, repetir a mesma ação no mesmo estado ou atingir o limite.

Cada execução grava seus artefatos em `runs/<timestamp>/`. O log inclui o texto e o modelo usado em cada preenchimento, com valores de campos de senha redigidos. O status `done` representa a declaração de conclusão do executor; uma avaliação separada verifica o resultado. Código de saída: `0` somente para `done` + eval `passed`, `2` para parada sem conclusão ou eval não aprovado, `1` para erro fatal de configuração/API/execução. Falhas de ações entram no histórico para orientar a próxima decisão; falhas da API Jev encerram a execução após os retries do SDK.

Se o LLM indicar falta de informação (`text: null`), a execução para com `missing_input`. Erro HTTP, timeout de 45 segundos, JSON inválido ou resposta truncada do OpenRouter produz `generation_error`. Ambos usam código de saída `2`, preservam os logs e não executam o preenchimento. Não há retries nem fallback automático para outro modelo no gerador.

## Eval e observabilidade — habilitados por padrão

Toda execução pela CLI ou por `runSession` captura evidências e executa a avaliação final, sem flags adicionais. O terminal informa o caminho de `report.html`, que pode ser aberto diretamente no navegador, offline. `runHarness` é o loop de baixo nível; integrações devem usar `runSession` para obter esses recursos por padrão.

| Artefato                                                   | Conteúdo                                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `report.html`                                              | Comandos, resultado do executor e do eval, ações, confiança, tempo, texto gerado e links para evidências                  |
| `plan.json`                                                | Objetivo, comandos planejados, justificativa, modelo e tokens; existe somente no modo `--goal`                            |
| `events.jsonl`                                             | Eventos ordenados com timestamps, entradas/saídas das chamadas Jev/OpenRouter/eval, duração, erros e eventos do navegador |
| `steps.jsonl`                                              | Ações concluídas ou interrompidas, registradas incrementalmente                                                           |
| `evidence/step-NNN-before/after.observation.json` e `.png` | Observação do DOM e screenshot antes/depois de cada passo registrado                                                      |
| `final.observation.json` e `final.png`                     | Estado final capturado, inclusive após falhas quando o navegador estiver disponível                                       |
| `trace.zip`                                                | Trace do Playwright com ações, snapshots, screenshots e rede do navegador                                                 |
| `eval.json`                                                | Veredito, confiança, verificações explícitas e referência à evidência                                                     |
| `result.json`                                              | Resultado completo (schema versão 3), status por comando, métricas, tempos, tokens e falhas de captura                    |

O eval faz **uma chamada adicional ao Jev**, com uma pergunta distinta da escolha de ações. Recebe a lista ordenada de comandos, estado final e ações concretas associadas a cada comando; não recebe a declaração `done` como evidência de sucesso. Usa o mesmo modelo TypeSafe configurado, portanto é uma segunda avaliação, não um juiz de fornecedor independente. A chamada adicional usa a conta TypeSafe.

Vereditos: `passed` (evidência de conclusão), `failed` (requisito não cumprido), `inconclusive` (evidência insuficiente ou confiança abaixo de 0.70) e `error` (falha no avaliador). O juiz recebe observações textuais limitadas pelo harness, não as imagens. É uma avaliação probabilística; não comprova efeitos externos invisíveis no navegador.

Para critérios verificáveis, acrescente expectativas opcionais. Ambas verificam **substring literal, com distinção entre maiúsculas e minúsculas**, na observação final. Uma expectativa falsa reprova a avaliação mesmo quando o juiz aprova:

```bash
npm start -- --url https://www.wikipedia.org \
  'Pesquise Alan Turing e abra o artigo correspondente' \
  --expect-text 'Alan Turing' --expect-url '/wiki/Alan_Turing'
```

Para inspecionar o trace, use o [Trace Viewer do Playwright](https://playwright.dev/docs/trace-viewer):

```bash
npx playwright show-trace runs/<execução>/trace.zip
```

Falhas de navegação, modelo ou abertura do browser passam pela finalização e produzem relatório. Se não houver estado final, o eval é inconclusivo. Erros do avaliador não apagam os registros da execução. Falhas ao capturar screenshots/trace aparecem em `warnings`. Encerramento forçado do processo e falha de escrita no disco podem impedir a finalização; os eventos já gravados permanecem. Argumentos inválidos são rejeitados antes de iniciar uma execução.

As métricas contam chamadas lógicas de `planner`, `jev`, `openrouter` e `eval` (os retries internos do SDK não são chamadas separadas), latência e tokens reportados pelo provedor; `callsWithUsage` distingue consumo conhecido de consumo não informado. Não há estimativa de custo monetário. Modelos efetivamente usados ficam registrados nas respostas dos eventos.

## Escopo

Protótipo para navegação e formulários simples em uma aba e contexto novo. Links com `target` abrem na mesma aba; popups por JavaScript, iframes, CAPTCHA, confirmação por e-mail, MFA, login persistente, uploads e downloads não são suportados. Campos de senha podem ser preenchidos pelo OpenRouter e são redigidos dos eventos, passos, resultado e entrada do eval. As instruções orientam o Jev a tratar conteúdo da página como dados e exigir pedido explícito para ações com efeitos externos; isso não é uma barreira de segurança contra prompt injection. Use em páginas e tarefas de teste sob seu controle.

Texto da página é enviado à TypeSafe. O planejador e o Jev recebem apenas indicações de que valores foram fornecidos, como `senha=<provided>`; o valor integral é enviado ao OpenRouter somente quando ele precisa gerar o conteúdo de um campo. Os artefatos são locais, sem serviço externo de telemetria. Eventos e resultados redigem valores de campos de senha, mas screenshots, DOM de terceiros e principalmente `trace.zip` podem conter dados da tarefa, formulários e tráfego do site; o trace não deve ser tratado como anonimizado. Chaves dos clientes não são incluídas nos eventos do harness. `runs/` e `.env` estão no `.gitignore`.

## Validação

```bash
npm run check
npm test
```

Os testes usam Chromium real, servidor HTTP local e modelos simulados. Validam planejamento de objetivos, execução dos subobjetivos, fluxo híbrido, campos de senha com redação, ausência de chamadas ao gerador em outras ações ou baixa confiança, erros de geração, informação ausente, formato HTTP/JSON, observação do resultado, decisão inválida, loop e limite de passos. Também verificam geração dos artefatos, métricas, vereditos, divergência executor/juiz, falhas antes e durante a execução e escape de conteúdo no HTML. Não precisam de chave nem comprovam a qualidade das decisões dos modelos reais.

O código está organizado em `src/domain` (tipos e regras), `src/application` (loop, sessão e avaliação) e `src/infrastructure` (Playwright, modelos, telemetria e HTML). `src/session.ts` compõe os adaptadores e mantém a entrada programática com eval e observabilidade ativos. Veja [arquitetura e regras de dependência](docs/architecture.md).

Use `npm run validate` para executar tipos, formatação e todos os testes, incluindo a verificação automática das fronteiras entre camadas. `npm run format` aplica a formatação padrão.

OpenRouter: [roteador gratuito](https://openrouter.ai/docs/cookbook/get-started/free-models-router-playground) e [saída estruturada](https://openrouter.ai/docs/guides/features/structured-outputs).

Referências: [introdução ao Jev](https://docs.typesafe.ai/introduction), [SDK JavaScript](https://docs.typesafe.ai/sdk/javascript), [API](https://docs.typesafe.ai/api), [confiança](https://docs.typesafe.ai/confidence).
