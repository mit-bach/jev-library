import Image from "next/image"
import Link from "next/link"
import { ArrowDownIcon, ArrowUpRightIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { registry } from "@/lib/registry"

function LibraryIntro() {
  return (
    <header id="library-overview" data-spy className="library-intro">
      <Image
        src="/images/optical-study.webp"
        alt=""
        fill
        preload
        sizes="(max-width: 639px) 1100px, (max-width: 1680px) 100vw, 1680px"
        className="intro-art"
      />
      <div className="intro-shade" aria-hidden="true" />
      <div className="intro-content">
        <p className="intro-label">
          <span aria-hidden="true" /> TypeSafe UI / Component library
        </p>
        <h1>
          Interfaces, in a<br />
          different light.
        </h1>
        <p className="intro-description">
          Small parts. Extraordinary possibilities. A considered collection of
          components for the next thing you build.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            nativeButton={false}
            render={<a href="#group-actions" />}
            size="lg"
          >
            Explore components <ArrowDownIcon data-icon="inline-end" />
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/lab" />}
            variant="outline"
            size="lg"
            className="intro-secondary"
          >
            Enter the Lab <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
      <div className="intro-caption">
        <span>Independent by design. Open by nature.</span>
        <span className="hidden sm:inline">Glass study / TypeSafe UI</span>
      </div>
      <div className="intro-specs">
        <span>
          <strong>{registry.length}</strong> components
        </span>
        <span>
          React <span aria-hidden="true">/</span> Base UI
        </span>
        <span>Light &amp; dark</span>
        <span>Source included</span>
      </div>
    </header>
  )
}

export { LibraryIntro }
