# Jev Engineering

**Typed Decision Systems for Reliable Agent Workflows**  
Av1dlive | 19 September 2026

[Read the paper (PDF)](jev-engineering.pdf) · [Read the manuscript](jev-engineering.md) · [Original kit guide](jev-engineering-README.md)

A technical review and implementation framework for using Jev's typed decisions inside agent workflows. The paper separates observation, model judgment, deterministic policy, authorized action, and outcome verification.

## Start Here

Read Sections 3-6 for the interface, decision loop, and worked example. Appendices A and B contain application recipes; Appendix C contains a reusable integration prompt.

## Contents

| File | Purpose |
| --- | --- |
| [Paper](jev-engineering.pdf) | Illustrated 34-page paper |
| [Manuscript](jev-engineering.md) | Editable text with numbered references |
| [Diagrams](jev-diagrams/) | Eight original diagrams |
| [Workflow demo](jev-workflow-demo.mjs) | Dependency-free advisory claim-checking example |
| [First request](jev-first-request.json) | Example native TypeSafe request |
| [Practice cases](jev-practice-cases.json) | Fictional cases, not recorded predictions |
| [Integration prompt](jev-integration-prompt.txt) | Prompt for a coding assistant working in an existing project |

## Run the Offline Example

Requires Node.js 20 or newer. No package installation is needed.

```sh
node jev-workflow-demo.mjs --self-test
```

The 30 offline checks test validation and policy behavior using synthetic responses. They do not measure Jev's semantic accuracy.

An optional `--live` mode reads `TYPESAFE_API_KEY` from your environment and incurs provider usage. It prints an advisory result and does not execute a business action. Check current provider documentation and data policies before using it. Never commit credentials.

## Evidence and Scope

This is an independent technical review and proposed implementation framework, not an official TypeSafe publication, a peer-reviewed paper, or a new model benchmark. Reported performance figures are attributed in the manuscript with their evaluation boundaries. No live provider request was made for the paper; demonstration thresholds are uncalibrated, not production settings.

API details and pricing reflect the paper's 19 September 2026 research snapshot. Verify current documentation before deployment.

The layout takes inspiration from the academic typography of *Attention Is All You Need*. It does not claim conference affiliation, endorsement, or equivalent scientific contribution.
