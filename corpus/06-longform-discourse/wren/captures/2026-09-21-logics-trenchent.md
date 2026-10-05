author: Logics
handle: @immortalhowwl
post id: 2102012226747924961
timestamp: 2026-09-21T12:29:03Z
url: https://x.com/immortalhowwl/status/2102012226747924961
engagement: likes 143, reposts 11, quotes 4, replies 7, bookmarks 512, views 333478
article url: https://x.com/i/article/2101977364221628416
article title: TRENCHNET: How OPUS 5.5, Jev & Graph Theory Turn the Trades of pumpfun Best Traders Into a System
_disclaimer: This is a saved post, not an official TypeSafe document.
This is a saved post, not an official TypeSafe document.

Retrieval note: fxtwitter article body. This is the author's design for watching pump.fun wallets. It is not a measured trading result. A later post from the same account offering a Claude Code prompt is not copied here.

# TRENCHNET: How OPUS 5.5, Jev & Graph Theory Turn the Trades of pumpfun Best Traders Into a System

You find a pump.fun trader with a strong record. You inspect the wallet, follow its purchases, and start recognizing how it trades.

Then you find another. And another.

Soon you are comparing entries across several tokens, checking whether earlier buyers still hold, and trying to remember which wallets always seem to appear together. A purchase is easy to spot. Keeping the whole group in your head becomes the work.

That is the idea behind TRENCHNET: follow a selected group of traders continuously, connect their actions, and turn the important changes into readable analysis.

GPT-6 Astra studies the traders and explains the situations. A graph keeps track of their shared trading history. Jev evaluates narrow questions about incoming events. The trades themselves supply the tokens to investigate.

# 1. Opus builds the trader profiles

[Image omitted.]

The process starts with a candidate list of wallets and their available trading histories.

Code calculates realized results, open positions, holding periods, typical purchase sizes, and profit concentration. Opus receives those figures alongside the trades behind them.

Its first job is to establish what makes each trader worth following.

Consider two profitable wallets. One repeatedly closes positions after holding for several hours. The other makes many rapid trades, with most of its total profit coming from one exceptional winner.

Both can look attractive in a profit ranking. Their next purchases mean different things. The first wallet's entry may develop into a position you can observe. The second may finish its entire trade before you have understood the token.

Opus gives each profile a trading style, the evidence for including it, and the behavior that deserves particular attention. For example:

Regularly realizes gains across several tokens. Usually holds for hours. A purchase substantially larger than its normal entry deserves examination. Most recent positions remain open, so the latest apparent gains are still unrealized.

This profile becomes context for future events. A small exploratory buy and a substantial addition are no longer interchangeable just because they came from the same address.

The instruction to Astra is specific:

> Describe how this wallet trades using the supplied history. Identify repeatable behavior, profit concentration, typical holding time, and unusual position changes. Support each conclusion with trades. Mark missing history where it changes the interpretation.

The roster can then be ordered by explicit selection criteria, with the profile explaining each inclusion. Here, “best traders” refers to the strongest candidates in the observed group, rather than a claim to have ranked every wallet on Solana.

New purchases from that group start the next stage automatically.

# 2. The graph connects their trades


Every observed purchase connects a wallet to a token. The connection carries the transaction time, direction, and size. Sales update the same history.

This creates a wallet-token graph: a record of who traded what and when. Comparing those records reveals which wallets repeatedly meet in the same tokens.

Imagine A, B, and C buying a fresh token within a short period. All three are selected traders. The obvious observation is that several followed wallets are entering together.

The graph adds their shared history. Perhaps A regularly enters first, with B and C appearing shortly afterwards. Perhaps the same sequence has occurred across several earlier launches.

That pattern changes how the current buying should be described. Three familiar participants repeating a familiar sequence offer different information from three traders who rarely overlap.

To make the comparison meaningful, the graph considers both shared purchases and each wallet's total activity. Two addresses that buy nearly everything will overlap often. The time window matters too: entering the same token days apart is different from arriving together.

Then D buys. Its available history shows little overlap with A, B, or C. The buyer group has expanded beyond its familiar pattern.

The graph passes along a compact relationship summary:

A, B, and C have recurring shared entries.

D rarely overlaps with those wallets in the observed period.

The current token has attracted both sets of participants.

These relationships describe repeated trading patterns. They do not establish common ownership or private coordination: the graph records that the wallets frequently trade together, without inventing identities behind the addresses.

The summary travels with the new trades, so the next stage evaluates the buyers in context.

# 3. Jev evaluates the changes

Jev is TypeSafe AI's decision model. It understands text input and returns answers in a format you define: a choice, a score, or a probability for a stated proposition. It does not generate explanations.

Its role here is to handle focused judgments repeatedly as the trading activity changes.

The input is a compact snapshot: recent transactions, position changes, relevant trader profiles, and the graph's relationship summary. Straightforward calculations have already happened in code.

Rather than ask “Is this token good?”, split the assessment into questions with clear criteria. For example:

> Behavior fit: does this purchase match the trader's established entry pattern?

> Position intent: based on the supplied history, does this look like an exploratory purchase? This is assessed separately: a small test position can also be the trader's usual way of entering.

> Historical context: is the supplied history sufficient to interpret this event, or should that part of the assessment remain unresolved?

> Attention: does the event leave the current report valid, require an update, or introduce a situation that needs its first analysis?

Each question is answered separately. Independent questions can share one request, and code combines their answers with explicit rules.

There is no reason to ask Jev whether four buyers exceed three. The count is already known. The model is useful where a narrow interpretation depends on the supplied context, such as whether an entry fits a trader's documented behavior.

The resulting route is simple: continue observing, send for analysis, or flag insufficient evidence. Those categories describe what happens to the information. They are not trading orders.

A low-confidence answer stays uncertain. It does not become an estimated probability of the token rising. Jev selects what deserves interpretation; the actual transactions remain attached to the case.

# 4. Opus writes the situation report

Opus receives the selected event together with the evidence that produced it: the trader profiles, entry sequence, observed positions, graph summary, and Jev's assessments.

Its output answers four questions:

What changed?

Which traders are involved?

How does this relate to their previous behavior?

What would change the interpretation next?

For the arrival of D, an illustrative report could read:

> D entered a token already held by A, B, and C. The first three have recurring shared entries; D has little overlap with them in the available history. Its purchase fits the entry pattern recorded in its profile. Participation has broadened beyond the usual trio. The next relevant changes are additions from D and reductions by the earlier buyers.

> Astra can also distinguish a strong-looking purchase from a weakly supported interpretation. If D's history contains only a few trades, the report cannot give its apparent lack of overlap the same weight as a long record.

The writing instruction keeps the analysis tied to the evidence:

> Explain the change using the supplied trades and profiles. Distinguish observed facts from interpretations. Name the missing information that affects this case. End with the specific participant actions that would change the assessment. Do not invent motives or a price target.

> References to the underlying transactions belong with the report. If Astra says that A added to its position, there should be a purchase supporting that statement.

The result is a readable account of an ongoing trade sequence, with clear reasons for revisiting it.

# 5. Follow one token through the whole sequence

[Image omitted.]

Take a hypothetical token called TOKEN. The name is only a label for this example.

## A enters.

The purchase introduces TOKEN into observation because A is already in the selected group. Its profile shows a tendency to build positions through several entries. The first buy is consistent with that pattern, but no other followed wallet has joined yet.

The event remains recorded without requiring a long analysis. If A sells immediately, that sale is still captured; a quiet case does not disappear from observation.

## B and C follow.

The count of tracked buyers rises. The graph finds their recurring overlap with A and supplies the previous shared entries as context.

The initial reading becomes: a familiar group is accumulating. Their purchases are real, but the relationship between these buyers stays visible in the description. Jev evaluates the relevant narrow questions against the updated snapshot.

## D arrives.

D brings a different observed trading history. Its profile and purchase add information beyond another entry from the recurring trio. The combined assessment routes the case to Astra, which produces the report above.

At this point, the token became interesting through the actions of the tracked wallets. Nobody needed to know its name beforehand or bring it for inspection.

## A sells part of its position.

The original report now needs updating. Code records how much of A's observed position remains. The event includes its earlier purchases, so Opus can describe a partial reduction accurately.

The other positions matter here. B and C remain holders. D has not sold. The new report describes a split between participants, rather than continuing to portray the early group as uniformly accumulating.

A transfer with an unknown purpose remains a transfer. It does not become a sale merely because the balance decreased.

## D adds while B exits.

Now two changes pull in different directions. One of the recurring buyers has closed its observed position, while the newer participant has increased exposure.

Opus receives both events together with the current holdings. The updated explanation can say:

B has exited, following A's earlier reduction. D has added to its position. The original group is weakening while D's participation is increasing. C remains a holder; its next trade would show whether the remaining member of the trio follows the exits.

The earlier report remains attached to the earlier evidence. The new one explains the change. You can follow how the reading evolved without rewriting the first observation around the latest outcome.

If C subsequently exits, the group that first drew attention has largely unwound. If D also starts selling, its position history shows the reversal. If no new event occurs, the last report retains its timestamp instead of being presented as a fresh development.

By the time you consider TOKEN, you can see the first entries, the relationships between the buyers, and the positions they still hold. The purchase that caught your attention is part of a sequence you can actually follow.

With love by @immortalhowwl
