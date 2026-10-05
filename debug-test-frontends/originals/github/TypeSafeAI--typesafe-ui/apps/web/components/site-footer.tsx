import { ArrowUpRightIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { site } from "@/lib/site"

function SiteFooter() {
  return (
    <footer className="bg-background border-t">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-4 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <Brand />
          <p className="text-muted-foreground">{site.tagline}</p>
        </div>
        <nav aria-label="Footer" className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href={site.links.github} target="_blank" rel="noreferrer" className="hover:text-foreground inline-flex items-center gap-1">
            GitHub <ArrowUpRightIcon className="size-3" strokeWidth={1.5} />
          </a>
          <a href={site.links.docs} target="_blank" rel="noreferrer" className="hover:text-foreground inline-flex items-center gap-1">
            TypeSafe docs <ArrowUpRightIcon className="size-3" strokeWidth={1.5} />
          </a>
          <span>Built on shadcn and Base UI.</span>
          <span className="text-foreground">Choose with confidence.</span>
        </nav>
      </div>
    </footer>
  )
}

export { SiteFooter }
