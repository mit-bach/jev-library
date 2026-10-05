
## jeiel85/jevscope commit=d39ab43e88af20be7142b4335c84fbf69c740e0e license=MIT size=209 branch=main pushed=2026-09-18T15:29:27Z
- FILE apps/studio/src/App.tsx bytes=15905 fixtureish=False
  SYMS: const format = ( | const hash = async ( | function download | function db | function history | const answer = (
  URLS: localhost:4317
  LINE: type RecordItem = { id: string; createdAt: string; projectHash: string; stateHash: string; request: unknown; result?: EvaluationResult; error?: string };
- FILE packages/evaluator/src/workbench.ts bytes=7538 fixtureish=False
  SYMS: export function parseCases | export function checkExpectations | export async function runBatch | function worker | export function summarize | const percentile = (
  LINE: export type Runner = (state: EvaluationCase["state"], project: JevScopeProject, signal?: AbortSignal) => Promise<EvaluationResult>;

## a742987/JevLens commit=ae1ff103d185197bc5a753c8aa21f6420cf1e0eb license=MIT size=125 branch=main pushed=2026-09-26T13:58:23Z
- FILE ui/index.html bytes=24837 fixtureish=True
  SYMS: const esc = ( | const fmt = ( | const nfoul = ( | const shortRun = ( | function confidenceOf | function timeText
  LINE: <title>JevLens — Jev decision timeline</title>
- FILE README.md bytes=11489 fixtureish=True
  URLS: 127.0.0.1:6274 | 127.0.0.1:8787
  LINE: JevLens 是一个本地 MCP 服务器，外加一个查看 [TypeSafe Jev](https://typesafe.ai) 决策的网页面板。它不做决策，不做工具路由，也不碰你 Agent 的上下文。它包住每一次 `systemOne` 调用，把完整的 state、问题、答案、概率分布、置信度与延迟写入一个只追加的 JSONL 文件，并呈现为一条时间线，

## MashiroKai/jev-playground commit=148e4f927d7c9ec83a37492cb65099410143e459 license=MIT size=54 branch=main pushed=2026-09-29T00:14:34Z
- FILE public/index.html bytes=29019 fixtureish=False
  SYMS: function initLang | function fail | function errText | function applyStatic | function addQuestionRow | function refresh
  LINE: <label for="state"><span data-i18n="state.label"></span> <span style="font-weight:400;color:var(--muted)" data-i18n="state.hint"></span></label>

## k3a/jev-playground commit=73eae15d3cbcd11a4a72bae4b147258777934c46 license=None size=504 branch=main pushed=2026-09-28T14:30:44Z
- FILE index.html bytes=28257 fixtureish=False
  SYMS: function renderQuestions | function esc | function updateQuestion | function updateQuestionType | function addQuestion | function clearQuestions
  URLS: /v1/systemone | localhost:8000
  LINE: .question-header select { width: 120px; }

## saimahmedqazi/typesafe-jev-playground commit=b6e6e316d0967a49bce07f61aa5c4292e785605f license=None size=291 branch=main pushed=2026-10-02T07:38:55Z
- FILE src/client/components/ResultInspector.tsx bytes=14759 fixtureish=False
  SYMS: export function ResultInspector | const handleCopyRaw = (
  LINE: const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
- FILE src/server/evaluate.ts bytes=11254 fixtureish=False
  SYMS: export function createEvaluationHandlers | function handleEvaluateRequest | function handleQuestionsListRequest | function handleModelsDiscoveryRequest | const provider = ( | const defaultList = (
  LINE: const { mode, questions, questionId, questionType, state, modelConfig, choices, customQuestionText } = parseResult.data;

## frederico-kluser/jev-playground commit=4edca2814216a7558f600e5ebc731410fffa19e7 license=MIT size=291 branch=main pushed=2026-09-29T00:11:14Z
- FILE components/RequestInspector.tsx bytes=5556 fixtureish=False
  SYMS: export function RequestInspector | function downloadCollection | function CodeShell
  URLS: openrouter.ai/api/alpha/decisions
  LINE: footer={`${body.length.toLocaleString("en-US")} B · POST https://openrouter.ai/api/alpha/decisions`}
- FILE app/page.tsx bytes=11381 fixtureish=False
  SYMS: export default function PlaygroundPage | const body = ( | const body = ( | function onKey
  LINE: const { notify, renderToastStack } = useToasts();

## wagnerjt/jev-playground commit=2d09ec1c1e504f7ec4386a2b9d4edc5fe6069dbc license=MIT size=234 branch=main pushed=2026-09-30T22:37:10Z
- FILE src/components/ResponseVisualizer.tsx bytes=15456 fixtureish=False
  SYMS: export const ResponseVisualizer
  LINE: const [showRaw, setShowRaw] = useState(false);

## nwadmark/jev-decision-lab commit=7a9b59742c08bb059704fdc6eb1632f545841973 license=MIT size=96 branch=main pushed=2026-09-30T05:10:20Z
- FILE app.js bytes=12668 fixtureish=False
  SYMS: function renderTabs | function selectScenario | function updateCounts | function showToast | function copyText
  LINE: state: "A customer assessment covers 28 branch switches. It flags 4 devices as running software versions marked unsupported in the assessment data. There are no active outages, and
- FILE index.html bytes=6317 fixtureish=False
  LINE: <meta name="description" content="A small, practical workbench for designing typed decisions to try in the TypeSafe Jev Playground." />

## MoonStruckHorrors/jev-playground commit=c140a7def67e39f3ce38b4d2ad190b3ec1c45971 license=None size=193 branch=main pushed=2026-09-28T20:15:34Z
- FILE src/App.tsx bytes=20768 fixtureish=False
  SYMS: function uid | function newOption | function newQuestion | function percent | function App | function closeTypeGuide
  LINE: type QuestionType = 'choice' | 'score' | 'noul'

## Laaaaksh/jev-playground commit=9a0d9ba518b611d1b24defefc8e6c3f6ac9708e6 license=MIT size=17 branch=main pushed=2026-09-27T11:45:07Z
- FILE public/app.js bytes=11236 fixtureish=False
  SYMS: function loadKey | function saveKey | function initKeyUI | function addQuestion | function refreshHelp | function linesToObject
  LINE: noul: ["Optional: define yes/no (true: … and false: …)", "Returns the probability that the answer is yes. Leave empty for a plain yes/no."],

## yAntPower/jev-decision-lab commit=b60ce057c70499802ad9d56a92ab78007d183be6 license=MIT size=107 branch=main pushed=2026-09-25T01:38:58Z
- FILE dist/app.js bytes=40070 fixtureish=False
  SYMS: const pretty = ( | const percent = ( | const duration = ( | const describe = ( | const chineseSource = ( | function translateExisting
  URLS: /v1/systemone | api.typesafe.ai
  LINE: try { setLocale(localStorage.getItem("jev-decision-lab-language")); } catch { /* private browsing may deny storage */ }

## shivanathd/jev-playground commit=20574a96ab5ac3d39b945b290ff0daafec5eca39 license=MIT size=93 branch=main pushed=2026-09-19T03:48:55Z
- FILE src/components/Playground.tsx bytes=8351 fixtureish=False
  SYMS: function getKeySnapshot | function getModelSnapshot | function getServerKeySnapshot | function getServerModelSnapshot | export function Playground | function applyExample
  LINE: const [showKey, setShowKey] = useState(false);

## Shoaib-Asghar/jev-probe commit=b14d935b487ecde6959f1d71170548f0d30688ba license=None size=617 branch=main pushed=2026-09-28T18:11:59Z
- FILE src/web/app.py bytes=27574 fixtureish=False
  SYMS: def _build_preview_data | def home | def get_models | def export_run | def run_exploration | def _format_feed_entry
  LINE: for seed_text in spam_uc.seed_states[:6]:

## Tomdachs/jev-replay-lab commit=d59cd353b6e19422c5d16f6be1dc6f74dc224754 license=MIT size=263 branch=main pushed=2026-09-21T00:07:20Z
- FILE src/web/main.tsx bytes=53099 fixtureish=True
  SYMS: const useText = ( | const drafts = ( | function questions | const pct = ( | const number = ( | function download
  URLS: api.typesafe.ai
  LINE: const drafts = (q: Questions): Draft[] =>

## andududu/jeview commit=495a4e43e9d67e495a66ab0d9e55ac1c5c4040d6 license=MIT size=873 branch=main pushed=2026-09-21T21:52:51Z
- FILE ui/app.js bytes=96484 fixtureish=True
  SYMS: function h | const human = ( | const kindOf = ( | const plainQuestion = ( | const clip = ( | const questionOf = (
  URLS: /v1/systemone
  LINE: /** A question in plain words: `company_guidance` reads as "company guidance", `rows[0].text` as "rows 1 text". */

## dayhaysoos/jevals commit=af6fecc0776dd5d97d5dc89fc0a72cae5e3e2580 license=MIT size=362 branch=main pushed=2026-09-18T14:51:10Z
- FILE index.html bytes=308 fixtureish=False
- FILE bin/jevals.js bytes=3627 fixtureish=False
  SYMS: export function checkNode | export function options | function main

## TYC-000/jev-dashboard commit=65014cc8a665698d10ccf7ba1941ee1b0d596b96 license=None size=7 branch=main pushed=2026-09-25T07:42:32Z
- FILE jev_dashboard.py bytes=8012 fixtureish=False
  SYMS: def resolve_data_path | def load_entries
  LINE: """Jev API Usage Dashboard — Streamlit app.

## davila7/jev-explained commit=5cbe35e04609112be77b1bd447bd79b3bde7980b license=MIT size=1180 branch=main pushed=2026-09-20T16:53:26Z
- FILE src/components/Workbench.tsx bytes=9224 fixtureish=False
  SYMS: export function Workbench | const onKey = ( | function QuestionCriteria | function ViewButton | function CompactQuestions
  LINE: const TYPE_STYLES: Record<Question["type"], string> = {

## Codercise/jev-in-practice commit=02be666a30ad39d4e9000199f7e8e2c612abfb4f license=MIT size=307 branch=main pushed=2026-09-21T17:48:48Z
- FILE src/App.tsx bytes=10274 fixtureish=False
  SYMS: export default function App | function loadPreset | function runEvaluation | const body = ( | function parseJson | function parseQuestions
  LINE: const [activeId, setActiveId] = useState(examples[0].id)

## Dillettant/jev-test commit=110c2051ec10ee48ac6aebeb63ee66db59c586b2 license=None size=70 branch=main pushed=2026-09-19T17:59:46Z
- FILE src/components/Playground.tsx bytes=10443 fixtureish=False
  SYMS: export function Playground | const onKey = ( | const loadPreset = ( | const addQuestion = ( | const instructionsFor = (
  URLS: /v1/systemone | api.typesafe.ai
  LINE: const [presetIdx, setPresetIdx] = useState(0);

## sohithk10/jev-trace-evaluator commit=3b06ba5edd103d86f560d4afd092b50e56575026 license=None size=161 branch=main pushed=2026-10-01T00:09:58Z
- FILE src/jev_eval/web.py bytes=4268 fixtureish=True
  SYMS: def audit | def make_server | class Handler | def log_message | def send | def valid_host
  LINE: """Loopback-only, offline trace review UI."""
- FILE src/jev_eval/judge.py bytes=964 fixtureish=False
  SYMS: class JevJudge | def __init__ | def __call__
  URLS: api.typesafe.ai
  LINE: """Opt-in TypeSafe integration. No trace tools are executed."""

## Chandler-Sun/chat2jev commit=fef7b1f734ad272477d0f71894c74c0d03cb306d license=MIT size=2145 branch=main pushed=2026-09-23T02:45:29Z
- FILE src/components/playground.tsx bytes=31310 fixtureish=False
  SYMS: export function Playground | function convert | function applyConversion | function loadSample | function applySample | function blankState
  LINE: const [ready, setReady] = useState(false);

## kierandotai/jev-scout commit=81b1b9d9ebe84c01b8786fb4c391bbab401017ac license=None size=240 branch=main pushed=2026-09-21T14:28:23Z
- FILE src/dashboard.ts bytes=10162 fixtureish=False
  SYMS: export async function startDashboard | function buildSummary | function safeWrite | function onLedgerEvent | function logRequest | function hostIsValid
  LINE: const DASHBOARD_HTML_PATH = path.join(__dirname, "dashboard.html");

## ado11231/jevqa commit=1490a1f3ba89eae3cef7fbe59cadda2470a0d37a license=None size=458 branch=main pushed=2026-10-01T03:22:01Z
- FILE packages/ui/src/App.tsx bytes=6605 fixtureish=False
  SYMS: export function App | const onSelect = ( | function RunMessage
  LINE: const [clicked, setClicked] = useState<{ runId: string | null; stepIndex: number } | null>(null);
- FILE packages/server/src/report.ts bytes=3169 fixtureish=False
  SYMS: export const REPORT_FILE_NAME | export async function buildReport | export async function writeReport | function readFrames | function safeInScript

## Nainish-Rai/jev-frontend-qa commit=5ca1988eadc9b66dee0b34d791560e1049ab54cc license=MIT size=811 branch=main pushed=2026-09-28T12:45:09Z
- FILE src/jev_frontend_qa/demo_static/index.html bytes=4271 fixtureish=False
  LINE: <p id="list-empty" class="empty-state" hidden>

## openlayer-ai/jevals commit=0a8f895a0428b89c865f953d5295b6b516e4018c license=MIT size=422 branch=main pushed=2026-10-01T16:48:21Z
- FILE src/jevals/_eval.py bytes=9443 fixtureish=False
  SYMS: class and | class Result | def __bool__ | def __str__ | def _snake | class Eval
  LINE: An eval is three functions of a sample: state(), questions(), reduce().

## jgridifier/jev-research-eval commit=6a4e9bbd9454cc96300ee3724ac613bc52d21351 license=NOASSERTION size=133 branch=main pushed=2026-09-17T14:43:56Z
- FILE scripts/generate_report_v4.py bytes=25915 fixtureish=True
  SYMS: def esc | def fmt_int | def by_id | def outcome_bar_svg | def timing_svg | def table_rows
  URLS: Cloudflare
  LINE: def render(qc: dict, *, date_label: str = "17 Sep 2026") -> str:

## 4esv/jev-eval commit=4050562fe17f783479c2f58ee8cbc345fab6fada license=None size=4227 branch=main pushed=2026-09-23T18:03:53Z
- FILE evaljev/report.py bytes=9631 fixtureish=False
  SYMS: def models | def label | def latest | def summarize | def determinism | def plots
  LINE: ax.set(title=task, xlabel="stated confidence", xlim=(0, 1.02), ylim=(0, 1.02))
- FILE evaljev/serve.py bytes=2118 fixtureish=False
  SYMS: class Request | def as_text | def models | def systemone
  URLS: /v1/systemone
  LINE: POST /v1/systemone takes {"state": ..., "questions": {...}} and returns {"answers": {...}, "usage": {...}}.

## butada/draft-jev-evaluator commit=1c6433d6bc35f2fa68e8af0d80802f4f3422bfef license=MIT size=1714 branch=main pushed=2026-09-27T00:46:33Z
- FILE frontend/index.html bytes=3988 fixtureish=False
- FILE backend/app.py bytes=16958 fixtureish=False
  SYMS: def generation_parameters | class GenerationFailure | def __init__ | class GenerateInput | def nonblank | class EvaluateInput
  URLS: openrouter.ai/api/v1/models | openrouter.ai/api/{path}
  LINE: QUESTIONS = json.loads((ROOT / "questions.json").read_text())

## jleifeld/maclaya commit=351e045a1967007920a4590f258fff3664223205 license=Apache-2.0 size=633 branch=main pushed=2026-09-29T08:15:24Z
- FILE web/src/pages/Playground.tsx bytes=21101 fixtureish=False
  SYMS: const pretty = ( | function parseJsonText | function RowButtons | function move | function QuestionEditor | const set = (
  LINE: state: 'I was billed twice this month. Please refund the duplicate charge as soon as possible.',
- FILE web/src/pages/Dashboard.tsx bytes=5543 fixtureish=False
  SYMS: export function Dashboard | function bucketName
  LINE: const [range, setRange] = usePersistentState<Range>('dashboard-range', '1h');

## thijmenkam/jev-benchmarks commit=980be52a890b14867699f83342347dd574af6ab0 license=None size=83 branch=main pushed=2026-09-18T07:27:28Z
- FILE jev_bench/report.py bytes=6092 fixtureish=True
  SYMS: def _fmt | def _pct | def _ms | def build_report
  LINE: lines.append("### Accuracy by task (primary decisions)")
- FILE jev_bench/clients/typesafe.py bytes=3175 fixtureish=True
  SYMS: class TypeSafeClient | def __init__ | def display_name | def timed_evaluate | def evaluate | def in
  LINE: def timed_evaluate(self, state, questions, label=None, call_seed=0):

## hugo-alves/jev-router-playground commit=c2eb6ccf68b793d4ad99fb0ff1cc29edf11d9a93 license=MIT size=259 branch=main pushed=2026-09-18T01:25:54Z
- FILE app.js bytes=49101 fixtureish=False
  SYMS: function loadPool | function savePool | function loadSettings | function saveSettings | function loadSecret | function saveSecret
  URLS: /v1/systemone | api.typesafe.ai | openrouter.ai/api/v1
  LINE: Vanilla JS, no build step. State + render + API calls.

## molis-ai/jev-workbench commit=75aeda4d92588b80ddfdcac527011ec14f197c3e license=MIT size=2428 branch=main pushed=2026-09-22T14:42:37Z
- FILE apps/web/src/main.tsx bytes=15997 fixtureish=False
  SYMS: function readTheme | function useTheme | function App | function Workspace | const functions = ( | function update
  LINE: const [theme, setThemeState] = useState<Theme>(readTheme);

## YUUM321/jev-klondike-benchmark commit=7b3eb45519f45258dacec94d57a2e76e9b23aae2 license=MIT size=134 branch=main pushed=2026-09-25T10:07:42Z
- FILE web/app.js bytes=28574 fixtureish=False
  SYMS: function parseCard | function makeCard | function renderPileSlot | function renderWaste | function countFoundation | function renderBoard
  LINE: "states-metric", "foundation-peak-metric", "reveal-age-metric",
- FILE benchmark/replay.py bytes=1788 fixtureish=False
  SYMS: def load_records | def main
  LINE: parser.add_argument("log", type=Path, help="path to decisions.jsonl")

## goodboybeau/system-one-playground commit=304c528f1e83ca4412f99a9d5943688929404c3a license=MIT size=2889 branch=main pushed=2026-09-27T22:43:17Z
- FILE ui/src/pages/Playground.tsx bytes=19679 fixtureish=False
  SYMS: function useDemos | export function PlaygroundPage | const setEditor = ( | function run | const on = ( | function loadPreset
  URLS: /v1/systemone
  LINE: const [demos, setDemos] = useState<D.Demos>(() => D.load(window.localStorage));

## BrendanH18/jev_fsd commit=bbc9012331dfb175a555c76c50487467ce93fb40 license=MIT size=6838 branch=main pushed=2026-10-01T03:09:47Z
- FILE static/js/ui/drive-report.js bytes=5969 fixtureish=True
  SYMS: export class DriveReport
  LINE: : h("p", { class: "empty-state" }, "Your first drive starts with a destination. Finish it to see your report here."));
- FILE static/index.html bytes=18670 fixtureish=False
  LINE: <strong>Estate wagon</strong><span>Longer wheelbase. Everyday utility.</span>

## getainode/jebadiah commit=cc904344061e4ee71d2cb8297eafd2ce1c798f99 license=Apache-2.0 size=1317 branch=main pushed=2026-09-29T19:10:27Z
- FILE server/src/jebadiah_server/app.py bytes=15689 fixtureish=False
  SYMS: def error | def unprocessable | def bad_request | def unavailable | def short_name | def decision_entry
  URLS: /v1/systemone
  LINE: prompt is the model repository's renderer, so a request answered here and the same request

## ali-master/usejev commit=89e6b80fcc5e18bbf690c0af38b9e0c054d4ec3d license=None size=589 branch=master pushed=2026-09-30T12:40:23Z
- FILE playground/index.html bytes=865 fixtureish=False
  LINE: content="A hands-on playground for Laya. Explore sixteen real decision-model demos, edit inputs, and inspect probabilities."/>

## Hangzhi/diffusion-jev-sglang commit=a6dce88a2fc9c11b1df44d03033f1ebafd75c504 license=MIT size=15858 branch=main pushed=2026-09-23T17:15:58Z
- FILE scripts/render_emoji_report.py bytes=14129 fixtureish=True
  SYMS: def read | def percent | def main | def overview_row | class recall | class balancing
  LINE: """Render completed emoji benchmark artifacts: uvx --with matplotlib python scripts/render_emoji_report.py."""
- FILE scripts/render_gemma_report.py bytes=3596 fixtureish=False
  LINE: """Render completed Gemma benchmarks: uvx --with matplotlib python scripts/render_gemma_report.py."""

## Heman10x-NGU/Verdict-open-jev commit=30f15564821626ca5c1ad5b2638c4eb7078787dd license=NOASSERTION size=8031 branch=main pushed=2026-09-28T00:30:31Z
- FILE webgpu-demo/index.html bytes=49318 fixtureish=False
  SYMS: function escapeHtml | function resetEvaluationState | function renderCandidates | function loadPreset | function showCopyFeedback | function flashReceiptHint
  LINE: <title>Verdict Decision Engine • 151M ModernBERT (WebGPU / WASM)</title>

## little-planet-labs/jev-playground commit=418b723779569b1cb1f21a4f7f34c546d44c7e34 license=None size=447 branch=main pushed=2026-09-17T13:56:22Z
- FILE src/app/page.tsx bytes=14808 fixtureish=False
  SYMS: export default function PlaygroundPage | const onKey = ( | const addQuestion = ( | const loadSample = (
  LINE: const [draft, setDraft] = useState<Draft>(initialDraft);

## cephalization/jev-triage commit=b11928eb5856a16fef722d51caff43990c123b78 license=MIT size=1503 branch=main pushed=2026-09-29T16:30:04Z
- FILE apps/web/index.html bytes=768 fixtureish=False
- FILE apps/web/src/main.tsx bytes=3429 fixtureish=False
  SYMS: function Root | function Routed
  LINE: state: "The sign-in link expired. Try again.",

## STiFLeR7/Jev-LLM-Playground commit=23c78486ab38db6caed07efa45788a2f46107c1d license=MIT size=841 branch=main pushed=2026-09-25T10:34:07Z
- FILE web/index.html bytes=19761 fixtureish=True
  LINE: <!-- THESIS: A decision workbench, not a chat dashboard or scrolling marketing demo.

## legostin/jev-mcp commit=606e948996f808d806e547fab902ed996339baa6 license=MIT size=2402 branch=main pushed=2026-09-24T11:16:17Z
- FILE docs/index.html bytes=14826 fixtureish=True
  URLS: openrouter.ai/docs/guides/community/jev
  LINE: <meta name="description" content="Open-source MCP server that lets Claude Code, Codex and AI agents drive a real Chrome browser with JEV: ~100 ms typed decisions, calibrated confid
- FILE ui/index.html bytes=333 fixtureish=False

## AntonioCoppe/jev-harness commit=1a3dd4ae86de72f0df7d6e70b25feffc41ca3255 license=MIT size=8050 branch=main pushed=2026-09-25T16:31:24Z
- FILE demos/marketing/index.html bytes=5088 fixtureish=True

## AbdelStark/jev-benchmarks commit=0d610cc53e79bcbec691312b0c4adb4a0e371642 license=Apache-2.0 size=489 branch=main pushed=2026-09-17T07:55:14Z
- FILE src/jev_benchmarks/report.py bytes=5934 fixtureish=False
  SYMS: def _format | def _latest_predictions | def build_report

## sunil-sadasivan/jevernetes commit=3a08dcb1c3611c0014b000074006701ad767bfa2 license=MIT size=6916 branch=main pushed=2026-09-28T04:47:59Z
- FILE jevernetes/report.py bytes=5877 fixtureish=False
  SYMS: def build_report | def write_report | def safe_console | class TailPrinter | def __init__ | def publish
- FILE jevernetes/web/index.html bytes=22174 fixtureish=True
  LINE: <details class="log-search-options"><summary>Search scope &amp; options</summary><p id="ask-scope" class="field-note"></p><label>Maximum Jev batches<select id="ask-budget"><option 

## olivier-motium/jev-doom commit=13589d2b97d18940423933262834aa3e376ffcdc license=MIT size=70 branch=main pushed=2026-09-21T12:33:03Z
- FILE index.html bytes=21945 fixtureish=True
  SYMS: function command | function stats | function inspect | function drawMap | function render | function poll
  LINE: :root{color-scheme:dark;--bg:#101316;--panel:#181e23;--muted:#96a5b0;--line:#303b43;--cyan:#7be9dc;--orange:#ffc085}*{box-sizing:border-box}body{margin:0;background:var(--bg);color

## mizchi/jev-playground commit=79fc189ee6edd8caf96a170227676d7c5c143848 license=None size=13499 branch=main pushed=2026-09-26T16:19:10Z
- FILE experiments/browser-chaos/app/index.html bytes=39471 fixtureish=True
  SYMS: function that | const slow = ( | function burnMainThread | function thrashLayout | function fetchBallast | function applyPromoCode
  LINE: mistake, and it is invisible in three ways at once — nothing renders,

## wustep/jev-playground commit=4f38b140e91f68da1288fbc91f867bf4a29f478f license=None size=1051 branch=main pushed=2026-09-26T06:44:56Z
- FILE index.html bytes=844 fixtureish=False
- FILE src/inbox/InboxApp.tsx bytes=15433 fixtureish=True
  SYMS: const pct = ( | function ConfidenceTriad | function InboxRow | const topReasons = ( | export default function InboxApp | const setWeight = (
  LINE: const [items, setItems] = useState<InboxItem[]>(boot.items)

## DonaldMurillo/system-one-playground commit=888a033725e67e76fca7f4440ffd9b239a19db1c license=MIT size=7046 branch=main pushed=2026-09-23T01:51:19Z
- FILE studio/index.html bytes=8338 fixtureish=False
  LINE: <button class="tab" data-tab="trace" role="tab" type="button">Trace</button>
- FILE internal/studio/webdist/index.html bytes=8385 fixtureish=False
  LINE: <button class="tab" data-tab="trace" role="tab" type="button">Trace</button>

## Resadan-dev/jev-zork commit=981451ba8adc076fd4058d20a37c8bef2739c0ae license=MIT size=195 branch=main pushed=2026-09-21T12:18:31Z
- FILE replay/index.html bytes=7907 fixtureish=True

## patryckalves/jev-no-enem commit=7f85f787e3d13ce75da5bbc8d578038af73cc077 license=None size=116 branch=main pushed=2026-09-21T11:59:18Z
- FILE docs/index.html bytes=11899 fixtureish=False

## NorbertBodziony/guard-jev commit=86e7dba193fc94d458f36e225379c12596ddef0c license=None size=65 branch=main pushed=2026-09-17T09:07:15Z
- FILE app/page.tsx bytes=11775 fixtureish=True
  SYMS: function barColor | export default function Home | function pickPreset | function check
  LINE: const [text, setText] = useState(PRESETS[0].text);

## nssmd/jev-bot commit=4695a4e92fca03751dd86619612379576228bfda license=MIT size=64 branch=main pushed=2026-09-22T08:20:28Z
- FILE public/index.html bytes=9329 fixtureish=False
  LINE: <p class="eyebrow"><span></span> JEV / DECISION STUDIO</p>

## kavehmz/typesafe-playground commit=3e1bd368e81750415199d3ee44f2a8dc4ffee072 license=None size=28156 branch=main pushed=2026-09-29T07:11:22Z
- FILE demo01/public/index.html bytes=8705 fixtureish=False
  LINE: <meta name="description" content="A hands-on experiment in small AI judgments and transparent software decisions.">
- FILE demo02/public/index.html bytes=10576 fixtureish=False
  LINE: <div class="stage-guide" id="stage-guide"><span class="guide-kicker">YOUR DRIVER IS READY</span><h2>Meet the decision engine.</h2><p>Start a run to give Jev the controls.<br>Watch 

## tedliou/decision-model-playground commit=195fdb98d517b146fa890c459836ceea94566a72 license=None size=117 branch=main pushed=2026-09-19T13:31:18Z
- FILE apps/web/index.html bytes=527 fixtureish=False

## reachjalil/jevlogs commit=217d2b70bfb327a0038b21851c1c9c143eb80469 license=MIT size=3387 branch=main pushed=2026-09-22T03:35:36Z
- FILE benchmarks/space/app.py bytes=14130 fixtureish=True
  SYMS: def _download | def load_metrics | def load_e1 | def route_from_row | def summarize | def estimate_savings
  LINE: Loads saved decisions from the public dataset. Makes no live model calls.

## bitnovus/jev-spam-eval commit=a3757a1b3412177a686c1b4d95227b50a8f73537 license=MIT size=6416 branch=main pushed=2026-09-18T15:21:10Z
- FILE experiments/jev-context/report.py bytes=6401 fixtureish=True
  SYMS: class definitions
  LINE: '- Enriched: same question plus Reply-To, link text/destinations/hostnames, and attachment names/types.',

## chepyle/jev-test commit=231645b206242fbbdc80f8a3b45c1a7509e8db54 license=Apache-2.0 size=464 branch=main pushed=2026-10-02T12:34:19Z
- FILE report/build_report.py bytes=14508 fixtureish=False
  SYMS: def load | def pct | def ledger | def top_confusions | def build | def mean
- FILE encoder/modal_app.py bytes=13781 fixtureish=False
  SYMS: def load | def items | def packs | class Scorer | def __init__ | def logits
  LINE: Kev-4B trained on Kev's `decision-v7` train partition; this trains an encoder on the same

## PromtEngineer/jev-harness commit=9bd4f670a2866498aa570e4ce4654997b3dce190 license=MIT size=1498 branch=main pushed=2026-09-24T22:00:50Z
- FILE app/index.html bytes=23903 fixtureish=False
  SYMS: function loadRuns | function flow | const n = ( | function loadRun | function loadResults | function loadGateLab
  LINE: <section class="view" id="v-gatelab"><div class="card"><h3>Same classifier, three policies · six statements</h3><div id="gatetable"></div></div>
- FILE tools/report.py bytes=4651 fixtureish=False
  SYMS: def load | def t5_outcome | def main

## droidrun/mobile-jev commit=395fc222beac4f059f9a0beb337d114a2b066e99 license=MIT size=28148 branch=main pushed=2026-09-17T12:55:20Z
- FILE apps/jev-studio/app/page.tsx bytes=6220 fixtureish=False
  SYMS: export default function Studio

## mohsen1/llm-debugger-vscode-extension commit=17522a386e16bbe21952345c9fc1bc1ba84ad418 license=MIT size=3917 branch=main pushed=2026-09-21T19:50:11Z
- FILE src/webview/index.html bytes=317 fixtureish=False
- FILE src/webview/App.tsx bytes=3461 fixtureish=False
  SYMS: export function App | const handleMessage = ( | const onCheckboxChange = ( | function AiFunctionCallView | function Thinking | function Results
  LINE: const [debugEnabled, setDebugEnabled] = React.useState<boolean>(false);

## hegargarcia/jev-playground commit=c144bb6d99600eb506dc29133fe780cc88eb5645 license=None size=97 branch=main pushed=2026-09-17T15:27:20Z
- FILE src/app/page.tsx bytes=108 fixtureish=False
  SYMS: export default function Home
- FILE src/app/connect-four/page.tsx bytes=1430 fixtureish=False
  SYMS: export const metadata | export default function ConnectFour
  LINE: description: "Play Connect Four against five AI models, with independent boards and move decision logs.",

## minkhant1996/system-one-playground commit=a8c4c3202287993f5202ff90e79356520dce3acb license=MIT size=478 branch=main pushed=2026-09-29T07:59:46Z
- FILE frontend/src/components/Playground.tsx bytes=16526 fixtureish=False
  SYMS: function levelsOf | function safeParse | function md | export default function Playground | const loadSessions = ( | function openSession
  LINE: intro: 'Hi! Tell me what you want to decide and paste the text, in any language. I will turn it into typed questions, run the decision model, and explain the result.',

## grandaha/jev-playground commit=e4827651dba502f26b9848195d738b28289baba5 license=MIT size=3851 branch=main pushed=2026-10-01T00:30:07Z
- FILE experiments/playground/scripts/index.html bytes=38346 fixtureish=False
  SYMS: function el | const fmt = ( | const clone = ( | function lsGet | function lsSet | function toText
  LINE: <section class="pane" aria-labelledby="h-state">

## kobashi/jev-playground commit=ce66832f9098b5f1a5416b7ddb73f8ed151c9ab8 license=MIT size=124 branch=main pushed=2026-09-30T00:52:19Z
- FILE web/index.html bytes=64592 fixtureish=False
  SYMS: const mod = ( | const clampDeg = ( | const scaleLen = ( | const phraseLen = ( | const shiftToZero = ( | function audio
  LINE: const scaleLen = () => SCALES[state.scale].steps.length;
- FILE eval/run.ts bytes=8425 fixtureish=False
  SYMS: const phraseJob = ( | const rankJob = ( | const pct = ( | const mean = ( | const main = async ( | const seconds = (
  LINE: goodProbability: probabilities[item.good] ?? 0,

## sa-ha/jev-playground commit=562fb8eb39dc2669f647d916d32cce8ad9aefe7b license=MIT size=61 branch=main pushed=2026-09-28T15:40:45Z
- FILE src/jev_playground/report.py bytes=6594 fixtureish=False
  SYMS: class ThresholdStat | class QuestionStat | def collectThresholds | def summarizeQuestion | def formatRate | def buildReport
  LINE: def summarizeQuestion(questionName: str, caseResults: list[CaseResult], thresholds: list[float]) -> QuestionStat:

## Ahmar004/jev-playground commit=961141bfdbfa05932678406f03189daecb1ccd07 license=None size=1661 branch=main pushed=2026-10-02T17:53:16Z
- FILE src/app/(app)/sandbox/page.tsx bytes=1160 fixtureish=True
  SYMS: export const metadata | const SKELETON = ( | export default function SandboxPage
  LINE: Build a state and ask Jev Noul, Choice and Score questions. Start from a template and see

## Bald0Wang/jev-playground commit=7eabcf65afd327dec7526135de335f5c98c15bd3 license=None size=1533 branch=main pushed=2026-09-23T09:22:58Z
- FILE smart-home/smart_home_playground.html bytes=130631 fixtureish=True
  SYMS: function getAudioContext | function playSound | function createRoomFloor | function createWall | function setupRoomLight | function makeBox
  URLS: 127.0.0.1:8810 | cloudflare
  LINE: if (audioCtx.state === 'suspended') audioCtx.resume();

## mohitmail85/jev-playground commit=263a20be0113f9f03180929551df5fbff2693dc5 license=MIT size=14 branch=main pushed=2026-09-27T15:01:49Z
- FILE jev_app.py bytes=4943 fixtureish=False
  SYMS: def evaluate_with_jev | def evaluate | def print_result | def evaluate_endpoint
  URLS: localhost:5002
  LINE: """Evaluate a support ticket with BeatAPI's free JEV decision model.

## ndolinschi/harnessjudge commit=bdd635beee798b0cb19b3319422d18faf30bfff8 license=None size=19 branch=main pushed=2026-09-17T09:22:10Z
- FILE src/app/page.tsx bytes=7093 fixtureish=False
  SYMS: export default function Page | function decide
  LINE: const [trace, setTrace] = useState("Ran npm test → 12 passed, 0 failed. Coverage Softmax 100%. Completed.");

## deepdave98/jev-playground commit=29f0fb44eff41237bc6aeb90d5ed7e5e08da82b5 license=None size=528 branch=main pushed=2026-09-29T17:16:52Z
- FILE common/bench.py bytes=1985 fixtureish=False
  SYMS: def run | def load