"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { Brand } from "@/components/brand"
import { SearchProvider, SearchTrigger } from "@/components/search-command"
import { ThemeToggle } from "@/components/theme-toggle"
import { groups, groupDetails, registry } from "@/lib/registry"
import { site } from "@/lib/site"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 supports-backdrop-filter:backdrop-blur-md">
      <SearchProvider>
        <div className="mx-auto grid h-13 max-w-[1680px] grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_minmax(0,22rem)_1fr]">
          <div className="flex min-w-0 items-center gap-5">
            <Brand />
            <nav
              aria-label="Main"
              className="hidden items-center gap-1 sm:flex"
            >
              {site.nav.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-2 py-1 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden lg:block">
            <SearchTrigger className="w-full justify-start" />
          </div>

          <div className="flex items-center justify-end gap-1">
            <SearchTrigger compact className="lg:hidden" />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={
                      <a
                        href={site.links.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${site.name} on GitHub`}
                      />
                    }
                  />
                }
              >
                <GithubIcon />
              </TooltipTrigger>
              <TooltipContent>View source on GitHub</TooltipContent>
            </Tooltip>
            <ThemeToggle />
            <MobileNav pathname={pathname} />
          </div>
        </div>
      </SearchProvider>
    </header>
  )
}

function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="sm:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            <Brand sub={site.tagline} />
          </SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
        </SheetHeader>
        <nav
          aria-label="Mobile"
          className="flex flex-col gap-6 px-4 pb-6 text-sm"
        >
          <div className="flex flex-col gap-1">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
                className="rounded-md px-2 py-1.5 font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
          {groups.map((group) => (
            <div key={group} className="flex flex-col gap-1">
              <p className="eyebrow px-2">{group}</p>
              <Link
                href={`/#${groupDetails[group].id}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Overview
              </Link>
              {registry
                .filter((entry) => entry.group === group)
                .map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/#${entry.id}`}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-1 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {entry.title}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export { SiteHeader }
