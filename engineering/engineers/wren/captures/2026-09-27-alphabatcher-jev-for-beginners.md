author: Alpha Batcher
handle: @alphabatcher
post id: 2104164965552726101
timestamp: 2026-09-27T11:03:15Z
url: https://x.com/alphabatcher/status/2104164965552726101
engagement: likes 28, reposts 4, quotes 5, replies 9, bookmarks 8, views 7022
article url: https://x.com/i/article/2103664515845951488
article title: Jev for beginners: how to use the AI model that can't write a single word
_disclaimer: This is a saved post, not an official TypeSafe document.
This is a saved post, not an official TypeSafe document.

Retrieval note: same fxtwitter recovery as the other X articles. @0xTreff post 2105757266280419829 calls this "the guide" under a John Kim video. The article does not name John Kim. The author is Alpha Batcher, @alphabatcher. John Kim's own notes are a separate file. Numbers in this guide are the author's or TypeSafe's, as written.

# Jev for beginners: how to use the AI model that can't write a single word

On September 15, TypeSafe AI released Jev. The launch thread from founder Diogo Almeida, who helped build the instruction-following research behind ChatGPT at OpenAI, passed 39 million views and nearly 59,000 bookmarks. Five days later TypeSafe dropped the waitlist. Two days after that, it paused new signups because demand was more than it could serve.

If you bookmarked it and still can't explain what Jev does, that's understandable. Jev can't write a reply or a line of code. It reads text you give it, answers questions you wrote in advance, and attaches a probability to every answer. A typical request takes a fraction of a second and costs a tiny fraction of a cent.

Once you see where that fits, you'll find spots for it all over your code. Below you'll go from zero to a working request, then learn the habits that make Jev cheap and accurate, and the places where it gets things wrong.

## 1. What Jev actually is

Picture an if-statement that understands language.

Regular code branches on things it can compute, like if order_total > 100. It falls apart when the condition needs judgment. Is this customer angry? Will this shell command delete files? You end up with keyword lists and regexes that break on the first message phrased a little differently, or you pay an LLM to read the text and hope its JSON parses.

Jev handles that kind of condition directly. Every request has two parts. The state is the thing being judged: a support message, a form submission, a JSON record, a chat log. The questions are the judgments you want, each with its possible answers defined up front.

Jev returns one typed answer per question, with probabilities. Your code reads the numbers and decides what happens next. TypeSafe describes it as a function call for frontier intelligence: messy input goes in, typed decisions with probabilities come out.

Here's the example from TypeSafe's quickstart. The input is one customer message: "Hi, I've been trying to connect my Stripe account for 3 days and the integration keeps failing. I'm losing sales. Please help ASAP."

Links: https://docs.typesafe.ai/introduction/quickstart

The request asks 3 things at once: which team should handle it (billing, technical or sales), how frustrated the customer is on a 3-level scale, and whether the message is urgent. Jev picked technical at 0.85, with the remaining 0.15 on billing. It put frustration exactly on "Frustrated but civil" and gave urgency 1.0. The whole request used 392 input tokens.

Your code gets numbers it can branch on right away, and every answer is one of the options you listed.

## 2. Where Jev fits next to ChatGPT and Claude Code

ChatGPT, Claude and the model inside your coding agent generate text one token at a time. Even when you force them into JSON, your code still has to parse a string and handle the times it comes back malformed or cut off. Ask one for a confidence number and you get a number it wrote, and TypeSafe's launch post calls those estimates overconfident and inconsistent.

Jev evaluates all your questions in parallel in one pass and returns a probability distribution over the answers you allowed. TypeSafe trained it with a method it calls Reinforcement Learning for Calibrated Decisions (RLCD). Calibrated means the probabilities should match reality: across many answers marked 0.9, about 9 in 10 should be right.

One thing trips up beginners right away. You can't set Jev as the model behind Claude Code, Cursor or Codex, and TypeSafe's docs say so plainly. Your coding agent writes the code that calls Jev, and your app calls Jev whenever it needs a decision.

The strongest setups use both kinds of model. The LLM does the writing and the open-ended reasoning. Jev makes the small calls in between, like which model should take this task or whether a tool call is safe to run.

The names explain the bet. "System One" comes from Daniel Kahneman's Thinking, Fast and Slow, where System 1 is fast, automatic judgment and System 2 is slow deliberate reasoning. Jev is named after the economist William Stanley Jevons, who noticed that more efficient steam engines made coal use go up. TypeSafe expects the same with intelligence: make a decision cost almost nothing, and software will make far more of them.

## 3. The numbers that matter

Price is $0.042 per million input tokens, which TypeSafe also writes as $42 per billion. Output tokens are free. The quickstart request above used 392 input tokens, so it cost about $0.000016. A hundred thousand messages that size come to roughly $1.65.

TypeSafe quotes 70 to 500 milliseconds per request end to end, measured from the US West Coast where the service runs. If your servers sit in Europe or Asia, add network time and measure it yourself. The launch demo had Jev play Doom at about 10 decisions a second for roughly $7 an hour.

The homepage headline says 193.6x faster and 444.6x cheaper. Those numbers come from TypeSafe's own workflow evals, and the launch post says they sit at the high end of real-world gains. Skeptics on Hacker News pointed out that comparing a model with no text output against LLMs that reason at length makes the gap look bigger. Use the headline as a ceiling and test on your own data.

The limits you'll hit first:

- 64,000 tokens per request, with the state plus the longest single question capped at 32,000

- Up to 255 options per Choice question and 2 to 10 levels per Score question

- Text only: a string, a JSON object or an array of text, with no images, audio or video yet

- English works best, and other languages are accepted with lower accuracy, so test before you rely on them

- 250,000 tokens per second and 1,200 requests per minute, limits TypeSafe says can change while it adds capacity

## 4. The 3 question types

Every question is one of three types, and each one gives back a different shape of answer. Pick the type before you worry about the wording.

One detail is easy to miss. The key you give a question, like refund_requested, only exists for your code and never reaches the model. Write the full question in instructions, even when the key looks obvious.

Noul is a yes/no question. The answer is one number, noul, the probability that the answer is yes. Near 1 is a strong yes, near 0 a strong no.

Phrase it so a high number means yes. "Does the message contain personal data?" reads cleanly. "Is the message free of personal data?" flips the meaning, and whoever reads your code later will get it backwards.

Keep one condition per Noul, too. "Is the customer angry and asking for a refund?" makes the model judge two things at once, so ask two Nouls and combine them in code.

A value around 0.5 means the model gives yes and no about equal odds. To measure how much of something is present, use a Score. Set the Noul threshold by what a wrong answer costs: raise it when a false yes hurts, like issuing a refund or paging someone at 3am, and lower it when a missed yes hurts more, like skipping a safety flag.

Choice picks one option from a list you define, up to 255 of them. You get the winning choice, the full probabilities across every option, and a confidence from 0 to 1. Confidence is high when one option dominates and low when the probability is spread out.

Add an other option whenever your list might not cover every input, because Jev has to pick something. Give it your full list of teams or categories, since each extra option costs only a few tokens. Describe what belongs in each option, and spell out how it differs from its neighbor when the line is thin.

Score places the input on an ordered scale you describe, 2 to 10 levels written from low to high. The score is the probability-weighted average of the level numbers, so it can land between levels. A 1.43 on a 3-level scale means the model is split between levels 1 and 2, leaning toward 1.

Write each level as a situation the model can recognize. "A feature is broken, but a workaround exists" gives it something to match. "Moderately severe" leaves it nothing to compare against. Keep each Score to one dimension, and if a level reads "urgent and angry and detailed," split it into three Scores.

When the model keeps landing between two levels on inputs you think are clear, add examples to the levels. TypeSafe tested this on a bug report about an export button that fails in Safari.

With plain level descriptions, the answer came back 1.43 at 0.35 confidence. Adding one relevant example ("export fails in one browser but works in another") moved it to 1.03 at 0.96 confidence. An unrelated example changed nothing, so your examples have to look like your real inputs.

Use Scores to rank items or to check them against a threshold. The docs warn against reading 1.4 as an exact spot 40% of the way to the next level.

## 5. Your first request in 10 minutes

Start with access, because it's messy right now. TypeSafe opened Jev to everyone on September 20 with $5 of free credit, about 120 million tokens. On September 22 it paused new signups, and at the time of writing the homepage still says they're paused. Existing accounts keep working, and TypeSafe's homepage has an email form for the reopening.

If you already have an account, open the Playground. Paste a real message from your own work, add a Noul, a Choice and a Score, and run them together. Spend your first hour here with your own data before you write any code.

Links: https://console.typesafe.ai/playground

If you don't have an account, Jev is also on Vercel's AI Gateway as typesafe-ai/jev, called through the AI SDK's experimental_evaluate function. The yes/no type is named boolean on that route. LangChain users can install langchain-typesafe, still an alpha release, and call Jev through TypeSafeClassifier.

Links: https://vercel.com/ai-gateway/models/jev

For the direct API, install the Python SDK (Python 3.10 or newer) and put your key in TYPESAFE_API_KEY. There's also a JavaScript SDK. Here's the quickstart request turned into a working router:

```
pip install typesafe-sdk
```

```
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

client = TypeSafeClient()  # reads TYPESAFE_API_KEY, uses jev-latest

message = (
    "Hi, I've been trying to connect my Stripe account for 3 days "
    "and the integration keeps failing. I'm losing sales. Please help ASAP."
)

response = client.system_one(
    state=message,
    questions={
        "department": Choice(
            instructions="Which team should handle this",
            criteria={
                "billing": "Payment or subscription issues",
                "technical": "Bugs or integration problems",
                "sales": "Pricing or account questions",
            },
        ),
        "frustration": Score(
            instructions="How frustrated the customer appears",
            criteria=[
                "Calm, just stating facts",
                "Frustrated but civil",
                "Very angry, strong language",
            ],
        ),
        "is_urgent": Noul(
            instructions="The message conveys urgency or time-sensitivity",
        ),
    },
)

answers = response.answers
print(response.model)  # the exact version that answered

if answers["department"].confidence < 0.5:
    print("Send to a person first")
elif answers["is_urgent"].noul > 0.8:
    print("Page the on-call", answers["department"].choice, "team")
else:
    print("Add to the", answers["department"].choice, "queue")
```

Run it and you should see numbers close to the quickstart's. The department comes back technical with 0.78 confidence, which clears the 0.5 floor, and urgency sits at 1.0, so the message goes to the on-call technical team. A vague message like "hey, something's off with my account" should spread probability across the teams, pull confidence down and land with a person first. That branch is where Jev earns its place: the model tells your code when it's unsure.

For your own version, add an other option to the Choice and swap the print calls for your real handlers.

## 6. The habits that make Jev cheap and accurate

Ask everything in one request. All questions run in parallel against the same input, so an extra question barely changes response time and costs only its own tokens. TypeSafe calls this speculative fan-out. In its GDPR cookbook, 13 questions sent together came out 12.2x cheaper and 10x faster than 13 separate requests, mostly because the long document went over the wire once.

Include questions that only matter for some inputs, like bug severity on a message that might turn out to be about billing, and let your code ignore what it doesn't need. Split into a second request only when the next question depends on data you have to fetch after seeing the first answer.

Gate every action on confidence. Sort answers into three paths. High confidence acts automatically. Medium confidence asks the user to confirm or flags the item for review. Low confidence goes to a person or a slower fallback.

The bar moves with the stakes: TypeSafe's banking example sends anything under 0.5 to a human and wants more than 0.9 before approving a transfer without asking. Start strict, then move the thresholds once you've seen how confidence lines up with accuracy on your data.

Break big judgments into small Scores. "How important is this ticket?" hides several judgments in one question. Ask separate Scores for how severe the bug is, how frustrated the customer is and how much detail the report gives an engineer. Then combine them in code with weights like 0.6, 0.3 and 0.1, dividing each score by its top level first so scales of different lengths compare fairly.

When the ranking feels off, you change a number and rerun instead of rewriting a prompt. TypeSafe calls this composite scoring.

Make Jev pick from a list. Jev can't write out a value, so extraction needs a different shape. Find candidates with a regex or an LLM, then give Jev a Choice over those candidates. The extraction cookbook does exactly this for emails, phone numbers and amounts: regexes find every candidate, Jev picks the one the question asks for, and code normalizes it. Whenever your instinct says "extract X," rewrite it as "here are the candidates for X, which one is it?"

Point at fields by name. When the state is a JSON object, refer to its parts with backticks and dot paths, like "Does `refund_policy` cover the situation in `message`, given `order.charges`?" The model then knows exactly which part of the input each question is about.

Send only what the question needs. Accuracy drops as unrelated text fills the input, and TypeSafe says Jev suffers from context rot. Filter in code before you send, so a single ticket gets classified without the customer's whole history attached. If you can't filter in code, ask one Noul per chunk about whether it's relevant, and drop the chunks that score low.

Pin the model version once it works. jev-latest moves when TypeSafe ships a new release, so answers can shift with no change on your side. Every response names the exact version that answered, currently jev-1.13.0. Log it, and once your thresholds are tuned, send that versioned ID instead of the alias.

Keep every question and threshold in one file. That file is what a reviewer needs to read, and it's where you'll make almost every fix. TypeSafe's docs give the same advice for integrations written by coding agents.

## 7. Where Jev gets it wrong

TypeSafe publishes a jaggedness page listing the known failure modes of jev-1.13, last reviewed September 17. Read it before you ship anything. Here's what matters most when you're starting out.

Links: https://docs.typesafe.ai/model-jaggedness/jev-1.13

Jev reads literally. It answers the words you wrote, including every scope word and negation, and it won't fill in the intent a person would. When a wrong answer makes you explain what you actually meant, that explanation belongs in the instructions.

Numbers and dates belong in code. Jev doesn't count reliably, whether that's characters or items in a list, and it can't do arithmetic. It judges named colors better than hex codes. It reads dates as text, so asking which date comes first or whether one falls inside a window gives shaky answers.

The fix is the same each time: Jev handles the meaning and code handles the math. To count items that match a description, ask one Noul per item and add them up in code. For dates, have Jev pick the day, month and year from Choice lists that include a "not stated" option, then build and compare real dates in code, as the date extraction cookbook shows.

Messy inputs cost accuracy. Double negatives, questions about a property of a property, and long inputs full of irrelevant detail all make answers worse. So does text written to steer the model, like an instruction hidden inside a customer message. TypeSafe says it expects to improve here, so test your integration with hostile inputs before real users reach it.

Separate questions don't follow math rules. TypeSafe's own example asked "Is the customer asking for a refund?" and "Is the customer asking for something other than a refund?" as two Nouls about the same message. They came back 0.72 and 0.47, which add up to 1.19. Ask each decision one way, and never reuse a threshold tuned on a Noul for a Choice.

A typed answer can still be wrong. TypeSafe's "can't hallucinate" claim means Jev can never return a value outside your options. One of the top comments on the Hacker News launch thread made the obvious point that it can still pick the wrong valid option. Confidence gating and a labeled test set are what catch those wrong picks.

Anything that needs generated text, like a reply or a summary, still goes to an LLM.

## 8. What to build first

Pick a first project where a wrong answer costs little:

- Inbox or support triage. A Choice for the team, a Noul for urgency and a Score for frustration, routed in code like the example above.

- Labeling a spreadsheet. One request per row to tag reviews or survey answers by topic and sentiment. At around 300 tokens a row, 10,000 rows cost about 13 cents.

- A model router in front of your LLM. Jev decides whether a request needs your cheap model or your strongest one, and LangChain ships a router middleware for it.

- A safety check before an agent runs a tool. LangChain's AutoModeMiddleware uses Jev to screen calls to tools like bash and blocks risky ones before they execute.

- Checking LLM output. TypeSafe's cookbooks show how to check whether a citation supports its claim before an answer reaches a user.

## 9. Let your coding agent write the integration

Install TypeSafe's agent skill before you ask Claude Code, Codex or Cursor to add Jev to a project. It gives the agent the current API and TypeSafe's recommended patterns. The docs warn that an outdated skill leads agents to invent request fields, and that agents aren't great at writing questions, so plan to edit those yourself.

In Claude Code:

```
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

For Codex, Cursor and other agents:

```
npx skills add typesafe-ai/skills --skill typesafe-ai
```

Then start with a prompt that maps the opportunities before any code changes:

```
Use the TypeSafe skill. Read this project and list every place where the code judges text with fragile logic: regexes, keyword lists, long if/else chains, or an LLM call that returns JSON.

For each one, propose a Jev request with the exact questions (Noul, Choice or Score), the criteria for every option or level, and a confidence threshold for acting automatically.

Put all proposed questions and thresholds in one table. Don't change any code yet.
```

## 10. Roll it out without breaking what works

Use the same order for every new Jev decision:

1. Keep the current behavior running.

1. Run Jev beside it and log every answer with its probabilities and model version.

1. Label a few dozen real inputs with the answer you expected.

1. Fix the questions and thresholds wherever confidence and accuracy disagree.

1. Automate the low-risk path first.

1. Keep a person or a stronger model on the uncertain cases.

Code that already decides correctly should stay as it is. An if-statement that costs nothing beats a model call that can be wrong.

Keep your LLM for writing and reasoning. Hand Jev the thousands of small yes/no and pick-one decisions your software makes every day, and let the confidence number tell your code when a person needs to look.

Follow me @alphabatcher for hands-on guides to new AI models like Jev, with working code and the mistakes to catch before you ship.

Links: https://x.com/alphabatcher
