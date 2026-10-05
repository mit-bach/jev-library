"use client"

import * as React from "react"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { labGroups, labRegistry } from "@/lib/lab-registry"

function LabNavigation({
  active,
  onNavigate,
  mobile = false,
}: {
  active: string
  onNavigate: (id: string) => void
  mobile?: boolean
}) {
  const [query, setQuery] = React.useState("")
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const matches = labRegistry.filter((entry) =>
    words.every((word) =>
      `${entry.id} ${entry.title} ${entry.description} ${entry.group}`
        .toLowerCase()
        .includes(word)
    )
  )
  return (
    <nav
      aria-label={mobile ? "Mobile Lab navigation" : "Lab navigation"}
      className="flex min-h-0 flex-col"
    >
      <div className="sticky top-0 z-10 space-y-2 bg-background p-4">
        <label className="flex flex-col gap-2 text-xs font-medium">
          Find a Lab
          <Input
            type="search"
            placeholder="Search examples…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <p
          role="status"
          className="font-mono text-[10px] text-muted-foreground"
        >
          {matches.length} / {labRegistry.length} examples
        </p>
      </div>
      <div className="space-y-2 px-3 pb-6">
        {matches.length === 0 ? (
          <p className="px-1 py-3 text-sm text-muted-foreground">
            No Labs match. Try “invoice”, “chess”, or “routing”.
          </p>
        ) : null}
        {labGroups.map((group) => {
          const entries = matches.filter((entry) => entry.group === group)
          if (!entries.length) return null
          return (
            <details
              key={group}
              open={
                words.length > 0 || entries.some((entry) => entry.id === active)
              }
              className="group/lab-nav"
            >
              <summary className="cursor-pointer rounded-md px-2 py-2 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {group}
                <span className="ms-2 font-mono text-[10px] text-muted-foreground">
                  {entries.length}
                </span>
              </summary>
              <ul className="space-y-0.5 pb-2">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`/lab#${entry.id}`}
                      aria-current={entry.id === active ? "page" : undefined}
                      onClick={(event) => {
                        event.preventDefault()
                        onNavigate(entry.id)
                      }}
                      className={cn(
                        "block rounded-md px-3 py-2 text-xs leading-relaxed transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        entry.id === active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {entry.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )
        })}
      </div>
    </nav>
  )
}

export { LabNavigation }
