# Sources

Every URL opened for this survey, the commit that was read, and the local path when one exists. GitHub metadata came from `gh api repos/<owner>/<repo>` (size, default branch, `pushed_at`, license). Commits for cloned repos are `git rev-parse HEAD`. Each of those HEADs was checked against `gh api repos/<owner>/<repo>/commits/HEAD` and matched.

Parent clones are under `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/`. Clones made for this survey are under `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/`.

`originals/` was not written. No second clone was made when `.git` was already there.

## Pages

| URL | What was read | Commit |
| --- | --- | --- |
| https://me.jonymusky.com/blog/jev-system-one-browser-qa | Full fetched HTML. Names `jonymusky/jev-browser-qa` and `wy-coliney/jev-browser-use`. | n/a |
| https://jarbon.substack.com/p/i-put-jev-in-a-playwright-browser | Free portion only. No repository link. Remainder is paywalled. | n/a |
| https://cdn.jsdelivr.net/npm/@typesafe-ai/sdk@0.6.0/package.json | Package metadata. | published 0.6.0 |
| https://cdn.jsdelivr.net/npm/@typesafe-ai/sdk@0.6.0/dist/index.mjs | `TypeSafeClient` default `baseURL` and `POST /v1/systemone`. Saved only as a fetch, not as a project tree. | published 0.6.0 |

## Parent clones

| GitHub | Commit | Pushed | Local path |
| --- | --- | --- | --- |
| https://github.com/jonymusky/jev-browser-qa | `ca6d5a2d46623f9f8606aabc10f1143afd070090` | 2026-09-19T20:39:17Z | `.../originals/github/jonymusky--jev-browser-qa` |
| https://github.com/vinilana/jev-browser | `7d608732aa586465dc612c1d54c8b83b6ddc7625` | 2026-09-17T05:42:50Z | `.../originals/github/vinilana--jev-browser` |
| https://github.com/ElshinQ/jevaluate | `9f1b9272a9ac797fae6bfba54d141d2953a62991` | 2026-09-19T15:15:25Z | `.../originals/github/ElshinQ--jevaluate` |
| https://github.com/KiritoKing/midscene-jev-runner | `f07d22fd682697e874faf2f5a062d30272b92900` | 2026-09-24T07:34:55Z | `.../originals/github/KiritoKing--midscene-jev-runner` |
| https://github.com/browser-use/jev-ultrafast | `1231850a0bf1a0c0341fe408ef1668dbbfdfac46` | 2026-09-30T01:24:38Z | `.../originals/github/browser-use--jev-ultrafast` |
| https://github.com/PenglongHuang/jev-demo | `def34f2c3c996554d05a124fcdd67acad9ff41fa` | 2026-09-30T02:10:57Z | `.../originals/github/PenglongHuang--jev-demo` |
| https://github.com/devagrawal09/jev-review | `31f89602797fb7bea007f8a480bf368bf564954e` | 2026-09-17T00:29:25Z | `.../originals/github/devagrawal09--jev-review` |
| https://github.com/vinilana/jev-eval-agent | `037de1120c84b4b63cdf748e2acf258ff66d7731` | 2026-09-17T11:07:31Z | `.../originals/github/vinilana--jev-eval-agent` |
| https://github.com/sugarforever/tryjev | `52770fc2166b929ede98c6a1599cc03dea33af9c` | 2026-09-25T19:24:01Z | `.../originals/github/sugarforever--tryjev` |
| https://github.com/terryds/jevplayground | `02c20a09b37cca2fbdd586394f2bee82db6a5dae` | 2026-09-19T09:52:17Z | `.../originals/github/terryds--jevplayground` |
| https://github.com/TypeSafeAI/typesafe-playground | `0fbc9ef9d99157a2f86631fa3b385ef88ca79a10` | 2026-10-01T17:56:41Z | `.../originals/github/TypeSafeAI--typesafe-playground` |
| https://github.com/TypeSafeAI/jev-harness | `1239b23052b701e690727755cf17ea90c92654ff` | 2026-10-01T23:21:58Z | `.../originals/github/TypeSafeAI--jev-harness` |
| https://github.com/adyoi/jev-system-one-playground | `b133e6b41fbc0638cfb11f413cd6544f7b1cf1e2` | 2026-09-24T08:33:07Z | `.../originals/github/adyoi--jev-system-one-playground` |
| https://github.com/comoc/jev-minesweeper | `5cbc361b1260cdfef6e9383639797bf483c064e0` | 2026-09-20T12:50:17Z | `.../originals/github/comoc--jev-minesweeper` |

Files opened in those trees include `src/jev/client.ts`, `src/jev/judge.ts`, `src/jev/pick.ts`, `src/jevReporter.ts`, `scripts/dashboard.ts`, `dashboard/index.html`, `src/infrastructure/models/jev.ts`, `src/infrastructure/reporting/html.ts`, `scripts/jev.mjs`, `scripts/browser-loop.mjs`, `scripts/judge-lines.mjs`, `scripts/tree-test.mjs`, `scripts/walk.mjs`, `src/decision.ts`, `src/runner.ts`, `src/constants.ts`, `src/utils.ts`, `jev_ultrafast/model.py`, `jev_ultrafast/questions.py`, `jev_ultrafast/demo.py`, `jev_ultrafast/static/index.html`, `jev_ultrafast/static/app.js`, `public/js/output.js`, `src/dashboard/public/app.js`, `src/review/judgments.ts`, `agent/lib/jev-router.ts`, `eval-ui/charts.js`, `src/lib/server/providers.ts`, `public/index.html` (terryds), `lib/serverJev.ts`, `examples/host/jev-choice.ts`, `Program.cs`, `server.mjs` (minesweeper). Package files and READMEs were opened where the survey cites a script or a door.

## Trees cloned for this survey

| GitHub | Commit | Pushed | Local path |
| --- | --- | --- | --- |
| https://github.com/mizchi/jev-test-filter | `955bdf4e20ff49c3dac0b5b3eee5df0278d5be87` | 2026-09-24T12:11:22Z | `.../trees/mizchi--jev-test-filter` |
| https://github.com/moritzkremb/jev-voice-browser | `198a0764395a666f8398026c0d8abdaf6d1866c5` | 2026-09-21T08:57:55Z | `.../trees/moritzkremb--jev-voice-browser` |
| https://github.com/romaluev/jev-ego | `12eaafe795db56da821d9268ee7b9ae9ea24b23b` | 2026-09-17T14:35:29Z | `.../trees/romaluev--jev-ego` |
| https://github.com/xpressabhi/jev-browser | `740f1800d61717cdb9eaab66c39799283c905342` | 2026-09-20T17:20:04Z | `.../trees/xpressabhi--jev-browser` |
| https://github.com/Ying-Kai-Liao/jev-browser | `b8c9e7f862ade1a112bd5d6544ba8e0c7dcbeb36` | 2026-10-02T06:44:03Z | `.../trees/Ying-Kai-Liao--jev-browser` |
| https://github.com/cooper667/jev-playwright | `5c99a71dc2dd0b9e1ef945603eec4af1f9c0ca17` | 2026-09-30T07:49:56Z | `.../trees/cooper667--jev-playwright` |
| https://github.com/arthurfiorette/jev-playwright | `96bdcc6bdf2dd0a9194c302e84eb6c87abb4f398` | 2026-10-01T21:49:44Z | `.../trees/arthurfiorette--jev-playwright` |
| https://github.com/tontoko/jev-browser | `94f8814fd9af914749c00b8b91192d307ffbb35d` | 2026-10-01T11:39:54Z | `.../trees/tontoko--jev-browser` |
| https://github.com/krw82/jev-playwright-mcp | `db7762fd2ef66af7b38362c98982692bc81f57b7` | 2026-09-17T09:18:17Z | `.../trees/krw82--jev-playwright-mcp` |
| https://github.com/yukurash/jev-playwright-repair-lab | `500aabc76805554e8fa3aa19c1deb31abaa41c3e` | 2026-09-25T08:46:40Z | `.../trees/yukurash--jev-playwright-repair-lab` |
| https://github.com/srirsatt/jev-uicheck-fast | `2e0ad04e879f18ddcc5916afed2974eb09b093f9` | 2026-09-30T01:06:43Z | `.../trees/srirsatt--jev-uicheck-fast` |
| https://github.com/dingw530/playwright-jev | `15bd5a44d8517ce75bd303c53ba66ec3d8afdca6` | 2026-09-23T01:37:13Z | `.../trees/dingw530--playwright-jev` |
| https://github.com/zbcoding/jev-userflow-browser-monitor | `e061366933c6d34dd4a79564d5f5d4bc4988b284` | 2026-09-22T20:56:14Z | `.../trees/zbcoding--jev-userflow-browser-monitor` |
| https://github.com/davidkotler/jev-browser-tests | `ed532e1070fff55ccd58ae9e0f8184ca29e36943` | 2026-09-22T03:45:49Z | `.../trees/davidkotler--jev-browser-tests` |
| https://github.com/Faresabdelghany/jev-browser-test | `28a550694dfb79acff962736819ac4e48cc5c678` | 2026-09-24T13:41:55Z | `.../trees/Faresabdelghany--jev-browser-test` |
| https://github.com/wy-coliney/jev-browser-use | `cf7e76607d4ec70592b24becadd0296dcda8177a` | 2026-09-23T04:01:55Z | `.../trees/wy-coliney--jev-browser-use` |

## Read through the GitHub API, not cloned

GitHub `size` is over 50000 for both. No full clone.

| URL | Commit | Files read |
| --- | --- | --- |
| https://github.com/Kevin-Liu-01/Relay | `46cc77af7ff88b8d0191e9d35ea1f85ef94484bc` | README, `package.json`, `LICENSE`, `docs/system-one.md`, `runner/typesafe.mjs`. Code search also hit `src/live/main.jsx` and `tests/hosted.test.mjs`. Those two were not fetched in full. |
| https://github.com/reticlehq/reticle | `4a6317f9155e31e5e55d718c42718c66c225fd3b` | README, `LICENSE`, `server/src/features/harness/jev-driver.ts`. Code search also hit `bench/harness/jev.mjs`, `bench/JEV-SCORECARD.md`, and `server/src/features/harness/jev-driver.test.ts`. `engine/src/evidence/verified.ts` was named by a comment and was not opened. |

API content URLs used:

- https://api.github.com/repos/Kevin-Liu-01/Relay/contents/runner/typesafe.mjs
- https://api.github.com/repos/Kevin-Liu-01/Relay/contents/docs/system-one.md
- https://api.github.com/repos/Kevin-Liu-01/Relay/readme
- https://api.github.com/repos/Kevin-Liu-01/Relay/contents/package.json
- https://api.github.com/repos/reticlehq/reticle/contents/server/src/features/harness/jev-driver.ts
- https://api.github.com/repos/reticlehq/reticle/readme
- https://api.github.com/repos/reticlehq/reticle/contents/LICENSE

## Search URLs that were not then opened as trees

`gh search repos "jev playwright"` returned the extra repos that were cloned. `gh search repos jev --owner mizchi` returned `mizchi/jev-test-filter` (cloned), plus `mizchi/jev-lint`, `mizchi/jev-playground`, `mizchi/jev-lexer`, `mizchi/jev-gomoku`, `mizchi/jev-playground-moba`, `mizchi/jev-persona-memory`, and `mizchi/awesome-jev`. Only `jev-test-filter` was cloned. `gh search code` on `reticlehq/reticle` and `Kevin-Liu-01/Relay` was used to find the files listed above.
