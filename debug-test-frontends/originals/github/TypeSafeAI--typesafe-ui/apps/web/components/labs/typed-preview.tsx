"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { JevContract } from "@workspace/ui/components/jev-contract"
import { JevResult, type JevAnswer } from "@workspace/ui/components/jev-result"
import type { LabEntry } from "@/lib/lab-registry"
import {
  comparisonState,
  fixtureAnswers,
  parseLabState,
  requestFor,
  stateText,
} from "@/lib/lab-preview"
import { WorkspaceWorkbench } from "@/components/labs/workspace-workbench"

type Run = { a: unknown; b?: unknown; answers: JevAnswer[] }

function TypedPreview({ entry }: { entry: LabEntry }) {
  const [input, setInput] = React.useState(() => stateText(entry.state))
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [run, setRun] = React.useState<Run | null>(null)
  const [error, setError] = React.useState("")
  const [failed, setFailed] = React.useState(false)
  const [reference, setReference] = React.useState(false)
  const structured = typeof entry.state !== "string"
  function invalidate() {
    setRun(null)
    setError("")
    setReference(false)
  }
  function execute(compare = false) {
    setError("")
    setRun(null)
    try {
      const state = parseLabState(input, structured)
      const b =
        compare && entry.comparison
          ? comparisonState(state, entry.comparison)
          : undefined
      if (failed)
        throw Error(
          "Simulated provider failure. No response was produced. Turn off failure simulation and run again."
        )
      setRun({
        a: requestFor(entry, state),
        ...(b === undefined ? {} : { b: requestFor(entry, b) }),
        answers: fixtureAnswers(entry, values),
      })
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not run this preview."
      )
    }
  }
  return (
    <div className="w-full min-w-0 space-y-4" data-testid="typed-preview">
      <div className="rounded-lg border border-teal/30 bg-teal/5 p-3 text-xs leading-relaxed">
        <strong>Local response studio.</strong> Edit a real example&apos;s input
        and choose illustrative outputs. No Jev request is sent; these fixtures
        do not predict what Jev would decide.
      </div>
      <div className="grid min-w-0 items-start gap-4 md:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Example input{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {structured ? "JSON object or array" : "Source text"}
            </span>
            <Textarea
              aria-label="Example input"
              rows={8}
              dir={structured ? "ltr" : "auto"}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                invalidate()
              }}
              className="field-sizing-content max-h-64 min-h-36 resize-y bg-background font-mono text-xs"
              spellCheck={false}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => execute()}>Run local preview</Button>
            {entry.comparison ? (
              <Button variant="outline" onClick={() => execute(true)}>
                Compare A/B
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => {
                setInput(stateText(entry.state))
                setValues({})
                setFailed(false)
                invalidate()
              }}
            >
              Reset example
            </Button>
          </div>
          {entry.comparison ? (
            <p className="text-xs text-muted-foreground">
              A/B changes only <code>{entry.comparison.path.join(".")}</code>:{" "}
              {entry.comparison.labelA} → {entry.comparison.labelB}. Both
              responses use your fixture values, not model predictions.
            </p>
          ) : null}
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={failed}
              onChange={(e) => {
                setFailed(e.target.checked)
                invalidate()
              }}
              className="accent-primary"
            />{" "}
            Simulate provider failure
          </label>
          <fieldset className="grid min-w-0 gap-3 rounded-lg border bg-card p-3 sm:grid-cols-2">
            <legend className="px-1 text-sm font-medium">
              Illustrative output values
            </legend>
            {entry.questions.map((q) => (
              <label
                key={q.id}
                className="flex min-w-0 flex-col gap-1.5 text-xs"
              >
                {q.label} fixture
                {q.type === "choice" ? (
                  <select
                    aria-label={`${q.label} fixture`}
                    value={values[q.id] ?? Object.keys(q.criteria ?? {})[0]}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [q.id]: e.target.value }))
                      invalidate()
                    }}
                    className="w-full min-w-0 rounded-md border bg-background p-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {Object.entries(q.criteria ?? {}).map(([key, label]) => (
                      <option key={key} value={key}>
                        {key} — {label}
                      </option>
                    ))}
                    <option value="__unknown">Unknown / unscored</option>
                  </select>
                ) : (
                  <select
                    aria-label={`${q.label} fixture`}
                    value={values[q.id] ?? "0.5"}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [q.id]: e.target.value }))
                      invalidate()
                    }}
                    className="rounded-md border bg-background p-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {["0", "0.25", "0.5", "0.75", "1"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                    <option value="__unknown">Unknown / unscored</option>
                  </select>
                )}
              </label>
            ))}
          </fieldset>
        </div>
        <div className="min-w-0 space-y-4">
          <JevResult
            answers={run?.answers ?? []}
            provenance="illustrative"
            error={error || undefined}
          />
          <p role="status" className="text-xs text-teal">
            {run
              ? `Local preview complete${run.b ? " · A/B inputs compared" : ""}. No model call.`
              : ""}
          </p>
          {run && entry.kind !== "catalog" ? (
            <WorkspaceWorkbench
              key={JSON.stringify(run)}
              entry={entry}
              state={(run.a as { state: unknown }).state}
              answers={run.answers}
            />
          ) : null}
          <details className="rounded-lg border bg-card p-3">
            <summary className="cursor-pointer text-sm font-medium">
              Typed question contract
            </summary>
            <div className="mt-4">
              <JevContract questions={entry.questions} />
            </div>
          </details>
        </div>
      </div>
      {run ? (
        <section
          aria-label="Request inspector"
          className="min-w-0 rounded-lg border bg-card p-4"
        >
          <h3 className="mb-2 text-sm font-medium">
            {run.b ? "A/B request comparison" : "Jev request shape"}
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Inspect the configured request. Nothing has been sent to a provider.
          </p>
          <div
            className={`grid min-w-0 gap-4 ${run.b ? "lg:grid-cols-2" : ""}`}
          >
            <div className="min-w-0">
              <p className="eyebrow mb-2">
                {run.b ? `A · ${entry.comparison?.labelA}` : "Request"}
              </p>
              <pre
                dir="ltr"
                className="max-h-96 overflow-auto rounded-lg bg-muted p-3 text-xs"
              >
                {JSON.stringify(run.a, null, 2)}
              </pre>
            </div>
            {run.b ? (
              <div className="min-w-0">
                <p className="eyebrow mb-2">B · {entry.comparison?.labelB}</p>
                <pre
                  dir="ltr"
                  className="max-h-96 overflow-auto rounded-lg bg-muted p-3 text-xs"
                >
                  {JSON.stringify(run.b, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
      {entry.reference ? (
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!run}
            onClick={() => setReference((v) => !v)}
          >
            {reference ? "Hide" : "Reveal"} reference notes
          </Button>
          {reference ? (
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs break-words whitespace-pre-wrap">
              {JSON.stringify(entry.reference, null, 2)}
            </pre>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Upstream teaching notes apply to the original example. They are not
            execution evidence or a universal answer key.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export { TypedPreview }
