#!/usr/bin/env bash
# =====================================================================
#  run_all.sh — Coleta automatizada das avaliações de qualidade de código.
#
#  Experimento fatorial: 5 projetos x 2 configs x 5 níveis x 3 repetições = 150 execuções
#    config "premium" = Claude Opus 4.8 (effort xhigh)
#    config "leve"    = Gemini 3.5 Flash
#
#  Características:
#    - RESUMÍVEL: pula execuções cujo arquivo de saída já existe e é válido.
#      Pode interromper (Ctrl+C) e rodar de novo que ele continua de onde parou.
#    - Neutraliza arquivos de instrução de IA (.clinerules, CLAUDE.md, GEMINI.md...)
#      durante as execuções, restaurando-os ao final (inclusive se for interrompido).
#    - Faz até MAX_RETRIES retentativas por execução em caso de saída inválida.
#    - Loga tudo em resultados/run.log.
#
#  ATENÇÃO: é uma carga pesada (~75 execuções Opus xhigh + 75 Gemini). Pode levar
#  várias horas e consumir cota. Rode quando puder deixar a máquina trabalhando.
#
#  PRÉ-REQUISITO: copie projetos.local.config.example para projetos.local.config
#  e edite com os caminhos/nomes reais dos projetos (ver aquele arquivo).
#
#  Uso:  bash run_all.sh
# =====================================================================
set -uo pipefail

# --- Localização e configuração local (parametrizada) ------------------------
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HERE/../.." && pwd)"
CONFIG="${PROJETOS_CONFIG:-$HERE/projetos.local.config}"
if [ ! -f "$CONFIG" ]; then
  echo "ERRO: não encontrei '$CONFIG'."
  echo "Copie projetos.local.config.example para projetos.local.config e edite-o"
  echo "com os caminhos/nomes reais dos projetos. (Ele fica fora do Git de propósito.)"
  exit 1
fi
# shellcheck disable=SC1090
source "$CONFIG"   # define ABP e PROJECTS (e, opcionalmente, *_DIR / GEMINI_KEY_FILE)

PROMPTS_DIR="${PROMPTS_DIR:-$REPO_ROOT/1-processo/instrumento/prompts}"
SCHEMAS_DIR="${SCHEMAS_DIR:-$REPO_ROOT/1-processo/instrumento/schemas}"
RAW="${RAW_DIR:-$HERE/resultados/raw}"
LOG="${RAW%/raw}/run.log"
KEY_FILE="${GEMINI_KEY_FILE:-$HERE/.gemini_key}"
mkdir -p "$RAW"

# --- Auth do Gemini (config leve) -------------------------------------------
# A coleta roda fora do terminal interativo, então a GEMINI_API_KEY precisa vir
# do ambiente OU de um arquivo local .gemini_key (uma linha, só a chave).
if [ -z "${GEMINI_API_KEY:-}" ] && [ -f "$KEY_FILE" ]; then
  export GEMINI_API_KEY="$(tr -d '[:space:]' < "$KEY_FILE")"
fi

CONFIGS=( "premium" "leve" )
LEVELS=( 1 2 3 4 5 )
REPS=( 1 2 3 )
MAX_RETRIES=4

log(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

# --- Neutralização de arquivos de contexto de IA (anti-contaminação) ---------
# Esconde arquivos que dariam dicas à IA (ela deve avaliar SÓ o código).
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

# --- Validação rápida da saída -----------------------------------------------
valid_output(){ # $1 config  $2 file
  [ -s "$2" ] || return 1
  if [ "$1" = "premium" ]; then grep -q '"structured_output"' "$2"; else grep -q 'nota_final' "$2"; fi
}

# --- Execução de uma config --------------------------------------------------
run_one(){ # $1 config  $2 projdir  $3 level  $4 outfile
  local cfg="$1" dir="$2" lvl="$3" out="$4"
  local prompt; prompt="$(cat "$PROMPTS_DIR/prompt_n${lvl}.txt")"
  if [ "$cfg" = "premium" ]; then
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

# --- Loop principal ----------------------------------------------------------
neutralize
total=$(( ${#PROJECTS[@]} * ${#CONFIGS[@]} * ${#LEVELS[@]} * ${#REPS[@]} ))
done_n=0; ran=0; skipped=0; failed=0
log "Iniciando coleta — $total execuções no total."
if [ -n "${GEMINI_API_KEY:-}" ]; then log "Gemini (leve): API key detectada (auth=gemini-api-key)."; else log "AVISO: GEMINI_API_KEY ausente — execuções leve vão falhar. Crie $KEY_FILE com a chave."; fi

for pj in "${PROJECTS[@]}"; do
  pid="${pj%%:*}"; pdir="$ABP/${pj#*:}"
  for cfg in "${CONFIGS[@]}"; do
    for lvl in "${LEVELS[@]}"; do
      for r in "${REPS[@]}"; do
        done_n=$((done_n+1))
        out="$RAW/${pid}_${cfg}_n${lvl}_r${r}.json"
        if valid_output "$cfg" "$out"; then
          skipped=$((skipped+1)); log "($done_n/$total) PULANDO ${pid}_${cfg}_n${lvl}_r${r} (já existe)"; continue
        fi
        ok=0
        for attempt in $(seq 0 $MAX_RETRIES); do
          if [ $attempt -gt 0 ]; then
            backoff=$(( attempt * 20 ))
            log "  retry $attempt para ${pid}_${cfg}_n${lvl}_r${r} (aguardando ${backoff}s p/ contornar falha transiente da API)"
            sleep "$backoff"
          fi
          log "($done_n/$total) RODANDO ${pid}_${cfg}_n${lvl}_r${r}"
          run_one "$cfg" "$pdir" "$lvl" "$out"
          if valid_output "$cfg" "$out"; then ok=1; break; fi
        done
        if [ $ok -eq 1 ]; then ran=$((ran+1)); else failed=$((failed+1)); log "  FALHOU: ${pid}_${cfg}_n${lvl}_r${r}"; fi
      done
    done
  done
done

log "Concluído. Executados agora: $ran | Pulados: $skipped | Falhas: $failed | Total: $total"
log "Agora rode:  node parse.js   para gerar o dados.csv"
