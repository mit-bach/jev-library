#!/usr/bin/env bash
# Runs the benchmark for every mode × model, no branches involved.
#   npm run eval:all                                   # both modes, default model
#   MODELS="gemini-3.8-flash opus-5" npm run eval:all
#   MODELS=all MODES="jev-classifier" npm run eval:all
# Extra args go to `eve eval` (e.g. -- --tag complex, or eval ids like assistant/0004).
set -uo pipefail
cd "$(dirname "$0")/.."

MODELS="${MODELS:-gemini-3.8-flash}"
MODES="${MODES:-llm-direct jev-classifier}"
if [ "$MODELS" = "all" ]; then
  MODELS="gemini-3.8-flash deepseek-v4.1-flash gpt-5.6-luna gpt-5.6-sol opus-5 fable-5.1 gpt-6-astra qwen3.8-27b"
fi

mkdir -p eval-results
rm -f .eve/dev-server-state.v1.json
for MODE in $MODES; do
  for MODEL in $MODELS; do
    echo "=== $MODE · $MODEL ==="
    AGENT_MODE="$MODE" EVAL_MODEL="$MODEL" npx eve eval --max-concurrency 1 --skip-report --verbose "$@" || echo "(eval $MODE/$MODEL finished with failures; results still recorded)"
  done
done
echo
echo "Done. Open the dashboard with: npm run ui"
