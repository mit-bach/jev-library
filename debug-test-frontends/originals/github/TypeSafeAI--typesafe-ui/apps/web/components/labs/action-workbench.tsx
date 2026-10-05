"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import type { JevAnswer } from "@workspace/ui/components/jev-result"
import type { LabEntry } from "@/lib/lab-registry"

function ActionWorkbench({
  entry,
  answers,
}: {
  entry: LabEntry
  answers: JevAnswer[]
}) {
  const [stepped, setStepped] = React.useState(false)
  const action = answers[0]?.value
  const chess = entry.id === "chess"
  const cells: Record<number, string> = {}
  let outcome = "Observation ready. Choose a fixture action before stepping."
  if (chess) {
    ;["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"].forEach((piece, index) => {
      cells[index] = piece
    })
    ;["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"].forEach((piece, index) => {
      cells[56 + index] = piece
      cells[48 + index] = "♙"
      cells[8 + index] = "♟"
    })
    const moves: Record<string, [number, number]> = {
      e4: [52, 36],
      d4: [51, 35],
      Nf3: [62, 45],
    }
    if (stepped && typeof action === "string" && moves[action]) {
      const [from, to] = moves[action]!
      cells[to] = cells[from]!
      delete cells[from]
      outcome = `${action} applied to the starting-position fixture. No search or opponent move.`
    }
  } else {
    const position = entry.id === "doom" ? 5 : 10
    cells[position] = stepped && action === "turn_left" ? "◀" : "▲"
    cells[entry.id === "doom" ? 6 : 2] =
      entry.id === "doom" && stepped && action === "open" ? "▱" : "▣"
    if (stepped)
      outcome =
        action === "turn_left"
          ? "Turned left; position unchanged."
          : action === "open"
            ? "Adjacent door opened in the local fixture."
            : action === "move_forward"
              ? "Forward movement blocked: the observation reports an obstacle."
              : "Waited; observation unchanged."
  }
  return (
    <section
      className="space-y-3 rounded-xl border bg-card p-4"
      aria-label="Action trace"
    >
      <h3 className="text-sm font-medium">One-observation action preview</h3>
      <div
        className={`grid overflow-hidden rounded-lg border ${chess ? "grid-cols-8" : "grid-cols-4"}`}
        aria-hidden="true"
        dir="ltr"
      >
        {Array.from({ length: chess ? 64 : 16 }, (_, index) => (
          <div
            key={index}
            className={`flex aspect-square items-center justify-center text-lg sm:text-xl ${(Math.floor(index / (chess ? 8 : 4)) + index) % 2 ? "bg-muted" : "bg-primary/15"}`}
          >
            {cells[index]}
          </div>
        ))}
      </div>
      <p className="text-xs">
        Selected fixture action: <code>{String(action ?? "unknown")}</code>
      </p>
      <Button
        size="sm"
        disabled={stepped || action === null}
        onClick={() => setStepped(true)}
      >
        Step illustration
      </Button>
      <p role="status" className="text-xs">
        {outcome}
      </p>
      <p className="text-xs text-muted-foreground">
        {stepped
          ? "This observation is consumed; run a new preview to reset it. "
          : ""}
        A bounded local illustration, not the full playground game engine or
        connected hardware.
      </p>
    </section>
  )
}

export { ActionWorkbench }
