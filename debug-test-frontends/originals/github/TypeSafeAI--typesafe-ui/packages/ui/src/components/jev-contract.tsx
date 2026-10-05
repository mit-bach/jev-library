import { Badge } from "@workspace/ui/components/badge"

export type JevQuestion = {
  id: string
  label: string
  type: "choice" | "noul" | "score"
  instructions: string
  criteria?: Record<string, string> | string[]
}

function JevContract({ questions }: { questions: readonly JevQuestion[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-4" data-slot="jev-contract">
      {questions.map((question) => (
        <section key={question.id} className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium">{question.label}</h3>
            <Badge variant="outline" className="font-mono">
              {question.type}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {question.instructions}
          </p>
          {question.criteria ? (
            <dl className="mt-3 space-y-2 text-xs">
              {Object.entries(question.criteria).map(([key, value]) => (
                <div
                  key={key}
                  className="grid min-w-0 gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
                >
                  <dt className="font-mono break-words">
                    {Array.isArray(question.criteria)
                      ? `Level ${Number(key) + 1}`
                      : key}
                  </dt>
                  <dd className="break-words text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ))}
    </div>
  )
}

export { JevContract }
