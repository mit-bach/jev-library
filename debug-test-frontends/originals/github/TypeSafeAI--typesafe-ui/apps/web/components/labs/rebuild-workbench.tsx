"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

function RebuildWorkbench({ id }: { id: string }) {
  const [query, setQuery] = React.useState("")
  const [name, setName] = React.useState("")
  const [contacts, setContacts] = React.useState([{ id: 1, name: "Ada" }])
  const [nextId, setNextId] = React.useState(2)
  const [email, setEmail] = React.useState("")
  const [issue, setIssue] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)
  return (
    <section
      className="space-y-4 rounded-xl border bg-card p-4"
      aria-label="Rebuilt interface preview"
    >
      <h3 className="text-sm font-medium">Rebuilt interface preview</h3>
      {id === "rebuild-catalog" ? (
        <>
          <label className="flex flex-col gap-2 text-xs">
            Search products
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Cloud"
            />
          </label>
          <ul className="space-y-2">
            {["Cloud notebook", "Studio keyboard", "Travel dock"]
              .filter((product) =>
                product.toLowerCase().includes(query.toLowerCase())
              )
              .map((product) => (
                <li key={product} className="rounded border p-3 text-sm">
                  {product}
                </li>
              ))}
          </ul>
          {!["Cloud notebook", "Studio keyboard", "Travel dock"].some(
            (product) => product.toLowerCase().includes(query.toLowerCase())
          ) ? (
            <p role="status" className="text-xs">
              No products match. Try “Cloud”.
            </p>
          ) : null}
        </>
      ) : id === "rebuild-contacts" ? (
        <>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim()) {
                setContacts((v) => [...v, { id: nextId, name: name.trim() }])
                setNextId((v) => v + 1)
                setName("")
              }
            }}
          >
            <Input
              aria-label="New contact name"
              placeholder="New contact name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" size="sm" disabled={!name.trim()}>
              Add contact
            </Button>
          </form>
          <ul className="space-y-2">
            {contacts.map((contact) => (
              <li key={contact.id} className="flex items-center gap-2">
                <Input
                  aria-label={`Contact ${contact.id} name`}
                  value={contact.name}
                  onChange={(e) =>
                    setContacts((v) =>
                      v.map((c) =>
                        c.id === contact.id ? { ...c, name: e.target.value } : c
                      )
                    )
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  aria-label={`Delete ${contact.name}`}
                  onClick={() =>
                    setContacts((v) => v.filter((c) => c.id !== contact.id))
                  }
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
          }}
        >
          <label className="flex flex-col gap-1 text-xs">
            Email
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setSubmitted(false)
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Issue
            <Input
              required
              value={issue}
              onChange={(e) => {
                setIssue(e.target.value)
                setSubmitted(false)
              }}
            />
          </label>
          <Button
            type="submit"
            size="sm"
            disabled={!email.trim() || !issue.trim()}
          >
            Submit sample ticket
          </Button>
          {submitted ? (
            <p role="status" className="text-sm text-teal">
              Sample ticket S-101 created locally for {email}.
            </p>
          ) : null}
        </form>
      )}
      <p className="text-xs text-muted-foreground">
        Local component composition. No API discovery, app generation, network
        request, or exported verification proof.
      </p>
    </section>
  )
}

export { RebuildWorkbench }
