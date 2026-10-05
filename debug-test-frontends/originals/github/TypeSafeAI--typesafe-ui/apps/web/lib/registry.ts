/**
 * The component catalog. One entry per file in packages/ui/src/components.
 * Demos live in components/demos.tsx and are keyed by `id`.
 */

export const groups = ["Actions", "Forms", "Layout", "Overlays", "Jev"] as const
export type Group = (typeof groups)[number]

export const groupDetails: Record<Group, { id: string; description: string }> = {
  Jev: { id: "group-jev", description: "Typed contracts and transparent decision results for Jev interfaces." },
  Actions: {
    id: "group-actions",
    description: "Buttons, badges, and menus. The parts people press.",
  },
  Forms: {
    id: "group-forms",
    description: "Inputs and toggles with clear states and visible focus.",
  },
  Layout: {
    id: "group-layout",
    description: "Surfaces, dividers, and tabs that hold everything else.",
  },
  Overlays: {
    id: "group-overlays",
    description: "Dialogs, sheets, tooltips, and the command palette.",
  },
}

export type RegistryEntry = {
  id: string
  title: string
  group: Group
  description: string
  /** Named exports from the component file, first one is the primary. */
  exports: string[]
  states: string[]
}

export const registry: RegistryEntry[] = [
  { id: "jev-contract", title: "Jev contract", group: "Jev", description: "Inspect noul, choice, and score questions with their exact candidate definitions.", exports: ["JevContract"], states: ["choice", "noul", "score"] },
  { id: "jev-result", title: "Jev result", group: "Jev", description: "Typed values with explicit provenance, unknown results, and failure states.", exports: ["JevResult"], states: ["empty", "illustrative", "provider", "unknown", "error"] },
  {
    id: "button",
    title: "Button",
    group: "Actions",
    description: "One filled action per surface. Everything else is outline or ghost.",
    exports: ["Button", "buttonVariants"],
    states: ["default", "hover", "focus", "disabled", "loading"],
  },
  {
    id: "badge",
    title: "Badge",
    group: "Actions",
    description: "A small label for status, counts, and categories.",
    exports: ["Badge", "badgeVariants"],
    states: ["default", "secondary", "outline", "destructive"],
  },
  {
    id: "dropdown-menu",
    title: "Dropdown menu",
    group: "Actions",
    description: "Grouped actions with shortcuts, submenus, and checkable items.",
    exports: ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuItem"],
    states: ["closed", "open", "focused", "disabled"],
  },
  {
    id: "input",
    title: "Input",
    group: "Forms",
    description: "A single-line text field with invalid and disabled states.",
    exports: ["Input"],
    states: ["default", "focus", "invalid", "disabled"],
  },
  {
    id: "input-group",
    title: "Input group",
    group: "Forms",
    description: "An input with leading or trailing addons, text, and buttons.",
    exports: ["InputGroup", "InputGroupInput", "InputGroupAddon", "InputGroupButton"],
    states: ["default", "focus", "disabled"],
  },
  {
    id: "textarea",
    title: "Textarea",
    group: "Forms",
    description: "Multi-line text that grows with the message.",
    exports: ["Textarea"],
    states: ["default", "focus", "invalid", "disabled"],
  },
  {
    id: "select",
    title: "Select",
    group: "Forms",
    description: "Pick one option from a fixed list. Groups and labels included.",
    exports: ["Select", "SelectTrigger", "SelectValue", "SelectContent", "SelectItem"],
    states: ["closed", "open", "selected", "disabled"],
  },
  {
    id: "checkbox",
    title: "Checkbox",
    group: "Forms",
    description: "A binary choice that can also be indeterminate.",
    exports: ["Checkbox"],
    states: ["unchecked", "checked", "indeterminate", "disabled"],
  },
  {
    id: "switch",
    title: "Switch",
    group: "Forms",
    description: "An on-off control that applies immediately.",
    exports: ["Switch"],
    states: ["off", "on", "disabled"],
  },
  {
    id: "card",
    title: "Card",
    group: "Layout",
    description: "A surface with header, action slot, content, and footer.",
    exports: ["Card", "CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter"],
    states: ["default", "compact"],
  },
  {
    id: "tabs",
    title: "Tabs",
    group: "Layout",
    description: "Switch between related panels. Default pill or underline style.",
    exports: ["Tabs", "TabsList", "TabsTrigger", "TabsContent"],
    states: ["active", "inactive", "disabled"],
  },
  {
    id: "separator",
    title: "Separator",
    group: "Layout",
    description: "A thin rule between sections, horizontal or vertical.",
    exports: ["Separator"],
    states: ["horizontal", "vertical"],
  },
  {
    id: "scroll-area",
    title: "Scroll area",
    group: "Layout",
    description: "Custom scrollbars that match the theme on every platform.",
    exports: ["ScrollArea", "ScrollBar"],
    states: ["idle", "scrolling"],
  },
  {
    id: "kbd",
    title: "Kbd",
    group: "Layout",
    description: "Keyboard keys and shortcut groups.",
    exports: ["Kbd", "KbdGroup"],
    states: ["default"],
  },
  {
    id: "dialog",
    title: "Dialog",
    group: "Overlays",
    description: "A modal for focused tasks and confirmations.",
    exports: ["Dialog", "DialogTrigger", "DialogContent", "DialogTitle", "DialogFooter"],
    states: ["closed", "open"],
  },
  {
    id: "sheet",
    title: "Sheet",
    group: "Overlays",
    description: "A panel that slides in from any edge.",
    exports: ["Sheet", "SheetTrigger", "SheetContent", "SheetTitle"],
    states: ["closed", "open"],
  },
  {
    id: "tooltip",
    title: "Tooltip",
    group: "Overlays",
    description: "A short hint on hover or focus.",
    exports: ["Tooltip", "TooltipTrigger", "TooltipContent", "TooltipProvider"],
    states: ["hidden", "visible"],
  },
  {
    id: "command",
    title: "Command",
    group: "Overlays",
    description: "A searchable command palette. Bound to ⌘K on this site.",
    exports: ["Command", "CommandDialog", "CommandInput", "CommandList", "CommandItem"],
    states: ["closed", "open", "empty"],
  },
]

export function entriesFor(group: Group) {
  return registry.filter((entry) => entry.group === group)
}

export function installCommand(id: string) {
  if (id.startsWith("jev-")) return `# Custom workspace component; no hosted shadcn registry entry.
# From the typesafe-ui repository root:
pnpm install --frozen-lockfile
# Import @workspace/ui/components/${id}`
  return `pnpm dlx shadcn@latest add ${id}`
}

export function importStatement(entry: RegistryEntry, packageName: string) {
  return `import { ${entry.exports.join(", ")} } from "${packageName}/components/${entry.id}"`
}
