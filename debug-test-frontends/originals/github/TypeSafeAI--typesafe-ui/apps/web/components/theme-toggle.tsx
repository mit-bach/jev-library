"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@workspace/ui/components/button"
import { Kbd } from "@workspace/ui/components/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

const iconSwap = "transition-[opacity,filter,scale] duration-300 ease-out-quart"
const iconShown = "scale-100 opacity-100 blur-0"
const iconHidden = "scale-[0.25] opacity-0 blur-[4px]"

function subscribeNoop() {
  return () => {}
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // next-themes only knows the resolved theme on the client. Render dark until then.
  const mounted = React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )

  const dark = mounted ? resolvedTheme === "dark" : true
  const label = dark ? "Use light scheme" : "Use dark scheme"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={() => setTheme(dark ? "light" : "dark")}
          />
        }
      >
        {/* Both icons stay mounted so the swap cross-fades in both directions. */}
        <span
          className="relative flex size-4 items-center justify-center"
          aria-hidden="true"
        >
          <SunIcon
            className={cn(
              iconSwap,
              dark ? iconShown : iconHidden
            )}
          />
          <MoonIcon
            className={cn(
              iconSwap,
              "absolute inset-0",
              dark ? iconHidden : iconShown
            )}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {label} <Kbd>D</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}

export { ThemeToggle }
