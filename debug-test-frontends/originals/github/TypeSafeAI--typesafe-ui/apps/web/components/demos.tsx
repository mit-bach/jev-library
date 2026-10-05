"use client"

import * as React from "react"
import { JevContract } from "@workspace/ui/components/jev-contract"
import { JevResult } from "@workspace/ui/components/jev-result"
import {
  ArrowRightIcon,
  ArrowUpIcon,
  BellIcon,
  CheckIcon,
  CopyIcon,
  InfoIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@workspace/ui/components/command"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@workspace/ui/components/input-group"
import { Kbd, KbdGroup } from "@workspace/ui/components/kbd"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet"
import { Switch } from "@workspace/ui/components/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      {children}
    </label>
  )
}

function ButtonDemo() {
  const [loading, setLoading] = React.useState(false)
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        disabled={loading}
        onClick={() => {
          setLoading(true)
          window.setTimeout(() => setLoading(false), 1200)
        }}
      >
        {loading ? "Deciding…" : "Decide"}
        {loading ? null : <ArrowRightIcon data-icon="inline-end" />}
      </Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button size="icon" variant="outline" aria-label="Settings">
        <SettingsIcon />
      </Button>
    </div>
  )
}

function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="secondary">
        <ShieldCheckIcon data-icon="inline-start" />
        Verified
      </Badge>
      <Badge variant="outline" className="text-teal border-teal/40">
        <span className="bg-teal size-1.5 rounded-full" aria-hidden="true" />
        Live · your key
      </Badge>
    </div>
  )
}

function DropdownMenuDemo() {
  const [notifications, setNotifications] = React.useState(true)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <UserIcon data-icon="inline-start" />
        Account
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuItem>
            <UserIcon />
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon />
            Settings
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={notifications} onCheckedChange={setNotifications}>
          <BellIcon />
          Notifications
        </DropdownMenuCheckboxItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CopyIcon />
            Copy link
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Public link</DropdownMenuItem>
            <DropdownMenuItem>Team link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LogOutIcon />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function InputDemo() {
  const [value, setValue] = React.useState("")
  const invalid = value.length > 0 && !value.includes("@")
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Field label="Email">
        <Input
          type="email"
          placeholder="you@example.com"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={invalid || undefined}
        />
      </Field>
      <p className={invalid ? "text-destructive text-xs" : "text-muted-foreground text-xs"}>
        {invalid ? "Enter a valid email address." : "Type without an @ to see the invalid state."}
      </p>
      <Input placeholder="Disabled" disabled />
    </div>
  )
}

function InputGroupDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search components…" />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="typesafe.ai" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Copy URL">
            <CopyIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function TextareaDemo() {
  const [value, setValue] = React.useState("Review the changed files and suggest a focused fix.")
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Field label="Request">
        <Textarea value={value} onChange={(event) => setValue(event.target.value)} rows={3} />
      </Field>
      <p className="text-muted-foreground tnum font-mono text-xs">{value.length} characters</p>
    </div>
  )
}

const models = [
  { value: "jev-latest", label: "jev-latest" },
  { value: "jev-fast", label: "jev-fast" },
  { value: "jev-2", label: "jev-2" },
]

function SelectDemo() {
  const [model, setModel] = React.useState<string | null>("jev-latest")
  return (
    <div className="flex flex-wrap items-start justify-center gap-3">
      <Select items={models} value={model} onValueChange={setModel}>
        <SelectTrigger className="w-44" aria-label="Model">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Models</SelectLabel>
            {models.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select items={models} defaultValue="jev-fast" disabled>
        <SelectTrigger aria-label="Model, disabled">
          <SelectValue />
        </SelectTrigger>
        <SelectContent />
      </Select>
    </div>
  )
}

function CheckboxDemo() {
  const [items, setItems] = React.useState([true, false, true])
  const all = items.every(Boolean)
  const none = items.every((item) => !item)
  return (
    <div className="flex flex-col gap-3 text-sm">
      <label className="flex items-center gap-2 font-medium">
        <Checkbox
          checked={all}
          indeterminate={!all && !none}
          onCheckedChange={(checked) => setItems(items.map(() => checked === true))}
        />
        Select all
      </label>
      <div className="ms-6 flex flex-col gap-2">
        {["Read", "Write", "Execute"].map((label, index) => (
          <label key={label} className="flex items-center gap-2">
            <Checkbox
              checked={items[index]}
              onCheckedChange={(checked) =>
                setItems(items.map((item, i) => (i === index ? checked === true : item)))
              }
            />
            {label}
          </label>
        ))}
      </div>
      <label className="text-muted-foreground flex items-center gap-2">
        <Checkbox disabled /> Disabled
      </label>
    </div>
  )
}

function SwitchDemo() {
  const [live, setLive] = React.useState(false)
  return (
    <div className="flex flex-col gap-3 text-sm">
      <label className="flex items-center justify-between gap-6">
        <span>
          Live mode
          <span className="text-muted-foreground block text-xs">
            {live ? "Requests go to Jev." : "A local matcher stands in for Jev."}
          </span>
        </span>
        <Switch checked={live} onCheckedChange={setLive} />
      </label>
      <label className="flex items-center justify-between gap-6">
        <span>Explain decisions</span>
        <Switch defaultChecked />
      </label>
      <label className="text-muted-foreground flex items-center justify-between gap-6">
        <span>Disabled</span>
        <Switch disabled />
      </label>
    </div>
  )
}

function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Decision</CardTitle>
        <CardDescription>Which tool fits this request?</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="More options">
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono">search_docs</span>
          <Badge>0.91</Badge>
        </div>
        <div className="text-muted-foreground flex items-center justify-between">
          <span className="font-mono">open_ticket</span>
          <span className="tnum font-mono text-xs">0.07</span>
        </div>
        <div className="text-muted-foreground flex items-center justify-between">
          <span className="font-mono">escalate</span>
          <span className="tnum font-mono text-xs">0.02</span>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Override</Button>
        <Button>Execute</Button>
      </CardFooter>
    </Card>
  )
}

function TabsDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="usage" disabled>
            Usage
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="text-muted-foreground pt-3 text-sm">
          Rendered output goes here.
        </TabsContent>
        <TabsContent value="code" className="text-muted-foreground pt-3 text-sm">
          Source goes here.
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="decide">
        <TabsList variant="line">
          <TabsTrigger value="decide">Decide</TabsTrigger>
          <TabsTrigger value="explain">Explain</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
        </TabsList>
        <TabsContent value="decide" className="text-muted-foreground pt-3 text-sm">
          One choice question, one round trip.
        </TabsContent>
        <TabsContent value="explain" className="text-muted-foreground pt-3 text-sm">
          Why the top option won.
        </TabsContent>
        <TabsContent value="log" className="text-muted-foreground pt-3 text-sm">
          Every decision, with its scores.
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm text-sm">
      <p className="font-medium">TypeSafe UI</p>
      <p className="text-muted-foreground">Small parts. Clear interfaces.</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4">
        <span>Library</span>
        <Separator orientation="vertical" />
        <span>Lab</span>
        <Separator orientation="vertical" />
        <span>GitHub</span>
      </div>
    </div>
  )
}

const decisions = Array.from({ length: 24 }, (_, index) => ({
  id: `req_${(1040 + index).toString(16)}`,
  option: ["search_docs", "open_ticket", "escalate", "answer"][index % 4]!,
  confidence: (0.62 + ((index * 7) % 35) / 100).toFixed(2),
}))

function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-56 w-full max-w-sm rounded-lg border">
      <div className="p-3">
        <p className="eyebrow mb-3">Recent decisions</p>
        {decisions.map((decision) => (
          <React.Fragment key={decision.id}>
            <div className="flex items-center justify-between py-1.5 font-mono text-xs">
              <span className="text-muted-foreground">{decision.id}</span>
              <span>{decision.option}</span>
              <span className="tnum">{decision.confidence}</span>
            </div>
            <Separator />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  )
}

function KbdDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-sm">
      <div className="flex items-center gap-4">
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>Enter</Kbd>
        <Kbd>Esc</Kbd>
      </div>
      <p className="text-muted-foreground flex items-center gap-2">
        Press
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        to search, or
        <Kbd>D</Kbd>
        to toggle the theme.
      </p>
    </div>
  )
}

function DialogDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Dialog>
        <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you are done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Name">
              <Input defaultValue="Val Alexander" />
            </Field>
            <Field label="Username">
              <Input defaultValue="@buns" />
            </Field>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <DialogClose render={<Button />}>Save changes</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger render={<Button variant="destructive" />}>Delete project</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription>
              This permanently removes the project and its deployments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Keep project</DialogClose>
            <DialogClose render={<Button variant="destructive" />}>Delete</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SheetDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(["right", "left", "bottom"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="outline" className="capitalize" />}>{side}</SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>API key</SheetTitle>
              <SheetDescription>Stored in this browser only. Never sent anywhere but TypeSafe.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-3 px-4">
              <Field label="TYPESAFE_API_KEY">
                <Input type="password" placeholder="ts_live_…" />
              </Field>
            </div>
            <SheetFooter>
              <SheetClose render={<Button />}>Save key</SheetClose>
              <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}

function TooltipDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
        <TooltipContent>Jev decides, your code executes.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="About confidence" />}>
          <InfoIcon />
        </TooltipTrigger>
        <TooltipContent side="bottom">Confidence is a probability, not a promise.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button size="icon" aria-label="Send" />}>
          <ArrowUpIcon />
        </TooltipTrigger>
        <TooltipContent>
          Send <Kbd className="ms-1">⌘↵</Kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

/** cmdk scrolls its first item into view on mount, which would yank the page down to this card. Mount it only once visible. */
function useInView<T extends Element>() {
  const ref = React.useRef<T>(null)
  const [inView, setInView] = React.useState(false)
  React.useEffect(() => {
    const element = ref.current
    if (!element || inView) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setInView(true)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [inView])
  return [ref, inView] as const
}

function CommandDemo() {
  const [ref, inView] = useInView<HTMLDivElement>()
  if (!inView) {
    return <div ref={ref} className="h-64 w-full max-w-sm rounded-lg border" aria-hidden="true" />
  }
  return (
    <Command className="w-full max-w-sm rounded-lg border">
      <CommandInput placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <SearchIcon />
            Search docs
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <PaperclipIcon />
            Attach sample
          </CommandItem>
          <CommandItem>
            <CheckIcon />
            Verify key
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem>
            <UserIcon />
            Profile
            <CommandShortcut>⇧⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SettingsIcon />
            Settings
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

function JevContractDemo() {
  return <div className="w-full max-w-xl"><JevContract questions={[{ id: "route", label: "Next action", type: "choice", instructions: "Choose only from the actions permitted by the host policy.", criteria: { search_docs: "Read approved documentation", needs_human: "Ask a human when evidence is missing" } }]} /></div>
}
function JevResultDemo() {
  const [state, setState] = React.useState("illustrative")
  return <div className="w-full max-w-xl space-y-3"><label className="flex items-center gap-3 text-xs">Response state<select className="bg-background rounded border p-2" value={state} onChange={e => setState(e.target.value)}><option value="illustrative">Illustrative</option><option value="unknown">Unknown</option><option value="empty">Empty</option><option value="error">Error</option></select></label><JevResult provenance="illustrative" answers={state === "empty" || state === "error" ? [] : [{ id: "route", label: "Next action", type: "choice", value: state === "unknown" ? null : "search_docs" }]} error={state === "error" ? "Sample request failed. Retry without treating a failure as an empty answer." : undefined} /></div>
}

export const demos: Record<string, React.ComponentType> = {
  "jev-contract": JevContractDemo,
  "jev-result": JevResultDemo,
  button: ButtonDemo,
  badge: BadgeDemo,
  "dropdown-menu": DropdownMenuDemo,
  input: InputDemo,
  "input-group": InputGroupDemo,
  textarea: TextareaDemo,
  select: SelectDemo,
  checkbox: CheckboxDemo,
  switch: SwitchDemo,
  card: CardDemo,
  tabs: TabsDemo,
  separator: SeparatorDemo,
  "scroll-area": ScrollAreaDemo,
  kbd: KbdDemo,
  dialog: DialogDemo,
  sheet: SheetDemo,
  tooltip: TooltipDemo,
  command: CommandDemo,
}
