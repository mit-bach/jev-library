author: Zhaorun Chen
handle: @zrrrr_cn
post id: 2104003596375425117
timestamp: 2026-09-27T00:22:02Z
url: https://x.com/zrrrr_cn/status/2104003596375425117
engagement: likes 79, reposts 5, quotes 5, replies 9, bookmarks 84, views 62707
This is a saved post, not an official TypeSafe document.

The attack-success rates are the author's claim about a red team of Jev 1.13 on DTap (DecodingTrust-Agent Platform). The post says "read more below" and attached a photo. No paper, PDF, or repo URL was in the post text. The photo was not copied. TypeSafe replied, post 2104768408890003807, "Jev not working right? It's built for composability! Needs more Jev!" That reply is a joke, not a rebuttal with numbers, and is not copied as its own file.

---

Jev is fast at helping you. Turns out, it can also be fast at helping an attacker!!

We red-teamed Jev 1.13 on our DTap (DecodingTrust-Agent Platform) and found a serious safety gap:

70.1% ASR under direct misuse
43.5% ASR under indirect prompt injection

In our evaluations, we found that under indirect prompt injection, Jev can follow attacker-injected instructions without blinking an eye, e.g., exfiltrating user data, deleting files, or taking other harmful actions.

But we found a much safer way to integrate Jev: use it as a self-gating layer for its own tool calls, significantly reducing ASR while preserving most of its utility.

Read more below
