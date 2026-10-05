"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, FileCode2Icon, TerminalIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type CopyState = "idle" | "copied" | "failed"

const iconSwap = "transition-[opacity,filter,scale] duration-300 ease-out-quart"
const iconShown = "scale-100 opacity-100 blur-0"
const iconHidden = "scale-[0.25] opacity-0 blur-[4px]"

function CopyButton({ code, label }: { code: string; label: string }) {
  const [state, setState] = React.useState<CopyState>("idle")

  React.useEffect(() => {
    if (state === "idle") return
    const timer = window.setTimeout(() => setState("idle"), 1600)
    return () => window.clearTimeout(timer)
  }, [state])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setState("copied")
    } catch {
      setState("failed")
    }
  }

  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className={cn(state === "copied" && "text-teal hover:text-teal")}
    >
      {/* Both icons stay mounted so the swap cross-fades instead of popping. */}
      <span data-icon="inline-start" className="relative flex size-3 items-center justify-center" aria-hidden="true">
        <CopyIcon className={cn(iconSwap, state === "copied" ? iconHidden : iconShown)} />
        <CheckIcon className={cn(iconSwap, "absolute inset-0", state === "copied" ? iconShown : iconHidden)} />
      </span>
      {state === "copied" ? "Copied" : state === "failed" ? "Failed" : "Copy"}
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? `${label} copied to clipboard` : ""}
      </span>
    </Button>
  )
}

function CodeSnippet({
  code,
  html,
  label,
  kind = "file",
  className,
}: {
  code: string
  html: string
  label: string
  kind?: "file" | "terminal"
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-card shadow-surface flex min-w-0 flex-col overflow-hidden rounded-lg text-sm",
        className
      )}
    >
      <div className="bg-muted/60 flex h-9 items-center justify-between gap-2 border-b ps-3 pe-1.5">
        <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 font-mono text-xs">
          {kind === "terminal" ? (
            <TerminalIcon className="size-3.5" strokeWidth={1.5} />
          ) : (
            <FileCode2Icon className="size-3.5" strokeWidth={1.5} />
          )}
          <span className="truncate">{label}</span>
        </span>
        <CopyButton code={code} label={label} />
      </div>
      <div
        className="min-w-0 overflow-auto p-3 font-mono text-[13px] leading-relaxed [&_pre]:m-0 [&_pre]:bg-transparent [&_code]:font-mono"
        // Shiki output produced at build time from files in this repo.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export { CodeSnippet, CopyButton }
