"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import type { JevAnswer } from "@workspace/ui/components/jev-result"
import type { LabEntry } from "@/lib/lab-registry"
import { ActionWorkbench } from "@/components/labs/action-workbench"
import { RebuildWorkbench } from "@/components/labs/rebuild-workbench"

const record = (state: unknown): Record<string, unknown> =>
  state && typeof state === "object" && !Array.isArray(state)
    ? (state as Record<string, unknown>)
    : {}
const text = (value: unknown) =>
  typeof value === "string" ? value : JSON.stringify(value, null, 2)

function RankingWorkbench({ state }: { state: unknown }) {
  const data = record(state)
  const candidates = Array.isArray(data.candidates)
    ? data.candidates
    : Array.isArray(data.captions)
      ? data.captions
      : []
  const [scores, setScores] = React.useState<Record<number, string>>({})
  const [ranked, setRanked] = React.useState(false)
  const rows = candidates.map((item, index) => ({
    index,
    content: text(item),
    score: scores[index] ? Number(scores[index]) : null,
  }))
  if (ranked)
    rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.index - b.index)
  return (
    <section
      className="space-y-3 rounded-xl border bg-card p-4"
      aria-label="Ranking comparison"
    >
      <h3 className="text-sm font-medium">
        {ranked ? "Fixture relevance order" : "Original candidate order"}
      </h3>
      <p className="text-xs text-muted-foreground">
        Enter sample scores to compare orders. Unscored candidates stay unknown;
        no quality metric is inferred.
      </p>
      <ol className="max-h-96 space-y-3 overflow-y-auto">
        {rows.map((row) => (
          <li key={row.index} className="rounded-lg bg-muted/50 p-3 text-xs">
            <p className="mb-2 break-words whitespace-pre-wrap">
              {row.index + 1}. {row.content}
            </p>
            <label className="flex items-center justify-between gap-2">
              Candidate {row.index + 1} fixture score
              <select
                aria-label={`Candidate ${row.index + 1} fixture score`}
                className="rounded border bg-background p-1"
                value={scores[row.index] ?? ""}
                onChange={(e) =>
                  setScores((v) => ({ ...v, [row.index]: e.target.value }))
                }
              >
                <option value="">Unknown</option>
                {[0, 0.25, 0.5, 0.75, 1].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ol>
      <Button size="sm" variant="outline" onClick={() => setRanked((v) => !v)}>
        {ranked ? "Restore original order" : "Compare ranking"}
      </Button>
    </section>
  )
}

function RoutingWorkbench({
  state,
  answers,
}: {
  state: unknown
  answers: JevAnswer[]
}) {
  const data = record(state)
  const [approved, setApproved] = React.useState(false)
  const selected = answers[0]?.value
  const blocked = data.sensitive_request === true || selected === "blocked"
  const requiresApproval =
    data.requires_approval === true ||
    selected === "modify_config_tool" ||
    selected === "select"
  const status =
    selected === null
      ? "Unknown: request more context"
      : blocked
        ? "Blocked by policy"
        : requiresApproval && !approved
          ? "Approval required"
          : "Mock route inspected"
  return (
    <section
      className="space-y-3 rounded-xl border bg-card p-4"
      aria-label="Policy checkpoint"
    >
      <h3 className="text-sm font-medium">Policy checkpoint</h3>
      <p role="status" className="text-sm">
        {status}
      </p>
      <ol className="space-y-2 border-s-2 border-primary/40 ps-4 text-xs">
        <li>Observe the supplied request</li>
        <li>
          Candidate: <code>{String(selected ?? "unknown")}</code>
        </li>
        <li>{status}</li>
        <li>Executed: false</li>
      </ol>
      {requiresApproval && !blocked && selected !== null ? (
        <Button
          size="sm"
          variant="outline"
          disabled={approved}
          onClick={() => setApproved(true)}
        >
          Approve simulation
        </Button>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Approval only changes this trace. No browser, LangChain adapter,
        configuration, or downstream tool is invoked.
      </p>
    </section>
  )
}

function EvidenceWorkbench({
  entry,
  state,
  answers,
}: {
  entry: LabEntry
  state: unknown
  answers: JevAnswer[]
}) {
  const [selection, setSelection] = React.useState("")
  const source =
    typeof state === "string"
      ? state
      : text(record(state).documentation ?? record(state).notes ?? state)
  const lines = source.split("\n").filter((line) => line.trim())
  const candidate = answers[0]?.value
  const supported =
    candidate !== null &&
    candidate !== "null" &&
    source.includes(String(candidate))
  return (
    <section
      className="space-y-3 rounded-xl border bg-card p-4"
      aria-label="Source evidence"
    >
      <h3 className="text-sm font-medium">Source evidence</h3>
      {entry.id === "extraction" ? (
        <p className="text-xs">
          {supported
            ? "Selected candidate is present in the source."
            : "No supported extraction. Keep the result null or request review."}
        </p>
      ) : null}
      <label className="flex flex-col gap-2 text-xs">
        Evidence passage
        <select
          value={selection}
          onChange={(e) => setSelection(e.target.value)}
          className="min-w-0 rounded border bg-background p-2"
          aria-label="Evidence passage"
        >
          <option value="">No passage selected</option>
          {lines.map((line, index) => (
            <option key={index} value={String(index)}>
              {index + 1}. {line.slice(0, 100)}
            </option>
          ))}
        </select>
      </label>
      {selection ? (
        <blockquote className="border-s-2 border-teal ps-3 text-sm break-words whitespace-pre-wrap">
          {lines[Number(selection)]}
          <footer className="mt-2 text-xs text-muted-foreground">
            Source passage {Number(selection) + 1} · selected by you
          </footer>
        </blockquote>
      ) : (
        <p className="text-xs text-muted-foreground">
          No citation selected. A proposed answer without supporting evidence
          needs review.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Exact excerpts show provenance, not proof that the passage answers the
        question.
      </p>
    </section>
  )
}

function WorkspaceWorkbench({
  entry,
  state,
  answers,
}: {
  entry: LabEntry
  state: unknown
  answers: JevAnswer[]
}) {
  const data = record(state)
  if (entry.kind === "routing")
    return <RoutingWorkbench state={state} answers={answers} />
  if (entry.kind === "ranking") return <RankingWorkbench state={state} />
  if (entry.kind === "game")
    return <ActionWorkbench entry={entry} answers={answers} />
  if (entry.kind === "rebuild") return <RebuildWorkbench id={entry.id} />
  if (entry.kind === "evidence" || entry.kind === "chat")
    return <EvidenceWorkbench entry={entry} state={state} answers={answers} />
  if (entry.kind === "workflow") {
    const rules = Array.isArray(data.rules) ? data.rules.map(record) : []
    const selected = rules.find((rule) => rule.id === answers[0]?.value)
    const support = answers.find((answer) => answer.id === "supported")?.value
    return (
      <section
        className="space-y-3 rounded-xl border bg-card p-4"
        aria-label="Workflow recommendation"
      >
        <h3 className="text-sm font-medium">Recommendation checkpoint</h3>
        <p className="text-sm">
          {selected && typeof support === "number" && support >= 0.75
            ? text(selected.action)
            : "Request more information before recommending an action."}
        </p>
        <p className="text-xs text-muted-foreground">
          Illustrative threshold: 0.75. This is a UI fixture, not an operational
          policy. No refund, account change, or business action occurs.
        </p>
        <details>
          <summary className="cursor-pointer text-xs">
            Available follow-up evidence
          </summary>
          <p className="mt-2 text-sm">{text(data.followup)}</p>
        </details>
      </section>
    )
  }
  if (entry.kind === "solver")
    return (
      <section className="space-y-3 rounded-xl border bg-card p-4">
        <h3 className="text-sm font-medium">Prediction ≠ proof</h3>
        <p className="text-sm">
          Classifier fixture:{" "}
          <code>{String(answers[0]?.value ?? "unknown")}</code>
        </p>
        <p className="text-xs text-muted-foreground">
          Exact solver: not run. Reveal the upstream reference separately.
          Editing constraints invalidates that reference; open the playground
          for a real Z3 check.
        </p>
      </section>
    )
  if (entry.kind === "review")
    return <ReviewWorkbench state={state} answers={answers} />
  return (
    <p className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
      This subjective fixture evaluates supplied text only. It is not audience
      research, an image analysis, or a measured engagement score.
    </p>
  )
}

function ReviewWorkbench({
  state,
  answers,
}: {
  state: unknown
  answers: JevAnswer[]
}) {
  const [threshold, setThreshold] = React.useState("0.75")
  const support = answers.find((a) => a.id === "supported")?.value
  const queued =
    answers[0]?.value === "needs_review" &&
    typeof support === "number" &&
    support >= Number(threshold)
  return (
    <section
      className="space-y-3 rounded-xl border bg-card p-4"
      aria-label="Review queue"
    >
      <h3 className="text-sm font-medium">Review queue</h3>
      <label className="flex items-center gap-3 text-xs">
        Fixture threshold
        <Input
          aria-label="Fixture threshold"
          type="number"
          min="0"
          max="1"
          step="0.25"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-24"
        />
      </label>
      <p role="status" className="text-sm">
        {queued
          ? "Finding queued for human review"
          : "No finding meets the fixture threshold"}
      </p>
      <pre className="overflow-auto rounded bg-muted p-3 text-xs">
        {text(record(state).diff)}
      </pre>
      <p className="text-xs text-muted-foreground">
        Tests not run. Review not posted. No merge or repository action.
      </p>
    </section>
  )
}

export { WorkspaceWorkbench }
