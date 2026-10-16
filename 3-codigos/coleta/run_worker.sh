#!/usr/bin/env bash
# =====================================================================
#  run_worker.sh — Worker PARTICIONADO para coleta paralela.
#
#  Uso:  bash run_worker.sh <config: premium|leve> <worker_id> <num_workers>
#  Ex.:  bash run_worker.sh leve 0 2   (worker 0 de 2 do leve)
#
#  - Roda SÓ as células da sua config e da sua partição (idx % num_workers == id),
#    pulando as já válidas (resumível). Partições disjuntas => sem colisão.
#  - NÃO neutraliza nem restaura arquivos de IA — isso é feito UMA vez, externamente,
#    em volta de TODOS os workers (senão um worker restauraria enquanto outro roda).
#  - Loga no próprio arquivo: resultados/worker_<config>_<id>.log
#  - Mesma robustez do run_all.sh: timeout por célula, retry com backoff.
#
#  PRÉ-REQUISITO: copie projetos.local.config.example para projetos.local.config
#  e edite com os caminhos/nomes reais dos projetos (ver aquele arquivo).
# =====================================================================
set -uo pipefail

CFG="${1:?uso: run_worker.sh <premium|leve> <id> <num>}"
WID="${2:?faltou worker_id}"
NW="${3:?faltou num_workers}"

# --- Localização e configuração local (parametrizada) ------------------------
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HERE/../.." && pwd)"
CONFIG="${PROJETOS_CONFIG:-$HERE/projetos.local.config}"
if [ ! -f "$CONFIG" ]; then
  echo "ERRO: não encontrei '$CONFIG'. Copie projetos.local.config.example e edite-o."
  exit 1
fi
# shellcheck disable=SC1090
source "$CONFIG"   # define ABP e PROJECTS (e, opcionalmente, *_DIR / GEMINI_KEY_FILE)

PROMPTS_DIR="${PROMPTS_DIR:-$REPO_ROOT/1-processo/instrumento/prompts}"
SCHEMAS_DIR="${SCHEMAS_DIR:-$REPO_ROOT/1-processo/instrumento/schemas}"
RAW="${RAW_DIR:-$HERE/resultados/raw}"
LOG="${RAW%/raw}/worker_${CFG}_${WID}.log"
KEY_FILE="${GEMINI_KEY_FILE:-$HERE/.gemini_key}"
mkdir -p "$RAW"

# Auth Gemini (config leve): GEMINI_API_KEY do ambiente, senão de .gemini_key
if [ -z "${GEMINI_API_KEY:-}" ] && [ -f "$KEY_FILE" ]; then
  export GEMINI_API_KEY="$(tr -d '[:space:]' < "$KEY_FILE")"
fi

LEVELS=( 1 2 3 4 5 )
REPS=( 1 2 3 )
MAX_RETRIES=4

log(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] [${CFG}#${WID}] $*" | tee -a "$LOG"; }

valid_output(){ # $1 cfg  $2 file
  [ -s "$2" ] || return 1
  if [ "$1" = "premium" ]; then grep -q '"structured_output"' "$2"; else grep -q 'nota_final' "$2"; fi
}

run_one(){ # $1 projdir  $2 level  $3 outfile
  local dir="$1" lvl="$2" out="$3"
  local prompt; prompt="$(cat "$PROMPTS_DIR/prompt_n${lvl}.txt")"
  if [ "$CFG" = "premium" ]; then
    local schema; schema="$(cat "$SCHEMAS_DIR/schema_n${lvl}.json")"
    ( cd "$dir" && timeout -k 30 900 claude -p "$prompt" --model claude-opus-4-8 --effort xhigh \
        --output-format json --json-schema "$schema" \
        --safe-mode --permission-mode bypassPermissions --tools "Read,Glob,Grep" \
        < /dev/null ) > "$out" 2>>"$LOG"
  else
    ( cd "$dir" && timeout -k 30 900 gemini -p "$prompt" -m gemini-3.5-flash -o json \
        --approval-mode yolo --skip-trust < /dev/null ) > "$out" 2>>"$LOG"
  fi
}

if [ "$CFG" = "leve" ]; then
  [ -n "${GEMINI_API_KEY:-}" ] && log "API key detectada." || log "AVISO: sem GEMINI_API_KEY — leve vai falhar."
fi
log "Iniciando worker — config=$CFG, partição $WID/$NW."

idx=-1; ran=0; skipped=0; failed=0
for pj in "${PROJECTS[@]}"; do
  pid="${pj%%:*}"; pdir="$ABP/${pj#*:}"
  for lvl in "${LEVELS[@]}"; do
    for r in "${REPS[@]}"; do
      idx=$((idx+1))
      [ $(( idx % NW )) -ne "$WID" ] && continue   # não é minha partição
      out="$RAW/${pid}_${CFG}_n${lvl}_r${r}.json"
      if valid_output "$CFG" "$out"; then skipped=$((skipped+1)); continue; fi
      ok=0
      for attempt in $(seq 0 $MAX_RETRIES); do
        if [ $attempt -gt 0 ]; then
          backoff=$(( attempt * 20 ))
          log "retry $attempt para ${pid}_${CFG}_n${lvl}_r${r} (aguardando ${backoff}s)"
          sleep "$backoff"
        fi
        log "RODANDO ${pid}_${CFG}_n${lvl}_r${r}"
        run_one "$pdir" "$lvl" "$out"
        if valid_output "$CFG" "$out"; then ok=1; break; fi
      done
      if [ $ok -eq 1 ]; then ran=$((ran+1)); else failed=$((failed+1)); log "FALHOU ${pid}_${CFG}_n${lvl}_r${r}"; fi
    done
  done
done
log "Worker CONCLUÍDO. Rodadas: $ran | Puladas: $skipped | Falhas: $failed."
