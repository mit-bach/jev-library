"use client"

import * as React from "react"
import {
  ArrowRightIcon,
  ArrowUpIcon,
  GitBranchIcon,
  PaperclipIcon,
  PenLineIcon,
  RotateCcwIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Kbd, KbdGroup } from "@workspace/ui/components/kbd"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

const models = [
  { value: "jev-latest", label: "jev-latest" },
  { value: "jev-fast", label: "jev-fast" },
]

function ComposerScene() {
  const [message, setMessage] = React.useState(
    "Review the changed files and suggest a focused fix."
  )
  const [attached, setAttached] = React.useState(true)
  const [model, setModel] = React.useState<string | null>("jev-latest")
  const [sent, setSent] = React.useState(false)

  function reset() {
    setMessage("Review the changed files and suggest a focused fix.")
    setAttached(true)
    setSent(false)
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLineIcon className="size-4 text-primary" />
            Compose
          </CardTitle>
          <CardDescription>
            <GitBranchIcon className="me-1 inline size-3.5" strokeWidth={1.5} />
            feat / focused-fix
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            placeholder="What should Jev decide?"
            aria-label="Request"
          />
          {attached ? (
            <div className="flex">
              <Badge variant="outline" className="h-7 gap-2 ps-2 pe-1">
                <PaperclipIcon />
                spec.md{" "}
                <span className="font-mono text-muted-foreground">4.2 KB</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full"
                  aria-label="Remove attachment"
                  onClick={() => setAttached(false)}
                >
                  <XIcon />
                </Button>
              </Badge>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAttached(true)}
              disabled={attached}
            >
              <PaperclipIcon data-icon="inline-start" />
              Attach sample
            </Button>
            <Select items={models} value={model} onValueChange={setModel}>
              <SelectTrigger size="sm" aria-label="Model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Reset"
              onClick={reset}
            >
              <RotateCcwIcon />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-xs text-muted-foreground">
            {sent
              ? "Received locally. No model connected."
              : "Make changes with the context you provide."}
          </span>
          <span className="flex items-center gap-3">
            <KbdGroup className="hidden text-muted-foreground sm:inline-flex">
              <Kbd>⌘</Kbd>
              <Kbd>↵</Kbd>
            </KbdGroup>
            <Button
              disabled={!message.trim()}
              onClick={() => {
                setSent(true)
                setMessage("")
              }}
            >
              Send
              <ArrowUpIcon data-icon="inline-end" />
            </Button>
          </span>
        </CardFooter>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        Local preview. No requests are sent.
      </p>
    </div>
  )
}

const options = [
  {
    id: "search_docs",
    label: "Search docs",
    keywords: ["how", "docs", "guide", "what"],
  },
  {
    id: "open_ticket",
    label: "Open ticket",
    keywords: ["bug", "broken", "error", "fail"],
  },
  {
    id: "escalate",
    label: "Escalate",
    keywords: ["urgent", "outage", "down", "security"],
  },
  {
    id: "answer",
    label: "Answer directly",
    keywords: ["thanks", "hello", "price", "plan"],
  },
]

function score(request: string) {
  const words = request.toLowerCase().split(/\W+/).filter(Boolean)
  const raw = options.map(
    (option) =>
      1 +
      option.keywords.filter((keyword) => words.includes(keyword)).length * 4
  )
  const total = raw.reduce((sum, value) => sum + value, 0)
  return options.map((option, index) => ({
    ...option,
    confidence: raw[index]! / total,
  }))
}

function DecisionScene() {
  const [request, setRequest] = React.useState(
    "The dashboard is broken after the last deploy, is this a known bug?"
  )
  const [decided, setDecided] = React.useState<ReturnType<typeof score> | null>(
    null
  )
  const ranked = decided
    ? [...decided].sort((a, b) => b.confidence - a.confidence)
    : null
  const pick = ranked?.[0]

  return (
    <div className="grid w-full max-w-3xl gap-4 md:grid-cols-[minmax(0,11fr)_minmax(0,10fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Request</CardTitle>
          <CardDescription>
            Jev picks one option from a fixed list. Your code executes it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            rows={3}
            aria-label="Request"
          />
          <div>
            <p className="eyebrow mb-2">Fixed options</p>
            <ul className="flex flex-wrap gap-1.5">
              {options.map((option) => (
                <li key={option.id}>
                  <Badge
                    variant={pick?.id === option.id ? "default" : "outline"}
                    className="font-mono"
                  >
                    {option.id}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDecided(null)}
            disabled={!decided}
          >
            Clear
          </Button>
          <Button
            onClick={() => setDecided(score(request))}
            disabled={!request.trim()}
          >
            Decide
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Decision</CardTitle>
          <CardDescription>
            {pick ? (
              <>
                Pick:{" "}
                <span className="font-mono text-foreground">{pick.id}</span>
              </>
            ) : (
              "No decision yet."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {ranked ? (
            ranked.map((option, index) => (
              <div key={option.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "font-mono",
                      index > 0 && "text-muted-foreground"
                    )}
                  >
                    {option.id}
                  </span>
                  <span className="tnum font-mono text-xs">
                    {option.confidence.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-300 ease-out-quart",
                      index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                    )}
                    style={{ width: `${Math.round(option.confidence * 100)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              Run a request to see the pick, its confidence, and every
              option&apos;s score.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Demo mode. A local keyword matcher stands in for Jev.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

function SettingsScene() {
  const [live, setLive] = React.useState(false)
  const [explain, setExplain] = React.useState(true)

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="size-4 text-primary" />
          Workspace settings
        </CardTitle>
        <CardDescription>
          Explore settings locally. Changes reset when you leave this scene.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="keys">API keys</TabsTrigger>
            <TabsTrigger value="danger">Danger zone</TabsTrigger>
          </TabsList>
          <TabsContent
            value="general"
            className="flex flex-col gap-4 pt-4 text-sm"
          >
            <label className="flex items-center justify-between gap-6">
              <span>
                Simulate live mode
                <span className="block text-xs text-muted-foreground">
                  {live
                    ? "Visual preview only. No requests are sent."
                    : "A local matcher stands in for Jev."}
                </span>
              </span>
              <Switch checked={live} onCheckedChange={setLive} />
            </label>
            <Separator />
            <label className="flex items-center justify-between gap-6">
              <span>
                Explain decisions
                <span className="block text-xs text-muted-foreground">
                  Show every option&apos;s score.
                </span>
              </span>
              <Switch checked={explain} onCheckedChange={setExplain} />
            </label>
            <Separator />
            <div className="flex items-center justify-between gap-6">
              <span>Status</span>
              <Badge
                variant="outline"
                className={cn(
                  live
                    ? "border-teal/40 text-teal"
                    : "border-warning/40 text-warning"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    live ? "bg-teal" : "bg-warning"
                  )}
                  aria-hidden="true"
                />
                {live ? "Simulated live" : "Demo mode"}
              </Badge>
            </div>
          </TabsContent>
          <TabsContent
            value="keys"
            className="flex flex-col gap-3 pt-4 text-sm"
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium">TYPESAFE_API_KEY</span>
              <Input type="text" value="ts_demo_example" readOnly />
            </label>
            <p className="text-xs text-muted-foreground">
              Example key only. No credentials are collected or stored.
            </p>
          </TabsContent>
          <TabsContent
            value="danger"
            className="flex items-center justify-between gap-6 pt-4 text-sm"
          >
            <span>
              Delete workspace
              <span className="block text-xs text-muted-foreground">
                Preview the confirmation dialog. No data is deleted.
              </span>
            </span>
            <Dialog>
              <DialogTrigger render={<Button variant="destructive" />}>
                Delete
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Delete this workspace?</DialogTitle>
                  <DialogDescription>
                    This is a confirmation preview. No workspace, decisions, or
                    keys will be deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Keep workspace
                  </DialogClose>
                  <DialogClose render={<Button variant="destructive" />}>
                    Delete
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export { ComposerScene, DecisionScene, SettingsScene }
