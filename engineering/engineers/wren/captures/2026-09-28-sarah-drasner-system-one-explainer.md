author: Sarah Drasner
handle: @sarah_edo
post id: 2104561809084567843
timestamp: 2026-09-28T13:20:10Z
url: https://x.com/sarah_edo/status/2104561809084567843
site: https://system-one-explainer.netlify.app/
engagement: likes 440, reposts 50, quotes 3, replies 19, bookmarks 486, views 39053
This is a saved post, not an official TypeSafe document.

The post says: "I made a site to explain System One thinking (Jev is an example of this)! We make fast judgments all day, some models can too. The guide explains how to use those quick judgments in software." The reply gives the site URL (likes 28, reposts 1, bookmarks 30, views 3505).

The text below is the visible copy extracted from the static HTML on 2026-10-01. The site's animations are not in this file. Line breaks follow the HTML, so some sentences are split. Nothing was rewritten.

System One: fast judgments and deliberate checks

Understanding

System One

Thinking can be described in two modes: System One is fast and intuitive, System Two is slow and deliberate. LLMs can support both, but thorough reasoning takes time and compute.

System One models skip text generation. Given state and a bounded question with predefined answer types, they predict probabilities in a single forward pass.

This produces fast, low-cost predictions with scores that express the model’s confidence. This guide explains how the approach works, then applies it to software design.

System One

fast, automatic judgments

System Two

effortful, deliberate thought

Strength

familiar patterns

Risk

plausible but wrong impressions

Software analogy

focused prediction + checks

Case study

Jev × WebMCP extension

We are illustrating a software workflow, not a model of the brain. Psychological descriptions and AI product categories should not be treated as equivalent.

01

Thinking

02

Categories

03

Scales

04

Thresholds

05

Workflow

06

Confidence

07

Limitations

08

Case study

01

Two modes of thinking

Intuition and deliberate checking.

In the framework popularized by Daniel Kahneman, System One operates automatically and associatively, whereas System Two demands focus and conscious effort. These are descriptions of processing, not two literal compartments in the brain.

For example, recognizing a word happens instantly, while multi-digit math demands step-by-step mental effort.

What feels effortless shifts with experience, but speed doesn’t guarantee accuracy. Intuition and deliberate analysis are both capable of error. Rapid impressions may work well in familiar territory, but complex tasks always require deliberate checking.

Select an example in the diagram. The paths illustrate the distinction; they do not measure cognition or show neural activity. Background: Kahneman’s

Nobel lecture

.

02

Recognizing categories

Select an option from a defined set.

In software architecture, classification serves as a natural analogue to quick human judgment: both rapidly map a complex input to a predetermined category. A customer support message, for instance, might be routed to billing, technical integration, or sales.

The answer space determines what the system can express. Because a system can only express what its answer space allows, including graceful fallback categories like "other" or "insufficient information" is essential.

The visualizations here illustrate categorical probability distributions, where the sum of all outcomes equals 1. Toggling between presets demonstrates the contrast between a decisive confidence score and a near-tie.

03

Judging on a scale

A probability-weighted mean.

Some judgments measure degree rather than category. An ordered rubric can help make this explicit. For example, one could score a tone as 0 (calm), 1 (frustrated but civil), or 2 (very angry)..

Define the scale.

Assign ordered levels 0, 1, and 2 to the descriptions.

Represent uncertainty.

Give each level a probability, with a total of 1.

Compute a summary.

The weighted mean is the sum of each level number multiplied by its probability.

Inspect what the mean hides.

A distribution concentrated near 1 and one split between 0 and 2 can have the same mean.

Assigning equally spaced numbers to these levels is a deliberate design choice, not a precise measurement of feeling. The final score simply marks a relative position on this rubric.

These are illustrative distributions. The first assigns all probability to level 1, giving a score of 1.0. Sliders set relative weights, which are normalized to sum to 1; all-zero weights use equal probabilities.

04

From estimate to action

Estimate the probability of a statement.

Predicting an outcome and acting on it are two different things. An estimate measures uncertainty, and a decision balances that uncertainty against the cost of an error.

Estimate.

A score from 0 to 1 indicates the predicted probability that a message is urgent.

Policy.

A decision threshold converts this score into a boolean action. Shifting the threshold changes the system's behavior without altering the underlying evidence.

A lower cutoff catches more cases but triggers more false alarms. A higher cutoff avoids false alarms but misses real cases. Choose your threshold by testing this tradeoff on labeled data.

Both controls are simulated. The 0.90 cutoff is an example, not a universal recommendation.

05

Composing a workflow

Evaluate independent questions in one call.

Decoupling feature evaluation from decision logic provides a robust design pattern for intelligent systems. Rather than monolithically processing a support ticket, the architecture estimates discrete attributes in isolation: classification, urgency, and sentiment. It then delegates decision execution to a rules engine.

Parallel Execution:

Evaluative tasks that consume the same input can run concurrently when supported by the architecture.

Sequential Pipelines:

Chain dependent tasks so downstream steps receive upstream outputs.

Deterministic Execution:

Guardrails, financial calculations,and policy constraints should always be handled via deterministic code rather than probabilistic models.

The diagram assumes 120 ms per request: 40 sequential calls take 4.8 seconds, while the combined call is assumed to take 120 ms.

06

Using confidence

Define when to act, review, or defer.

Model predictions don't need to execute immediately. Workflows can pause, request review, or gather more data. We can implement checks on a fast impression.

Relying on confidence scores requires verifying calibration across large test sets: a 0.9 score doesn't mean 90% accuracy unless cases rated at 80% actually succeed 80% of the time.

// Pseudocode: thresholds require validation.

if (confidence < 0.5) {

gatherMoreInformation();

} else if (confidence < 0.9) {

requestReview();

} else {

actIfAuthorized();

}

High confidence never replaces access controls or policy checks. Tune these thresholds for each specific task. High-risk actions may always require human confirmation regardless of score.

TThe diagram and code use the same intervals. Test thresholds separately for each task.

07

Limitations

Where an initial judgment needs checking.

False Familiarity

A case can closely resemble a known pattern while differing in one decisive detail. Always inspect the evidence supporting a classification.

Incomplete Data

When inputs lack required context, ensure the system can explicitly abstain rather than guess.

Changed conditions

Test models against the target production environment. Past accuracy does not transfer automatically.

Precision and consistency

Use deterministic code for precise calculations and policy checks. Plausibility is not proof.

Consequences of error

Set review requirements based on the real-world consequences of an error, not the speed or fluency of the prediction.

An imperfect analogy

Fast software is not necessarily intuitive, and generated text is not necessarily deliberate reasoning. Assess the task and implementation directly.

08

Case study: Jev × WebMCP

A Chrome extension for selecting and preparing tool calls.

The

Jev × WebMCP extension

puts this workflow in a browser side panel. As a user types, it predicts a tool and its arguments from the tools exposed by the current page. The panel shows the proposed call, confidence, and request latency.

Discover.

On an enabled site, read the available WebMCP tools, descriptions, and input schemas.

Evaluate.

Convert those schemas into Jev questions. Select a tool, identify argument values, and allow a “no tool fits” result.

Assemble.

Combine the answers into a proposed call. Missing arguments remain available for manual entry.

Apply policy.

Run eligible read-only calls automatically when checks pass, or request user action and confirmation.

WebMCP supplies the page’s tool interface. Jev supplies structured judgments. The extension connects them and controls execution. Tool selection is derived from the schemas rather than site-specific configuration.

Explore the extension

Testing site

A grocery search in the side panel

A simulated replay of a grocery search, with the extension enabled on the test site provided.

Schema Mapping

Tools & Enums: Converted into discrete categorical choices.

Booleans: Mapped to true/false evaluations.

Free-text: Selected from spans of the user’s input.

From prediction to execution

Model predictions are strictly decoupled from execution rights. State-changing calls require user initiation, and high-consequence actions demand secondary confirmation regardless of reported confidence.

Jev’s role

Jev is TypeSafe’s implementation

of focused, typed judgments. Its Choice, Score, and Noul interfaces are concrete examples of the ideas above. Its

documented limitations

still apply; the extension’s checks do not make predictions infallible.

Reading further.

Start with Daniel Kahneman’s

Maps of Bounded Rationality

for the psychological distinction. The software diagrams here are teaching examples.

TypeSafe’s documentation

describes its particular use of the term.

All demos run locally without model requests. By

Sarah Drasner

.

Source

.
