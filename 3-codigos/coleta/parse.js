// =====================================================================
//  parse.js — Consolida os JSONs brutos de resultados/raw/ em dados.csv
//  Trabalho Final de Estatística Aplicada (DSM / FATEC)
//
//  Lê todos os arquivos resultados/raw/<P>_<config>_n<L>_r<R>.json,
//  extrai as métricas de cada um (tratando os formatos diferentes de
//  Claude e Gemini) e gera:
//    - dados.csv      : uma linha por execução (a base do trabalho)
//    - problemas.csv  : uma linha por problema apontado (para análise de alucinação)
//
//  Uso:  node parse.js
// =====================================================================
const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const RAW = path.join(BASE, 'resultados', 'raw');
const FNAME_RE = /^(P\d)_(premium|leve)_n([1-5])_r(\d)\.json$/;

const stripBOM = (s) => s.replace(/^﻿/, '');

// Extrai o objeto JSON estruturado de dentro da resposta do Gemini (remove cercas ```json)
function extractGeminiJson(resp) {
  if (resp == null) return null;
  const m = String(resp).match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = m ? m[1] : String(resp);
  try { return JSON.parse(candidate.trim()); } catch { return null; }
}

function parseFile(file) {
  const raw = stripBOM(fs.readFileSync(file, 'utf8'));
  const m = path.basename(file).match(FNAME_RE);
  if (!m) return null;
  const [, projeto, configuracao, nivel, rep] = m;
  const row = {
    projeto, configuracao,
    nivel_instrucao: Number(nivel), repeticao: Number(rep),
    nota_final: '', c1_funcionamento: '', c2_legibilidade: '', c3_estrutura: '',
    c4_solid: '', c5_nao_funcionais: '', n_problemas: '',
    output_tokens: '', tokens_total: '', cost_usd: '', duration_ms: '',
    parse_ok: false,
  };
  const problemas = [];
  try {
    const env = JSON.parse(raw);
    let assess = null;
    if (configuracao === 'premium') {
      assess = env.structured_output;
      const mu = (env.modelUsage && env.modelUsage['claude-opus-4-8']) || {};
      row.output_tokens = mu.outputTokens ?? '';
      row.tokens_total = (mu.inputTokens || 0) + (mu.outputTokens || 0)
                       + (mu.cacheReadInputTokens || 0) + (mu.cacheCreationInputTokens || 0);
      row.cost_usd = env.total_cost_usd ?? '';
      row.duration_ms = env.duration_ms ?? '';
    } else {
      assess = extractGeminiJson(env.response);
      // Modelo principal = o de maior contagem de tokens (robusto a modelos auxiliares
      // que o CLI às vezes invoca, ex.: flash-lite de calibração). Config leve = gemini-3.5-flash.
      const models = (env.stats && env.stats.models) || {};
      let mainKey = '', best = -1;
      for (const k of Object.keys(models)) {
        const t = (models[k].tokens && models[k].tokens.total) || 0;
        if (t > best) { best = t; mainKey = k; }
      }
      const gm = models[mainKey];
      if (gm) {
        row.tokens_total = gm.tokens ? gm.tokens.total ?? '' : '';
        row.output_tokens = gm.tokens ? gm.tokens.candidates ?? '' : '';
        row.duration_ms = gm.api ? gm.api.totalLatencyMs ?? '' : '';
      }
      row.cost_usd = ''; // Gemini CLI não reporta custo
    }
    if (assess && typeof assess === 'object') {
      row.nota_final = assess.nota_final ?? '';
      const c = assess.categorias || {};
      row.c1_funcionamento = c.c1_funcionamento ?? '';
      row.c2_legibilidade = c.c2_legibilidade ?? '';
      row.c3_estrutura = c.c3_estrutura ?? '';
      row.c4_solid = c.c4_solid ?? '';
      row.c5_nao_funcionais = c.c5_nao_funcionais ?? '';
      row.n_problemas = assess.n_problemas ?? (Array.isArray(assess.problemas) ? assess.problemas.length : '');
      if (Array.isArray(assess.problemas)) {
        assess.problemas.forEach((p, i) => problemas.push({
          projeto, configuracao, nivel_instrucao: Number(nivel), repeticao: Number(rep),
          idx: i + 1, categoria: p.categoria || '', severidade: p.severidade || '',
          descricao: (p.descricao || '').replace(/\s+/g, ' ').trim(),
        }));
      }
      row.parse_ok = row.nota_final !== '' && row.nota_final !== undefined;
    }
  } catch (e) {
    row.parse_ok = false;
  }
  return { row, problemas };
}

function toCsv(rows, cols) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n';
}

function main() {
  if (!fs.existsSync(RAW)) { console.error('Pasta não encontrada:', RAW); process.exit(1); }
  const files = fs.readdirSync(RAW).filter((f) => FNAME_RE.test(f)).sort();
  const rows = [], allProblemas = [];
  let ok = 0, bad = 0;
  for (const f of files) {
    const res = parseFile(path.join(RAW, f));
    if (!res) continue;
    rows.push(res.row);
    allProblemas.push(...res.problemas);
    if (res.row.parse_ok) ok++; else { bad++; console.warn('PARSE FALHOU:', f); }
  }
  const dataCols = ['projeto', 'configuracao', 'nivel_instrucao', 'repeticao', 'nota_final',
    'c1_funcionamento', 'c2_legibilidade', 'c3_estrutura', 'c4_solid', 'c5_nao_funcionais',
    'n_problemas', 'output_tokens', 'tokens_total', 'cost_usd', 'duration_ms', 'parse_ok'];
  const probCols = ['projeto', 'configuracao', 'nivel_instrucao', 'repeticao', 'idx',
    'categoria', 'severidade', 'descricao'];
  fs.writeFileSync(path.join(BASE, 'dados.csv'), toCsv(rows, dataCols));
  fs.writeFileSync(path.join(BASE, 'problemas.csv'), toCsv(allProblemas, probCols));
  console.log(`\nArquivos lidos: ${files.length} | OK: ${ok} | Falhas de parse: ${bad}`);
  console.log(`Linhas em dados.csv: ${rows.length} | Linhas em problemas.csv: ${allProblemas.length}`);
  console.log('Gerados: dados.csv e problemas.csv');
}

main();
