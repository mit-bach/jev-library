author: Brucky
handle: @danikkk_wqs
post id: 2105599094999703609
timestamp: 2026-10-01T10:01:59Z
url: https://x.com/danikkk_wqs/status/2105599094999703609
engagement: likes 16, reposts 3, quotes 0, replies 1, bookmarks 7, views 539
This is a saved post, not an official TypeSafe document.

The 71% to 93% figure is Brucky's claim about 200 labeled tickets after rewriting six questions. He says he did not change the model, the threshold, or the data. No dataset, seed, or rubric was linked. The post quotes an article by @polydao, which is saved separately and is a different text.

---

You're still writing Jev questions like LLM prompts. that's why half your answers come back with low confidence

Jev doesn't guess what you meant. it answers exactly what you wrote, and a vague question gets 0.5 back, which is Jev telling you it can't decide

here's what fixed mine, before → after:

a field named is_fraud → Jev never sees the name, the meaning goes in the instructions

"urgent and from a paying customer?" → two questions, combine them in code

"very frustrated" → "mentions cancelling or a chargeback"

"worse than the previous level" → every level has to make sense on its own

a yes/no where yes means unsafe → flip it, high should always mean yes

a choice with no exit → add "other", or it has to pick something wrong

"extract the vendor name" → give it the list of vendors and make it pick one

what I didn't expect: I never touched the model, the threshold or the data. I rewrote 6 questions and my ticket router went from 71% to 93% on 200 labeled tickets

Jev answers the question you wrote, not the one you meant.
