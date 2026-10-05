author: Navin Kabra
handle: @NGKabra
post id: 2104900751252492778
timestamp: 2026-09-29T11:47:00Z
url: https://aiiq.substack.com/p/should-you-be-using-jev-laya-or-other
engagement: the pointing post had likes 14, reposts 6, quotes 1, replies 1, bookmarks 13, views 861; the essay page showed 8 likes, 2 comments, and 1 restack when fetched
This is a saved post, not an official TypeSafe document.

The essay is dated Sep 29, 2026. Two comparison charts are images and were not copied. The prose says Laya "significantly underperformed" Jev and does not print the accuracy percentages. The 100x cheaper and 10-100x faster lines are his summary of the public claims, not a new measurement. His email classifier and the synthetic test are his own, and he does not publish the item counts.

A sentence in the fetched page was garbled around a footnote ("#d above is an especially important"). It is kept as it arrived rather than repaired. The intended sentence is not guessed.

---

# Should You Be Using Jev, Laya, or Other “System One Models”?

A model that gives fast and cheap decisions could be useful in many contexts.

For the last few weeks, my Twitter feed has been full of people trying out Jev, a new type of AI model, also known as a System One Model. If you work in a company that is automating workflows using AI (or if you as an individual are at the cutting edge of AI and are using agents to automate your personal workflows), Jev and related models could be an important new tool.

## What is Jev and Why Should You Care

Jev is a new type of AI model that can take a text prompt+documents as input and answer simple yes/no questions based on the input. And it does this while being 100x cheaper than the frontier LLMs (ChatGPT Astra, Claude Opus), and being 10-100x faster.

Specifically, imagine a document or a collection of documents (like a customer complaint and a bunch of supporting documents that the customer has attached with the complaint). And imagine a bunch of related yes/no or classification question (like, “Is this complaint resolved?”, “What is the severity of this complaint?”, “Which department should this complaint be routed to: billing, technical, shipping, account access, or other?”, or “Out of 1 to 5 stars, how many stars is this customer likely to give us?”. Jev can take all the documents and all the questions and produce all the answers in a fraction of a second.

Here are some more examples:

- Give it an email from your bank and ask: Is this an important email? (I am actually using this daily because my banks keep sending me all kinds of junk, but I can’t mark them as spam because they’re my banks, and once in a while there is an extremely important email in there.)
- Give it a PDF of a paper and ask, “Does this paper support the claim that the Indian economy did badly for the first few years after 1991”
- Give it a comment and ask it if it contains an insult, threat, or harassment. (for example, “The server is dead again, can someone kill the stuck process?” should return No.

I’m already using it to classify my emails, and I expect to start using it in more places over the next few weeks.

## Don’t ChatGPT/Claude Do This? Why Use Jev?

Yes, the LLMs (ChatGPT, Claude, Gemini, DeepSeek) can all do this. But they’re far more expensive and they take much longer. So for high volume decisions (like my email classification), they are prohibitively expensive, and for applications where the response has to be fast, they are unusably slow.

Because it is so fast and cheap, you can use it in many many places where it was not practical to use LLMs. In fact, they expect you to find a large number of applications that you had not previously considered at all. That’s why they called it Jev: it is short for Jevons Paradox.

## But Isn’t This Just Regular Machine Learning?

Before LLMs in particular and Deep Learning Neural networks in general started taking over the world, AI meant classical/statistical machine learning. Those algorithms are similar to Jev in the sense that they’re much faster and much cheaper than LLMs.

The problem with classical machine learning algorithms is that to use them you have to collect your own training data set, then train the algorithm on this data set. For most companies and individuals, that is too much work: they neither have the expertise nor the appetite to implement something like. (If they did, all these algorithms would have been implemented 10 years ago, and they’re not. QED.)

Jev is different because, like LLMs, they have trained Jev on a large amount of data from various different domains. So, in most cases, unless your application is very niche and unique, you can just start using Jev without requiring any training.

Footnote in the essay: Lots of people think what they’re doing is niche and unique, but in most cases, it is not. In the AI world, this is called zero-shot learning.

## What About Laya, and Other Open Source Jev Alternatives?

Jev’s architecture is probably not especially unique. As soon as Jev took off, a number of people released similar models which are, a) small, b) fast, c) open source, d) can be run on your machine locally.

The point, which most people seem to be missing, is that the speed and cost are irrelevant unless the accuracy of the answers is good. I tried Laya myself and compared it to Jev on two workloads: 1) my own email classification, that I’m using Jev for, and 2) a synthetic test I asked Claude to create for me (consisting of questions like the ones in the first section of this article).

The first problem I ran into is that, Laya has a much smaller context window than Jev. So my email classification program didn’t work with Laya at all because almost all my emails were larger than Laya’s context window. To make the comparison a little more fair to Laya, I reimplemented the classifier to use only a subset of the email so that it fit in the context window.

Even after this adjustment, Laya significantly underperformed Jev on accuracy.

Two charts follow in the original and are not in this file.

When Open Source System One Models Might Still Be Worth It

The fetched page then has a broken sentence: "#d above is an especially important to a lot of people who don’t want to send their data to the cloud, either because of privacy concerns, or because of regulatory constraints, or because their agreements with customers forbid them from doing so."

And, you can fine tune the open source model with your data and increase its accuracy.

So, if you can’t send your data to the cloud, and you have relatively simpler questions to ask, and especially if you are willing to collect some data and fine tune the model, then you could/should use an open source System One model.

## How Does It Work?

A standard LLM model is a next-word predictor. The model takes some text as input, “understands” it (i.e., understands everything about the text conceptually and builds a mental model of the meaning of everything in the text), then outputs a single word as an output. When you use ChatGPT.com (the website) it sends your prompt to gpt-5.6 (the model), gets a single word as an output from the model, then appends that word to your prompt and sends it back to the model for the next word after that. It keeps repeating this process until gpt-5.6 outputs a special token indicating <end-of-output>.

This is one of the reasons why using an LLM is so slow: this humongous model is being run in a loop generating one word at a time.

Jev keeps the first part of this model, but rips out the rest. In Jev, the model takes the text input, “understands it” and then uses this understanding to output a yes/no answer. In case of multiple questions, I can output answers to all of them in parallel. That is why it is so much cheaper and so much faster.

Obviously, this is not a very difficult thing to implement if you already have an LLM. Which is why so many Jev clones popped up very quickly.

However, as I indicated earlier, the secret sauce of Jev isn’t the architecture, it is the training data. They have put a lot of effort into creating large amount of synthetic data, representing all the different kinds of questions people might want to ask Jev, and train Jev on that. That’s why it can answer so many different kinds of questions without requiring any additional training. And the open source clones who haven’t done the same thing give you models which aren’t able to answer the questions with the same level of accuracy.

Footnote: Technically, it is outputting a “token”. But for the purposes of this discussion you can think of a token as a single word.

## Limitations: What Not To Use Jev For

First, it helps to remember that Jev is a language model. It does not understand maths and it cannot do calculations reliably. The reason ChatGPT is able to do complex calculations well is because it uses tools, like calculators and Python programs, to do its calculations—Jev doesn’t have tools. So, do not ask questions that involve mathematical comparisons or calculations.

Second, we have no idea what Jev was trained on, so we can never be sure what kind of accuracy Jev will give in any specific situation. So always evaluate Jev with your data before you make any decisions.

Finally, there appears to be a misconception that since Jev outputs only Yes/No and categorical answers, it cannot hallucinate. This is false. Jev can hallucinate, so all the techniques you’ve learnt to deal with LLM hallucinations should be used even when you’re using Jev

## Summary

If you’re already using an LLM or an agent in any high-volume situation and are getting worried about the costs or the latency, explore whether any parts of this can be replaced by Jev.

And try to find interesting uses of Jev. I feel this will be a big thing.
