import { Badge } from "@workspace/ui/components/badge"

export type JevAnswer = {
  id: string
  label: string
  type: "choice" | "noul" | "score"
  value: string | number | null
}

type JevResultProps = {
  answers: readonly JevAnswer[]
  provenance: "illustrative" | "provider"
  error?: string
}

function JevResult({ answers, provenance, error }: JevResultProps) {
  return (
    <section
      className="min-w-0 rounded-xl border bg-card p-4"
      data-slot="jev-result"
      aria-label="Typed response"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">
          {provenance === "illustrative"
            ? "Illustrative response"
            : "Provider response"}
        </h3>
        <Badge variant="outline">
          {provenance === "illustrative"
            ? "Local fixture"
            : "Unverified decision"}
        </Badge>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : answers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No response yet. Run an example to inspect its typed output.
        </p>
      ) : (
        <dl className="space-y-4">
          {answers.map((answer) => (
            <div key={answer.id} className="min-w-0">
              <dt className="text-xs text-muted-foreground">
                {answer.label}{" "}
                <span className="font-mono">/ {answer.type}</span>
              </dt>
              <dd className="mt-1 font-mono text-sm break-words">
                {answer.value === null
                  ? "Unknown"
                  : typeof answer.value === "number"
                    ? answer.value.toFixed(2)
                    : answer.value}
                {typeof answer.value === "number" &&
                Number.isFinite(answer.value) &&
                answer.value >= 0 &&
                answer.value <= 1 ? (
                  <meter
                    min={0}
                    max={1}
                    value={answer.value}
                    aria-label={`${answer.label} value`}
                    className="jev-meter mt-2 block h-1.5 w-full"
                  />
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        {provenance === "illustrative"
          ? "You control these fixture values. No model call or confidence measurement."
          : "A typed response does not prove correctness or authorize an action."}
      </p>
    </section>
  )
}

export { JevResult }
