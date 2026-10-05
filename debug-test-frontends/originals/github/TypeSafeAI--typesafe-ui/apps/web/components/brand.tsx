import Image from "next/image"
import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

import { site } from "@/lib/site"

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-6 shrink-0 overflow-hidden rounded-md [outline:1px_solid_oklch(0_0_0/0.1)] -outline-offset-1 dark:[outline-color:oklch(1_0_0/0.1)]",
        className
      )}
      aria-hidden="true"
    >
      <Image src="/brand/mark.jpg" alt="" fill sizes="24px" priority />
    </span>
  )
}

function Brand({ className, sub }: { className?: string; sub?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className={cn(
        "flex items-center gap-2 rounded-md text-sm font-semibold tracking-[-0.01em] outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <BrandMark />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap">{site.name}</span>
        {sub ? <span className="eyebrow mt-1 text-[9px]">{sub}</span> : null}
      </span>
    </Link>
  )
}

export { Brand, BrandMark }
