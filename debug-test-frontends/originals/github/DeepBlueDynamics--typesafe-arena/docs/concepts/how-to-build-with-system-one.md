<!-- source: https://docs.typesafe.ai/concepts/how-to-build-with-system-one -->
<!-- crawled: 2026-09-17 via grub-crawler -->

# How to build with TypeSafe

System One is TypeSafe’s model for building AI-powered software, not agents. It does not generate code or choose its own next action. It provides AI primitives that embed into software, so code remains in control while the model handles common-sense judgments over unstructured data.**Summary:**build a normal software workflow and insert System One only where AI is needed.- Keep control flow, deterministic rules, and side effects in code.
- Break broad judgments into narrow, typed questions with explicit instructions and criteria.
- Give each question only the context it needs.
- Use probabilities and confidence to act, ask for review, or escalate.
- Ask independent questions together, then compose their answers in code.

## Three software architectures

TypeSafe is designed for building**AI-powered software**, where code owns the workflow and AI handles narrow, structured decisions.- Traditional software
- LLM agents
- AI-powered software

Traditional code is a complex decision tree made from simple software primitives. Because each primitive is reliable, developers can compose them into higher-level abstractions.An agent processes instructions and chooses its next step. This works well when a person is monitoring the process, but every loop introduces another opportunity to go off the rails.Code handles deterministic work and owns the control flow. The model appears only where the system needs programmable common sense or needs to interpret unstructured data. Each AI task is kept atomic and constrained.![Traditional software, agents, and AI-powered software shown as three different system architectures.](https://mintcdn.com/ts-docs/aFVnpmCIX68NpsV1/images/how-to-build-with-typesafe/software-architectures-light.webp?fit=max&auto=format&n=aFVnpmCIX68NpsV1&q=85&s=35c7622176190d1b1f19dc712f2fbf11)![Traditional software, agents, and AI-powered software shown as three different system architectures.](https://mintcdn.com/ts-docs/aFVnpmCIX68NpsV1/images/how-to-build-with-typesafe/software-architectures-dark.webp?fit=max&auto=format&n=aFVnpmCIX68NpsV1&q=85&s=8e6c2c73bdd4c9b541c4f9294bd829b5)

## What makes System One composable

## Structured

System One is type-safe by construction. Decisions and probabilities conform to the structured software types and JSON schema your code expects, so it never has to recover a value from generated prose.

## Parallel

Questions are evaluated independently and in parallel. One primitive’s result does not become hidden context that changes another primitive’s result.

## Comparable

Outputs are sortable and can drive smart`if`statements, thresholds, and comparisons.

## Fast

Most queries complete in about 100 ms. System One is fast enough for real-time request paths and user interfaces.

## Calibrated confidence

[RLCD](../introduction/machine-learning-primer.md)communicates uncertainty through calibrated probabilities instead of tending toward overconfidence.

## Self-consistent

System One is designed to return stable answers across repeated evaluations. See the[self-consistency cookbook](../cookbooks/consistency_noul_cookbook.md).Because every output is constrained to the supplied options, the model returns a full probability distribution over those options rather than inventing a value outside the schema. TypeSafe’s target is a greater than 100× intelligence-to-speed-and-cost ratio; the underlying bet is that cheaper intelligence will create much more demand.

## Design a System One workflow

1

### Use code when you can

Keep deterministic work in code. It is reliable and cheap. Avoid agent`while`loops when a software workflow can express the same behavior.Example: keep deterministic rules in code

```
days_overdue = (today - invoice.due_date).days

if days_overdue > 30:
 route_to_collections(invoice)
```

Browse the[System One patterns](../patterns.md)for bounded ways to compose model decisions with code.2

### Decompose the input state

Include only the context relevant to the current questions. This helps the model avoid distractions and context rot. Do not rely on knowledge stored in model weights when current information can come from your own knowledge base.Example: send only relevant context

```json
{
 "state": {
 "ticket_message": "My flight was cancelled. Can I get a refund?",
 "refund_policy": "Cancelled flights are eligible for a full refund."
 },
 "questions": {
 "policy_supports_refund": {
 "type": "noul",
 "instructions": "Does the refund policy support the refund requested in the ticket?"
 }
 }
}
```

[Try it in the Playground →](https://console.typesafe.ai/decode#share/N4IghgDglgagpgJwM5QPYDsQC4QDcCMIANCACaoDGArgLZzoAuAKnAB4PYjAA66ABH24gGUCgGs4DAPp0kSMAHM4QrIJABZAJ58AZgBsoCgBYM+AdzBI+FMOgpw9euKQB0fAMK2+AST5LTYHwIcDpU6KQA-EJEvAJCwaHhUhCoBhSaKmqedg5OpLoGxgxWYMF8DoZQAEZOuqgIfIGhjkEhYa5CvAC+xCAQCKg0EMUs7Jw8-GopaZpSSFQQKQjFUgntmRMCccKaEMrYauioVHrRsVtCUOhIDAhUFCIYSJlCACKocFYMRnCtifnTUTaeaLeqmb6-NbhVoARyonwYzj4Vz4ENRogkDCiIHOXW6vSQDjgD2c6lQpAcSGwAG0QAArOC4AC0ejAiJuIAAul0gA)3

### Use structure in the input state

Use nested JSON for the`state`and`questions`fields. Point questions at specific values when that removes ambiguity, and include the backtick characters around each path inside the question.Example: reference a nested value

Use a backticked dot-and-index path to point a question at a specific nested value, such as`support.tickets[0].message`.request```
{
 "state": {
 "support": {
 "tickets": [
 {
 "message": "I was charged twice for order A-104."
 },
 {
 "message": "How do I reset my password?"
 }
 ]
 },
 "commerce": {
 "orders": [
 {
 "id": "A-104",
 "charges": [
 {
 "amount_usd": 49,
 "status": "captured"
 },
 {
 "amount_usd": 49,
 "status": "captured"
 }
 ]
 }
 ]
 },
 "account": {
 "security": {
 "password_reset": "Email a reset link to the address on file."
 }
 }
 },
 "questions": {
 "duplicate_charge": {
 "type": "noul",
 "instructions": "Do `support.tickets[0].message` and `commerce.orders[0].charges` indicate a duplicate charge?"
 },
 "password_reset_supported": {
 "type": "noul",
 "instructions": "Can `account.security.password_reset` resolve the request in `support.tickets[1].message`?"
 }
 }
}
```

[Try it in the Playground →](https://console.typesafe.ai/decode#share/N4IghgDglgagpgJwM5QPYDsQC4QDcCMIANCACaoDGArgLZzoAuAKnAB4PYjAA66ABH24gkVCBFQIGQrHx78BgkAygUA1nAZJpfANq8FCuQYNC6SJGADmcbUICSfAO5gkfCgAswCa6T4NHKnB8AGYSfBKkiHwAggC0+AAMACwAdEL6xgC+RBkGRsYCpnDmVjbYigASqI585HwOCMUafDQAnnwQLkiOEQD86fIGmbl8ALoZ2RlCFKg0dAgUZTL5hSARiFrleoOGIyYgUKS2IHGJSUI5O-seXtabMtsFeXtPQmA0qFSMAPpUSEflJIATkuT2MQiQDDADD+xwokBhjQBLyGoLBshR4PAHy+DF+-20wLR6MUkOhsPK0wRVCRAxJwyuCnGjIZBmZAkm8jeFBmuO0K1JcGoCCgDFa-JeQk65h6CFI30aSA0xwAojQwFAADZ8MB8RXNTVQdCqPyoPzuIJgUikRWuDAhLVwNIgEasvgMzLEEAQBCzCCaFjsTj5ISkUSG+EMODfG7eJYYnZCMUQeNCdCfTUXEZCI2QhBUCjKDD3RQAETNAAMRGIJAwUso1BokDoEqMUmYLNYKzr0L4KzM5ohFil1sgW23Y3du0bSCpoZbauG51G3J44-0XfJOatpd0Igqmnjq+JJHAActs0pWinjumqJniJfcwx84W0OgS0IAMJgfgVsA8p8jApEqwqiq0KS7rK8r6gw3aKqgmq4EEDAWnqcAAI5UMUDB8EafBVqIJ51g26iaDo+Bth2pQVhuEy8J6JBKpqQpRqQACyqCRJqSDYDoIAAFZwLgsSavOkIgKMmRAA)4

### Decompose the questions

Ask the most explicit, narrow, specific, atomic questions you can. Break down complex or ill-defined questions into separate questions that each evaluate one property.This is probably the most important concept in this guide. Broad questions hide several judgments behind one answer. Atomic questions expose those judgments so you can inspect, tune, and combine them in code.Example: decompose spam detection

One broad question (bad)```
{
 "is_spam": {
 "type": "noul",
 "instructions": "Is `message` spam?"
 }
}
```

[Try it in the Playground →](https://console.typesafe.ai/decode#share/N4IghgDglgagpgJwM5QPYDsQC4QDcCMIANCACaoDGArgLZzoAuAKnAB4PYjAA66ABH24g6SJGADmcIVj49+AwSCT1SiabN4KFQ0lCQQANmACeAfXRg66oQEEKdPgAUTCVAYNCimrYrg0wUB7YighwAO5gCKRIAAIURlA0ALQARhhUSAB0bJaGUiDeAgC+XvICQkhUKQBWcBQM1iAAqgiSjDLxATR8xqhUCHx+hqjGcHB8aegZnoWKaaTGjQCafXwAFmC44ylj-MoGdQxwpHwAZqgDYHwAJPhEAAyPE+lZfADCGKdQCN29-XwQFxuAwAsCiMIXE4MVCkEx8aF8UIUOBQLZ8KAMTIzMqKAxQdAAayQ6gA2rMBHIfNoQEd2I03glupNpsRydT+kEZEI1gwGBAsAB6AWdRKpF7ZVi5A4CsD2fJsoqzAC63kV6CKxBAEFcNAgDCQLHYnEpij0pn0lnUJvKNOMEHyXJA6D6QVKWiE+KQDAQVHqaHQxOCQgAkkg+AADERiSThvgWmgAfiEqt4GpI+0OxwAsjC4AYkNgSSBargkkYjl6QEqikA)Decomposed questions (good)```

{
 "requests_credentials": {
 "type": "noul",
 "instructions": "Does `message.body` ask the recipient to provide a password or other login credential?"
 },
 "offers_unexpected_reward": {
 "type": "noul",
 "instructions": "Does `message.body` claim the recipient received an unexpected prize, payment, or reward?"
 },
 "creates_time_pressure": {
 "type": "noul",
 "instructions": "Does `message.subject` or `message.body` pressure the recipient to act quickly?"
 },
 "sender_identity_mismatch": {
 "type": "noul",
 "instructions": "Does the organization named in `message.sender.display_name` conflict with the domain in `message.sender.email`?"
 },
 "link_domain_mismatch": {
 "type": "noul",
 "instructions": "Does the domain in `message.links[0].url` conflict with the organization named in `message.sender.display_name`?"
 },
 "disguises_link_destination": {
 "type": "noul",
 "instructions": "Does `message.links[0].text` conceal or misrepresent the destination in `message.links[0].url`?"
 }
}
```

[Try it in the Playground →](https://console.typesafe.ai/decode#share/N4IghgDglgagpgJwM5QPYDsQC4QDcCMIANCACaoDGArgLZzoAuAKnAB4PYjAA66ABH24g6SJGADmcIVj49+AwSCT1SiabN4KFQ0lCQQANmACeAfXRg66oQEEKdPgAUTCVAYNCimrYrg0wUB7YighwAO5gCKRIAAIURlA0ALQARhhUSAB0bJaGUiDeAgC+XvICQkhUKQBWcBQM1iAAqgiSjDLxATR8xqhUCHx+hqjGcHB8aegZnoWKaaTGjQCafXwAFmC44ylj-MoGdQxwpHwAZqgDYHwAJPhEAAyPE+lZfADCGKdQCN29-XwQFxuAwAsCiMIXE4MVCkEx8aF8UIUOBQLZ8KAMTIzMqKAxQdAAayQ6gA2rMBHIfNoQEd2I03glupNpsRydT+kEZEI1gwGBAsAB6AWdRKpF7ZVi5A4CsD2fJsoqzAC63kV6CKxBAEFcNAgDCQLHYnEpITgAEcqHAkPrTBRQqpGFAwAZicETeUacYIPkuSB0H0gqUtEJ8daEFR6mh0K7fQARVBWvgAAxEYkkmXmxiTfDBBPha3GSKg0HoDHhqABrlwUFUOdB4MhfAuTYYBYGBlQ4nxfDtx1LToMAH4hKqg4pUKdTogkKYqOg2N76sdTKEIlF1O7FAwvT7FP6qIHZiHowxw5GMDHFPHEymrWm4BmYVme4z84W6sWoKXEXUUVsTmA-BzguhzHJWUAAF5wEQoLGHQjAwc2q6RKQw4FPIJTeEIvZgEcM4MIkcCmNqd79Lum5CNu3qNPuh44seYYRgRF6NNeSDJqmEgPpUNSHNmza3qIXGPgs2YkaIZFvj+FCft+CKymWFpQBQBIGMYaGjlhSgqIgpg1v226mDQej+AwFBrBuR6etRwRCLR2LBiAoankxUaXkIbFSRc4iAZBuFRnwFh0Cc3aCfemTKOgqgIJkuj6EYZhBXA2YUJ8eL1HwYQYmsUnkP43ahZx6aRdF2T5QYSYaRhY5CHihKmHlAToEZJm4eZln0dZu52QGDnUs5Z7MdGrEJuxrbjI1BX8GFwl1USJL3EqmQcilaXKWWWWtl5rS+RB-kYIFlhgYVd7CSViCxXohgmOYR2VSO1VaXF4hUHoVqmHNDVWgRFhDR1jlUd1fq9aynUDa5LG2SAnkzemc1IAtS20gwq3oMizpNgMxlIKE4lyQWfCqNa+L7fwJ1CXD+LzYty0IBVVXFLwGokPsoGkAAsjCcAutgJIgLUuBJEYeEcEqRRAA)Example: verify a tool-call trace

One broad question (bad)```
{
 "tool_calls_are_correct": {
 "type": "noul",
 "instructions": "Is `trace.tool_calls` correct for `request` and `available_tools`?"
 }
}
```

[Try it in the Playground →](https://console.typesafe.ai/decode#share/N4IghgDglgagpgJwM5QPYDsQC4QDcCMIANCACaoDGArgLZzoAuAKnAB4PYjAA66ABH24gEcAI5U4SBkKx8e-AYJAM207EoDqACzAMA5Ej4MtcPgHc4ukwj5R+AZUsMGAG1MNUNVAgSozt-gAxMC0RdBMoBgB+ISJeRSUXSl00dBklR11XOCI+DQBBWPjFIVJdOHShACYABiqANgBaGoBOZoBmIoUBISp0SMqQADMQsIi1YoBfOIUhMFwwKBcwACM3AH0PVBckdPkEoQBzOEpUUjh1ikiATz3ig7JJCgQoCAZUwYAlSW3cUzA+FcGNcjKg+Mt3gwqOc+GB0KRwRhDpFoXAAHRdBI9EAQMAIMB0FTIO7dLFCIG3dRCKQvdCHIT3RSTRnTRlHOAMdYWKyIElYpTnJDPV7vDCDADiHKMJj4Q28cAoYCksu8gNQ3lIdnKhjhCIBZRUGOIjOxuPxhMQu3U+35iRSUPOg3QtBWvONpIeSTpKMdVJAzporoQmNtpXKgwAmlGI40ALKxxoAEUTIf5vX6alkAG0TWThqN6ONU6GQBQ4DsoFQrbmBABdXPM0mNgSs2bKfFlvklZTqlyXMAuHbpHMeuQ1pRQUiDRWD9b4YsPdAEip+46nc6XG4L7t4w60egMK2yG22pQUwaZZxuXIFBmjlsNmb8k95yfTgd9qrb7FLuiDY6ctyxhuk+Ja7vujBHmO97dhCPorrIAAsADsaL1DU9RVKBp5CF6yIOghfCNPgVRVGi7TtFU+DYSWBqEdUdRNK0HTft2fQDH6ZYVlWd6ns2WL8XWNFCFsfYiEgVAuIew65i+Dyif2s5vpxH5zqxQioFQDAQFpXY4SAcEEekKFoRhWHjtieHwekxGkeRlHzjBglMoy9YKI2kzEDivg0G8SAsOwnA2iJvaKTs6x4hcFDeCIFCZtB8nXBA9H+ppLjFkIdg0lQcWpFBQgAJKGAABgwHbogpM47MVao+AqDAqjYxUiOIkgMDVup8MV8yLMsawXKJSDFTEIBTLwnkkEg5b1XApCxmc5ZINgWYgAAVnAuCNBCbUgLWkxAA)Decomposed questions (good)```

{
 "geocode_tool_is_relevant": {
 "type": "noul",
 "instructions": "Is `trace.tool_calls[0].name` an appropriate tool for resolving `request.location`?"
 },
 "geocode_location_matches": {
 "type": "noul",
 "instructions": "Does `trace.tool_calls[0].arguments.city` match `request.location`?"
 },
 "geocode_arguments_match_schema": {
 "type": "noul",
 "instructions": "Does `trace.tool_calls[0].arguments` conform to `available_tools.geocode_city.parameters`?"
 },
 "geocode_result_matches_call": {
 "type": "noul",
 "instructions": "Does `trace.tool_results[0].tool_call_id` match `trace.tool_calls[0].id`?"
 },
 "weather_tool_is_relevant": {
 "type": "noul",
 "instructions": "Is `trace.tool_calls[1].name` an appropriate tool for answering `request.text`?"
 },
 "weather_arguments_match_schema": {
 "type": "noul",
 "instructions": "Does `trace.tool_calls[1].arguments` conform to `available_tools.get_weather.parameters`?"
 },
 "weather_uses_geocoded_coordinates": {
 "type": "noul",
 "instructions": "Do the coordinates in `trace.tool_calls[1].arguments` match those in `trace.tool_results[0].output`?"
 },
 "weather_date_matches": {
 "type": "noul",
 "instructions": "Does `trace.tool_calls[1].arguments.date` match `request.date`?"
 },
 "weather_unit_matches": {
 "type": "noul",
 "instructions": "Does `trace.tool_calls[1].arguments.unit` match `request.unit`?"
 }
}
```

[Try it in the Playground →](https://console.typesafe.ai/decode#share/N4IghgDglgagpgJwM5QPYDsQC4QDcCMIANCACaoDGArgLZzoAuAKnAB4PYjAA66ABH24gEcAI5U4SBkKx8e-AYJAM207EoDqACzAMA5Ej4MtcPgHc4ukwj5R+AZUsMGAG1MNUNVAgSozt-gAxMC0RdBMoBgB+ISJeRSUXSl00dBklR11XOCI+DQBBWPjFIVJdOHShACYABiqANgBaGoBOZoBmIoUBISp0SMqQADMQsIi1YoBfOIUhMFwwKBcwACM3AH0PVBckdPkEoQBzOEpUUjh1ikiATz3ig7JJCgQoCAZUwYAlSW3cUzA+FcGNcjKg+Mt3gwqOc+GB0KRwRhDpFoXAAHRdBI9EAQMAIMB0FTIO7dLFCIG3dRCKQvdCHIT3RSTRnTRlHOAMdYWKyIElYpTnJDPV7vDCDADiHKMJj4Q28cAoYCksu8gNQ3lIdnKhjhCIBZRUGOIjOxuPxhMQu3U+35iRSUPOg3QtBWvONpIeSTpKMdVJAzporoQmNtpXKgwAmlGI40ALKxxoAEUTIf5vX6alkAG0TWThqN6ONU6GQBQ4DsoFQrbmBABdXPM0mNgSs2bKfFlvklZTqlyXMAuHbpHMeuQ1pRQUiDRWD9b4YsPdAEip+46nc6XG4L7t4w60egMK2yG22pQUwaZZxuXIFBmjlsNmb8k95yfTgd9qrb7FLuiDY6ctyxhuk+Ja7vujBHmO97dhCPorrIAAsADsaL1DU9RVKBp5CF6yIOghfCNPgVRVGi7TtFU+DYSWBqEdUdRNK0HTft2fQDH6ZYVlWd6ns2WL8XWNFCFsfYiEgVAuIew65i+Dyif2s5vpxH5zqxQioFQDAQFpXY4SAcEEekKFoRhWHjtieHwekxGkeRlHzjBglMoy9YKI2kzEDivg0G8SAsOwnA2uy64XApUBIOsIhuAsjB6UowIQPR-qaS4xZCHYNJUBQoroFBQgAJKGAABgwHbogpM47FmNS1miv5wMVsL8JAEC+G1UDlKC2wqjY4m-HYhx8MVIjiJIDBokkiq5cVMQgFMoEhRQZwXFNKQYOsNC6BQJhQS+InXElTqpelICZWV2W5flICJqgkjDWVYBlmilUfkgNV1eBdCQWiFJNVtDA7cNo0SFIk3JDNc0LcUS0resX0HpFAM7esQomFt8UHUdfroCd7oPOdCCXak123fdpXlS9vaKdVtVogjkFNct6ByggNCgsN8yLMsaxhb2SBomuy0bhSaJmsuRJILNvF8K22JC3D4mSZyyO7TTmPKIdyW45Jp2E8TGCk3dJWPc9ClK1J71069SmkP921aA9lM27TdWTtL83uYtIBAdYmzUxFUXlnAsWZtB8la8duv492+s5STgxFU7T0VdTVXvfgdUNU1cKwhAbWoB1XWib1zVIBYtJDSNYigxNKjsB70Ntr7iDwwge7fYem0O6jO1wBj1pspr2OyEIOtpTH2Jx1dgxkybztp29WaZ-T7cQYeTMYKz7MeJzCxLKsGyiQLAFck41hi3iEuWo3Xswz75+t1WkjrAr5ykJc6oIJqS4qHtQ+JW1njYSZ08oXXjobWeYJgJqg1FqP+ARk5m0XoODOn016dylnwVW0pUBIFMHYJBqdthBwkpbD6aJNLaS0rfFs3sW4IHWHRbugNdoa0AVHCeIDp4Jz9HPIhVMSHp2XugjuiM0R0Xtqw4GNdxoSPKLQ2W9DH6MPYirB2kh2GRxxsAoePDIF8ONgIl2aDV5iJ+moqRQNq5jTBpYqG7leCeRIPgtwOU4CkFjCtHY2AswgAAFYh0aBCcaIBayTCAA)5

### Use structure in the questions

Keep atomic questions short. When instructions or criteria need several kinds of guidance, use objects or arrays with named fields instead of flattening everything into a dense prose string. This makes the decision boundary easier to scan, review, and tune.For a Choice, describe what belongs in each option, what belongs in a neighboring option instead, and a few representative examples. Use the same field names across options so the model can compare them directly.Example: define contrastive Choice criteria

```json
{
 "card_help_topic": {
 "type": "choice",
 "instructions": {
 "question": "Which disposable virtual card topic is the user asking about?",
 "focus": "Classify the information the user wants."
 },
 "criteria": {
 "get_disposable_virtual_card": {
 "what": "Purpose, eligibility, or setup",
 "not_for": "Quantity, transaction, or merchant restrictions",
 "examples": [
 "How can I get a disposable virtual card?",
 "What are disposable cards for?"
 ]
 },
 "disposable_card_limits": {
 "what": "Quantity, transaction, or merchant restrictions",
 "not_for": "Purpose, eligibility, or setup",
 "examples": [
 "How many disposable cards can I make per day?",
 "Where can I use a disposable card?"
 ]
 }
 }
 }
}
```

[Try it in the Playground →](https://console.typesafe.ai/decode#share/N4IghgDglgagpgJwM5QPYDsQC4QDcCMIANCACaoDGArgLZzoAuAKnAB4PYgASqA7gAQ0w6AJ79SUJBFRIwAIwA2cfrigIGVMAv4UwCUkh3D+ASUFgA1soiJxYEQH5iICAlQ0IDJC3adgAHXR+fn8QXX0AfQALOAUICIZUaApQrH4AoOCQkAYRG1TsiijUKAo4UKJArOyodCQGBCoKBjQ6gozq4NCARyo4etaC0IB1KNKo8UlpWUVlVXVNbXDSfkTk-klVmP4qJFswJAtagHN+eVQqBgcKqs7QgDNKXaGQAGEFA5R7sQZt2seEEIWhgtspdrZeMIvAA6UK3YIAX0qmS6YQQUAYiCgYHa8KyoWOcAYEQkUhk8iUEXmGi0EWWuJRdxAvCiYAYLwAClQENM4ER+LEoMcoHIoAoMSJ+agEPw9hoIDdGdVQuhUMSAS8AIqaRgS-kNYSyZqtKUyugIIpQ-gIfoNUrAtrEPHKkBsMAeJRIAoAbWdTJ4Al0QTMhIYZ0mZJmShUahpSz0pGuTqVTNGbLONoj0wpymWhgBSb9wQAun6kX7QqTs7M6QmIuKaBivdh0kXsiy2VqdS1cvqEIawMaMKbBIhLYxrbb0UPHcjOviQKr1dLOdzefzBcLReLe-xpbKiVQFcn56i3R7+j626iA+ZRFnybMjPpDEHTOYrPwbDLSPYk3PT1RUZEFzYwzHBcMq0faNlkLFMSzLPEEVuZD0ARZw9iUZo4FIABZVBSFiJBsG9EAACs4FwABaD5MXqEBiwRIA)A short, unambiguous question or criterion can remain a string. Add structure when it separates guidance that would otherwise blur together. For the full set of places structure is accepted, and worked examples for instructions, Choice options, Score levels, and Noul criteria, see[Advanced: structure](../primitives/advanced.md).6

### Ask a lot of questions

Ask many narrow, independent questions about the same state in one request. This is how you maximize effectiveness and intelligence per dollar with the API: questions run in parallel, and code can combine their signals without adding serial model round trips.See the[Speculative Fan-Out pattern](../patterns/fan-out.md)and[Parallel questions cookbook](../cookbooks/parallel_questions.md).7

### Combine question outputs in code (or feed into a classical ML model)

Combine independent answers with deterministic rules or weighted sums. For learned composition, use the probabilities as features in a downstream classical machine-learning model.Example: combine signals with a weighted score

```
answers = response.answers

# Combine independent signals into one application-specific score.

quality = (
 0.4 * answers["answers_request"].noul
 + 0.4 * answers["citations_are_supported"].noul
 + 0.2 * (1 - answers["contradicts_context"].noul)
)
```

[Composite Scoring](../patterns/composite-scoring.md)shows how to preserve individual judgments while combining them. If you do not have labels for a downstream model, use an ensemble of expensive reasoning models to generate them; the[AutoResearch cookbook](../cookbooks/autoresearch_feature_discovery.md)shows how to train a classical model on System One outputs.8

### Route on uncertainty

Make code take different actions for confident and unconfident answers. Escalate uncertain cases to a person or a more expensive reasoning model. Test thresholds by plotting confidence against accuracy on your data.Example: route by confidence

```
answer = response.answers["card_help_topic"]

if answer.confidence < 0.8:
 route_to_human_review(ticket)
else:
 route_to_handler(answer.choice, ticket)
```

See[Confidence](../confidence.md)and[Confidence-Gated Routing](../patterns/confidence-routing.md)for choosing thresholds and matching them to the risk of each action.Decomposition does not require more round trips. Questions over the same state run in parallel.

## Putting it all together

This support-ticket workflow keeps deterministic work in code, sends only relevant structured context, evaluates many atomic questions in one request, and composes the answers with explicit confidence gates.triage_ticket.py```
from typesafe_sdk import Choice, Noul, NoulCriteria, Score, TypeSafeClient

def triage_ticket(ticket, customer):
 # Handle deterministic states without calling a model.

 if ticket["status"] == "closed":
 return "no_action"

 open_orders = [
 order for order in customer["orders"] if order["status"] != "delivered"
 ]

 # Include only the structured context needed by the questions below.

 state = {
 "ticket": {
 "message": ticket["message"],
 "sender": ticket["sender"],
 "links": ticket["links"],
 },
 "customer": {
 "plan": customer["plan"],
 "open_orders": open_orders,
 },
 "policy": {
 "sensitive_credentials": ["password", "security code", "API key"],
 },
 }

 # Ask structured, atomic questions together so they run in parallel.

 questions = {
 "topic": Choice(
 instructions={
 "question": "Which team should handle `ticket.message`?",
 "focus": "Classify the customer's primary request.",
 },
 criteria={
 "billing": {
 "what": "Charges, invoices, refunds, or subscriptions",
 "not_for": "Order tracking or account access",
 "examples": ["I was charged twice", "Where is my refund?"],
 },
 "orders": {
 "what": "Order status, delivery, cancellation, or returns",
 "not_for": "Charges or account access",
 "examples": ["Where is my order?", "Cancel my shipment"],
 },
 "account": {
 "what": "Login, profile, permissions, or security",
 "not_for": "Charges or order tracking",
 "examples": ["Reset my password", "I cannot sign in"],
 },
 },
 ),
 "requests_credentials": Noul(
 instructions={
 "question": "Does the message request a sensitive credential?",
 "compare": [
 "`ticket.message`",
 "`policy.sensitive_credentials`",
 ],
 "focus": "Look for a request to disclose the credential itself.",
 },
 criteria=NoulCriteria(
 true={
 "what": "Asks the recipient to disclose a listed credential",
 "examples": [
 "Reply with your password",
 "Send us your API key",
 ],
 },
 false={
 "what": "Does not ask the recipient to disclose a credential",
 "not_for": "A legitimate instruction to reset a credential",
 "examples": ["Use this link to reset your password"],
 },
 ),
 ),
 "sender_identity_mismatch": Noul(
 instructions={
 "question": "Does the claimed sender identity conflict with its domain?",
 "compare": [
 "`ticket.sender.display_name`",
 "`ticket.sender.email`",
 ],
 "focus": "Compare the named organization with the email domain.",
 },
 criteria=NoulCriteria(
 true={
 "what": "Claims an organization unrelated to the email domain",
 "examples": ["Acme Payroll sent from claim-bonus.example"],
 },
 false={
 "what": "The identity and domain agree or make no conflicting claim",
 "examples": ["Acme Payroll sent from acme.example"],
 },
 ),
 ),
 "unexpected_reward": Noul(
 instructions={
 "question": "Does the message announce an unexpected reward?",
 "inspect": "`ticket.message`",
 "focus": "Look for an unsolicited prize, payment, or reward claim.",
 },
 criteria=NoulCriteria(
 true={
 "what": "Announces an unrequested prize, payment, or reward",
 "examples": ["You were selected for a $1,000 bonus"],
 },
 false={
 "what": "Contains no reward claim or discusses an expected payment",
 "not_for": "A customer asking about a known refund or payroll deposit",
 "examples": ["When will my approved refund arrive?"],
 },
 ),
 ),
 "refund_requested": Noul(
 instructions={
 "question": "Does the customer explicitly request a refund or credit?",
 "inspect": "`ticket.message`",
 "focus": "Require a requested remedy, not a billing complaint alone.",
 },
 criteria=NoulCriteria(
 true={
 "what": "Directly asks for money back or an account credit",
 "examples": ["Please refund the duplicate charge"],
 },
 false={
 "what": "Does not ask for a refund or credit",
 "not_for": "A complaint or billing question without a requested remedy",
 "examples": ["Why was I charged twice?"],
 },
 ),
 ),
 "mentions_open_order": Noul(
 instructions={
 "question": "Does the message refer to a supplied open order?",
 "compare": [
 "`ticket.message`",
 "`customer.open_orders`",
 ],
 "focus": "Match an order id or other identifying details.",
 },
 criteria=NoulCriteria(
 true={
 "what": "Refers to an open order by id or identifying details",
 "examples": ["Where is order A-104?"],
 },
 false={
 "what": "Does not identify any supplied open order",
 "not_for": "A generic order question with no matching details",
 "examples": ["How long does shipping usually take?"],
 },
 ),
 ),
 "frustration": Score(
 instructions={
 "question": "How frustrated does the customer appear?",
 "inspect": "`ticket.message`",
 "focus": "Judge expressed frustration, not issue severity.",
 },
 criteria=[
 {
 "what": "Calm and matter-of-fact",
 "signals": ["Neutral wording", "No complaint about the experience"],
 },
 {
 "what": "Frustrated but civil",
 "signals": ["Expresses annoyance", "Remains constructive"],
 },
 {
 "what": "Very angry or threatening to leave",
 "signals": ["Hostile language", "Threatens cancellation or churn"],
 },
 ],
 ),
 }

 with TypeSafeClient() as client:
 response = client.system_one(
 state=state,
 questions=questions,
 )

 # Compose independent spam signals with weights controlled by code.

 answers = response.answers
 spam_risk = (
 0.45 * answers["requests_credentials"].noul
 + 0.30 * answers["sender_identity_mismatch"].noul
 + 0.25 * answers["unexpected_reward"].noul
 )

 # Escalate uncertain judgments instead of guessing.

 spam_is_uncertain = 0.4 < spam_risk < 0.6
 if spam_is_uncertain or answers["topic"].confidence < 0.75:
 return route_to_human_review(ticket)
 if spam_risk >= 0.6:
 return quarantine_as_spam(ticket)

 # Let code decide which speculative answers matter on this path.

 if answers["topic"].choice == "billing":
 return route_to_billing(
 ticket,
 refund_requested=answers["refund_requested"].noul >= 0.7,
 )
 if answers["topic"].choice == "orders":
 return route_to_orders(
 ticket,
 mentions_open_order=answers["mentions_open_order"].noul >= 0.7,
 )

 priority = (
 "high"
 if answers["frustration"].confidence >= 0.7
 and answers["frustration"].score >= 1.5
 else "normal"
 )
 return route_to_account_support(ticket, priority=priority)
```
