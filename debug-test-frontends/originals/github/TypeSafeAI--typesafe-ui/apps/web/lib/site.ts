export type Direction = "ltr" | "rtl"

export const site = {
  name: "TypeSafe UI",
  tagline: "Small parts. Clear interfaces.",
  description:
    "Unofficial community React components and interface patterns for TypeSafe AI projects. Preview, inspect, and reuse source.",
  url: "https://typesafe-ui.vercel.app",
  /** BCP 47 language tag applied to <html lang>. */
  lang: "en",
  /** Text direction applied to <html dir> and the DirectionProvider. Flip to "rtl" for RTL locales. */
  dir: "ltr" as Direction,
  /** Package alias consumers import from inside this monorepo. */
  packageName: "@workspace/ui",
  links: {
    github: "https://github.com/TypeSafeAI/typesafe-ui",
    typesafe: "https://typesafe.ai",
    docs: "https://docs.typesafe.ai/introduction/quickstart",
  },
  nav: [
    { href: "/", label: "Library" },
    { href: "/lab", label: "Lab" },
  ],
} as const
