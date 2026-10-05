author: TypeSafe AI
handle: @typesafeai
post id: none
timestamp: retrieved 2026-10-01
url: https://evals.typesafe.ai/
engagement: not a post
This is an official TypeSafe document.

Diogo Almeida's launch thread (15 September 2026, post 2099925690682630371) points here: https://evals.typesafe.ai/. The launch blog says the homepage claims of 193.6x faster and 444.6x cheaper come from this site, and that every model is given the same workflow and compared with the average of GPT-6 Astra and Claude Fable 5.1.

What follows is the visible text of the five HTML pages on 2026-10-01: overview, security incidents, agent trace observability, invoice processing, and customer service. Navigation labels repeat on each page. SVG charts may contribute axis labels and point labels, and they may omit points that are only drawn. These figures are TypeSafe's published dashboard. They were not rerun.
## Page: index.html

Workflow evals

Workflow evals

Overview

Security Incidents

Agent Trace Observability

Invoice Processing

Customer Service

Structured workflows for automation tasks

Real world tasks can be executed via

structured workflows

or

standalone prompts

. Structure is always better.

Lens

Cost

Time

Mean accuracy vs cost and time

TypeSafe

OpenAI

Anthropic

Fireworks

workflow

prompt

frontier: nothing is both cheaper and more accurate

40%

50%

60%

70%

80%

$0.0001

$0.001

$0.01

$0.1

$1

cost per case, USD (log)

accuracy

haiku 4.5 · workflow · 53.6% · $0.0195 · 12.5 s

haiku 4.5 · prompt · 18.1% · $0.0363 · 21.2 s

opus 5 · workflow · 73.1% · $0.1761 · 37.8 s

opus 5 · prompt · 64.8% · $0.3417 · 70.5 s

sonnet 5 · workflow · 67.8% · $0.1174 · 78.1 s

sonnet 5 · prompt · 60.4% · $0.2251 · 149.2 s

DS v4 flash · workflow · 64.4% · $0.0059 · 51.9 s

DS v4 flash · prompt · 59.3% · $0.0132 · 120.1 s

DS v4 pro · workflow · 65.5% · $0.0413 · 86.5 s

DS v4 pro · prompt · 59.7% · $0.0907 · 192.1 s

luna · workflow · 66.8% · $0.0033 · 12.9 s

luna · prompt · 51.9% · $0.0079 · 27.3 s

sol · workflow · 74.1% · $0.0836 · 23.3 s

sol · prompt · 63.4% · $0.2005 · 48.6 s

terra · workflow · 67.9% · $0.0304 · 10.1 s

terra · prompt · 61.6% · $0.0750 · 25.1 s

Jev · workflow · 67.8% · $0.0004 · 0.4 s

haiku 4.5

haiku 4.5 ↓ 18%

opus 5

opus 5

sonnet 5

sonnet 5

DS v4 flash

DS v4 flash

DS v4 pro

DS v4 pro

luna

luna

sol

sol

terra

terra

Jev

frontier: nothing is both faster and more accurate

40%

50%

60%

70%

80%

0.1 s

1 s

10 s

100 s

1000 s

seconds per case (log)

accuracy

haiku 4.5 · workflow · 53.6% · $0.0195 · 12.5 s

haiku 4.5 · prompt · 18.1% · $0.0363 · 21.2 s

opus 5 · workflow · 73.1% · $0.1761 · 37.8 s

opus 5 · prompt · 64.8% · $0.3417 · 70.5 s

sonnet 5 · workflow · 67.8% · $0.1174 · 78.1 s

sonnet 5 · prompt · 60.4% · $0.2251 · 149.2 s

DS v4 flash · workflow · 64.4% · $0.0059 · 51.9 s

DS v4 flash · prompt · 59.3% · $0.0132 · 120.1 s

DS v4 pro · workflow · 65.5% · $0.0413 · 86.5 s

DS v4 pro · prompt · 59.7% · $0.0907 · 192.1 s

luna · workflow · 66.8% · $0.0033 · 12.9 s

luna · prompt · 51.9% · $0.0079 · 27.3 s

sol · workflow · 74.1% · $0.0836 · 23.3 s

sol · prompt · 63.4% · $0.2005 · 48.6 s

terra · workflow · 67.9% · $0.0304 · 10.1 s

terra · prompt · 61.6% · $0.0750 · 25.1 s

Jev · workflow · 67.8% · $0.0004 · 0.4 s

haiku 4.5

haiku 4.5 ↓ 18%

opus 5

opus 5

sonnet 5

sonnet 5

DS v4 flash

DS v4 flash

DS v4 pro

DS v4 pro

luna

luna

sol

sol

terra

terra

Jev

Each point averages one model configuration's accuracy, cost and time over the four workflows with equal weight, against the consensus labels. Every model runs at its provider's default reasoning setting. Up and to the left is better.

How we evaluate

Decompose the work, build a harness

To automate a task, we decompose the decisions into programmatic rules and intelligent judgments. Rather than ask a model to solve the entire problem in one shot (like the prompt examples in the plot), we ask independent narrow questions and defer to code where possible. We use three types:

Noul

, yes or no;

Choice

, one option among several;

Score

, a level on a scale. The results are then used programmatically to produce the output actions. Averaged across the four example tasks, every model is more accurate, cheaper and faster in the workflow than it is with the same policy as a prompt.

P(yes)

threshold

0.82

Noul

· yes or no. The model gives a probability.

0.62

Choice

· one option from a defined set. The model gives a distribution over the choices, as well as confidence.

score

1.90

· confidence

0.71

0

1

2

3

4

Score

· a continuous rating on a scale. The model gives a score, distribution over the levels, and confidence.

Docs: Primitives

A toy example. The policy on the left is the kind of paragraph a team writes down; the chart on the right is the same policy as a workflow. Each sentence became either a question for the model, with a type, or a rule for the code.

Expense claims

1

Every claim comes with a receipt. If the receipt cannot be read, ask the employee for a new one.

2

Work out what kind of expense it is: a meal, travel, or equipment.

3

A meal over $75 needs a manager's sign-off when the description on the claim does not clearly match the receipt.

4

Everything else is approved.

becomes

One expense claim

the receipt · the

claim form

The model reads the claim:

reads the receipt and the claim form

the receipt can be read

what kind of expense: a meal, travel, or

equipment

how clearly the claim's description matches

the receipt, on four levels

readable?

no

NEW RECEIPT

yes

The code decides:

a meal over $75 whose description does

not clearly match

MANAGER REVIEW

anything else

APPROVE

1

THE MODEL ANSWERS

2

THE CODE DECIDES

Questions

Noul

Score

Choice

Assume the harness is correct

Instead of debating the correctness of the harness and labels, we assume that the code is correct, and measure against the current smartest large models. For this eval, the reference labels are generated via an average of the responses of GPT-6 Astra and Claude Fable 5.1, both at high thinking, answering every question in the harness. All other models are evaluated using the provider's default reasoning settings.

Example workflows

Security Incidents

A security alert fires on a laptop or a server. Given the alert and everything on file about that machine, we decide whether to close it, pass it to an analyst, or contain it now.

10%

30%

50%

70%

$0.0001

$0.001

$0.01

$0.1

haiku 4.5 · workflow · 58.8% · $0.0047 · 3.4 s

haiku 4.5 · prompt · 17.1% · $0.0068 · 4.6 s

opus 5 · workflow · 66.2% · $0.0574 · 15.1 s

opus 5 · prompt · 62.9% · $0.0619 · 13.5 s

sonnet 5 · workflow · 60.8% · $0.0271 · 18.9 s

sonnet 5 · prompt · 51.7% · $0.0506 · 37.5 s

DS v4 flash · workflow · 37.9% · $0.0032 · 37.4 s

DS v4 flash · prompt · 44.6% · $0.0037 · 41.9 s

DS v4 pro · workflow · 41.7% · $0.0234 · 60.0 s

DS v4 pro · prompt · 37.1% · $0.0267 · 66.3 s

luna · workflow · 52.1% · $0.0013 · 7.0 s

luna · prompt · 29.6% · $0.0021 · 13.4 s

sol · workflow · 62.5% · $0.0295 · 8.5 s

sol · prompt · 45.8% · $0.0472 · 14.0 s

terra · workflow · 51.2% · $0.0119 · 5.7 s

terra · prompt · 45.4% · $0.0140 · 7.1 s

Jev · workflow · 61.7% · $0.0001 · 0.3 s

Agent Trace Observability

A support agent has just finished with a customer. Given the whole run, every tool call included, we decide whether a person needs to look at it, and how soon.

20%

40%

60%

80%

$0.0001

$0.001

$0.01

$0.1

$1

haiku 4.5 · workflow · 57.2% · $0.0100 · 7.1 s

haiku 4.5 · prompt · 29.3% · $0.0163 · 9.3 s

opus 5 · workflow · 75.2% · $0.1033 · 27.4 s

opus 5 · prompt · 63.5% · $0.1642 · 37.5 s

sonnet 5 · workflow · 68.0% · $0.0545 · 38.0 s

sonnet 5 · prompt · 65.8% · $0.0863 · 53.0 s

DS v4 flash · workflow · 73.0% · $0.0043 · 51.7 s

DS v4 flash · prompt · 68.5% · $0.0063 · 62.7 s

DS v4 pro · workflow · 71.6% · $0.0357 · 90.1 s

DS v4 pro · prompt · 72.1% · $0.0424 · 92.6 s

luna · workflow · 76.1% · $0.0025 · 14.5 s

luna · prompt · 66.2% · $0.0038 · 15.1 s

sol · workflow · 76.6% · $0.0575 · 40.3 s

sol · prompt · 73.9% · $0.0907 · 37.0 s

terra · workflow · 73.0% · $0.0209 · 11.4 s

terra · prompt · 72.5% · $0.0350 · 14.9 s

Jev · workflow · 71.6% · $0.0003 · 0.5 s

Invoice Processing

A vendor's bill arrives. Given the bill, the order behind it, and what was actually delivered, we decide whether it gets paid, held, or sent back.

0%

20%

40%

60%

80%

$0.001

$0.01

$0.1

$1

haiku 4.5 · workflow · 42.9% · $0.0558 · 30.8 s

haiku 4.5 · prompt · 6.0% · $0.0763 · 63.4 s

opus 5 · workflow · 78.4% · $0.4856 · 92.1 s

opus 5 · prompt · 66.9% · $0.7699 · 188.7 s

sonnet 5 · workflow · 72.9% · $0.3616 · 241.3 s

sonnet 5 · prompt · 62.4% · $0.5548 · 409.4 s

DS v4 flash · workflow · 69.8% · $0.0133 · 84.1 s

DS v4 flash · prompt · 58.2% · $0.0288 · 281.7 s

DS v4 pro · workflow · 72.7% · $0.0830 · 137.4 s

DS v4 pro · prompt · 63.8% · $0.2039 · 474.4 s

luna · workflow · 67.8% · $0.0081 · 21.4 s

luna · prompt · 55.1% · $0.0160 · 61.5 s

sol · workflow · 79.1% · $0.2152 · 34.3 s

sol · prompt · 65.1% · $0.4338 · 118.4 s

terra · workflow · 74.7% · $0.0778 · 17.3 s

terra · prompt · 64.0% · $0.1618 · 62.0 s

Jev · workflow · 61.8% · $0.0011 · 0.5 s

Customer Service

A customer writes in. Given the thread so far and the state of their account, we decide what the assistant should say and do next.

10%

30%

50%

70%

90%

$0.0001

$0.001

$0.01

$0.1

$1

haiku 4.5 · workflow · 55.4% · $0.0074 · 8.8 s

haiku 4.5 · prompt · 19.9% · $0.0459 · 7.6 s

opus 5 · workflow · 72.4% · $0.0579 · 16.6 s

opus 5 · prompt · 66.0% · $0.3710 · 42.2 s

sonnet 5 · workflow · 69.3% · $0.0264 · 14.3 s

sonnet 5 · prompt · 61.6% · $0.2085 · 96.7 s

DS v4 flash · workflow · 76.8% · $0.0029 · 34.6 s

DS v4 flash · prompt · 65.8% · $0.0139 · 93.9 s

DS v4 pro · workflow · 76.1% · $0.0232 · 58.6 s

DS v4 pro · prompt · 65.8% · $0.0898 · 134.9 s

luna · workflow · 71.4% · $0.0013 · 8.8 s

luna · prompt · 56.9% · $0.0094 · 19.2 s

sol · workflow · 78.3% · $0.0323 · 10.1 s

sol · prompt · 69.0% · $0.2303 · 24.9 s

terra · workflow · 72.7% · $0.0111 · 6.0 s

terra · prompt · 64.4% · $0.0894 · 16.3 s

Jev · workflow · 76.0% · $0.0001 · 0.4 s

## Page: security_incidents.html

Security Incidents

Security Incidents

Handling a security incident: close it, queue it, or contain it.

Overview

Security Incidents

Agent Trace Observability

Invoice Processing

Customer Service

An alert has fired. What should be done?

Input

The alert

what fired, on which asset, and when

The asset

its environment, tier and owner

Open tickets

change requests and incidents already in flight

Registered devices

the hardware this person is known to use

Scheduled maintenance

work someone booked in advance

Standing authorizations

who may do what, and until when

Output

one of

AUTO CLOSE

NOTIFY USER

ESCALATE TIER2

KILL PROCESS

DISABLE ACCOUNT

ESCALATE URGENT

Lens

Cost

Time

Security Incidents: accuracy against cost and time

TypeSafe

OpenAI

Anthropic

Fireworks

workflow

prompt

frontier: nothing is both cheaper and more accurate

10%

30%

50%

70%

$0.0001

$0.001

$0.01

$0.1

cost per case, USD (log)

accuracy

haiku 4.5 · workflow · 58.8% · $0.0047 · 3.4 s

haiku 4.5

haiku 4.5 · prompt · 17.1% · $0.0068 · 4.6 s

haiku 4.5

opus 5 · workflow · 66.2% · $0.0574 · 15.1 s

opus 5 · prompt · 62.9% · $0.0619 · 13.5 s

opus 5

sonnet 5 · workflow · 60.8% · $0.0271 · 18.9 s

sonnet 5

sonnet 5 · prompt · 51.7% · $0.0506 · 37.5 s

sonnet 5

DS v4 flash · workflow · 37.9% · $0.0032 · 37.4 s

DS v4 flash

DS v4 flash · prompt · 44.6% · $0.0037 · 41.9 s

DS v4 flash

DS v4 pro · workflow · 41.7% · $0.0234 · 60.0 s

DS v4 pro

DS v4 pro · prompt · 37.1% · $0.0267 · 66.3 s

DS v4 pro

luna · workflow · 52.1% · $0.0013 · 7.0 s

luna

luna · prompt · 29.6% · $0.0021 · 13.4 s

luna

sol · workflow · 62.5% · $0.0295 · 8.5 s

sol · prompt · 45.8% · $0.0472 · 14.0 s

sol

terra · workflow · 51.2% · $0.0119 · 5.7 s

terra

terra · prompt · 45.4% · $0.0140 · 7.1 s

terra

Jev · workflow · 61.7% · $0.0001 · 0.3 s

opus 5

sol

Jev

frontier: nothing is both faster and more accurate

10%

30%

50%

70%

0.1 s

1 s

10 s

100 s

seconds per case (log)

accuracy

haiku 4.5 · workflow · 58.8% · $0.0047 · 3.4 s

haiku 4.5

haiku 4.5 · prompt · 17.1% · $0.0068 · 4.6 s

haiku 4.5

opus 5 · workflow · 66.2% · $0.0574 · 15.1 s

opus 5 · prompt · 62.9% · $0.0619 · 13.5 s

sonnet 5 · workflow · 60.8% · $0.0271 · 18.9 s

sonnet 5

sonnet 5 · prompt · 51.7% · $0.0506 · 37.5 s

sonnet 5

DS v4 flash · workflow · 37.9% · $0.0032 · 37.4 s

DS v4 flash

DS v4 flash · prompt · 44.6% · $0.0037 · 41.9 s

DS v4 flash

DS v4 pro · workflow · 41.7% · $0.0234 · 60.0 s

DS v4 pro

DS v4 pro · prompt · 37.1% · $0.0267 · 66.3 s

DS v4 pro

luna · workflow · 52.1% · $0.0013 · 7.0 s

luna

luna · prompt · 29.6% · $0.0021 · 13.4 s

luna

sol · workflow · 62.5% · $0.0295 · 8.5 s

sol · prompt · 45.8% · $0.0472 · 14.0 s

sol

terra · workflow · 51.2% · $0.0119 · 5.7 s

terra

terra · prompt · 45.4% · $0.0140 · 7.1 s

terra

Jev · workflow · 61.7% · $0.0001 · 0.3 s

opus 5

opus 5

sol

Jev

The workflow

1

Read the alert

Three questions about the alert and the records joined to it: was the activity unauthorized, does a record explain it, and how strong is the evidence?

2

Close, queue, or act

The code combines the three answers with how important the machine is and where it runs. Borderline identity alerts also notify the user.

3

The state of the incident

Acting opens eleven more questions: credentials, live sessions, mail, anything left behind to run later, processes, network traffic, and how far the activity spread.

4

Choose the response

The playbook takes the first group whose conditions are met, then the strongest step in it that still applies. When no group applies, the alert is escalated.

A handful of cases: for each model, one where it alone differs from the other two; one where all three miss the reference; one where all three agree. Each model's path is drawn on the chart in its own colour and line style. Where paths share a stretch, the lines run side by side. What no model reached is faded. Underlined questions open below with every model's answer and the state it read.

Network sniffing while badge onsite

Opus differs from the other two

WinRM access on production server

Sol differs from the other two

LSASS memory dump via comsvcs

TypeSafe differs from the other two

Amsi.dll renamed as WinAppXRT

All three miss the reference

Python startup hook via calc.exe

All three agree

Models

Opus

Sol

TypeSafe

One alert

the alert · the asset it fired

on · the tickets,

registrations, schedules and

authorizations joined to it

Is this unauthorized activity?

Three readings of the alert:

reads the alert and the records the pipeline joined to it

someone was doing something they were not authorized

to do

a specific record accounts for this activity, in

advance

how strong the evidence is, from speculative to

confirmed

code reads the asset's environment and tier, and the detector's domain

Close, queue, or act?

close

probably authorized, a record explains

it, and not a domain controller

AUTO CLOSE

queue

everything in between

An identity alert in

the grey zone (0.15–0.60)?

yes

NOTIFY USER

no

ESCALATE TIER2

act: probably unauthorized (P > 0.75)

What state is the incident in?

Eleven readings of the incident:

reads the same alert and records, now describing the state of the

incident

credentials have reached someone unauthorized

a live session or token is being used by an attacker now

malicious mail is sitting in inboxes

something would bring the activity back after a reboot

a malicious process or task is running right now

data or command traffic is leaving to an attacker

destination

the attacker changed configuration that persists on its

own

it is happening now, or about to, rather than finished

it has reached beyond the entity that was flagged

how far it reaches: one entity, a workgroup, or the whole

organization

what kind of attack: host compromise, account takeover,

mail campaign, or exfiltration

Take the first group that applies, then its strongest action whose conditions hold:

1 · data is leaving now: the whole organization's reach blocks the destination;

otherwise this asset's egress

BLOCK DESTINATION

BLOCK EGRESS ASSET

2 · the attacker has access: a spreading live session locks the account; leaked

cloud credentials are revoked; else sessions; else re-authentication

DISABLE ACCOUNT

REVOKE ACCESS KEY

REVOKE SESSIONS

REQUIRE REAUTH

3 · malicious mail is delivered: a campaign in several mailboxes blocks the sender;

clearly malicious mail is purged; else quarantined

BLOCK SENDER

PURGE MAILBOXES

QUARANTINE MESSAGE

4 · the host is compromised: live persistence isolates the host, never a lone

production system; else kill the process; else quarantine the file

ISOLATE HOST

KILL PROCESS

QUARANTINE FILE

5 · configuration was changed: forwarding rules, delegations or consents are removed

REMOVE FORWARDING RULES

no group applies

ESCALATE URGENT

1

READ THE ALERT

2

CLOSE, QUEUE, OR ACT

3

THE STATE OF THE INCIDENT

4

CHOOSE THE RESPONSE

Action

Close

Queue

Page

Light containment

Heavy containment

Questions

Noul

Score

Choice

View examples

← all questions

## Page: agent_trace_observability.html

Agent Trace Observability

Agent Trace Observability

Watching over finished agent runs: which need attention, and how urgently.

Overview

Security Incidents

Agent Trace Observability

Invoice Processing

Customer Service

Analyze an agent trace from a customer support log. What followups are needed?

Input

The agent's instructions

the prompt and rules it was working under

The conversation

every turn between the customer and the agent

Tool calls

each call, its arguments, and what came back

The final message

what the agent said to close the run

Customer feedback

a rating or a comment, when one was left

Output

one of

AUTO-CLOSE

NOT A BUG

HUMAN REVIEW

PRIORITY REVIEW

FILE ISSUE · ROUTE

PAGE ON-CALL

Lens

Cost

Time

Agent Trace Observability: accuracy against cost and time

TypeSafe

OpenAI

Anthropic

Fireworks

workflow

prompt

frontier: nothing is both cheaper and more accurate

20%

40%

60%

80%

$0.0001

$0.001

$0.01

$0.1

$1

cost per case, USD (log)

accuracy

haiku 4.5 · workflow · 57.2% · $0.0100 · 7.1 s

haiku 4.5

haiku 4.5 · prompt · 29.3% · $0.0163 · 9.3 s

haiku 4.5

opus 5 · workflow · 75.2% · $0.1033 · 27.4 s

opus 5

opus 5 · prompt · 63.5% · $0.1642 · 37.5 s

opus 5

sonnet 5 · workflow · 68.0% · $0.0545 · 38.0 s

sonnet 5

sonnet 5 · prompt · 65.8% · $0.0863 · 53.0 s

sonnet 5

DS v4 flash · workflow · 73.0% · $0.0043 · 51.7 s

DS v4 flash

DS v4 flash · prompt · 68.5% · $0.0063 · 62.7 s

DS v4 flash

DS v4 pro · workflow · 71.6% · $0.0357 · 90.1 s

DS v4 pro

DS v4 pro · prompt · 72.1% · $0.0424 · 92.6 s

DS v4 pro

luna · workflow · 76.1% · $0.0025 · 14.5 s

luna · prompt · 66.2% · $0.0038 · 15.1 s

luna

sol · workflow · 76.6% · $0.0575 · 40.3 s

sol · prompt · 73.9% · $0.0907 · 37.0 s

sol

terra · workflow · 73.0% · $0.0209 · 11.4 s

terra

terra · prompt · 72.5% · $0.0350 · 14.9 s

terra

Jev · workflow · 71.6% · $0.0003 · 0.5 s

luna

sol

Jev

frontier: nothing is both faster and more accurate

20%

40%

60%

80%

0.1 s

1 s

10 s

100 s

seconds per case (log)

accuracy

haiku 4.5 · workflow · 57.2% · $0.0100 · 7.1 s

haiku 4.5

haiku 4.5 · prompt · 29.3% · $0.0163 · 9.3 s

haiku 4.5

opus 5 · workflow · 75.2% · $0.1033 · 27.4 s

opus 5

opus 5 · prompt · 63.5% · $0.1642 · 37.5 s

opus 5

sonnet 5 · workflow · 68.0% · $0.0545 · 38.0 s

sonnet 5

sonnet 5 · prompt · 65.8% · $0.0863 · 53.0 s

sonnet 5

DS v4 flash · workflow · 73.0% · $0.0043 · 51.7 s

DS v4 flash

DS v4 flash · prompt · 68.5% · $0.0063 · 62.7 s

DS v4 flash

DS v4 pro · workflow · 71.6% · $0.0357 · 90.1 s

DS v4 pro

DS v4 pro · prompt · 72.1% · $0.0424 · 92.6 s

DS v4 pro

luna · workflow · 76.1% · $0.0025 · 14.5 s

luna · prompt · 66.2% · $0.0038 · 15.1 s

luna

sol · workflow · 76.6% · $0.0575 · 40.3 s

sol · prompt · 73.9% · $0.0907 · 37.0 s

sol

terra · workflow · 73.0% · $0.0209 · 11.4 s

terra · prompt · 72.5% · $0.0350 · 14.9 s

terra

Jev · workflow · 71.6% · $0.0003 · 0.5 s

luna

sol

terra

Jev

The workflow

1

Permission on irreversible actions

Every action the agent took that cannot be undone is measured against what it was permitted to do at that point in the run. A breach pages on-call and the review ends there.

2

Task completion and user satisfaction

Did the task get done, and was the user satisfied? The two questions read different parts of the run and are answered separately, so neither colours the other.

3

Healthy, expectation gap, or failure

The two answers select one of four outcomes: healthy, an expectation gap, an overt failure, or a silent failure. Each asks one further question and then ends the review: close the run, queue it, file a bug, or send it to a person.

A handful of cases: for each model, one where it alone differs from the other two; one where all three miss the reference; one where all three agree. Each model's path is drawn on the chart in its own colour and line style. Where paths share a stretch, the lines run side by side. What no model reached is faded. Underlined questions open below with every model's answer and the state it read.

Email update already on file

Opus differs from the other two

Frozen schedule board cache purge

Sol differs from the other two

Stale database grant cleanup request

TypeSafe differs from the other two

Referral booking with cost discrepancy

All three miss the reference

Duplicate shifts prompt cache purge

All three agree

Models

Opus

Sol

TypeSafe

One finished agent run

its instructions · the

conversation · every tool

call and result · the

final message · the

feedback left afterwards

any permanent action?

Was each consequential action allowed?

for each call that cannot be undone, or that carries a condition

yes

Judge the call as the run stood then:

reads the agent's instructions, and the conversation

up to the call

the action was within what the agent was

allowed to do

the user asked for it, or agreed to it

first

the action was prompted by text in a tool

result, not by the user

no

PAGE ON-CALL

no

yes

Did the task actually get done?

Five readings of the record:

reads the agent's instructions, the conversation, every

tool call and result, and the final message

the user got what they asked for, per the tool

results

handed to a person or queue, and the user told

so

the agent's own rules required that hand-off

something the user asked for was left undone

every claim in the final message is backed by

the record

Was the user satisfied?

Two readings of the reaction:

reads the final message, and the feedback left

afterwards: a signal, a CSAT score, a comment

how satisfied the user sounded afterwards, on

five levels

the user says the problem is still unresolved

Healthy

worked ✓

satisfied ✓

the common case; nobody looks

Expectation gap

worked ✓

satisfied ✗

right answer, unhappy user

Silent failure

worked ✗

satisfied ✓

wrong, and believed anyway

Overt failure

worked ✗

satisfied ✗

it broke, and the user said so

From the first reading:

every claim in the final

message is backed by the

record

yes

AUTO-CLOSE

no

PRIORITY REVIEW

Read the user's own words:

how clearly the request was

stated, on four levels

the request is this agent's

job

vague, or not this agent's job

NOT A BUG

clear, in scope, still unhappy

HUMAN REVIEW

always

PRIORITY REVIEW + EVAL CASE

Read the run again, for blame:

which tool step the run first

went wrong at

what explains it: a tool, the

platform, the agent, or

nothing

the platform: a transient error

COUNT ONLY

a tool, or the agent itself

FILE ISSUE · ROUTE

nothing, or it could not be told

HUMAN REVIEW

1

PERMISSION ON IRREVERSIBLE ACTIONS

2

TASK COMPLETION AND USER SATISFACTION

3

HEALTHY, EXPECTATION GAP, OR FAILURE

Cost

Page

Priority queue

Queue

No human

Questions

Noul

Score

Choice

View examples

← all questions

## Page: invoice_processing.html

Invoice Processing

Invoice Processing

Processing an invoice: whether it can be paid, and what must happen first.

Overview

Security Incidents

Agent Trace Observability

Invoice Processing

Customer Service

An invoice was received. Should it be paid?

Input

The invoice

line items, totals, tax and bank details

The purchase order

what was ordered, in what quantity, at what price

The contract

rates, caps, retainage and payment terms

The vendor record

bank details on file, tier, and how long they have billed us

Prior invoices

what this vendor has already billed and been paid

Correspondence

emails about this invoice, from either side

Delivery evidence

receiving notes, timesheets and shipment records

Approvals

who signed off, and anything they said while doing it

Output

any that apply

PAY

SCHEDULE

SHORT PAY

ROUTE FOR APPROVAL

HOLD FOR DOCUMENTS

REQUEST CORRECTED INVOICE

DISPUTE LINES

FRAUD REVIEW

DUPLICATE

Lens

Cost

Time

Invoice Processing: accuracy against cost and time

TypeSafe

OpenAI

Anthropic

Fireworks

workflow

prompt

frontier: nothing is both cheaper and more accurate

0%

20%

40%

60%

80%

$0.001

$0.01

$0.1

$1

cost per case, USD (log)

accuracy

haiku 4.5 · workflow · 42.9% · $0.0558 · 30.8 s

haiku 4.5

haiku 4.5 · prompt · 6.0% · $0.0763 · 63.4 s

haiku 4.5

opus 5 · workflow · 78.4% · $0.4856 · 92.1 s

opus 5

opus 5 · prompt · 66.9% · $0.7699 · 188.7 s

opus 5

sonnet 5 · workflow · 72.9% · $0.3616 · 241.3 s

sonnet 5

sonnet 5 · prompt · 62.4% · $0.5548 · 409.4 s

sonnet 5

DS v4 flash · workflow · 69.8% · $0.0133 · 84.1 s

DS v4 flash · prompt · 58.2% · $0.0288 · 281.7 s

DS v4 flash

DS v4 pro · workflow · 72.7% · $0.0830 · 137.4 s

DS v4 pro

DS v4 pro · prompt · 63.8% · $0.2039 · 474.4 s

DS v4 pro

luna · workflow · 67.8% · $0.0081 · 21.4 s

luna · prompt · 55.1% · $0.0160 · 61.5 s

luna

sol · workflow · 79.1% · $0.2152 · 34.3 s

sol · prompt · 65.1% · $0.4338 · 118.4 s

sol

terra · workflow · 74.7% · $0.0778 · 17.3 s

terra · prompt · 64.0% · $0.1618 · 62.0 s

terra

Jev · workflow · 61.8% · $0.0011 · 0.5 s

DS v4 flash

luna

sol

terra

Jev

frontier: nothing is both faster and more accurate

0%

20%

40%

60%

80%

0.1 s

1 s

10 s

100 s

1000 s

seconds per case (log)

accuracy

haiku 4.5 · workflow · 42.9% · $0.0558 · 30.8 s

haiku 4.5

haiku 4.5 · prompt · 6.0% · $0.0763 · 63.4 s

haiku 4.5

opus 5 · workflow · 78.4% · $0.4856 · 92.1 s

opus 5

opus 5 · prompt · 66.9% · $0.7699 · 188.7 s

opus 5

sonnet 5 · workflow · 72.9% · $0.3616 · 241.3 s

sonnet 5

sonnet 5 · prompt · 62.4% · $0.5548 · 409.4 s

sonnet 5

DS v4 flash · workflow · 69.8% · $0.0133 · 84.1 s

DS v4 flash

DS v4 flash · prompt · 58.2% · $0.0288 · 281.7 s

DS v4 flash

DS v4 pro · workflow · 72.7% · $0.0830 · 137.4 s

DS v4 pro

DS v4 pro · prompt · 63.8% · $0.2039 · 474.4 s

DS v4 pro

luna · workflow · 67.8% · $0.0081 · 21.4 s

luna

luna · prompt · 55.1% · $0.0160 · 61.5 s

luna

sol · workflow · 79.1% · $0.2152 · 34.3 s

sol · prompt · 65.1% · $0.4338 · 118.4 s

sol

terra · workflow · 74.7% · $0.0778 · 17.3 s

terra · prompt · 64.0% · $0.1618 · 62.0 s

terra

Jev · workflow · 61.8% · $0.0011 · 0.5 s

sol

terra

Jev

The workflow

1

Read the documents

Seven rounds of questions, one subject at a time. Sums, dates, account numbers and statuses are computed in code rather than asked.

2

Reasons to stop

Four conditions end the review immediately: a fraud pattern, an invoice already paid, the wrong vendor or company, or a document that is not an invoice.

3

Holds, disputes and corrections

Three rule lists run side by side. Every rule that applies adds its actions: hold the invoice, dispute particular lines, or request a corrected copy.

4

Releasing the payment

A sequence of yes-or-no checks decides how the payment leaves: sent for approval, held for a signature, paid in the undisputed part, scheduled, or paid.

A handful of cases: for each model, one where it alone differs from the other two; one where all three miss the reference; one where all three agree. Each model's path is drawn on the chart in its own colour and line style. Where paths share a stretch, the lines run side by side. What no model reached is faded. Underlined questions open below with every model's answer and the state it read.

Prorated equipment support retainer invoice

Opus differs from the other two

CPA invoice from lookalike domain

Sol differs from the other two

Vulnerability scan invoice courier fee

TypeSafe differs from the other two

Photography invoice with cryptic codes

All three miss the reference

Tax compliance invoice wrong entity

All three agree

Models

Opus

Sol

TypeSafe

One invoice packet

the invoice · its purchase

order and contract · the

vendor master and bank-change

log · prior invoices ·

correspondence · delivery

evidence · approvals

read by the model; amounts, dates, account details and statuses are checked in code

The document:

a statement, quotation or reminder, not an invoice

the early-payment discount window, in days

Money and senders:

the correspondence claims new payment details

each unknown sender: plausible, a story, or an impostor

the pressure pattern: a short deadline, plus a threat

Prior invoices:

each prior invoice: same obligation, earlier period, or

unrelated

Order and contract:

the invoice belongs to another project or entity

what the contract prices: a fee, unit rates, or a cap

the invoice bills above that basis

a price difference is explained by how lines split the order

the retainage the contract withholds

Approvals:

each comment: approves, carves out lines, still reviewing, or

withholds

Each line:

what it is: work, tax, a charge on top, a credit, an expense

its place against the order: priced, a component, an extra,

not ours

what our records show was done

already billed by a prior invoice

declined by the owner by name

an add-on fee tracing to nothing

billed above its own stated rate

which purchase-order line it bills against

which delivery figure counts it

Charges and totals:

too vague to say what was bought

an adjustment is unexplained

an adjustment repeats a line

tax charged at two rates

fraud pattern

FRAUD REVIEW

already paid

DUPLICATE

wrong vendor or entity

REJECT

REQUEST CORRECTED INVOICE

not an invoice

REQUEST CORRECTED INVOICE

no reason to stop

Holds and referrals

bank details changed or claimed, unverified

HOLD BANK

first payment · doubtful sender · pressure

VERIFY VENDOR BY PHONE

a prior invoice at another amount, or unsure

DUPLICATE REVIEW

no PO, PO closed, or another project

PROCUREMENT REVIEW

a line nobody can place against the order

PROCUREMENT REVIEW

approver objects or is unclear · stale · predates its PO

OWNER REVIEW

our records show less was done than billed

OWNER REVIEW

too vague, or nothing of ours confirms the work

HOLD FOR DOCUMENTS

accepted work past the purchase-order cap

ESCALATE FOR APPROVAL

Line outcomes: bad lines are carved out of the payment

a duplicate charge, or work not performed

DISPUTE LINES

REQUEST CORRECTED INVOICE

declined by the owner by name

DISPUTE LINES

out of scope, within the short-pay allowance

DISPUTE LINES

out of scope, above the allowance

PROCUREMENT REVIEW

an unexplained fee, or more than the evidence

REQUEST CORRECTED INVOICE

Invoice corrections

amounts do not sum, or tax is charged twice

REQUEST CORRECTED INVOICE

an adjustment unexplained or duplicated

REQUEST CORRECTED INVOICE

priced above the PO or the contract

REQUEST CORRECTED INVOICE

wrong currency, or more than was received

REQUEST CORRECTED INVOICE

billing past the contract's total fee

DISPUTE LINES

REQUEST CORRECTED INVOICE

Anything held

or under review?

yes

release nothing; the actions stand

no

Lines carved out?

yes

yes

SHORT PAY

owner approved, within the

allowance, signed at the tier?

no

wait for the corrected invoice

no

Signed at the

right tier?

no

ROUTE FOR APPROVAL

yes

Approval still

pending?

yes

SCHEDULE

no

Due now, or a

discount to catch?

yes

PAY

no

SCHEDULE

1

READ THE DOCUMENTS

2

REASONS TO STOP

3

HOLDS, DISPUTES AND CORRECTIONS

4

RELEASING THE PAYMENT

Action

Stop

Review

Back to the vendor

Pay

Questions

Noul

Score

Choice

View examples

← all questions

## Page: customer_service.html

Customer Service

Customer Service

Choosing a support assistant's next actions on a customer's turn.

Overview

Security Incidents

Agent Trace Observability

Invoice Processing

Customer Service

A customer is actively asking for support. What should the assistant do next?

Input

The conversation

every turn so far, from both sides

The customer record

who they are and what they have contacted us about before

The account

subscription, recent charges, refunds and card status

A pending proposal

whatever the assistant last offered and is waiting on

Output

any that apply, sometimes none

SAY

REFUND

FREEZE CARD

SET INTENT

HAND OFF

FLAG FOR REVIEW

CLOSE

Lens

Cost

Time

Customer Service: accuracy against cost and time

TypeSafe

OpenAI

Anthropic

Fireworks

workflow

prompt

frontier: nothing is both cheaper and more accurate

10%

30%

50%

70%

90%

$0.0001

$0.001

$0.01

$0.1

$1

cost per case, USD (log)

accuracy

haiku 4.5 · workflow · 55.4% · $0.0074 · 8.8 s

haiku 4.5

haiku 4.5 · prompt · 19.9% · $0.0459 · 7.6 s

haiku 4.5

opus 5 · workflow · 72.4% · $0.0579 · 16.6 s

opus 5

opus 5 · prompt · 66.0% · $0.3710 · 42.2 s

opus 5

sonnet 5 · workflow · 69.3% · $0.0264 · 14.3 s

sonnet 5

sonnet 5 · prompt · 61.6% · $0.2085 · 96.7 s

sonnet 5

DS v4 flash · workflow · 76.8% · $0.0029 · 34.6 s

DS v4 flash · prompt · 65.8% · $0.0139 · 93.9 s

DS v4 flash

DS v4 pro · workflow · 76.1% · $0.0232 · 58.6 s

DS v4 pro

DS v4 pro · prompt · 65.8% · $0.0898 · 134.9 s

DS v4 pro

luna · workflow · 71.4% · $0.0013 · 8.8 s

luna

luna · prompt · 56.9% · $0.0094 · 19.2 s

luna

sol · workflow · 78.3% · $0.0323 · 10.1 s

sol · prompt · 69.0% · $0.2303 · 24.9 s

sol

terra · workflow · 72.7% · $0.0111 · 6.0 s

terra

terra · prompt · 64.4% · $0.0894 · 16.3 s

terra

Jev · workflow · 76.0% · $0.0001 · 0.4 s

DS v4 flash

sol

Jev

frontier: nothing is both faster and more accurate

10%

30%

50%

70%

90%

0.1 s

1 s

10 s

100 s

1000 s

seconds per case (log)

accuracy

haiku 4.5 · workflow · 55.4% · $0.0074 · 8.8 s

haiku 4.5

haiku 4.5 · prompt · 19.9% · $0.0459 · 7.6 s

haiku 4.5

opus 5 · workflow · 72.4% · $0.0579 · 16.6 s

opus 5

opus 5 · prompt · 66.0% · $0.3710 · 42.2 s

opus 5

sonnet 5 · workflow · 69.3% · $0.0264 · 14.3 s

sonnet 5

sonnet 5 · prompt · 61.6% · $0.2085 · 96.7 s

sonnet 5

DS v4 flash · workflow · 76.8% · $0.0029 · 34.6 s

DS v4 flash

DS v4 flash · prompt · 65.8% · $0.0139 · 93.9 s

DS v4 flash

DS v4 pro · workflow · 76.1% · $0.0232 · 58.6 s

DS v4 pro

DS v4 pro · prompt · 65.8% · $0.0898 · 134.9 s

DS v4 pro

luna · workflow · 71.4% · $0.0013 · 8.8 s

luna

luna · prompt · 56.9% · $0.0094 · 19.2 s

luna

sol · workflow · 78.3% · $0.0323 · 10.1 s

sol · prompt · 69.0% · $0.2303 · 24.9 s

sol

terra · workflow · 72.7% · $0.0111 · 6.0 s

terra

terra · prompt · 64.4% · $0.0894 · 16.3 s

terra

Jev · workflow · 76.0% · $0.0001 · 0.4 s

sol

Jev

The workflow

1

Intent, frustration and risk flags

Eleven readings of the conversation at once: what the customer wants and how they want it resolved, how frustrated they sound, how urgent it is, and flags such as unauthorized activity, a legal threat, or a request for a person.

2

Consent, fraud, money, retention

Four follow-ups, plus a tie-break when two intents are close. Each runs only when the first reading calls for it, with the records it needs attached: the pending proposal, the ledger and card status, the refund or fee on file, the subscription.

3

Check the assistant's claims

The assistant's own messages are compared with the record: did it tell the customer a refund had gone through, or that the card was frozen, when neither had happened?

4

Safety first, then the issue at hand

Nine sections run top to bottom: safety, the assistant's claims, a pending proposal, handing off, closing, then the issue itself. The first rule that applies in a section emits its actions; when none applies, the next section runs.

A handful of cases: for each model, one where it alone differs from the other two; one where all three miss the reference; one where all three agree. Each model's path is drawn on the chart in its own colour and line style. Where paths share a stretch, the lines run side by side. What no model reached is faded. Underlined questions open below with every model's answer and the state it read.

Charged again after cancellation

Opus differs from the other two

Repeat duplicate charge root cause

Sol differs from the other two

Espresso machine impulse return refund

TypeSafe differs from the other two

Frustrated customer threatens to cancel

All three miss the reference

Overdraft fee hardship referral

All three agree

Models

Opus

Sol

TypeSafe

One customer turn

the conversation so far ·

the customer record · what

is on the account · any

pending proposal

What is going on?

Eleven readings of the conversation:

reads the conversation, the customer record and a summary of the

account

what the customer's issue is, out of eight kinds

what they want: money back, a fix, an explanation, a

person, or unsaid

how frustrated they are, from calm to hostile

how time-critical it is, from none to emergency

they report a charge or login they did not make

they threaten legal or regulatory action

they threaten a chargeback, a public post, or the press

they ask for a person

a full card number, PIN, password or SSN is in the text

they say the issue is resolved

they say the company or assistant got something wrong

which follow-ups

does triage call

for?

every one whose

condition holds;

often none

a proposal is pending

Consent:

the proposal and the reply only; earlier turns removed

how they answer the proposal: accept, decline, or

unclear

their yes asks for different terms

unauthorized activity is

in play (P ≥ 0.30, or it

leads the intents)

Fraud:

adds the ledger entry and the card status

whether they still have the card

they now recognize the charge as their own

someone with access to the card made it

they report other activity they do not recognize

login codes, a changed email, an unknown device

what they describe matches the ledger entry

money is on the table (P ≥

0.20 or a money intent

leads) and a claim or fee

is on file

Money:

adds the claim or fee on file, and the order

why they want money back, out of six reasons

the amount they ask for against the amount on file

they say they were already refunded or credited

they offer photos, receipts, tracking or a confirmation

financial hardship, from none to a crisis

cancelling is in play (P ≥

0.15 with an active

subscription, or it leads)

Retention:

adds the subscription record

how likely they are to leave, from no sign to decided

why they want to cancel, out of five reasons

they would stay if something were offered or fixed

the two leading intents

are within 0.25 of each

other

Intent, two ways:

the customer's own turns only

which of the two leading intents fits better

none of them

code then re-splits the intent between the two options,

and folds each message's claims into one probability

the fraud or

money node ran,

and the

assistant has

spoken

yes

Integrity, per new assistant message:

reads the assistant's numbered messages and the record

the message says a refund was already issued

the message says the card is already secured

no

every answer, merged, goes to the policy

Safety, checked before anything else

credentials exposed

REDACT

REDACT

SAY warn not to share credentials

SAY warn not to share credentials

legal or regulatory threat

HAND OFF compliance

HAND OFF compliance

FLAG legal threat

FLAG legal threat

SAY handoff notice

SAY handoff notice

chargeback or public threat (the turn continues)

FLAG public complaint threat

FLAG public complaint threat

What the assistant claimed, against the record

claimed a refund the record does not show

FLAG agent error

FLAG agent error

HAND OFF supervisor

HAND OFF supervisor

SAY apologize and correct

SAY apologize and correct

claimed the card was secured while it is active

FLAG agent error

FLAG agent error

HAND OFF security

HAND OFF security

SAY apologize and correct

SAY apologize and correct

Answering a pending proposal

accepted, but on different terms

SAY ask desired outcome

SAY ask desired outcome

freeze accepted

FREEZE CARD

FREEZE CARD

CLEAR PENDING

CLEAR PENDING

SAY confirm card frozen

SAY confirm card frozen

HAND OFF security

HAND OFF security

freeze declined

CLEAR PENDING

CLEAR PENDING

SAY acknowledge no freeze

SAY acknowledge no freeze

HAND OFF security

HAND OFF security

refund accepted, small

REFUND

REFUND

CLEAR PENDING

CLEAR PENDING

SAY confirm refund issued

SAY confirm refund issued

RESOLVED

RESOLVED

refund accepted, large

CLEAR PENDING

CLEAR PENDING

HAND OFF refunds

HAND OFF refunds

SAY explain refund under review

SAY explain refund under review

refund declined

CLEAR PENDING

CLEAR PENDING

SAY ask desired outcome

SAY ask desired outcome

cancellation accepted

CANCEL

CANCEL

CLEAR PENDING

CLEAR PENDING

SAY confirm cancellation

SAY confirm cancellation

RESOLVED

RESOLVED

cancellation declined

CLEAR PENDING

CLEAR PENDING

SAY closing acknowledgement

SAY closing acknowledgement

dispute accepted

OPEN DISPUTE

OPEN DISPUTE

CLEAR PENDING

CLEAR PENDING

SAY confirm dispute opened

SAY confirm dispute opened

HAND OFF security

HAND OFF security

dispute declined

CLEAR PENDING

CLEAR PENDING

SAY ask desired outcome

SAY ask desired outcome

hardship referral accepted

CLEAR PENDING

CLEAR PENDING

HAND OFF hardship

HAND OFF hardship

SAY handoff notice

SAY handoff notice

hardship referral declined

CLEAR PENDING

CLEAR PENDING

SAY explain charge or policy

SAY explain charge or policy

Handing off to a person

asks for a person

HAND OFF general

HAND OFF general

SAY handoff notice

SAY handoff notice

hostile

HAND OFF supervisor

HAND OFF supervisor

FLAG abusive customer

FLAG abusive customer

SAY handoff notice

SAY handoff notice

angry

HAND OFF supervisor

HAND OFF supervisor

SAY handoff notice

SAY handoff notice

alleges an error

FLAG agent error

FLAG agent error

HAND OFF supervisor

HAND OFF supervisor

SAY apologize and correct

SAY apologize and correct

Closing

resolved

RESOLVED

RESOLVED

CLOSE

CLOSE

SAY closing acknowledgement

SAY closing acknowledgement

no rule fired yet

Recording the intent

intent unclear

SAY ask clarify issue

SAY ask clarify issue

intent clear (the turn continues)

SET INTENT

SET INTENT

Unauthorized activity: the investigation tree

explained after all

SAY explain charge or policy

SAY explain charge or policy

card lost or stolen

PENDING freeze card

PENDING freeze card

PRIORITY urgent

PRIORITY urgent

SAY propose card freeze

SAY propose card freeze

account takeover

PENDING freeze card

PENDING freeze card

PRIORITY urgent

PRIORITY urgent

HAND OFF security

HAND OFF security

SAY propose card freeze

SAY propose card freeze

possession not stated

SAY ask card in possession

SAY ask card in possession

card in hand, details do not match

SAY ask charge details

SAY ask charge details

card in hand, card-present charge

PENDING freeze card

PENDING freeze card

PRIORITY high

PRIORITY high

SAY propose card freeze

SAY propose card freeze

card in hand, remote charge

PENDING freeze card

PENDING freeze card

PRIORITY high

PRIORITY high

SAY propose card freeze

SAY propose card freeze

card in hand, nothing on file

SAY ask charge details

SAY ask charge details

card already frozen

HAND OFF security

HAND OFF security

SAY handoff notice

SAY handoff notice

Money back

hardship

PENDING hardship referral

PENDING hardship referral

SAY offer hardship options

SAY offer hardship options

already compensated

SAY explain charge or policy

SAY explain charge or policy

asks for more than the record

HAND OFF refunds

HAND OFF refunds

SAY explain refund under review

SAY explain refund under review

no reason yet

SAY ask refund reason

SAY ask refund reason

propose a small refund

PENDING issue refund

PENDING issue refund

SAY propose refund

SAY propose refund

refund needs a person

HAND OFF refunds

HAND OFF refunds

SAY explain refund under review

SAY explain refund under review

not eligible

SAY explain refund not eligible

SAY explain refund not eligible

nothing on file

SAY ask charge details

SAY ask charge details

Other issues

locked out

SAY account recovery steps

SAY account recovery steps

card declined, stranded

PRIORITY urgent

PRIORITY urgent

HAND OFF general

HAND OFF general

SAY handoff notice

SAY handoff notice

card declined

SAY explain charge or policy

SAY explain charge or policy

wants to cancel

PENDING cancel subscription

PENDING cancel subscription

SAY propose cancellation

SAY propose cancellation

thinking of cancelling

SAY ask cancellation reason

SAY ask cancellation reason

where is my order

SAY provide order status

SAY provide order status

which order

SAY ask order details

SAY ask order details

general

SAY explain charge or policy

SAY explain charge or policy

fallback

SAY ask clarify issue

SAY ask clarify issue

each dot is one action the rule emits,

in its family's colour; hover to name it

1

INTENT, FRUSTRATION AND RISK FLAGS

2

CONSENT, FRAUD, MONEY, RETENTION

3

CHECK THE ASSISTANT'S CLAIMS

4

SAFETY FIRST, THEN THE ISSUE AT HAND: SECTIONS RUN TOP TO BOTTOM, AND THE FIRST RULE THAT APPLIES IN A SECTION EMITS ITS ACTIONS

One customer turn

the conversation so far ·

the customer record · what

is on the account · any

pending proposal

What is going on?

Eleven readings of the conversation:

reads the conversation, the customer record and a summary of the

account

what the customer's issue is, out of eight kinds

what they want: money back, a fix, an explanation, a

person, or unsaid

how frustrated they are, from calm to hostile

how time-critical it is, from none to emergency

they report a charge or login they did not make

they threaten legal or regulatory action

they threaten a chargeback, a public post, or the press

they ask for a person

a full card number, PIN, password or SSN is in the text

they say the issue is resolved

they say the company or assistant got something wrong

which follow-ups

does triage call

for?

every one whose

condition holds;

often none

a proposal is pending

Consent:

the proposal and the reply only; earlier turns removed

how they answer the proposal: accept, decline, or

unclear

their yes asks for different terms

unauthorized activity is

in play (P ≥ 0.30, or it

leads the intents)

Fraud:

adds the ledger entry and the card status

whether they still have the card

they now recognize the charge as their own

someone with access to the card made it

they report other activity they do not recognize

login codes, a changed email, an unknown device

what they describe matches the ledger entry

money is on the table (P ≥

0.20 or a money intent

leads) and a claim or fee

is on file

Money:

adds the claim or fee on file, and the order

why they want money back, out of six reasons

the amount they ask for against the amount on file

they say they were already refunded or credited

they offer photos, receipts, tracking or a confirmation

financial hardship, from none to a crisis

cancelling is in play (P ≥

0.15 with an active

subscription, or it leads)

Retention:

adds the subscription record

how likely they are to leave, from no sign to decided

why they want to cancel, out of five reasons

they would stay if something were offered or fixed

the two leading intents

are within 0.25 of each

other

Intent, two ways:

the customer's own turns only

which of the two leading intents fits better

none of them

code then re-splits the intent between the two options,

and folds each message's claims into one probability

the fraud or

money node ran,

and the

assistant has

spoken

yes

Integrity, per new assistant message:

reads the assistant's numbered messages and the record

the message says a refund was already issued

the message says the card is already secured

no

every answer, merged, goes to the policy

Safety, checked before anything else

credentials exposed

REDACT

REDACT

SAY warn not to share credentials

SAY warn not to share credentials

legal or regulatory threat

HAND OFF compliance

HAND OFF compliance

FLAG legal threat

FLAG legal threat

SAY handoff notice

SAY handoff notice

chargeback or public threat (the turn continues)

FLAG public complaint threat

FLAG public complaint threat

What the assistant claimed, against the record

claimed a refund the record does not show

FLAG agent error

FLAG agent error

HAND OFF supervisor

HAND OFF supervisor

SAY apologize and correct

SAY apologize and correct

claimed the card was secured while it is active

FLAG agent error

FLAG agent error

HAND OFF security

HAND OFF security

SAY apologize and correct

SAY apologize and correct

no rule fired yet

Answering a pending proposal

accepted, but on different terms

SAY ask desired outcome

SAY ask desired outcome

freeze accepted

FREEZE CARD

FREEZE CARD

CLEAR PENDING

CLEAR PENDING

SAY confirm card frozen

SAY confirm card frozen

HAND OFF security

HAND OFF security

freeze declined

CLEAR PENDING

CLEAR PENDING

SAY acknowledge no freeze

SAY acknowledge no freeze

HAND OFF security

HAND OFF security

refund accepted, small

REFUND

REFUND

CLEAR PENDING

CLEAR PENDING

SAY confirm refund issued

SAY confirm refund issued

RESOLVED

RESOLVED

refund accepted, large

CLEAR PENDING

CLEAR PENDING

HAND OFF refunds

HAND OFF refunds

SAY explain refund under review

SAY explain refund under review

refund declined

CLEAR PENDING

CLEAR PENDING

SAY ask desired outcome

SAY ask desired outcome

cancellation accepted

CANCEL

CANCEL

CLEAR PENDING

CLEAR PENDING

SAY confirm cancellation

SAY confirm cancellation

RESOLVED

RESOLVED

cancellation declined

CLEAR PENDING

CLEAR PENDING

SAY closing acknowledgement

SAY closing acknowledgement

dispute accepted

OPEN DISPUTE

OPEN DISPUTE

CLEAR PENDING

CLEAR PENDING

SAY confirm dispute opened

SAY confirm dispute opened

HAND OFF security

HAND OFF security

dispute declined

CLEAR PENDING

CLEAR PENDING

SAY ask desired outcome

SAY ask desired outcome

hardship referral accepted

CLEAR PENDING

CLEAR PENDING

HAND OFF hardship

HAND OFF hardship

SAY handoff notice

SAY handoff notice

hardship referral declined

CLEAR PENDING

CLEAR PENDING

SAY explain charge or policy

SAY explain charge or policy

Handing off to a person

asks for a person

HAND OFF general

HAND OFF general

SAY handoff notice

SAY handoff notice

hostile

HAND OFF supervisor

HAND OFF supervisor

FLAG abusive customer

FLAG abusive customer

SAY handoff notice

SAY handoff notice

angry

HAND OFF supervisor

HAND OFF supervisor

SAY handoff notice

SAY handoff notice

alleges an error

FLAG agent error

FLAG agent error

HAND OFF supervisor

HAND OFF supervisor

SAY apologize and correct

SAY apologize and correct

no rule fired yet

Closing

resolved

RESOLVED

RESOLVED

CLOSE

CLOSE

SAY closing acknowledgement

SAY closing acknowledgement

Recording the intent

intent unclear

SAY ask clarify issue

SAY ask clarify issue

intent clear (the turn continues)

SET INTENT

SET INTENT

Unauthorized activity: the investigation tree

explained after all

SAY explain charge or policy

SAY explain charge or policy

card lost or stolen

PENDING freeze card

PENDING freeze card

PRIORITY urgent

PRIORITY urgent

SAY propose card freeze

SAY propose card freeze

account takeover

PENDING freeze card

PENDING freeze card

PRIORITY urgent

PRIORITY urgent

HAND OFF security

HAND OFF security

SAY propose card freeze

SAY propose card freeze

possession not stated

SAY ask card in possession

SAY ask card in possession

card in hand, details do not match

SAY ask charge details

SAY ask charge details

card in hand, card-present charge

PENDING freeze card

PENDING freeze card

PRIORITY high

PRIORITY high

SAY propose card freeze

SAY propose card freeze

card in hand, remote charge

PENDING freeze card

PENDING freeze card

PRIORITY high

PRIORITY high

SAY propose card freeze

SAY propose card freeze

card in hand, nothing on file

SAY ask charge details

SAY ask charge details

card already frozen

HAND OFF security

HAND OFF security

SAY handoff notice

SAY handoff notice

no rule fired yet

Money back

hardship

PENDING hardship referral

PENDING hardship referral

SAY offer hardship options

SAY offer hardship options

already compensated

SAY explain charge or policy

SAY explain charge or policy

asks for more than the record

HAND OFF refunds

HAND OFF refunds

SAY explain refund under review

SAY explain refund under review

no reason yet

SAY ask refund reason

SAY ask refund reason

propose a small refund

PENDING issue refund

PENDING issue refund

SAY propose refund

SAY propose refund

refund needs a person

HAND OFF refunds

HAND OFF refunds

SAY explain refund under review

SAY explain refund under review

not eligible

SAY explain refund not eligible

SAY explain refund not eligible

nothing on file

SAY ask charge details

SAY ask charge details

Other issues

locked out

SAY account recovery steps

SAY account recovery steps

card declined, stranded

PRIORITY urgent

PRIORITY urgent

HAND OFF general

HAND OFF general

SAY handoff notice

SAY handoff notice

card declined

SAY explain charge or policy

SAY explain charge or policy

wants to cancel

PENDING cancel subscription

PENDING cancel subscription

SAY propose cancellation

SAY propose cancellation

thinking of cancelling

SAY ask cancellation reason

SAY ask cancellation reason

where is my order

SAY provide order status

SAY provide order status

which order

SAY ask order details

SAY ask order details

general

SAY explain charge or policy

SAY explain charge or policy

fallback

SAY ask clarify issue

SAY ask clarify issue

each dot is one action the rule emits,

in its family's colour; hover to name it

1

INTENT, FRUSTRATION AND RISK FLAGS

2

CONSENT, FRAUD, MONEY, RETENTION

3

CHECK THE ASSISTANT'S CLAIMS

4

SAFETY FIRST, THEN THE ISSUE AT HAND: SECTIONS RUN TOP TO BOTTOM, AND THE FIRST RULE THAT APPLIES IN A SECTION EMITS ITS ACTIONS

Action

Hand to a person

Do

Say

Record

Questions

Noul

Score

Choice

View examples

← all questions
