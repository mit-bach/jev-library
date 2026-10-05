# Arquitetura

O projeto usa separação por responsabilidade e injeção explícita de dependências. Não há container de DI nem framework de aplicação.

```text
src/
  cli.ts                       Entrada, argumentos e saída no terminal
  session.ts                   Composição dos adaptadores de produção
  domain/
    types.ts                   Tipos, estados, contratos do planejador/modelos e resultados
    ports.ts                   Contratos do navegador e da telemetria
    actions.ts                 Construção determinística das ações candidatas
    config.ts                  Limites e validação compartilhados
    commands.ts                Parse, validação do batch e inferência da URL inicial
    input-values.ts            Extração de valores fornecidos pelo usuário
  application/
    harness.ts                 Loop observar → decidir → gerar → executar
    evaluate.ts                Regras para aprovação, falha e incerteza
    session.ts                 Ciclo de vida da execução e finalização
  infrastructure/
    browser/
      dom.ts                   Observação e execução sobre o DOM
      playwright.ts            Inicialização, eventos e adaptação do Playwright
    models/
      jev.ts                   Decisor e avaliador usando o SDK TypeSafe
      openrouter.ts            Planejamento e geração de texto via HTTP estruturado
    telemetry/
      file-observer.ts         Persistência de eventos, evidências e resultados
      metrics.ts               Agregação de chamadas, latências e tokens
    reporting/
      html.ts                  Renderização do relatório com escape de conteúdo
```

## Direção das dependências

`domain` não importa SDKs, arquivos nem outras camadas. `application` depende somente do domínio e de seus contratos. `infrastructure` implementa esses contratos com bibliotecas e I/O. A composição em `src/session.ts` conecta os adaptadores à aplicação.

O teste `test/architecture.test.ts` examina as declarações estáticas de imports e exports usadas no projeto: bloqueia dependências externas no núcleo, imports de camadas indevidas e ciclos entre módulos. Não é um analisador geral de imports dinâmicos. Novos adaptadores não exigem alterações no loop.

## Entradas públicas

- CLI: `npm start -- ...`, mantendo flags e comportamento existentes.
- Uso programático com defaults: `runSession` de `src/session.ts`. Aceita `goal`, `task` ou `commands`; eval e observabilidade continuam sempre ativos.
- Integrações com dependências próprias: `executeSession` de `src/application/session.ts` recebe `SessionDependencies` explicitamente.
- Testes isolados do loop: `runHarness` de `src/application/harness.ts` recebe `BrowserPort`, `Decider` e `TextGenerator`.

Os módulos antigos `src/browser.ts`, `src/jev.ts`, `src/openrouter.ts`, `src/harness.ts`, `src/eval.ts` e `src/observability.ts` foram distribuídos pelas novas camadas. Imports diretos desses módulos internos precisam usar os novos caminhos. A entrada `src/session.ts` permanece disponível.

## Recursos e erros

Cada `BrowserSnapshot` possui os elementos de uma observação e executa ações usando essas referências. O loop sempre chama `release()` em `finally`, inclusive quando o modelo falha. A aplicação encerra o navegador em `finally`; o adaptador também o encerra se a inicialização falhar parcialmente.

O armazenamento de arquivos pertence ao adaptador de telemetria. O caso de uso registra passos, solicita evidências e finaliza o resultado pelo contrato `RunTelemetry`. O HTML é uma função separada do acesso ao disco. Tipos compartilhados não pertencem a nenhum fornecedor.

Erros dos modelos continuam registrados e avaliados segundo as regras existentes. A construção dos clientes é adiada até seu uso, para que erros de configuração sejam capturados pela sessão. O campo `exitCode` agora também é persistido em `result.json`.

O schema dos artefatos está na versão 3. Cada execução contém `commands` e `commandResults`; execuções orientadas a objetivo também contêm `goal`, `plan` e o artefato `plan.json`. O planejador OpenRouter produz subobjetivos, não ações de DOM. Cada subobjetivo entra separadamente no mesmo loop Jev usado por batches explícitos.

Cada passo registra `commandIndex` e `command`. O batch roda sequencialmente no mesmo navegador e interrompe antes do próximo comando se o atual não terminar com `done`. Comandos que não começaram aparecem como `not_started` no relatório. Cada passo separa `candidate` (decisão do Jev) de `executedAction` (ação realmente enviada ao navegador). A intenção de preencher não aceita texto; só vira uma `FillAction` executável depois da geração. `outcome` é uma união fechada, e mensagens ficam em `error`. Uso de tokens é normalizado como `inputTokens` e `outputTokens`, independentemente do provedor.

Campos `password` são observados como editáveis e marcados com `sensitive`. O valor real é usado para executar o `fill`, enquanto observações, histórico, eval e eventos recebem `[REDACTED]`. Valores fornecidos viram apenas hints redigidos para planejador e Jev; o gerador OpenRouter recebe o valor integral quando precisa produzir o conteúdo do campo.

## Verificação

```bash
npm run validate
```

Executa TypeScript estrito, conferência de formatação e testes. Além de `strict`, o compilador usa `exactOptionalPropertyTypes` e `noUncheckedIndexedAccess`. `npm run format` aplica a formatação. Testes unitários verificam regras e contratos sem navegador; testes de integração usam Chromium real e modelos simulados. Os testes não consomem APIs externas.

Para adicionar outro navegador, implemente `BrowserPort`. Para outro modelo, implemente `GoalPlanner`, `Decider`, `TextGenerator` ou `Evaluator`. Para outro destino de observabilidade, implemente `RunTelemetry`. A seleção de cada implementação ocorre na composição, não nos casos de uso.
