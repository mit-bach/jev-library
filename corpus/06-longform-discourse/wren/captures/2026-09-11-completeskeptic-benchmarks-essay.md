author: Diogo Almeida
handle: @CompleteSkeptic
post id: none
timestamp: 2026-09-11
url: https://www.completeskeptic.com/p/lies-damned-lies-and-benchmarks
engagement: the page showed 24 likes, 3 comments, and 1 restack when fetched on 2026-10-01
This is a saved post, not an official TypeSafe document.

The essay was published on 11 September 2026, four days before the Jev launch. It is in this set because Diogo Almeida linked it on 29 September 2026, inside the window, from post 2104980716673237183, as the "Blog on anti-benchmaxxing" next to the WorkflowEvals release. The linking post is saved separately. Images in the essay were not copied.

Benchmarks got us to incredibly smart AI. What gets measured gets managed, and for years making lots of benchmark numbers go up generally made models smarter. I’m not arguing against benchmarks and their helpful contributions to progress. I’m against benchmaxxing.
A benchmark inevitably gets “benchmaxxed” when people building the model can optimize for a public eval score.1 You don’t have to train directly on a benchmark to benchmaxx it; you just have to train on similar data or try a hundred experimental settings, then compare how your model performs. The benchmark selects the model even if nobody intended to game it. Things were not great when benchmarks were an academic pursuit, but now that they are tied to enormous attention and funding, negative incentives to game them abound.
Illustration of the Streetlight Effect - source
The field wants to measure general intelligence, but can only optimize what it can see. Public evals are the streetlight. Post-training therefore pushes capability fastest in the illuminated areas, while reliability outside them can stay flat or even get worse. My claim is that many of the spikes in “jagged intelligence” are the benchmarks.
Annotated version from source

# Everyone is cheating

## Models chase benchmarks.
Meta’s Llama 4 allegedly ranked near the top of LMArena, but it turned out that not only was it not the public model, Meta was also caught testing 27 private variants before picking the best one, which had the unusually verbose and emoji-heavy style that Arena users rewarded. The ordinary version later landed far lower. Even Claude (normally the goody two-shoes), on a benchmark to simulate a vending machine and end with the most money, formed price cartels, lied to suppliers and promised customer refunds it never sent.

## Benchmarks chase users.
When GPT-6 Astra launched, Artificial Analysis’s Intelligence Index had it tied with GPT-5.6 Sol, which clashed with the widespread belief that Astra was a major leap. The next day, a revised index put Astra four points ahead. Three days later, another revision tied it with Claude Fable 5.1 for first. I do not think Artificial Analysis rigged the index. The changes are defensible. But the sequence shows the feedback loop: people’s intuitions about which model is better help determine whether an eval looks valid. The point of external evals should’ve been to inform the population, not the other way around.

## People cherry-pick for their favorite narrative.
When the Chinese open-weight model GLM-5.2 beat Fable 5 on one web-design leaderboard, it became evidence that Chinese models had caught the frontier. Design Arena’s own analysis was narrower: GLM used more repeatable templates, generated 25% more code, took twice as long, and still lost to Fable on several design categories.

## Benchmarks have been broken for a while.
Unspecialized humans scored 34.5% on MMLU in the original paper, worse than many small old models. The OpenAI coup was partially a result of safety researchers seeing models surpass PhD level at Google-Proof Question Answering (GPQA - an extremely hard dataset) in 2023. Yet humans still do most of the world’s useful work.
source
Everyone in the field knows they’re broken, but they still get quoted because everyone is competing for attention.

# What benchmarks should be
The crux of the problem is (1) intelligence is hard to measure, (2) a (good actor) lab wants to say “we made the model smarter,” and (3) for it to be believed (to whatever extent is accurate).
Benchmarks are a shortcut to get around the hard problem of trust. They seem like a magnifier of trust, but instead are a loan: bad actors can then exploit the trust projected on the benchmark.
The way out is to be trustworthy in the first place. We need to stop outsourcing credibility to a leaderboard and just be honest.
For labs, that means publishing caveats, disclosing cherry-picking, including the evidence that makes you look bad, and de-emphasizing benchmarks even when you’re ahead.
Users have a responsibility too: run your own private evals, treat public ones with a grain of salt, and don’t amplify every number or plot you see.
At TypeSafe, we’re making a new type of model, which means existing benchmarks don’t apply. We can start the race to the bottom with a wall of evals showing that we beat everyone else, or start from a clean maximally honest slate. We are choosing the clean slate: no standard benchmark table in our model releases. New evals will be dated snapshots and immediately retired once posted rather than hill-climbed. We will also publish our evolving internal evals as our current best guesses, alongside the caveats, any cherry-picking, and evidence that looks bad for us.
Thanks to Ke Deng, Erik Gafni, and Sasha Sheng for feedback.
1This is a form of p-hacking: try enough training choices, then report the result that looks strongest.
