import { Library } from "@/components/library"
import { loadSources } from "@/lib/sources"

export const dynamic = "force-static"

export default async function LibraryPage() {
  const sources = await loadSources()
  return <Library sources={sources} />
}
