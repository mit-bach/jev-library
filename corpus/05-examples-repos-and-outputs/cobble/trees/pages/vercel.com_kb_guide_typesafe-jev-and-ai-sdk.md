---
title: How to classify, route, and score with Jev and AI SDK
description: Use Jev from TypeSafe AI with AI SDK's experimental `evaluate` API to classify, route, score, and verify inside your application. Jev returns typed choices, scores, and boolean probabilities through AI Gateway.
url: "https://vercel.com/kb/guide/typesafe-jev-and-ai-sdk"
published: 2026-09-19
last_updated: 2026-09-22
authors: Ben Sabic
related_resources:
  - title: "What is Jev, TypeSafe AI's System One model?"
    url: "https://vercel.com/i/what-is-jev"
    description: "Jev is TypeSafe AI's System One model, built to return typed decisions with probabilities from supplied state and questions."
  - title: "7 practical Jev use cases for AI applications"
    url: "https://vercel.com/i/jev-use-cases"
    description: "Explore seven Jev use cases, including form routing, ticket prioritization, tool approvals, document classification, and response evaluation."
  - title: "How to automatically approve tool calls in eve with Jev"
    url: "https://vercel.com/kb/guide/auto-approve-tool-calls-eve-jev"
    description: "Use Jev to review tool calls in eve, allow routine actions, and request human approval when needed. Configure the policy and test its failure paths."
  - title: "Jev is the fastest-adopted model in AI Gateway history"
    url: "https://vercel.com/blog/ai-gateway-jev-model-launch"
    description: "Within 24 hours of launching on AI Gateway, Jev from TypeSafe AI has been used by more than twice the share of teams of any other recent model launch in its first day."
  - title: "AI SDK Evaluation"
    url: "https://ai-sdk.dev/docs/ai-sdk-core/evaluation"
    description: "experimental_evaluate evaluates named questions against one shared state using an evaluation model. State can be a string, JSON object, or JSON array. An array is one state, not a batch of unrelated inputs."
install_vercel_plugin: npx plugins add vercel/vercel-plugin
---

Routing a support ticket, assessing an agent’s proposed action, or rating a request’s urgency calls for a decision your code can act on. Language models can return structured decisions, but still produce them through text generation.

[Jev](https://vercel.com/i/what-is-jev), a System One model from TypeSafe AI, evaluates supplied state against typed questions and returns choices, scores, and boolean probabilities without generating prose. The AI SDK’s `experimental_evaluate` API makes these answers available directly in TypeScript via Vercel [AI Gateway](https://vercel.com/ai-gateway).

Your application decides what happens next: a department choice can select a support queue, a severity score can influence priority, and an uncertain result can trigger review. Keeping those rules in code lets you change how the application responds without redefining what you ask the model to assess.

## Overview

In this guide, you'll learn how to:

- Ask a single yes-or-no question about a piece of state
  
- Answer several typed questions in one request, including choice, score, and boolean questions against structured state
  
- Branch on probabilities and confidence so clear cases route automatically and uncertain cases go to review
  
- Unit-test that branching with a mock evaluation model
  
- Call Jev through the Gateway provider instance when your application needs an explicit provider object
  

## Prerequisites

Before you begin, make sure you have:

- A [Vercel account](https://vercel.com/signup)
  
- [Vercel CLI](https://vercel.com/docs/cli) installed (`npm i -g vercel`)
  
- Node.js 22+ and a package manager (e.g., [pnpm](https://pnpm.io/))
  
- An existing [Next.js](https://nextjs.org/docs/app) project using the App Router
  

## How Jev differs from a language model

Jev is a [probabilistic decision model, not a chat model](https://vercel.com/i/when-to-use-jev). Language models can generate structured answers, but any probability included in that output is itself a generated estimate.

Jev evaluates each question independently against the same state, returning typed answers with probabilities over the defined outcomes. Your schema constrains those answers, but doesn’t guarantee they’re correct.

|                           | Language model                            | Jev                                                                   |
| ------------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| **Output**                | Free-form text or structured output       | Typed `choice`, `score`, and `boolean` answers with probabilities     |
| **Probabilities**         | Prompted estimates, when available at all | Native to every answer, with a full distribution for choice and score |
| **Questions per request** | Answered together in one generation       | Evaluated independently, so adding a question doesn't change others   |
| **Text generation**       | Yes                                       | No                                                                    |

### Jev on AI Gateway at a glance

| Property            | Value                                                     |
| ------------------- | --------------------------------------------------------- |
| Model ID            | `typesafe-ai/jev`                                         |
| Model type          | Evaluation                                                |
| Context window      | 64,000 tokens per request and 32,000 for `state`          |
| Output token charge | None (input tokens only)                                  |
| Pricing             | $0.042 per 1M input tokens                                |
| Data controls       | Zero Data Retention and No Training, per request          |
| Observability       | Appears in AI Gateway logs, custom reporting, and budgets |

### Three question types

AI SDK exposes three question types, each mapped to a TypeSafe AI primitive:

| `type`    | What it does                               | `criteria`                                     | Answer fields             | Limits            |
| --------- | ------------------------------------------ | ---------------------------------------------- | ------------------------- | ----------------- |
| `choice`  | Picks one option from a named set          | Map of option keys to descriptions             | `choice`, `probabilities` | Up to 255 options |
| `score`   | Grades the state against an ordered rubric | Array of level descriptions, lowest to highest | `score`, `probabilities`  | 2 to 10 levels    |
| `boolean` | Estimates whether a statement is true      | Optional `true` and `false` descriptions       | `probability`             | None              |

Every answer keeps its question ID and matches the question’s `type`. For Boolean answers, `probability` estimates how likely the statement is to be true:

- `0.98` indicates a strong yes.
  
- `0.02` indicates a strong no.
  
- `0.5` indicates uncertainty between the two outcomes.
  

## Steps

### 1\. Install the AI SDK

Install AI SDK 7.0.105 or later, which adds `experimental_evaluate`:

**pnpm**

```bash
pnpm i ai
```

**npm**

```bash
npm i ai
```

**yarn**

```bash
yarn add ai
```

**bun**

```bash
bun add ai
```

Link your local directory to its Vercel project and pull your environment variables. This writes a `VERCEL_OIDC_TOKEN` to your environment file.

```bash
vercel link
vercel env pull
```

When you pass a model ID as a plain string (e.g., `typesafe-ai/jev`), AI SDK routes the call through AI Gateway and authenticates with the OIDC token.

Deployments on Vercel automatically receive the token. Locally, the token expires after 12 hours, so re-run `vercel env pull` when a request returns a 401.

### 2\. Ask one boolean question

Start with a single yes-or-no decision. The `state` is whatever you want the model to look at, and each key in `questions` becomes a key in `answers`.

```typescript
import { experimental_evaluate as evaluate } from 'ai';

export async function wasRefunded(transcript: string) {
  const result = await evaluate({
    model: 'typesafe-ai/jev',
    state: transcript,
    questions: {
      refunded: {
        type: 'boolean',
        instructions: 'Was a refund issued to the customer?',
        criteria: {
          true: 'The agent confirmed that money was returned to the customer.',
          false: 'No refund was issued, or the refund was declined.',
        },
      },
    },
  });

  return result.answers.refunded.probability;
}
```

Calling `wasRefunded('The support agent issued a full refund to the customer.')` returns a number close to `1`.

One example of `result.answers`:

```json
{
  "refunded": { "type": "boolean", "probability": 0.99 }
}
```

The `criteria` on a boolean question are optional, but they sharpen the decision by telling the model exactly what counts as true and false.

### 3\. Answer several questions against structured state in one request

Jev evaluates all questions in a request in parallel, so adding questions barely changes latency. You can mix all three question types, and `state` accepts a JSON object or array as well as a string, which means you can pass a record or a message history without serializing it yourself.

The following route handler triages a support ticket into a department, a severity level, and a refund flag in one round trip.

```typescript
import { experimental_evaluate as evaluate } from 'ai';

export async function POST(request: Request) {

  const ticket = await request.json();

  const result = await evaluate({
    model: 'typesafe-ai/jev',
    state: {
      subject: ticket.subject,
      message: ticket.message,
      plan: ticket.plan,
      previousTickets: ticket.previousTickets,
    },
    questions: {
      department: {
        type: 'choice',
        instructions: 'Which team should handle this ticket?',
        criteria: {
          billing: 'Charges, invoices, and refunds',
          technical: 'Bugs, outages, and integration failures',
          account: 'Login, permissions, and profile changes',
          other: 'Anything that does not fit the other teams',
        },
      },
      severity: {
        type: 'score',
        instructions: 'How severe is the issue for the customer?',
        criteria: [
          'Cosmetic or informational',
          'Degraded, but a workaround exists',
          'Blocking with no workaround',
          'Blocking and causing financial or data loss',
        ],
      },
      requestsRefund: {
        type: 'boolean',
        instructions: 'Is the customer asking for money back?',
      },
    },
    providerOptions: {
      gateway: { zeroDataRetention: true },
    },
  });

  return Response.json(result.answers);
}
```

Start the dev server and send a ticket:

**pnpm**

```bash
pnpm dev
```

**npm**

```bash
npm run dev
```

**yarn**

```bash
yarn dev
```

**bun**

```bash
bun dev
```

```bash
curl -X POST http://localhost:3000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Stripe sync broken",
    "message": "My Stripe connection has failed for three days and I am losing sales. Refund me for this month.",
    "plan": "pro",
    "previousTickets": 2
  }'
```

The response contains a typed answer and probabilities for each question under its original ID, as shown in the example below:

```json
{
  "department": {
    "type": "choice",
    "choice": "technical",
    "probabilities": { "billing": 0.08, "technical": 0.91, "account": 0.01, "other": 0 }
  },
  "severity": {
    "type": "score",
    "score": 2.86,
    "probabilities": { "0": 0, "1": 0.02, "2": 0.1, "3": 0.88 }
  },
  "requestsRefund": { "type": "boolean", "probability": 0.97 }
}
```

Reading the response:

- `department.choice` is inferred as a union of your option keys (`'billing' | 'technical' | 'account' | 'other'`), so TypeScript flags a typo like `choice === 'tech'` at compile time.
  
- `department.probabilities` covers every option, and the selected choice always has the highest value.
  
- `severity.score` is the probability-weighted mean across the rubric levels, indexed from zero. `2.86` sits between "Blocking with no workaround" and "Blocking and causing financial or data loss".
  
- `severity.probabilities` uses string keys for the level indices, so `"3"` is the fourth rubric entry.
  
- `requestsRefund.probability` is the estimated probability that the customer wants money back, not a confidence in the answer.
  

The `providerOptions.gateway` object is optional. Jev supports [Zero Data Retention](https://vercel.com/docs/ai-gateway/security-and-compliance/zdr) and [No Training](https://vercel.com/docs/ai-gateway/security-and-compliance/disallow-prompt-training) per request, and evaluation calls appear in AI Gateway [logs](https://vercel.com/docs/ai-gateway/observability-and-spend/logs) and count toward [budgets](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets) like any other model call.

### 4\. Branch on probabilities and confidence

Use the returned probabilities to decide when your application should act automatically or request review, setting stricter thresholds where an incorrect decision would have greater consequences.

TypeSafe AI also returns a separate `confidence` statistic for choice and score answers in `result.providerMetadata.typesafe.confidence`, keyed by question ID. Confidence summarizes how concentrated the probability distribution is, from `0` (spread evenly across options) to `1` (all on one option). It differs from the selected option's probability, and it isn't returned for boolean answers.

The routing logic below uses two paths:

| Condition                                                                                     | What your code does             |
| --------------------------------------------------------------------------------------------- | ------------------------------- |
| Department confidence is 0.6 or higher and the selected option's probability is 0.7 or higher | Assign the ticket to that queue |
| Either value is below its floor                                                               | Send the ticket to a human      |

Move the `evaluate` call into a function that returns a decision, keeping the questions from step three. Its `model` parameter defaults to Jev and lets the tests in step five substitute a mock.

```typescript
import {
  experimental_evaluate as evaluate,
  type Experimental_EvaluationModel as EvaluationModel,
} from 'ai';
export type Ticket = {
  subject: string;
  message: string;
  plan: string;
  previousTickets: number;
};
export async function routeTicket(
  ticket: Ticket,
  model: EvaluationModel = 'typesafe-ai/jev',
) {

  const result = await evaluate({
    model,
    state: ticket,
    questions: {
      department: {
        type: 'choice',
        instructions: 'Which team should handle this ticket?',
        criteria: {
          billing: 'Charges, invoices, and refunds',
          technical: 'Bugs, outages, and integration failures',
          account: 'Login, permissions, and profile changes',
          other: 'Anything that does not fit the other teams',
        },
      },
      severity: {
        type: 'score',
        instructions: 'How severe is the issue for the customer?',
        criteria: [
          'Cosmetic or informational',
          'Degraded, but a workaround exists',
          'Blocking with no workaround',
          'Blocking and causing financial or data loss',
        ],
      },
      requestsRefund: {
        type: 'boolean',
        instructions: 'Is the customer asking for money back?',
      },
    },
    providerOptions: {
      gateway: { zeroDataRetention: true },
    },
  });
  const { department, severity, requestsRefund } = result.answers;
  const confidence = result.providerMetadata?.typesafe?.confidence as
    | Record<string, number>
    | undefined;
  const departmentConfidence = confidence?.department ?? 0;
  const selectedProbability = department.probabilities?.[department.choice] ?? 0;
  // Below either floor, the model can't tell. Don't guess.
  if (departmentConfidence < 0.6 || selectedProbability < 0.7) {
    return { action: 'human-review' as const, reason: 'ambiguous department' };
  }
  return {
    action: 'assign' as const,
    queue: department.choice, // 'billing' | 'technical' | 'account' | 'other'
    severity: severity.score,
    // Jev classified the request. Whether to grant it is a separate check.
    refundRequested: requestsRefund.probability >= 0.8,
  };
}
```

Then update the route handler from step three to call `routeTicket` and return the routing decision instead of the raw model answers:

```typescript
import { routeTicket, type Ticket } from '@/lib/route-ticket';

export async function POST(request: Request) {
  const ticket = (await request.json()) as Ticket;
  return Response.json(await routeTicket(ticket));
}
```

Sending the same `curl` request from step three now returns a decision:

```json
{
  "action": "assign",
  "queue": "technical",
  "severity": 2.86,
  "refundRequested": true
}
```

Keep two distinctions in mind when applying this pattern:

- **Probability distributions are optional in the AI SDK.** Jev returns `probabilities` for Choice and Score answers, but other providers may omit them. Use optional chaining (`?.`) and handle a missing distribution explicitly, such as by sending the ticket to review.
  
- `refundRequested` **records intent, not approval.** It identifies whether the customer asked for money back. The billing team or application rules must check eligibility against the account, plan, and refund policy before approving a refund.
  

Treat the example thresholds as starting points. Calibration describes how predicted probabilities match observed outcomes across many examples; it doesn’t guarantee an individual answer is correct. Evaluate labeled tickets using the same questions, then [choose cutoffs based on the errors your workflow can tolerate](https://vercel.com/i/jev-probabilities-and-thresholds).

### 5\. Test the routing logic without calling Jev

The thresholds in `routeTicket` are application logic, so test them like any other function. The AI SDK ships `Experimental_EvaluationMockModelV4` in `ai/test`, which returns whatever answers you give it. Pass it as the `model` argument to check each branch with fixed inputs and no network call.

Add Vitest as a development dependency:

**pnpm**

```bash
pnpm add -D vitest
```

**npm**

```bash
npm install -D vitest
```

**yarn**

```bash
yarn add -D vitest
```

**bun**

```bash
bun add -d vitest
```

The `mockJev` helper derives its `answers` type from the mock’s `doEvaluate` return type, letting TypeScript catch incompatible answer shapes at compile time.

```typescript
import { Experimental_EvaluationMockModelV4 as MockEvaluationModel } from 'ai/test';
import { describe, expect, it } from 'vitest';
import { routeTicket, type Ticket } from './route-ticket';

type EvaluationResult = Awaited<ReturnType<MockEvaluationModel['doEvaluate']>>;

const ticket: Ticket = {
  subject: 'Stripe sync broken',
  message: 'My Stripe connection has failed for three days.',
  plan: 'pro',
  previousTickets: 2,
};

function mockJev(
  answers: EvaluationResult['answers'],
  confidence?: Record<string, number>,
) {
  return new MockEvaluationModel({
    doEvaluate: async () => ({
      answers,
      warnings: [],
      ...(confidence && { providerMetadata: { typesafe: { confidence } } }),
    }),
  });
}

const clearAnswers: EvaluationResult['answers'] = {
  department: {
    type: 'choice',
    choice: 'technical',
    probabilities: { billing: 0.05, technical: 0.93, account: 0.02, other: 0 },
  },
  severity: {
    type: 'score',
    score: 2.4,
    probabilities: { 0: 0, 1: 0.1, 2: 0.4, 3: 0.5 },
  },
  requestsRefund: { type: 'boolean', probability: 0.2 },
};

describe('routeTicket', () => {
  it('assigns the queue when the department is clear', async () => {
    const decision = await routeTicket(
      ticket,
      mockJev(clearAnswers, { department: 0.91, severity: 0.62 }),
    );

    expect(decision).toEqual({
      action: 'assign',
      queue: 'technical',
      severity: 2.4,
      refundRequested: false,
    });
  });

  it('assigns at exactly the confidence floor', async () => {
    const decision = await routeTicket(
      ticket,
      mockJev(clearAnswers, { department: 0.6, severity: 0.62 }),
    );

    expect(decision.action).toBe('assign');
  });

  it('sends the ticket to a human when the selected probability is too low', async () => {
    const decision = await routeTicket(
      ticket,
      mockJev(
        {
          ...clearAnswers,
          department: {
            type: 'choice',
            choice: 'billing',
            probabilities: { billing: 0.45, technical: 0.4, account: 0.15, other: 0 },
          },
        },
        { department: 0.7, severity: 0.5 },
      ),
    );

    expect(decision.action).toBe('human-review');
  });

  it('sends the ticket to a human when confidence metadata is missing', async () => {
    const decision = await routeTicket(ticket, mockJev(clearAnswers));

    expect(decision.action).toBe('human-review');
  });
});
```

Run the tests:

**pnpm**

```bash
pnpm vitest run lib/route-ticket.test.ts
```

**npm**

```bash
npx vitest run lib/route-ticket.test.ts
```

**yarn**

```bash
yarn vitest run lib/route-ticket.test.ts
```

**bun**

```bash
bunx vitest run lib/route-ticket.test.ts
```

**Expected output:**

```text
✓ lib/route-ticket.test.ts (4 tests)

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

Testing the thresholds this way is separate from checking whether the thresholds are right for your data. For that, run real tickets with known outcomes through Jev and compare its probabilities to what actually happened.

### 6\. Use the Gateway provider instance

Use `@ai-sdk/gateway` when you need an explicit provider object or want to configure custom headers, a custom `fetch`, or a different Gateway base URL.

**pnpm**

```bash
pnpm i @ai-sdk/gateway
```

**npm**

```bash
npm i @ai-sdk/gateway
```

**yarn**

```bash
yarn add @ai-sdk/gateway
```

**bun**

```bash
bun add @ai-sdk/gateway
```

```typescript
import { gateway } from '@ai-sdk/gateway';
import { experimental_evaluate as evaluate } from 'ai';

const result = await evaluate({
  model: gateway.evaluationModel('typesafe-ai/jev'),
  state: 'I was charged twice. Please refund the duplicate.',
  questions: {
    requestsRefund: {
      type: 'boolean',
      instructions: 'Is the customer requesting money back?',
    },
  },
});

console.log(result.answers.requestsRefund.probability);
```

The string and provider-instance forms are interchangeable.

## Best practices

### Ask atomic questions and combine them in code

Jev works best when each question asks one well-scoped thing that a knowledgeable person could answer in a few seconds. If a question would require extended reasoning or weighs several independent factors, split it into one question per factor and combine the answers with your own logic.

| Instead of                           | Ask                                                                                                | Then                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| "Rate this pull request"             | Three score questions: test coverage, documentation, description clarity                           | Weight the three scores by importance in code                  |
| "Is this ticket a priority?"         | A boolean for urgency, a score for business impact, a choice for customer tier                     | Compute ticket priority from all three answers                 |
| "Should the agent run this command?" | A boolean for destructive intent, a boolean for touching production, a choice for command category | Require confirmation when any risk flag exceeds your threshold |

### Describe options and levels instead of labeling them

Choice criteria are a map of option keys to descriptions, and score criteria are ordered descriptions from lowest to highest.

Writing `'Blocking with no workaround'` gives the model far more to match against than `'high'`. Descriptions can be strings, JSON objects, or arrays, so you can pass a list of example phrases for each option.

### Keep state focused

Input tokens are the only thing you pay for, so pass the fields the decision depends on rather than an entire record. Adding questions to a request doesn't degrade the answers to existing ones, because each question is evaluated independently.

### Set thresholds per action, not per model

Read-only actions like showing a screen can tolerate a wrong guess, so a probability of 0.7 might be enough. Destructive actions need a higher bar, closer to 0.9 or above, and a confirmation step below it. Encode that risk tolerance in your code, and keep a review path for anything under your floor.

Keep [classification separate from authorization](https://vercel.com/i/jev-agent-control). Jev can tell you that a customer asked for a refund or that a command looks destructive. Whether to grant the refund or run the command depends on rules Jev doesn't see, such as account status, policy, and permissions, so make that a second check in your code.

### Read distributions defensively

TypeSafe AI rounds probabilities and scores to two decimal places, and `result.rounding` reports that precision. Because of this rounding, a choice distribution may sum to `0.99` rather than exactly `1`. The AI SDK accounts for this during validation, so don't renormalize the values yourself.

## Troubleshooting

### Authentication errors (`401` or `403`)

Expired local credentials or an unlinked project can prevent authentication. Run `vercel env pull` to refresh your credentials, using `vercel link` first if the directory isn’t linked to a project. If a `403` persists, check your access to the linked project and AI Gateway.

### Unsupported question type

The evaluation model doesn’t support one of the requested question types. Check the model’s supported types and either adjust the questions or select a model that supports them. Jev supports Choice, Score, and Boolean questions.

### `NoSuchModelError`

When `modelType` is `'evaluationModel'`, the provider couldn’t resolve the requested evaluation model or doesn’t support evaluation. Check that the model ID is `typesafe-ai/jev` and that the call resolves through AI Gateway or another evaluation-capable provider.

### `InvalidResponseDataError`

The provider returned an invalid answer, such as a distribution with a missing option or a score outside the rubric range. Retry the request. If the error persists, report the failing questions and response to the provider.

### Evaluation is unavailable through an OpenAI-compatible client

AI Gateway exposes evaluation through the AI SDK, rather than its compatibility endpoints. Call `experimental_evaluate` from the `ai` package.

OpenAI-compatible endpoints don't support Jev evaluation. Use `experimental_evaluate` from the `ai` package for the examples in this guide. For other integrations, AI Gateway supports a [native HTTP evaluation API](https://vercel.com/docs/ai-gateway/modalities/evaluation#http-api) and a [TypeSafe-compatible API](https://vercel.com/docs/ai-gateway/sdks-and-apis/typesafe) for existing TypeSafe clients.

### Answers seem overconfident on your data

Run labeled examples through the same questions and compare predicted probabilities with observed outcomes. Inspect where errors cluster, revise unclear criteria, and evaluate the updated questions before choosing new thresholds.

## Next steps

- Follow [Route form submissions with Jev and AI SDK](https://vercel.com/kb/guide/jev-ai-sdk-form-router) to deploy a form router with configurable destinations, a fallback model, and optional email delivery
  
- Follow [How to automatically approve tool calls in eve with Jev](https://vercel.com/kb/guide/auto-approve-tool-calls-eve-jev) to apply the same `clear` and `caution` classification to an eve agent's tool calls, so routine actions run automatically and risky ones pause for a person
  
- See the same classify-score-flag pattern with TanStack AI's `decide()` in [Moderate product reviews with Jev, TanStack AI, and AI Gateway](https://vercel.com/kb/guide/moderate-product-reviews-jev-tanstack-ai), including how its result shape differs from `experimental_evaluate`
  
- Read [What is Jev, TypeSafe AI's System One model?](https://vercel.com/i/what-is-jev) and [When should you use Jev?](https://vercel.com/i/when-to-use-jev) to find other decisions in your application that fit a typed question
  
- Explore [seven practical Jev use cases](https://vercel.com/i/jev-use-cases) to apply typed questions to document categorization, moderation review, and response evaluation.
  
- [Evaluate Jev's probabilities and choose a threshold](https://vercel.com/i/jev-probabilities-and-thresholds) using labeled submissions to measure routing errors and assess whether `0.95` suits your workflow
  
- Explore the [AI SDK evaluation guide](https://ai-sdk.dev/docs/ai-sdk-core/evaluation) for the `evaluate` API, question types, and `Experimental_EvaluationMockModelV4` for tests
  
- See the [AI Gateway evaluation docs](https://vercel.com/docs/ai-gateway/modalities/evaluation) and the [Jev model page](https://vercel.com/ai-gateway/models/jev) for pricing, limits, and the Gateway provider instance

## Related Resources

- [What is Jev, TypeSafe AI's System One model?](https://vercel.com/i/what-is-jev): Jev is TypeSafe AI's System One model, built to return typed decisions with probabilities from supplied state and questions.
- [7 practical Jev use cases for AI applications](https://vercel.com/i/jev-use-cases): Explore seven Jev use cases, including form routing, ticket prioritization, tool approvals, document classification, and response evaluation.
- [How to automatically approve tool calls in eve with Jev](https://vercel.com/kb/guide/auto-approve-tool-calls-eve-jev): Use Jev to review tool calls in eve, allow routine actions, and request human approval when needed. Configure the policy and test its failure paths.
- [Jev is the fastest-adopted model in AI Gateway history](https://vercel.com/blog/ai-gateway-jev-model-launch): Within 24 hours of launching on AI Gateway, Jev from TypeSafe AI has been used by more than twice the share of teams of any other recent model launch in its first day.
- [AI SDK Evaluation](https://ai-sdk.dev/docs/ai-sdk-core/evaluation): experimental\_evaluate evaluates named questions against one shared state using an evaluation model. State can be a string, JSON object, or JSON array. An array is one state, not a batch of unrelated inputs.

## More AI SDK guides

- [Building community moderation agents using AI SDK](/kb/guide/building-community-moderation-agents-using-ai-sdk): Learn how to build an AI-powered community moderation agent with Next.js, the AI SDK, and AI Gateway.
- [Using TanStack Intent to ship and consume agent skills](/kb/guide/tanstack-intent): TanStack Intent is a CLI for shipping and consuming agent skills, markdown files that teach AI coding agents how to use a library correctly. This guide covers installing Intent, loading skills from your dependencies, and shipping skills as a maintainer.
- [How to use OpenAI Function Calling with Next.js and the Vercel AI SDK](/kb/guide/openai-function-calling): Learn how to use OpenAI Function Calling and Vercel AI SDK in a Next.js Application to build AI-powered user experiences.