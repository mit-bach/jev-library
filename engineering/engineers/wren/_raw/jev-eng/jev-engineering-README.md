# Jev Engineering

Typed Decision Systems for Reliable Agent Workflows

Av1dlive | 19 September 2026

## Contents

- `jev-engineering.pdf`: the illustrated research-style paper.
- `jev-engineering.md`: editable manuscript with numbered references.
- `jev-diagrams/`: eight original diagrams embedded in the paper.
- `jev-workflow-demo.mjs`: dependency-free, advisory claim-checking example.
- `jev-first-request.json`: example native TypeSafe request.
- `jev-practice-cases.json`: fictional practice cases, not recorded model predictions.
- `jev-integration-prompt.txt`: reusable prompt for a coding assistant working in an existing project.

## Start here

Read Sections 3-6 for the interface, decision loop, and worked example. Use Appendices A and B to select a workflow. Give a coding assistant the general integration prompt in Appendix C plus the selected recipe. Build prompts are for a coding assistant; they are not requests that Jev can execute itself.

## Offline demonstration

Requires Node.js 20 or newer; no package installation is needed. From the extracted folder:

```sh
node jev-workflow-demo.mjs --self-test
node jev-workflow-demo.mjs
```

The self-test covers 30 offline checks with synthetic responses. These test response validation and local policy behavior, not Jev's semantic accuracy. Running the script without a flag prints usage instructions. The live mode only prints an advisory result; it does not execute a business action.

The script also supports an optional paid `--live` request with `TYPESAFE_API_KEY` supplied through your environment. Check the current provider documentation and data policy before using it. Never paste credentials into the manuscript or prompts. No live provider request was made for this paper.

## Evidence and scope

This is a technical review and proposed implementation framework, not a peer-reviewed publication or a report of newly conducted model benchmarks. Published performance figures are attributed to their sources with their evaluation boundaries. The workflow recipes are proposals for adaptation, not claims of deployed products. Demonstration thresholds are uncalibrated and must not be treated as production settings.

The layout takes inspiration from the academic typography of *Attention Is All You Need*. It does not claim a conference affiliation, endorsement, or equivalent scientific contribution.
