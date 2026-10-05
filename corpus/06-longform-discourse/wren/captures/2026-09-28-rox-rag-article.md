author: Marcus Dominguez-Kuhne, Calvin Yost-Wolff, Brian Xu, and Gopal Goel
handle: @rox_ai
post id: 2104642692307411334
timestamp: 2026-09-28
url: https://www.rox.com/articles/better-cheaper-faster-retrieval.-our-rag-experiment-with-jev
engagement: the pointing post had likes 8, bookmarks 3, views 344; the thread root had likes 75, reposts 8, quotes 9, replies 17, bookmarks 33, views 29927
This is a saved post, not an official TypeSafe document.

Byline on the page: Sep 28, 2026. By Marcus Dominguez-Kuhne, Calvin Yost-Wolff, Brian Xu, and Gopal Goel. The page header also lists Gopal Goel and Brian Xu.

Every figure below is the authors' claim. Two presentations of the result do not match, and this file does not pick one.

The article's own TL;DR says Jev-Score and Jev-Noul kept 91.2% and 89.3% of the GPT-6 Astra standard's relevance at k=100, versus 72.6% for production, and cost about 10× less ($0.46 vs $4.73).

The X thread says Jev-Score reached 96% accuracy, 12% higher than GPT-5 Mini, at 0.3s versus 6.2s, and the headline says 20x faster, 10x cheaper, and 12% more accurate than GPT-5 Mini.

Figure 3 and Table 2 are images. The HTML text did not include their cells. A full-page screenshot of the live article on 2026-10-01 was read for those cells. A digit in that reading can be wrong. As read, the chart is titled "Jev vs. our production reranker," mean over 75 queries, with relevance kept (%) against chunks sent to the agent. The legend names Jev-Score, Jev-Noul, Production (GPT-5 Mini), GPT-6 Astra, and Random order. Two curves are labeled at the right edge, 96% and 84%. The screenshot reading did not assign 84% to a named series with certainty. 96 minus 84 is 12, which is the gap the thread calls "12% higher," if those two labels are Jev-Score and GPT-5 Mini.

Table 2, "Cost per method," as read from that screenshot:

| Method | Cost per 1,000 queries | Cheaper than production |
| --- | ---: | ---: |
| GPT-6 Astra (high reasoning) | $9,800 | 0.000× |
| Production (GPT-5 Mini reranker) | $56 | — |
| Jev-Noul | $1.83 | 31× |
| Jev-Score | $5.46 | 10× |

$5.46 per 1,000 queries is not $0.46, and $56 per 1,000 queries is not $4.73. Both pairs are about 10×. The article prints both the TL;DR pair and the table. This file does not correct either.

Latency of 6.2s versus 0.3s appears in the thread and not in the article text that could be selected.

---

TL;DR. On 75 representative production queries, Jev-Score and Jev-Noul outperformed our production reranker, keeping 91.2% and 89.3% of the GPT-6 Astra standard's relevance at k=100 versus 72.6% for production, and cost about 10× less ($0.46 vs $4.73).

## How Retrieval Works at Rox

Our retrieval system ranks the relevance of thousands of chunks pulled from transcripts, emails, CRM notes, news and documents, and hands the top-K to the agent (see How Rox Mines Signal from Sales Data at Scale for more details). Then an agent uses the highest ranked chunks to answer the query. Today that reranker is a listwise LLM ranker which ranks batches of chunks in parallel.

Figure 1: The Production Reranking Pipeline. The figure is a drawing, not copied. It shows raw data sources, a split into chunks, parallel LLM batches, a highlight, and a top-K chunks box.

## How we Evaluated

### Gold Standard

On a set of 75 representative production reranker calls, we had a GPT-6 Astra grader at high reasoning score every chunk's relevance to its query according to a rubric, sampled three times per chunk, and averaged the results.

| Grade | Rubric text given to the grader | Percentage of chunks |
| ---: | --- | ---: |
| 3 | Directly answers or contains exactly what the query asks for | 7.0% |
| 2 | Clearly relevant to the query, but partial or indirect | 21.3% |
| 1 | Tangentially related (same topic, but does not help answer the query) | 36.0% |
| 0 | Irrelevant | 35.7% |

Table 1: The grading rubric given to GPT-6 Astra, and the resulting label distribution.

### Our Approaches using Jev

Jev-Noul asks "Is this chunk a relevant answer to the query?" and scores the chunk by the probability of "yes".

Jev-Score instead grades the chunk on the same four-level scale as the ground truth (not relevant / slightly relevant / mostly relevant / directly relevant) and scores it by the probability-weighted average level, which worked best.

Jev-Choice, which picks one item from a list, was not used because it limits the number of answer choices to 255, far fewer than the chunks we rank per query.

Figure 2: Ranking with Jev. One question per chunk, one probability or score per chunk. The figure is a drawing: items, all candidate chunks, into Jev, one question per chunk, then re-rank scores, top K to agent.

## Results

One offline run per method on the 75 labeled queries.

Figure 3: Kept-mass@k by ranker. Kept-mass@k is the total relevance of k chunks a ranker keeps divided by the total relevance of the best possible k chunks for that query. The chart reading is in the note at the top of this file.

## Cost

Table 2: Cost per method at list prices. The cells, as read from the screenshot, are in the note at the top of this file.

## Conclusion

Jev is strong at System 1 questions such as fast, classification-style questions such as our ranker system for our RAG pipeline, as shown here. We were impressed by how cheap and accurate Jev is, especially in comparison to our production LLM system. Hybrid systems pairing fast System 1 and slow, thinking System 2 models are the best way to optimize for speed, cost, and deep thinking.

We are rolling out this faster, better, cheaper Jev reranker into production, and are excited to announce our research results!
