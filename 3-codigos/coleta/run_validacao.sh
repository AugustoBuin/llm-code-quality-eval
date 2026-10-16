#!/usr/bin/env bash
# =====================================================================
#  run_validacao.sh — Validação do instrumento ANTES da coleta completa.
#
#  Roda: P1 x {premium, leve} x níveis {1,2,3,5} x rep 1 = 8 execuções.
#  Objetivo: confirmar que TODOS os níveis de instrução produzem saída
#  que o parse.js consome limpo, antes de soltar as 150.
#  (O nível 4 já costuma ser provado em pilotos.)
#
#  Por que isto importa: foi esta validação barata que pegou um bug de
#  escala (a nota virando a *média* das sub-notas) ANTES de gastar as 150
#  execuções. Validar antes de coletar em massa é o seguro mais barato.
#
#  As saídas vão para resultados/raw/ com os MESMOS nomes da coleta final,
#  portanto contam como parte das 150 e serão puladas pelo run_all.sh depois.
#
#  PRÉ-REQUISITO: copie projetos.local.config.example para projetos.local.config
#  e edite com os caminhos/nomes reais dos projetos (ver aquele arquivo).
#
#  Uso:  bash run_validacao.sh
# =====================================================================
set -uo pipefail

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
LOG="${RAW%/raw}/validacao.log"
KEY_FILE="${GEMINI_KEY_FILE:-$HERE/.gemini_key}"
mkdir -p "$RAW"

if [ -z "${GEMINI_API_KEY:-}" ] && [ -f "$KEY_FILE" ]; then
  export GEMINI_API_KEY="$(tr -d '[:space:]' < "$KEY_FILE")"
fi

# Descobre a pasta real de P1 a partir do mapeamento em PROJECTS.
PID="P1"; PDIR=""
for pj in "${PROJECTS[@]}"; do [ "${pj%%:*}" = "$PID" ] && PDIR="$ABP/${pj#*:}"; done
[ -z "$PDIR" ] && { echo "ERRO: rótulo $PID não encontrado em PROJECTS (veja projetos.local.config)."; exit 1; }

CONFIGS=( "premium" "leve" )
LEVELS=( 1 2 3 5 )
R=1
MAX_RETRIES=4

log(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

# --- Neutralização de arquivos de contexto de IA (anti-contaminação) ---------
neutralize(){
  log "Neutralizando arquivos de instrução de IA nos projetos..."
  find "$ABP" -not -path '*/node_modules/*' -not -path '*/.git/*' \
    \( -iname 'CLAUDE.md' -o -iname 'GEMINI.md' -o -iname 'AGENTS.md' \
       -o -iname '.clinerules' -o -iname '.windsurfrules' \
       -o -iname 'copilot-instructions.md' \) -print0 2>/dev/null |
  while IFS= read -r -d '' f; do
    [ -e "$f" ] && mv "$f" "$f.NEUTRALIZED_BAK" && log "  -> ocultado: $f"
  done
}
restore(){
  find "$ABP" -name '*.NEUTRALIZED_BAK' -print0 2>/dev/null |
  while IFS= read -r -d '' f; do
    mv "$f" "${f%.NEUTRALIZED_BAK}" && log "  -> restaurado: ${f%.NEUTRALIZED_BAK}"
  done
}
trap restore EXIT

valid_output(){ # $1 config  $2 file
  [ -s "$2" ] || return 1
  if [ "$1" = "premium" ]; then grep -q '"structured_output"' "$2"; else grep -q 'nota_final' "$2"; fi
}

run_one(){ # $1 config  $2 level  $3 outfile
  local cfg="$1" lvl="$2" out="$3"
  local prompt; prompt="$(cat "$PROMPTS_DIR/prompt_n${lvl}.txt")"
  if [ "$cfg" = "premium" ]; then
    local schema; schema="$(cat "$SCHEMAS_DIR/schema_n${lvl}.json")"
    ( cd "$PDIR" && timeout -k 30 900 claude -p "$prompt" --model claude-opus-4-8 --effort xhigh \
        --output-format json --json-schema "$schema" \
        --safe-mode --permission-mode bypassPermissions --tools "Read,Glob,Grep" \
        < /dev/null ) > "$out" 2>>"$LOG"
  else
    ( cd "$PDIR" && timeout -k 30 900 gemini -p "$prompt" -m gemini-3.5-flash -o json \
        --approval-mode yolo --skip-trust < /dev/null ) > "$out" 2>>"$LOG"
  fi
}

neutralize
total=$(( ${#CONFIGS[@]} * ${#LEVELS[@]} ))
done_n=0; ran=0; skipped=0; failed=0
log "Iniciando VALIDAÇÃO — $total execuções ($PID, níveis ${LEVELS[*]}, configs ${CONFIGS[*]})."

for cfg in "${CONFIGS[@]}"; do
  for lvl in "${LEVELS[@]}"; do
    done_n=$((done_n+1))
    out="$RAW/${PID}_${cfg}_n${lvl}_r${R}.json"
    if valid_output "$cfg" "$out"; then
      skipped=$((skipped+1)); log "($done_n/$total) PULANDO ${PID}_${cfg}_n${lvl}_r${R} (já existe)"; continue
    fi
    ok=0
    for attempt in $(seq 0 $MAX_RETRIES); do
      if [ $attempt -gt 0 ]; then
        backoff=$(( attempt * 20 ))
        log "  retry $attempt para ${PID}_${cfg}_n${lvl}_r${R} (aguardando ${backoff}s p/ contornar falha transiente da API)"
        sleep "$backoff"
      fi
      log "($done_n/$total) RODANDO ${PID}_${cfg}_n${lvl}_r${R}"
      run_one "$cfg" "$lvl" "$out"
      if valid_output "$cfg" "$out"; then ok=1; break; fi
    done
    if [ $ok -eq 1 ]; then ran=$((ran+1)); else failed=$((failed+1)); log "  FALHOU: ${PID}_${cfg}_n${lvl}_r${R}"; fi
  done
done

log "Validação concluída. Executados: $ran | Pulados: $skipped | Falhas: $failed | Total: $total"
log "Agora rode:  node parse.js   e confira que as 8+ linhas saem limpas."
