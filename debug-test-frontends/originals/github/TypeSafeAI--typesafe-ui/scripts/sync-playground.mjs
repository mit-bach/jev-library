import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import ts from "typescript"

// Read immutable Git objects; never import or execute the reference repository.
const repo = process.argv[2] || "../typesafe-playground"
const revision = "9d3d990604c4680a397db813a9058bd40597cc67"
const read = (file) =>
  execFileSync("git", ["-C", repo, "show", `${revision}:${file}`], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  })
function literal(node, bindings = {}) {
  if (
    ts.isAsExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isSatisfiesExpression(node)
  )
    return literal(node.expression, bindings)
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (node.kind === ts.SyntaxKind.NullKeyword) return null
  if (ts.isArrayLiteralExpression(node))
    return node.elements.map((x) => literal(x, bindings))
  if (ts.isObjectLiteralExpression(node))
    return Object.fromEntries(
      node.properties.map((x) => {
        if (!ts.isPropertyAssignment(x))
          throw Error("Only literal object properties are supported")
        return [x.name.text, literal(x.initializer, bindings)]
      })
    )
  if (ts.isIdentifier(node) && Object.hasOwn(bindings, node.text))
    return bindings[node.text]
  if (
    ts.isCallExpression(node) &&
    node.expression.getText() === "defaults" &&
    node.arguments.length === 0
  )
    return bindings.defaults
  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.PlusToken
  )
    return literal(node.left, bindings) + literal(node.right, bindings)
  if (ts.isArrowFunction(node)) return literal(node.body, bindings)
  throw Error(`Nonliteral expression: ${node.getText().slice(0, 100)}`)
}
function extract(file, name, bindings) {
  const source = ts.createSourceFile(
    file,
    read(file),
    ts.ScriptTarget.Latest,
    true
  )
  let found
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText() === name &&
      node.initializer
    )
      found = literal(node.initializer, bindings)
    ts.forEachChild(node, visit)
  }
  visit(source)
  if (found === undefined) throw Error(`${name} missing from ${file}`)
  return found
}
const catalog = JSON.parse(read("web/catalog.json"))
const extras = {
  workflow: extract("lib/workflow-examples.ts", "WORKFLOW_EXAMPLES", {
    defaults: extract("web/workflow.js", "defaults"),
  }),
  solver: extract("lib/smt/examples.ts", "SOLVER_EXAMPLES"),
  router: extract("lib/workflowGraph.ts", "ROUTER_SCENARIOS"),
  memes: extract("lib/memes.ts", "memeSamples"),
  cleanRoom: extract("src/clean-room/examples.ts", "demoExamples"),
  chat: extract("lib/jevChat.ts", "spaces"),
  chatNotes: extract("lib/jevChat.ts", "sampleNotes"),
  conversation: extract("components/conversation.tsx", "sample"),
  conversationVariants: extract("web/conversation-ui.js", "samples"),
  invoice: extract("components/extraction.tsx", "sample"),
  pr: extract("src/pr-review/sample.ts", "SAMPLE_PR"),
  prRules: extract("src/pr-review/sample.ts", "SAMPLE_RULES"),
  governance: extract("lib/governanceSample.ts", "GOVERNANCE_SAMPLE"),
  governanceManifest: extract("lib/governanceSample.ts", "GOVERNANCE_MANIFEST"),
  gateContext: extract("lib/classifyQuestionWithJev.ts", "sampleContext"),
  gateQuestions: extract("lib/classifyQuestionWithJev.ts", "sampleQuestions"),
  gateQuestion: extract("lib/classifyQuestionWithJev.ts", "sampleQuestion"),
  gateDocs: extract("lib/classifyQuestionWithJev.ts", "sampleDocs"),
  rerankFiles: extract("lib/rerank-data.ts", "files"),
  pcGoal: extract("lib/browserTaskContext.ts", "PC_BUILD_GOAL"),
  flightGoal: extract("lib/flightSandbox.ts", "FLIGHT_GOAL"),
  workspaces: extract("lib/workspace-details.ts", "workspaceDetails"),
}
const base = "apps/web/lib/playground/"
writeFileSync(base + "catalog.json", JSON.stringify(catalog, null, 2) + "\n")
writeFileSync(base + "scenarios.json", JSON.stringify(extras, null, 2) + "\n")
writeFileSync(base + "LICENSE.upstream.txt", read("LICENSE"))
const ids = catalog.packs.flatMap((p) => p.examples.map((e) => e.id))
writeFileSync(
  base + "provenance.json",
  JSON.stringify(
    {
      repository: "TypeSafeAI/typesafe-playground",
      revision,
      catalogIds: ids,
      workspaceRoutes: execFileSync(
        "git",
        ["-C", repo, "ls-tree", "-r", "--name-only", revision],
        { encoding: "utf8" }
      )
        .split("\n")
        .filter((x) => /^app\/[^/]+\/page\.tsx$/.test(x))
        .map((x) => "/" + x.split("/")[1]),
      credit:
        "TypeSafe AI Playground contributors; original playground by @nickthompson480",
      license: "MIT",
    },
    null,
    2
  ) + "\n"
)
console.log(
  `Pinned ${ids.length} examples, ${Object.keys(extras.workspaces).length - 1} workspace descriptions, and named scenario sets at ${revision}`
)
