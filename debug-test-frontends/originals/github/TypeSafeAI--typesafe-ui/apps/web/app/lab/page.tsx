import type { Metadata } from "next"

import { loadLabSources } from "@/lib/lab-sources"

import { Lab } from "@/components/lab"

export const metadata: Metadata = {
  title: "Lab",
  description: "Interactive scenes built from the TypeSafe UI library.",
}

export default async function LabPage() {
  return <Lab sources={await loadLabSources()} />
}
