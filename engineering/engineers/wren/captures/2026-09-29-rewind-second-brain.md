author: rewind
handle: @rewind02
post id: 2104888148568277164
timestamp: 2026-09-29T10:56:56Z
url: https://x.com/rewind02/status/2104888148568277164
engagement: likes 77, reposts 13, quotes 8, replies 14, bookmarks 96, views 48878
article url: https://x.com/i/article/2101814581311983616
article title: How to Build a Second Brain with Jev + GPT-6 Astra 
_disclaimer: This is a saved post, not an official TypeSafe document.
This is a saved post, not an official TypeSafe document.

Retrieval note: fxtwitter article body. The recall percentages and token counts are the author's claim. This file does not confirm a paper named Jev-Mem.

# How to Build a Second Brain with Jev + GPT-6 Astra 

GPT-6 Astra writes your second brain. Jev makes the thousands of small calls that keep it from rotting:

which notes connect, what's a duplicate, what's safe to remember, and when the vault honestly doesn't know the answer

In the last guide we built a second brain with GPT-6 Astra: a plain folder of Markdown files, an interview that fills it, and a few loops that keep it tidy

That setup works well - until it grows. Past a few hundred notes, the hard part stops being the writing

It becomes the small decisions that happen constantly:

- Is this new note a duplicate of an old one? 
- Does it contradict something you decided in March? 
- Which three of four hundred pages actually answer this question? 
- Is "I hate video calls" a real preference, or one bad Tuesday?

You can ask Astra to make every one of those calls, but it's slow and expensive to have a reasoning model read whole files just to answer yes or no

Skip the calls instead, and the vault rots quietly: duplicates pile up, old decisions sit next to the newer ones that reversed them, and answers get worse without anyone noticing

This guide adds Jev as the decision layer that handles those calls, so Astra only does what it's actually good at

[Image omitted.]

## Two brains, one vault

Jev, from TypeSafe AI, is a different kind of model from Astra. It never writes a sentence

You hand it some text - the "state" - plus a few typed questions, and it returns an answer to each: a yes/no probability (TypeSafe calls this primitive Noul), a pick from options you defined (Choice), or a position on a rubric you wrote (Score)

No prose, nothing to parse, and it can only ever point at one of the options you gave it

One explainer summed up the trade neatly: Jev gave up writing to get the speed. It can classify, route, score, and pick

It can't write a sentence, explain itself, write code, or reason step by step

So if you see a post claiming someone "built an app with Jev," what actually happened is that Astra or Claude Code built the app, and Jev sits inside it making the fast decisions

The same is true here - Astra builds and writes your second brain; Jev guards it

That gives you a clean three-way split for every operation in the vault:

[Image omitted.]

This split isn't just tidy 0 it measurably works

A research paper published this month, Jev-Mem, built an agent memory where Jev makes the frequent decisions (how memories connect, where to search, how much to search, when to stop) and a reasoning model only writes the final answer

On the LoCoMo memory benchmark it scored 0.777 against 0.700 for the strongest baseline, built its memory in 158 seconds instead of 1,044, and answered in 0.93 seconds instead of 1.47. One benchmark, with a small answering model - but it points the same direction as every hands-on test below

The most practical proof comes from one creator's rebuild of his own agent memory, shown in a video walkthrough

Before Jev, his agent guessed one file by its title, read the whole thing (often 15,000-40,000 tokens to find a fact three lines long), and hoped it had picked right

Across 52 test questions it found the right section 40% of the time, at roughly 21,000 tokens of reading per question

After adding two quick Jev rounds - which files, then which sections - it found the right section 96% of the time, at about 1,200 tokens

Same agent, same notes. Only the decisions changed

## What you actually need

- The vault from the last guide - a plain folder of Markdown files. Obsidian is optional; it's just a nice window onto the same folder

- Codex running GPT-6 Astra, working directly on that folder, exactly as before

- A Jev key. TypeSafe has opened sign-up at typesafe.ai (testers report about $5 of free credit). You can also reach Jev through Vercel's AI Gateway or OpenRouter. Store the key as an environment variable - the official Python SDK reads TYPESAFE_API_KEY automatically - rather than pasting it into a chat

- Python 3.11 or newer, for the tools below

You can have Astra write the Jev plumbing for you from scratch, but two open-source projects save a lot of time

jev-second-brain is a small command-line tool that indexes an Obsidian or Markdown vault, finds candidate links between notes, and asks Jev to judge them - without ever editing your notes

Jev-Mem is the research code from the paper above, useful as a reference design for the recall side

Both are MIT-licensed, and both are early: the CLI is a pre-release MVP, and Jev-Mem is research code

VERIFIED - the vault CLI
I installed jev-second-brain and ran it against its included fictional vault. Its 71 tests passed. Indexing, search, and link previews ran with zero model calls. It refused to evaluate without a key, refused to send a note that had changed since indexing, and refused to use a state folder other users could read

VERIFIED - the Jev-Mem demo
The offline demo ran without any keys and printed a full decision trace: how much search effort went to each of its four memory views, the evidence checks after each round, the decision to stop, and zero calls to a language model. The decisions in that demo are mocked, so it shows how the pipeline fits together - not how good Jev's judgments are

## The structure: four folders, three gates

The folders don't change from the last guide: raw/ for untouched captures, entities/ for one page per thing, concepts/ for one page per idea, and AGENTS.md as the routing map Codex reads before every request

Two things are new

First, every compiled page gets a small header that code can read without asking any model:

```
---
source: raw/2026-09-12-voice-interview.md   # where this came from
updated: 2026-09-14
status: current        # current | history | superseded
scope: client work     # who or what this applies to
expires: 2027-03-01    # optional, for anything time-sensitive
---
```

This is what lets code do the cheap work first

Expired or superseded pages get skipped before Jev ever sees them. A page with no source can be flagged automatically

And when a source note changes, code can find every page that cites it

Keeping each memory tied to its evidence is the idea at the center of Oracle's recent guide to governing agent memory, and it holds just as well for a personal vault

Second, Jev sits at three gates - the places where a wrong decision does the most damage:

[Image omitted.]

Notice what lives outside the vault: the search index, cached judgments, and your review decisions

The CLI keeps all of this in a separate state folder and insists that folder is private to you

Your notes stay plain, human-readable Markdown, and the machinery never clutters them

## Fill it: interview, then link

Filling the vault starts the same way as before

Astra interviews you by voice, one question at a time, pushing past vague first answers

Your answers land as dated files in raw/, and Astra compiles them into entity and concept pages

What's new is what happens every time a page is created or changed: a link pass

[Image omitted.]

The order matters. Code builds a short list of candidates first - pages the new one already links to, pages that share its words or title - capped at around ten

Only that list goes to Jev, which labels each pair: duplicate, related, revises, contradicts, none, or unsure

Those labels become proposals in a review queue. You keep, reject, or mark them unsure, and the decision is logged. Nothing edits your notes on its own

The two labels that earn their keep are revises and contradicts

That creator's "before" state is the failure they prevent: when his agent learned something new, it appended a bullet wherever it judged best, nobody checked whether the fact already existed or contradicted an older note, and old decisions ended up sitting next to the newer ones that reversed them

With the CLI, the whole link pass is four commands. Run it against the included fictional vault first, then point it at your own:

```
pipx install "git+https://github.com/fellowship-dev/jev-second-brain.git"

STATE="$(mktemp -d)"                          # private state folder, outside the vault
secondbrain init ~/vault --state "$STATE"
secondbrain index --state "$STATE"            # rerun after any note changes
secondbrain suggest concepts/pricing.md --state "$STATE" --k 10
                                              # ↑ preview only: shows the shortlist, no model call

# with AI_GATEWAY_API_KEY set in your environment:
secondbrain suggest concepts/pricing.md --state "$STATE" --k 10 \
  --evaluate --max-requests 12 --max-cost-usd 0.10

secondbrain review PROPOSAL_ID keep --state "$STATE" --note "checked both notes"
```

One detail worth knowing: this CLI reaches Jev through Vercel's AI Gateway, so it uses an AI_GATEWAY_API_KEY rather than a TypeSafe key directly

## The promotion gate

Here's the gate most second brains don't have

Everything in raw/ is an observation - something that happened or was said. Everything in entities/ and concepts/ is what your brain treats as true, and it shapes every future answer

Moving a claim from the first to the second deserves a stricter check than anything else in the system

Picture this: Astra reads a dated note saying you skipped Tuesday's client call because you were sick, and proposes a new memory - "I always skip video calls." The source is real. The generalization is wrong

And once it's stored as a preference, every future answer about scheduling quietly bends around it

Oracle's memory guide found the same trap with customer data: a one-time refund exception almost became "this customer is always eligible for refunds."

[Image omitted.]

The gate asks three yes/no questions in a single Jev call, and plain code turns the numbers into a decision

Here's the whole thing, using the official Python SDK

I validated these question definitions against the real SDK; the live call itself needs your key

```
from typesafe_sdk import TypeSafeClient, Noul, Choice

QUESTIONS = {
    "supported":  Noul(instructions="Is every claim in `candidate` explicitly supported by `source`?"),
    "scope_fits": Noul(instructions="Does `candidate` keep the same limits as `source` "
                                    "(who, when, how often, which project)? A one-off must stay a one-off."),
    "conflict":   Noul(instructions="Does `candidate` contradict any note in `existing`?"),
    "kind": Choice(
        instructions="What kind of memory is `candidate`?",
        criteria={
            "preference": "A standing preference or habit of the owner.",
            "fact":       "A stable fact about a person, project, or tool.",
            "decision":   "A dated decision that may later be reversed.",
            "event":      "Something that happened once.",
        },
    ),
}

def decide(a):
    s, f, c = a["supported"].noul, a["scope_fits"].noul, a["conflict"].noul
    if s >= 0.90 and f >= 0.90 and c <= 0.10:
        return "promote"
    if s < 0.50 or c >= 0.50:
        return "reject"
    return "review"                      # the grey zone goes to you

client = TypeSafeClient()                # reads TYPESAFE_API_KEY from the environment
state = {
    "candidate": "I always skip video calls.",
    "source":    "2026-09-12 — skipped the Tuesday client call, I was sick.",
    "existing":  ["Prefers async updates for internal work, calls for clients."],
}
result = client.system_one(state, QUESTIONS, model="jev-1.13.0")   # pin the version
print(decide(result.answers))
```

Three habits make this gate trustworthy:

- Send the grey zone to yourself. A probability is not a verdict. Clear passes and clear failures can be automatic; everything in between is your call

- Start in shadow mode. For the first couple of weeks, let the gate log what it would have done while you keep deciding by hand. Where it disagrees with you, reword the questions or move the thresholds. Only then let it act

- Pin the Jev version. Cached judgments are only valid for the model that made them. When you upgrade, re-run a small set of cases you've already decided before you switch over

## Asking it questions: route, check, stop, then answer

The read side is where the time and money go, and where the biggest improvement is

Instead of Astra guessing a file and reading it whole, a question passes through five quick stages - and Astra only reads what survives them

[Image omitted.]

1. Always load the essentials (code). AGENTS.md and your current priorities go in every time. A confident routing decision should never push out the rules that always apply

1. Which files? (Jev, one call.) Ask about every candidate file at once: might the answer be in here? In the same call, ask a second question - does the vault contain this at all? That one question is what lets your brain say "I don't know." When the creator asked his memory for a favorite pizza topping it had never recorded, the old system dutifully returned an unrelated 11,700-token file. The new one scored it 0.11 and returned nothing

1. Which sections? (Jev.) Within the chosen files, ask per section: does this actually answer the question - and is it current, or only history? Keep those two apart. In Oracle's test, a past refund scored 1.62 out of 2 for relevance while being correctly labeled "history": on-topic, but not permission to do it again

1. Enough evidence? (Jev, with a cap.) Stop, or run one more round. Always cap the rounds - Jev-Mem's default is 16 calls - so a hard question can't turn into an endless search

1. Answer (Astra). Astra writes the answer from only the selected sections, citing their file paths

The same pattern works as a reranker on top of ordinary search. In one retrieval benchmark, adding a Jev check on "does this passage directly answer the question?" lifted top-1 accuracy from 21% to 54% on the same retrieved chunks

The CLI does a version of this with secondbrain search "your question" --rerank, and if the Jev call fails, it falls back to the plain local ranking and says so rather than pretending

"An honest note on speed. A single Jev call typically returns in well under a second, but rounds that depend on each other add up, and big inputs take longer. In the creator's demo, a two-round recall across a large vault took seven to eight seconds and cost around a tenth to a third of a cent. That's far cheaper than Astra reading 13,000 tokens of the wrong file - but it isn't instant. Keep the rounds few and batch every question you can into each one."

## Keep it alive with loops

As in the last guide, maintenance runs on a schedule, not on your memory. The difference now is who does what in each loop

[Image omitted.]

Three of these loops you'll recognize from the last guide

The new one - the weekly retune - is what makes the system genuinely improve

Every keep or reject you log is feedback. Once a week, Astra reads the cases where Jev and you disagreed and rewrites the wording of the questions, the options, or the thresholds

This is the System 1/System 2 pairing in miniature: the fast model makes the calls, the slow model reviews the pattern and adjusts the rules, and neither does the other's job

The "on change" loop is where the page headers pay off

When a source note is edited, code finds every page whose source: points at it and queues those pages for a re-check

The CLI enforces the same idea on its own: it refuses to send any note that changed since the last index, so Jev never judges stale text

## Cost and privacy: code first, Jev second, Astra last

[Image omitted.]

The cost logic is a funnel. Code checks everything for free and removes what doesn't need judgment

Jev judges the shortlist for fractions of a cent. Astra - the expensive part - only ever reads the sections that survived

At Jev's published price of $0.042 per million input tokens, with output free because it never generates any, a 3,000-token check costs about $0.000126, and ten thousand of them about $1.26

You can ask several questions about the same text in one call, and TypeSafe says adding questions barely changes the response time, so batch them

Two cost habits keep this honest. Set per-run limits - the CLI has --max-requests and --max-cost-usd - and set a budget on your provider account as well, because those per-run limits are not a spending cap

And measure the whole path, not just the Jev call: extra searches and repeatedly sending large chunks of text can quietly eat the savings

Privacy deserves the same care, because a second brain is your most personal data

With the CLI, full note text stays in the local index. When Jev is asked something, only the selected pair of notes, or your query plus a short excerpt, is sent - never the whole vault

In its default private mode, it sends a fictional test note first and stops unless the provider confirms your request is on a zero-data-retention route (on Vercel, currently a Pro or Enterprise feature)

Use --public only for notes that are genuinely public. I couldn't verify that private-mode check live - my test environment has no route to Vercel - so run the tool's own canary on fictional notes before you point it at anything private

## Wire it into everything you build

As before, the brain earns its keep when every project reads from it

The only change to each project's AGENTS.md is that Astra asks through the recall gate instead of opening files directly:

```
## knowledge
- before starting, ask the brain: run recall (route → check → stop) for this task
- use only the sections recall returns, and cite their paths
- if recall says the vault doesn't contain it, say so — don't guess
- propose new memories as notes in ~/vault/raw/ — never write to entities/ or concepts/ directly
```

That last line is the one that keeps the brain clean

Projects can add observations freely, but only the promotion gate decides what becomes a fact

If you juggle several projects, pin the active ones in Codex so the right workspace - and its AGENTS.md - loads every time

The sync warning from the last guide still applies: one sync system, never two fighting over the same files. There's one more reason now - if a sync service changes a note after you index it, the CLI will refuse to send it until you re-index. That's the tool protecting you from judging stale text, but it will look like an error if you don't expect it

## The card

1. Keep the vault from the last guide - raw/, entities/, concepts/, AGENTS.md - and add a source / updated / status / scope header to every compiled page

1. Get a Jev key and store it as an environment variable: TYPESAFE_API_KEY for the SDK, AI_GATEWAY_API_KEY for the CLI. Pin a Jev version

1. Install the CLI and run init → index → suggest on the fictional sample vault first. Zero model calls, zero risk

1. Interview → raw/ → Astra compiles pages → Jev proposes links → you review

1. Add the promotion gate. Run it in shadow mode for two weeks, then let clear passes and clear failures through automatically, with the grey zone coming to you

1. Replace "read the whole file" with route → check → stop → answer - and let the brain say "I don't know."

1. Schedule the loops: nightly link and compile, a weekly sweep plus retune, a re-check on every change

1. Point every project's AGENTS.md at the recall step, and route new memories through raw/

The smallest useful version takes an afternoon: the vault you already have, a Jev key, and one extra question in front of every recall - "is the answer in here at all?" Your answers will get shorter, cheaper, and more honest from the first day

The models in both seats will keep changing

The vault, and every decision you've logged into it, outlasts all of them
