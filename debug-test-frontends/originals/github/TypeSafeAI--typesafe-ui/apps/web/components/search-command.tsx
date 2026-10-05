"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BoxesIcon,
  ExternalLinkIcon,
  FlaskConicalIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@workspace/ui/components/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@workspace/ui/components/command"
import { Kbd, KbdGroup } from "@workspace/ui/components/kbd"

import { labRegistry } from "@/lib/lab-registry"
import { groups, registry } from "@/lib/registry"
import { site } from "@/lib/site"

type SearchContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SearchContext = React.createContext<SearchContextValue | null>(null)

/**
 * Every word of the query must appear in the title or its keywords. Title
 * prefixes rank first so "dialog" finds Dialog before anything that merely
 * mentions it. cmdk's default fuzzy match let descriptions outrank titles.
 */
function filterCommand(value: string, search: string, keywords?: string[]) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 1
  const haystack = [value, ...(keywords ?? [])].join(" ").toLowerCase()
  if (!words.every((word) => haystack.includes(word))) return 0
  return value.toLowerCase().startsWith(words[0]!) ? 1 : 0.5
}

function useSearch() {
  const context = React.useContext(SearchContext)
  if (!context) {
    throw new Error("SearchTrigger must be rendered inside SearchProvider.")
  }
  return context
}

/**
 * Owns the single palette instance and the ⌘K shortcut. Triggers anywhere in
 * the tree (the header renders two, one per breakpoint) open the same dialog.
 */
function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo(() => ({ open, setOpen }), [open])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchDialog />
    </SearchContext.Provider>
  )
}

function subscribeHydration() { return () => {} }

function SearchTrigger({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { setOpen } = useSearch()
  const hydrated = React.useSyncExternalStore(subscribeHydration, () => true, () => false)

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={className}
        onClick={() => setOpen(true)}
        disabled={!hydrated}
      aria-label="Search components"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <SearchIcon />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => setOpen(true)}
      disabled={!hydrated}
      aria-label="Search components"
      aria-keyshortcuts="Control+K Meta+K"
    >
      <SearchIcon data-icon="inline-start" className="text-muted-foreground" />
      <span className="flex-1 text-start font-normal text-muted-foreground">
        Search components…
      </span>
      <KbdGroup className="hidden sm:inline-flex">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </Button>
  )
}

function SearchDialog() {
  const { open, setOpen } = useSearch()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  function run(action: () => void) {
    setOpen(false)
    action()
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Jump to a component or page."
      filter={filterCommand}
    >
      <CommandInput placeholder="Type a component or page…" />
      <CommandList>
        <CommandEmpty>No matches. Try “dialog” or “select”.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem
            value="Library"
            keywords={["overview", "components", "home"]}
            onSelect={() => run(() => router.push("/"))}
          >
            <BoxesIcon />
            Library
          </CommandItem>
          <CommandItem
            value="Lab"
            keywords={["scenes", "examples", "interactive"]}
            onSelect={() => run(() => router.push("/lab"))}
          >
            <FlaskConicalIcon />
            Lab
          </CommandItem>
        </CommandGroup>
        {groups.map((group) => (
          <CommandGroup heading={group} key={group}>
            {registry
              .filter((entry) => entry.group === group)
              .map((entry) => (
                <CommandItem
                  key={entry.id}
                  value={entry.title}
                  keywords={[
                    entry.id,
                    entry.group,
                    ...entry.description.split(/\W+/),
                  ]}
                  onSelect={() => run(() => router.push(`/#${entry.id}`))}
                >
                  {entry.title}
                  <CommandShortcut className="font-mono">
                    {entry.id}
                  </CommandShortcut>
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
        <CommandGroup heading="Jev Labs">
          {labRegistry.map(entry => <CommandItem key={entry.id} value={`Lab: ${entry.title}`} keywords={[entry.id, entry.group, entry.description]} onSelect={() => run(() => router.push(`/lab#${entry.id}`))}><FlaskConicalIcon />{entry.title}</CommandItem>)}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="Toggle theme"
            keywords={["dark", "light", "scheme", "mode"]}
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          >
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            Toggle theme
            <CommandShortcut>D</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="Open GitHub"
            keywords={["repository", "source", "code"]}
            onSelect={() =>
              run(() => window.open(site.links.github, "_blank", "noopener"))
            }
          >
            <ExternalLinkIcon />
            Open GitHub
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export { SearchProvider, SearchTrigger }
