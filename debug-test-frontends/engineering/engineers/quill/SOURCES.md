# Sources

Commits are `git rev-parse HEAD` on the tree that was read, except where the note says GitHub API only. `pushed_at` is from `GET /repos/{owner}/{repo}` on 2026-10-02. A clone with `.git` under `originals/github/` was not cloned again. Shallow clones for this survey are under `engineers/quill/trees/`.

## Parent clones read

| URL | Commit | Local path |
| --- | --- | --- |
| https://github.com/sugarforever/tryjev | `52770fc2166b929ede98c6a1599cc03dea33af9c` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/sugarforever--tryjev` |
| https://github.com/little-planet-labs/jev-playground | `418b723779569b1cb1f21a4f7f34c546d44c7e34` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/little-planet-labs--jev-playground` |
| https://github.com/terryds/jevplayground | `02c20a09b37cca2fbdd586394f2bee82db6a5dae` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/terryds--jevplayground` |
| https://github.com/PenglongHuang/jev-demo | `def34f2c3c996554d05a124fcdd67acad9ff41fa` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/PenglongHuang--jev-demo` |
| https://github.com/adyoi/jev-system-one-playground | `b133e6b41fbc0638cfb11f413cd6544f7b1cf1e2` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/adyoi--jev-system-one-playground` |
| https://github.com/TypeSafeAI/typesafe-ui | `61e5e9e30face27cf03da0035c79cde408240cca` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/TypeSafeAI--typesafe-ui` |
| https://github.com/TypeSafeAI/typesafe-playground | `0fbc9ef9d99157a2f86631fa3b385ef88ca79a10` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/TypeSafeAI--typesafe-playground` |
| https://github.com/nickthompson480/typesafe-ai-playground | `8ee3d0b36d0c2dd46987131f0b7b14c084d81e65` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/nickthompson480--typesafe-ai-playground` |
| https://github.com/comoc/jev-minesweeper | `5cbc361b1260cdfef6e9383639797bf483c064e0` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/comoc--jev-minesweeper` |
| https://github.com/DeepBlueDynamics/typesafe-arena | `c057cfbb892a0b39d7c882fc591be0b4285e8d9e` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/DeepBlueDynamics--typesafe-arena` |

Each of those SHAs matched `GET /repos/{owner}/{repo}/commits/{default_branch}` except that the comparison was equality of the tip SHA, not a second clone.

## Trees cloned for this survey

| URL | Commit | Local path |
| --- | --- | --- |
| https://github.com/saimahmedqazi/typesafe-jev-playground | `b6e6e316d0967a49bce07f61aa5c4292e785605f` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/saimahmedqazi--typesafe-jev-playground` |
| https://github.com/luongnv89/system1 | `872e2d086626dd55da063b7c6685418d7db59b30` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/luongnv89--system1` |
| https://github.com/wagnerjt/jev-playground | `2d09ec1c1e504f7ec4386a2b9d4edc5fe6069dbc` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/wagnerjt--jev-playground` |
| https://github.com/mariusandra/jev.st | `0eaf0e6bad5288882f85393006bc05c6714d0b0e` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/mariusandra--jev.st` |
| https://github.com/nwadmark/jev-decision-lab | `7a9b59742c08bb059704fdc6eb1632f545841973` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/nwadmark--jev-decision-lab` |
| https://github.com/kerryback/jev | `ad1927242eb8d9bc1b7f9c08c4b47905d058f488` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/kerryback--jev` |
| https://github.com/zeke/jev | `8c2907406b60486f4eb9b384e700e912e5b4170a` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/zeke--jev` |
| https://github.com/Ahmar004/jev-playground | `961141bfdbfa05932678406f03189daecb1ccd07` | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/Ahmar004--jev-playground` |

## Read from GitHub without a clone

| URL | Commit or note | What was read |
| --- | --- | --- |
| https://github.com/ihatecoding01/Simple-Jev | `9578fcdc9b34f3a7d63e03faf8f1f42b45ebcb7e` | Raw `frontend/src/services/api.ts`, `frontend/src/components/DecisionCard.tsx`, and a pattern search of `frontend/src/app/playground/page.tsx`. Code search for `systemone` returned no hits. |
| https://github.com/markjaquith/typesafe-ai-playground | API only, not a SHA in this note | README via the contents API. |
| https://github.com/kavehmz/typesafe-playground | API only | README via the contents API. Size 28156. |
| https://github.com/blck-snwmn/playground-jev | API only | README via the contents API. |
| https://github.com/JYeswak/jev_playground | API only | README via the contents API. Size 64084, not cloned. |
| https://github.com/jleifeld/maclaya | API only | README via the contents API. |
| https://registry.npmjs.org/@typesafe-ai/sdk/-/sdk-0.6.0.tgz | package version 0.6.0, not a git commit | `package/dist/index.mjs` default `baseURL` and `POST /v1/systemone`. Temp extract was not kept. Repository field on the package: `git+https://github.com/typesafe-ai/typesafe-sdk-js.git`. |

GitHub searches used, not a single commit:

- Repository search `jev playground` (161 hits, first page opened in the tool result).
- Repository search for playground / system one / inspector (first page; mostly unrelated).
- Code search `systemone` in `Ahmar004/jev-playground` and in `ihatecoding01/Simple-Jev`.

## Pages

| URL | How | Result used |
| --- | --- | --- |
| https://www.tryjev.xyz/ | fetch | Rendered editor text. State, questions, response column. |
| https://jevplayground.terrydjony.com/ | fetch | Rendered editor. Vercel key step, Remember, presets. |
| https://jev-xyz.com/en/try | fetch | Fixed questions, server-side key, documented official POST shape. |
| https://jevtypesafeai.com/jev/playground | fetch | Unofficial door note. `POST https://jevtypesafeai.com/api/v1/decide` and a mention of the official systemone URL. |
| https://jevlibrary.dev/resources/playground | curl was a shell; browser render after that | "Open resource" href is `https://console.typesafe.ai/playground`. |
| https://jevlibrary.dev/categories/demos | browser render | First screen of 101 "Demos & playgrounds". Search box did not filter from script. |
| https://jevlibrary.dev/resources | fetch, earlier | Category index snippet. Not the full list. |
| https://jevhunt.com/categories/demos | fetch | First page of "Demos & Playgrounds". |
| https://jevhunt.com/ | fetch | Directory home, not the category. |
| https://console.typesafe.ai/playground | fetch | Body was "Just a moment...". Not logged in. |

Files inside the clones that the grades cite are listed in `PLAYGROUNDS.md`. They were opened from the local paths above.
