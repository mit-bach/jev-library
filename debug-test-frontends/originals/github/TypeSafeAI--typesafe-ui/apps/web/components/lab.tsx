"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  PanelLeftIcon,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Badge } from "@workspace/ui/components/badge"
import { CodeSnippet, CopyButton } from "@/components/code-snippet"
import {
  ComposerScene,
  DecisionScene,
  SettingsScene,
} from "@/components/labs/classic-scenes"
import { TypedPreview } from "@/components/labs/typed-preview"
import { LabNavigation } from "@/components/labs/lab-navigation"
import {
  catalogLabCount,
  labById,
  labRegistry,
  playgroundSource,
  workspaceLabCount,
  type LabEntry,
} from "@/lib/lab-registry"
import type { LabSources } from "@/lib/lab-sources"

const classicNames = {
  composer: "ComposerScene",
  decision: "DecisionScene",
  settings: "SettingsScene",
}
const classics: Record<string, React.ComponentType | undefined> = {
  composer: ComposerScene,
  decision: DecisionScene,
  settings: SettingsScene,
}
function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback)
  return () => window.removeEventListener("hashchange", callback)
}
function Lab({ sources }: { sources: LabSources }) {
  const hash = React.useSyncExternalStore(
    subscribeHash,
    () => window.location.hash.slice(1),
    () => ""
  )
  const entry = labById(hash) ?? labRegistry[0]!
  const [open, setOpen] = React.useState(false)
  function navigate(id: string) {
    window.location.hash = id
    setOpen(false)
    window.requestAnimationFrame(() =>
      document.getElementById("lab-title")?.focus({ preventScroll: true })
    )
  }
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-[1680px] outline-none"
    >
      <div className="grid lg:grid-cols-[224px_minmax(0,1fr)] 2xl:grid-cols-[224px_minmax(0,1fr)_176px]">
        <aside className="catalog-rail sticky top-13 hidden h-[calc(100svh-3.25rem)] overflow-y-auto border-e lg:block">
          <LabNavigation active={entry.id} onNavigate={navigate} />
        </aside>
        <div className="min-w-0 px-4 pt-5 pb-10 sm:px-6">
          <header id="lab-overview" className="mb-5 border-b pb-5">
            <p className="eyebrow mb-2">TypeSafe UI / Jev experiments</p>
            <h1 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
              Component lab
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Explore {catalogLabCount} playground examples, {workspaceLabCount}{" "}
              workspace scenarios. Edit inputs, explore typed responses, and
              reuse the components.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge variant="outline">
                Local previews · no provider calls
              </Badge>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="sm" className="lg:hidden" />
                  }
                >
                  <PanelLeftIcon /> Browse Labs
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-80 max-w-[90vw] overflow-y-auto"
                >
                  <SheetHeader>
                    <SheetTitle>Browse Labs</SheetTitle>
                    <SheetDescription>
                      Search every Jev example and interface pattern.
                    </SheetDescription>
                  </SheetHeader>
                  <LabNavigation
                    active={entry.id}
                    onNavigate={navigate}
                    mobile
                  />
                </SheetContent>
              </Sheet>
            </div>
          </header>
          {hash && !labById(hash) ? (
            <p role="status" className="mb-4 rounded-lg border p-3 text-sm">
              This Lab was not found. Showing Composer; use the example browser
              to choose another.
            </p>
          ) : null}
          <LabExample
            key={entry.id}
            entry={entry}
            sources={sources}
            navigate={navigate}
          />
          <footer className="mt-10 border-t pt-5 text-xs leading-relaxed text-muted-foreground">
            Adapted from{" "}
            <a
              className="underline underline-offset-4"
              href={playgroundSource}
              target="_blank"
              rel="noreferrer"
            >
              TypeSafeAI/typesafe-playground
            </a>{" "}
            (MIT). Original playground by @nickthompson480; community extensions
            by its contributors. These component previews are independent of the
            upstream live services.
          </footer>
        </div>
        <aside className="sticky top-13 hidden h-fit space-y-4 px-4 pt-6 2xl:block">
          <p className="eyebrow">In this Lab</p>
          <nav
            aria-label="Lab outline"
            className="flex flex-col gap-3 text-xs text-muted-foreground"
          >
            <a
              href="#lab-overview"
              onClick={(event) => {
                event.preventDefault()
                document.getElementById("lab-overview")?.scrollIntoView()
              }}
            >
              Overview
            </a>
            <a
              href="#lab-preview"
              onClick={(event) => {
                event.preventDefault()
                document.getElementById("lab-preview")?.scrollIntoView()
              }}
            >
              Preview &amp; source
            </a>
            <a
              href="#lab-install"
              onClick={(event) => {
                event.preventDefault()
                document.getElementById("lab-install")?.scrollIntoView()
              }}
            >
              Installation
            </a>
            <a
              href="#lab-notes"
              onClick={(event) => {
                event.preventDefault()
                document.getElementById("lab-notes")?.scrollIntoView()
              }}
            >
              Experiment notes
            </a>
          </nav>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-primary"
          >
            Component library <ArrowUpRightIcon className="size-3" />
          </Link>
        </aside>
      </div>
    </main>
  )
}

function LabExample({
  entry,
  sources,
  navigate,
}: {
  entry: LabEntry
  sources: LabSources
  navigate: (id: string) => void
}) {
  const [view, setView] = React.useState("preview")
  const defaultFile =
    entry.kind === "classic"
      ? "components/labs/classic-scenes.tsx"
      : "components/labs/typed-preview.tsx"
  const [file, setFile] = React.useState(defaultFile)
  const peers = labRegistry.filter(
    (candidate) => candidate.group === entry.group
  )
  const index = peers.findIndex((candidate) => candidate.id === entry.id)
  const Classic = classics[entry.id as keyof typeof classics]
  const dataCode = JSON.stringify(entry, null, 2)
  const classicName = classicNames[entry.id as keyof typeof classicNames]
  const importCode = Classic
    ? `import { ${classicName} } from "@/components/labs/classic-scenes"\n\n<${classicName} />`
    : `import { TypedPreview } from "@/components/labs/typed-preview"\nimport { labById } from "@/lib/lab-registry"\n\nconst example = labById("${entry.id}")!\n\n<TypedPreview entry={example} />`
  return (
    <article
      className="lab-example min-w-0 space-y-4"
      aria-labelledby="lab-title"
    >
      <header className="space-y-2">
        <p className="eyebrow">{entry.group}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="lab-title"
            tabIndex={-1}
            className="min-w-0 flex-1 text-xl font-semibold tracking-tight outline-none sm:text-2xl"
          >
            {entry.title}
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(peers.length).padStart(2, "0")}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous scene"
              onClick={() =>
                navigate(peers[(index - 1 + peers.length) % peers.length]!.id)
              }
            >
              <ArrowLeftIcon className="rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next scene"
              onClick={() => navigate(peers[(index + 1) % peers.length]!.id)}
            >
              <ArrowRightIcon className="rtl:rotate-180" />
            </Button>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {entry.description}
        </p>
      </header>
      <section id="lab-preview" className="min-w-0">
        <Tabs value={view} onValueChange={setView}>
          <TabsList
            variant="line"
            aria-label="Lab view"
            className="w-full justify-start border-b"
          >
            <TabsTrigger value="preview" className="flex-none px-4">
              Preview
            </TabsTrigger>
            <TabsTrigger value="source" className="flex-none px-4">
              Source
            </TabsTrigger>
          </TabsList>
          <div className="lab-console mt-2 w-full min-w-0 overflow-hidden rounded-xl">
            <div
              className={`lab-stage p-3 sm:p-4 ${view === "source" ? "hidden" : ""}`}
              inert={view === "source"}
            >
              <div className="scene-enter flex min-w-0 justify-center">
                {Classic ? <Classic /> : <TypedPreview entry={entry} />}
              </div>
            </div>
            {view === "source" ? (
              <div className="min-w-0 space-y-4 p-4">
                <label className="flex flex-col gap-2 text-xs">
                  Source file
                  <select
                    aria-label="Source file"
                    className="min-w-0 rounded border bg-background p-2 font-mono text-xs"
                    value={file}
                    onChange={(event) => setFile(event.target.value)}
                  >
                    <option value="example">Example data · {entry.id}</option>
                    {Object.keys(sources.files).map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </label>
                {file === "example" ? (
                  <div className="min-w-0">
                    <div className="flex justify-end">
                      <CopyButton code={dataCode} label="Lab example data" />
                    </div>
                    <pre
                      dir="ltr"
                      className="max-h-[32rem] overflow-auto rounded bg-muted p-3 text-xs"
                    >
                      {dataCode}
                    </pre>
                  </div>
                ) : (
                  <div className="max-h-[36rem] overflow-auto">
                    <CodeSnippet {...sources.files[file]!} label={file} />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </Tabs>
      </section>
      <div className="lab-reuse grid items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section id="lab-install" className="min-w-0 space-y-3">
          <Tabs defaultValue="install">
            <TabsList
              variant="line"
              aria-label="Lab code"
              className="w-full justify-start border-b"
            >
              <TabsTrigger value="install" className="flex-none px-4">
                Install
              </TabsTrigger>
              <TabsTrigger value="import" className="flex-none px-4">
                Import
              </TabsTrigger>
            </TabsList>
            <TabsContent value="install" className="pt-3">
              <CodeSnippet
                {...sources.install}
                label="Install Lab workspace"
                kind="terminal"
              />
            </TabsContent>
            <TabsContent value="import" className="pt-3">
              <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
                <div className="flex items-center justify-between gap-2 border-b px-3 py-1">
                  <span className="text-xs">Import {entry.title}</span>
                  <CopyButton code={importCode} label="Lab import" />
                </div>
                <pre dir="ltr" className="overflow-auto p-4 font-mono text-xs">
                  {importCode}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Workspace setup, not an npm package install. These examples use{" "}
            <code>@/</code> app imports and <code>@workspace/ui</code>{" "}
            primitives. To port a Lab, copy its renderer, example data,
            dependencies, and shared tokens together.
          </p>
        </section>
        <section
          id="lab-notes"
          className="space-y-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border"
        >
          <h3 className="text-sm font-medium">Try this</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {entry.tryThis}
          </p>
          {entry.kind !== "classic" ? (
            <a
              href={`${playgroundSource.replace("/tree/", "/blob/")}/${entry.sourceFile}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-4"
            >
              Upstream example source <ArrowUpRightIcon className="size-3" />
            </a>
          ) : null}
        </section>
      </div>
    </article>
  )
}

export { Lab }
