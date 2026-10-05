# Jev beside an Anthropic agent

Research note, 2026-10-02. Public repos and docs only. No API call was made. Star counts and push times are from the GitHub API on that date. A number in a README is the author's claim.

Claude Managed Agents is Anthropic's hosted harness. You define the agent, the tools, the MCP servers, and the skills. Anthropic runs the loop. The beta header on the docs page is `managed-agents-2026-04-01`. A Claude API key is the credential. Docs: `https://platform.claude.com/docs/en/managed-agents/overview`.

The Claude Agent SDK is the other door. You run the same kind of loop in your own process, with hooks and MCP. Claude Code is that loop as a product. Public Jev harnesses are written for Claude Code. Almost none name Managed Agents.

Official TypeSafe docs, already in `corpus/01-primary-typesafe/introduction/coding-agents.md`, say Jev does not replace the model inside Claude. Anthropic has not shipped a Jev integration. The pages that say so are community pages.

## Three ways they connect

**Skill.** `typesafe-ai/skills`, 2586 stars, pushed 2026-09-12, MIT. Claude Code: `claude plugin marketplace add typesafe-ai/skills` then `claude plugin install typesafe@typesafe-ai`. The repo is a skill document. It teaches the agent to write Jev calls. It does not call Jev on each turn.

**MCP.** The agent calls Jev when it chooses to. TypeSafe publishes no MCP server. These community servers speak MCP, so a Managed Agent can list one under its MCP servers, and Claude Code can `claude mcp add` one. The key stays in the server environment.

| Repo | Stars | Pushed | What it exposes |
| --- | --- | --- | --- |
| `jkudish/jev-mcp` | 496 | 2026-10-02 | Ten judgment tools. npm `@jkudish/jev-mcp`. TypeSafe, or OpenRouter, Cloudflare, or Vercel as fallback. |
| `itsmostafa/system-one-connector` | 339 | 2026-10-04 | Choice, Score, Noul, batching. Catalogs still call this typesafe-mcp. |
| `blakestone-x/jev-mcp` | 25 | 2026-09-16 | classify, score, check, match, screen. Thresholds live in `jev_mcp/questions.py`. |
| `rashedInt32/jev-mcp` | 7 | 2026-09-28 | classify, score, check, batched ask, triage. Also a Claude Code plugin. |
| `freepik-company/jev-mcp` | 3 | 2026-09-28 | OpenRouter or TypeSafe. Apache-2.0. Go. |

Skip `codaaiteam/jev-mcp`. Its README sends people to `jevtypesafeai.com`, which is not TypeSafe.

An MCP tool is the right plug when Claude should ask a question mid-task. It is a weak way to make Jev run on every step, because Claude can skip the tool.

**Host-owned call.** Your code builds the menu, calls Jev, checks the answer, then lets Claude continue. This is the pattern that uses Jev on purpose, every time the event fires. On Claude Code and the Agent SDK the event is a hook, especially `PreToolUse`. On Managed Agents the same job is a custom tool: Anthropic sends `agent.custom_tool_use`, your client calls Jev, then you return `user.custom_tool_result`. The loop stays Anthropic's. The decision stays yours.

## High-use harnesses

These put Jev on a repeating step, not on a single demo call.

**`shitianfang/jev-use`**, 48 stars, pushed 2026-09-22, MIT. The smallest piece that is still a harness. `npm i jev-use` exports `check`, `pick`, and `rate`. `npx jev-use serve` is the MCP server. `jev-use hook gate` is a Claude Code `PreToolUse` hook for Bash, Write, and Edit. A deny blocks, an unsure answer asks, an allow stays silent, and a failed call fails open. `JEV_BACKEND=mock` runs with no key. The README's timings are the author's, and the repo keeps the scripts under `bench/`. Claude Code, Codex, and pi. For a Managed Agent, call the library from the custom-tool handler. Do not expect the Claude Code hook to run inside Anthropic's sandbox.

**`jonathanavis96/jev-kit`**, 55 stars, pushed 2026-10-02, MIT. The fullest Claude Code kit on disk. Separate directories: `jev_guard`, `compaction`, `filesearch`, `browser`, `review`, `belay`, `hooks`. The guard is a `PreToolUse` hook. The README says 1310 tests pass and quotes a browser-cost comparison. Those figures were not rerun here. `install/install.sh` writes under `$HOME` and does not edit `settings.json` unless you pass `--wire`. Copy one directory. Do not install the kit as the harness for a new project.

**`kerpopule/hermes-jev-skills`**, 1028 stars, pushed 2026-10-02, MIT. Routing, memory, compaction, skill selection, and computer use, with Claude Code and Codex named beside Hermes. Broad. Read a module. Do not adopt the repo as the project harness.

**`tamaratran/fast-jev-compaction`**, 7409 stars, pushed 2026-09-18, MIT. Replaces Claude Code's compaction summary with a Jev keep-or-drop over tool calls. User and assistant text stays. Issue 21, 2026-09-18, on Claude Code 2.1.272: `session.compact` is not a recognized hook event, and `claude plugin details` reports Hooks (0). Confirm the hook fires on the Claude Code build you run before you depend on it.

**`0x7067/claude-jev`**, 21 stars, pushed 2026-10-05, MIT. One Claude Code plugin: rule checks that block an edit, verbatim compaction, and a model tier for each subagent. Python standard library. With no key, the hooks switch off. Small enough to read beside jev-use.

**`TypeSafeAI/jev-harness`**, 27 stars, commit `1239b23`, already cloned under `debug-test-frontends/originals/github/`. An LLM proposes, Jev answers four narrow questions, code decides, a receipt can be replayed offline. The README says this community org is not the official TypeSafe team. `pnpm bench:review` totals are scripted mocks. Copy the receipt and the split. Point the proposer at Claude with the Anthropic key. Do not quote the bench.

**`codejunkie99/keel`**, 32 stars. A Mac app, not an Anthropic agent. The five rules in Avid's write-up are the ones to keep: filter options the host cannot run, skip the selector when the user already pinned a route, re-check the choice against current state, define the abstain path before the call, and do not treat a selection as permission. The local copy of that write-up is `corpus/06-longform-discourse/2026-09-23-Av1dlive-2102802621664985241.md`.

## A modular shape for one project

One decision first. Add the next only after the first has a receipt.

1. Install `typesafe-ai/skills` so the agent writes legal Jev questions.
2. Own a small module with three functions: build the menu, call `POST https://api.typesafe.ai/v1/systemone`, accept or abstain. `jev-use`'s `check` / `pick` / `rate` is that module if you want to start from code instead of a blank file.
3. Fire it from the surface you actually run. Claude Code or the Agent SDK: a `PreToolUse` hook. Managed Agents: a custom tool whose handler calls the module, plus one MCP server from the table above for questions Claude should ask on its own.
4. Write one JSON line per decision: options offered, choice, confidence, whether the host accepted it. `TypeSafeAI/jev-harness` `replayBoundReceipt` is the pattern. AntonioCoppe's offline JSONL loop, already graded in `debug-test-frontends/QUALITY.md`, is how you rerun the cases with no key.

Keep the TypeSafe key and the Anthropic key in the process environment. Do not put either key in a tool argument or in the agent's prompt.
