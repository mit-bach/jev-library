import type { JevQuestion } from "@workspace/ui/components/jev-contract"
import catalog from "@/lib/playground/catalog.json" with { type: "json" }
import scenarios from "@/lib/playground/scenarios.json" with { type: "json" }
import provenance from "@/lib/playground/provenance.json" with { type: "json" }

export type LabKind =
  | "catalog"
  | "workflow"
  | "routing"
  | "evidence"
  | "ranking"
  | "solver"
  | "rebuild"
  | "game"
  | "chat"
  | "review"
  | "meme"
  | "classic"
export type LabEntry = {
  id: string
  title: string
  description: string
  group: string
  kind: LabKind
  state: unknown
  questions: JevQuestion[]
  tryThis: string
  upstream: string
  sourceFile: string
  comparison?: {
    path: string[]
    value: unknown
    labelA: string
    labelB: string
  }
  reference?: unknown
}

export const playgroundRevision = provenance.revision
export const playgroundSource = `https://github.com/${provenance.repository}/tree/${playgroundRevision}`
const choice = (
  id: string,
  label: string,
  criteria: Record<string, string>,
  instructions: string
): JevQuestion => ({ id, label, type: "choice", instructions, criteria })
const confidence: JevQuestion = {
  id: "supported",
  label: "Evidence support",
  type: "noul",
  instructions:
    "Does the supplied evidence support the proposed decision? Missing support should lead to abstention.",
}

const catalogLabs: LabEntry[] = catalog.packs.flatMap((pack) =>
  pack.examples.map((raw) => {
    const example = raw as {
      id: string
      title: string
      description: string
      state: unknown
      questions?: JevQuestion[]
      tryThis: string
      comparison?: LabEntry["comparison"]
      test?: unknown
    }
    return {
      id: example.id,
      title: example.title,
      description: example.description,
      group: pack.title,
      kind: "catalog",
      state: example.state,
      questions: example.questions ?? (pack.questions as JevQuestion[]),
      tryThis: example.tryThis,
      upstream: "/examples",
      sourceFile: "web/catalog.json",
      comparison: example.comparison,
      reference: example.test,
    }
  })
)

const workspaces: LabEntry[] = []
function add(
  entry: Omit<LabEntry, "group" | "tryThis"> & {
    group?: string
    tryThis?: string
  }
) {
  workspaces.push({
    group: "Jev workspaces",
    tryThis:
      "Edit the input and response fixture. Inspect the contract before running the local preview.",
    ...entry,
  })
}

for (const playbook of scenarios.workflow) {
  for (const [index, starter] of playbook.starters.entries()) {
    add({
      id: `workflow-${playbook.id}-${index + 1}`,
      title: `${playbook.name}: ${starter.label}`,
      description: playbook.description,
      group: "Workflow playbooks",
      kind: "workflow",
      upstream: "/workflow",
      sourceFile: "lib/workflow-examples.ts",
      state: {
        facts: starter.text,
        rules: playbook.rules,
        followup: playbook.followup,
      },
      questions: [
        choice(
          "rule",
          "Recommended rule",
          Object.fromEntries([
            ["need_information", "Ask for missing evidence"],
            ...playbook.rules.map((r) => [r.id, r.condition]),
          ]),
          "Choose only a rule supported by the facts. Recommend its action; do not execute it."
        ),
        confidence,
      ],
      tryThis:
        "Add the supplied follow-up to the facts, then choose a supported rule. No business action is executed.",
    })
  }
}
for (const route of ["tool-router", "langchain"]) {
  for (const [index, scenario] of scenarios.router.entries()) {
    add({
      id: `${route}-${index + 1}`,
      title: `${route === "langchain" ? "LangChain" : "Tool router"}: ${scenario.name}`,
      description: scenario.expectation,
      group: "Routing & policy",
      kind: "routing",
      upstream: `/${route}`,
      sourceFile: "lib/workflowGraph.ts",
      state: {
        request: scenario.request,
        current_node: "ops_agent",
        requires_approval: index === 1,
        sensitive_request: index === 2,
      },
      questions: [
        choice(
          "next_node",
          "Next allowed node",
          {
            read_config_tool: "Read mock configuration",
            modify_config_tool: "Propose a configuration change",
            need_information: "Ask for clarification",
            blocked: "Block a sensitive request",
          },
          "Restrict selection to permitted outgoing nodes. A choice does not grant execution permission."
        ),
      ],
      reference: {
        expectedPath: scenario.path,
        expectation: scenario.expectation,
      },
    })
  }
}
for (const [index, example] of scenarios.solver.entries()) {
  add({
    id: `smt-${index + 1}`,
    title: example.name,
    description: `Compare a ${example.type} prediction with the upstream reference.`,
    group: "Solver cases",
    kind: "solver",
    upstream: "/smt-solver",
    sourceFile: "lib/smt/examples.ts",
    state: { type: example.type, constraints: example.text },
    questions: [
      choice(
        "prediction",
        "Classifier prediction",
        {
          satisfiable: "A satisfying assignment may exist",
          unsatisfiable: "The constraints appear contradictory",
          unknown: "Insufficient information",
        },
        "This prediction is not a proof. Only an exact solver may establish satisfiability."
      ),
    ],
    reference: {
      expected: example.expected,
      note: "Upstream teaching reference, not a solver execution in this Lab.",
    },
    tryThis:
      "Change one constraint. The reference applies only to the original fixture; this UI does not run Z3.",
  })
}
for (const example of scenarios.cleanRoom) {
  add({
    id: `rebuild-${example.id}`,
    title: `Rebuild: ${example.title}`,
    description: example.description,
    group: "Clean-room rebuilds",
    kind: "rebuild",
    upstream: "/clean-room",
    sourceFile: "src/clean-room/examples.ts",
    state: { goal: example.goal, example: example.id },
    questions: [
      choice(
        "primitive",
        "UI primitive",
        {
          list: "Render a list of reusable cards",
          form: "Render labeled editable fields",
          confirmation: "Render the returned confirmation",
        },
        "Select the reusable UI primitive for the current observed interaction."
      ),
    ],
    tryThis: example.goal,
  })
}
for (const [index, meme] of scenarios.memes.entries()) {
  add({
    id: `meme-${index + 1}`,
    title: meme.name,
    description: "Inspect reviewed caption text and audience context.",
    group: "Meme examples",
    kind: "meme",
    upstream: "/memes",
    sourceFile: "lib/memes.ts",
    state: meme,
    questions: [
      choice(
        "style",
        "Humor mechanism",
        {
          relatable: "Shared experience",
          absurdist: "Surreal exaggeration",
          wordplay: "Double meaning",
          satire: "Criticism through humor",
          wholesome: "Affectionate humor",
          deadpan: "Dry literalness",
          unclear: "Insufficient context",
        },
        "Evaluate the supplied text and description, never unseen image pixels."
      ),
      {
        id: "lands",
        label: "Audience fit",
        type: "noul",
        instructions:
          "A subjective judgment about the described audience, not measured engagement.",
      },
    ],
  })
}
for (const [space, example] of Object.entries(scenarios.chat)) {
  for (const [index, prompt] of example.prompts.entries()) {
    add({
      id: `chat-${space}-${index + 1}`,
      title: `${example.title}: ${prompt}`,
      description: example.description,
      group: "Jev Chat",
      kind: "chat",
      upstream: "/jev-chat",
      sourceFile: "lib/jevChat.ts",
      state: {
        space,
        prompt,
        notes:
          space === "notes"
            ? scenarios.chatNotes
            : "Local composition preview; no generated prose.",
      },
      questions: [
        choice(
          "response",
          "Response strategy",
          {
            cite_passage: "Select an exact source passage",
            clarify: "Request the missing fact",
            scripted: "Use a fixed response template",
            fictional: "Compose a fictional scene from supplied fragments",
          },
          "Select a bounded response strategy. Do not invent unsupported facts or citations."
        ),
      ],
    })
  }
}
const replyQuestion = choice(
  "recipient",
  "Reply recipient",
  {
    Ada: "Ada's latest message",
    Sam: "Sam's latest message",
    no_reply: "No reply is needed",
  },
  "Use only earlier messages as context. Keep no-reply and uncertainty explicit."
)
add({
  id: "conversation",
  title: "Conversation recipient ranking",
  description: "Inspect speakers and select the next reply recipient.",
  kind: "evidence",
  upstream: "/conversation",
  sourceFile: "components/conversation.tsx",
  state: scenarios.conversation,
  questions: [replyQuestion, confidence],
})
for (const [id, example] of Object.entries(scenarios.conversationVariants))
  add({
    id: `conversation-${id}`,
    title: `Conversation: ${id}`,
    description: "Compare a follow-up question with resolved chatter.",
    kind: "evidence",
    upstream: "/conversation",
    sourceFile: "web/conversation-ui.js",
    state: example.transcript,
    questions: [replyQuestion],
    reference: { expected: example.expected },
  })
add({
  id: "extraction",
  title: "Invoice candidate extraction",
  description: "Choose exact values from a synthetic invoice, including null.",
  kind: "evidence",
  upstream: "/extraction",
  sourceFile: "components/extraction.tsx",
  state: scenarios.invoice,
  questions: [
    choice(
      "amount",
      "Invoice amount",
      {
        "$1,000.00": "Design services",
        "$200.00": "Production support",
        "$1,250.00": "Total due",
        null: "No supported candidate",
      },
      "Choose a value present in the source. Never invent a missing amount."
    ),
  ],
})
add({
  id: "gate",
  title: "Ask gate with citations",
  description:
    "Inspect evidence before proposing an answer or a human handoff.",
  kind: "evidence",
  upstream: "/gate",
  sourceFile: "lib/classifyQuestionWithJev.ts",
  state: {
    question: scenarios.gateQuestion,
    history: scenarios.gateContext,
    documentation: scenarios.gateDocs,
  },
  questions: [
    choice(
      "route",
      "Question route",
      {
        already_answered: "Earlier messages answer the question",
        answerable_by_docs:
          "A supplied documentation passage supports the answer",
        needs_human: "Evidence is insufficient",
        needs_more_context: "The question needs clarification",
      },
      "Require supporting citations. Unsupported answers fall back to a human."
    ),
    confidence,
  ],
})
add({
  id: "youtube-extract",
  title: "Caption relevance and evidence",
  description:
    "Select original caption passages without paraphrasing or inventing transcript text.",
  kind: "ranking",
  upstream: "/youtube-extract",
  sourceFile: "components/YouTubeExtractLab.tsx",
  state: {
    topic: "Typed decisions",
    captions: [
      { time: "00:12", text: "Jev chooses from the options you supply." },
      { time: "00:28", text: "Your code decides which actions are allowed." },
      { time: "00:40", text: "Thanks for joining this demonstration." },
    ],
  },
  questions: [
    {
      id: "relevance",
      label: "Passage relevance",
      type: "score",
      instructions:
        "Score relevance to the topic using original caption text only.",
      criteria: ["Off topic", "Related", "Directly relevant"],
    },
  ],
})
add({
  id: "reranker",
  title: "Vector order versus relevance",
  description:
    "Compare supplied vector order with editable illustrative relevance scores.",
  kind: "ranking",
  upstream: "/reranker",
  sourceFile: "components/RerankerModuleLab.tsx",
  state: {
    query: "Where is authentication verified?",
    candidates: Array.from({ length: 200 }, (_, index) => {
      const [path, text] =
        scenarios.rerankFiles[index % scenarios.rerankFiles.length]!
      const section = Math.floor(index / scenarios.rerankFiles.length) + 1
      return {
        id: `${path}#section-${section}`,
        text: `${path} — ${text} Sample excerpt ${section}.`,
        vectorScore: Number((0.98 - ((index * 37) % 200) * 0.0035).toFixed(4)),
      }
    }),
  },
  questions: [
    {
      id: "relevance",
      label: "Candidate relevance",
      type: "score",
      instructions:
        "Unknown scores stay unscored. Similarity is not a correctness measure.",
      criteria: [
        "Irrelevant",
        "Partially relevant",
        "Directly answers the question",
      ],
    },
  ],
})
for (const id of ["pr-review", "ast-governance"])
  add({
    id,
    title:
      id === "pr-review" ? "PR review evidence queue" : "AST policy findings",
    description:
      id === "pr-review"
        ? scenarios.pr.description
        : scenarios.governance.description,
    kind: "review",
    upstream: `/${id}`,
    sourceFile:
      id === "pr-review"
        ? "src/pr-review/sample.ts"
        : "lib/governanceSample.ts",
    state:
      id === "pr-review"
        ? { ...scenarios.pr, rules: scenarios.prRules }
        : { ...scenarios.governance, manifest: scenarios.governanceManifest },
    questions: [
      choice(
        "risk",
        "Review disposition",
        {
          needs_review: "Queue the finding for human review",
          context_required: "Request more surrounding code",
          no_finding: "No supported finding",
        },
        "Retain the hunk and policy evidence. Do not post a review, run tests, or merge."
      ),
      confidence,
    ],
  })
for (const [id, title, actions, state] of [
  [
    "chess",
    "Chess legal-move selection",
    {
      e4: "Move the e-pawn two squares",
      d4: "Move the d-pawn two squares",
      Nf3: "Develop the king-side knight",
    },
    {
      position: "Starting position",
      legal_moves: ["e4", "d4", "Nf3"],
      note: "A bounded opening fixture, not a chess engine or lookahead search.",
    },
  ],
  [
    "microduck",
    "MicroDuck action selection",
    {
      turn_left: "Turn away from the obstacle",
      wait: "Observe the next frame",
      move_forward: "Move toward the target",
    },
    {
      obstacle_ahead: true,
      target: "charging station",
      battery: 42,
      note: "Simulated hardware; no robot is connected.",
    },
  ],
  [
    "doom",
    "JevDoom bounded actions",
    {
      turn_left: "Inspect the corridor",
      open: "Open the adjacent door",
      wait: "Wait for the next observation",
    },
    {
      position: [1, 1],
      adjacent_door: true,
      allowed_actions: ["turn_left", "open", "wait"],
      note: "Original game action fixture; no Doom engine or assets.",
    },
  ],
] as const)
  add({
    id,
    title,
    description:
      "Inspect the current observation and step through a bounded local action trace.",
    group: "Games & simulations",
    kind: "game",
    upstream: `/${id}`,
    sourceFile: `components/${id === "chess" ? "ChessLab" : id === "doom" ? "DoomLab" : "MicroDuckLab"}.tsx`,
    state,
    questions: [
      choice(
        "action",
        "Allowed action",
        actions,
        "Choose only an action available in this observation. This component preview does not run the full game."
      ),
    ],
  })
for (const [id, title, goal] of [
  ["browser-pc", "Browser agent: PC research", scenarios.pcGoal],
  ["browser-flight", "Browser agent: flight sandbox", scenarios.flightGoal],
])
  add({
    id: id!,
    title: title!,
    description:
      "Inspect a closed set of browser actions and a fresh-observation checkpoint.",
    group: "Browser tasks",
    kind: "routing",
    upstream: "/jev-browser-agent",
    sourceFile: "components/BrowserAgentLab.tsx",
    state: {
      goal,
      observation: "Synthetic local page",
      candidates: ["inspect", "select", "stop"],
      requires_approval: true,
    },
    questions: [
      choice(
        "next_node",
        "Browser action",
        {
          inspect: "Inspect current candidates",
          select: "Select a candidate for comparison",
          stop: "Stop without a purchase or booking",
        },
        "Use only current candidates. A fresh observation is required before acting."
      ),
    ],
  })

const gateBase = workspaces.find((entry) => entry.id === "gate")!
for (const [index, question] of scenarios.gateQuestions
  .split("\n")
  .filter((_, index) => index % 2 === 1)
  .entries()) {
  add({
    ...gateBase,
    id: `gate-question-${index + 1}`,
    title: `Ask gate: ${question}`,
    group: "Ask gate questions",
    state: {
      question,
      history: scenarios.gateContext,
      documentation: scenarios.gateDocs,
    },
  })
}

const classicLabs: LabEntry[] = [
  {
    id: "composer",
    title: "Composer",
    description: "Compose a request with a sample attachment.",
    kind: "classic",
    group: "Interface patterns",
    state: {},
    questions: [],
    tryThis: "Edit the request, remove an attachment, and send locally.",
    upstream: "/examples",
    sourceFile: "components/lab.tsx",
  },
  {
    id: "decision",
    title: "Decision",
    description: "A local keyword matcher illustrates closed-set selection.",
    kind: "classic",
    group: "Interface patterns",
    state: {},
    questions: [],
    tryThis: "Change the request and compare the ranked options.",
    upstream: "/examples",
    sourceFile: "components/lab.tsx",
  },
  {
    id: "settings",
    title: "Settings",
    description:
      "Preview controls and a confirmation dialog without storing credentials.",
    kind: "classic",
    group: "Interface patterns",
    state: {},
    questions: [],
    tryThis: "Explore tabs, switches, and confirmation focus.",
    upstream: "/examples",
    sourceFile: "components/lab.tsx",
  },
]

export const labRegistry: LabEntry[] = [
  ...classicLabs,
  ...workspaces,
  ...catalogLabs,
]
export const labGroups = [...new Set(labRegistry.map((entry) => entry.group))]
export const catalogLabCount = catalogLabs.length
export const workspaceLabCount = workspaces.length
export const labById = (id: string) =>
  labRegistry.find((entry) => entry.id === id)
