// =====================================================================
//  gabarito_check.js — Valida e consolida o gabarito humano (ground truth).
//  Trabalho Final de Estatística Aplicada (DSM / FATEC)
//
//  Lê gabarito.csv (você preenche as 5 sub-notas 0–20 por projeto) e:
//    - valida que cada nota é inteiro de 0 a 20 e que nada ficou em branco;
//    - calcula G(p) = soma das 5 categorias (pesos iguais, 0–100);
//    - gera gabarito_computed.csv (formato largo, 1 linha/projeto, com nota_global)
//      e gabarito_long.csv (1 linha por projeto×categoria, p/ erro por categoria).
//
//  A nota_global NÃO é digitada à mão — este script a calcula, evitando erro de soma.
//  Uso:  node gabarito_check.js
// =====================================================================
const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const FILE = path.join(BASE, 'gabarito.csv');
const CATS = ['g1_funcionamento', 'g2_legibilidade', 'g3_estrutura', 'g4_solid', 'g5_nao_funcionais'];

const stripBOM = (s) => s.replace(/^﻿/, '');

// Parser de linha CSV que respeita aspas duplas (observacoes pode ter vírgula).
function parseCsvLine(line) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else {
      if (ch === ',') { out.push(cur); cur = ''; }
      else if (ch === '"') q = true;
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function csvEsc(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function main() {
  if (!fs.existsSync(FILE)) { console.error('Não encontrei gabarito.csv em', BASE); process.exit(1); }
  const lines = stripBOM(fs.readFileSync(FILE, 'utf8')).split(/\r?\n/).filter((l) => l.trim() !== '');
  const header = parseCsvLine(lines[0]);
  const idx = (name) => header.indexOf(name);
  for (const c of ['projeto', ...CATS]) {
    if (idx(c) === -1) { console.error('Coluna ausente no cabeçalho:', c); process.exit(1); }
  }

  const rows = lines.slice(1).map(parseCsvLine);
  const problems = [];
  const computed = [];
  const long = [];

  rows.forEach((cols, ri) => {
    const projeto = (cols[idx('projeto')] || '').trim();
    const nome = (cols[idx('projeto_nome')] !== undefined ? cols[idx('projeto_nome')] : '').trim();
    let sum = 0; let allOk = true;
    const cat = {};
    for (const c of CATS) {
      const raw = (cols[idx(c)] || '').trim();
      if (raw === '') { problems.push(`${projeto || 'linha ' + (ri + 2)}: ${c} está EM BRANCO`); allOk = false; cat[c] = ''; continue; }
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 0 || n > 20) {
        problems.push(`${projeto}: ${c}="${raw}" inválido (precisa ser inteiro de 0 a 20)`);
        allOk = false; cat[c] = raw; continue;
      }
      cat[c] = n; sum += n;
    }
    computed.push({ projeto, projeto_nome: nome, ...cat, nota_global: allOk ? sum : '', observacoes: cols[idx('observacoes')] || '' });
    if (allOk) for (const c of CATS) long.push({ projeto, categoria: c, nota_humana: cat[c] });
  });

  // Relatório
  console.log('\n=== Gabarito — validação ===');
  if (problems.length) {
    console.log(`\n⚠ Faltam ${problems.length} célula(s) ou há valores inválidos:`);
    problems.forEach((p) => console.log('  - ' + p));
    console.log('\nPreencha/corrija no gabarito.csv e rode de novo. (Saídas não foram gravadas.)\n');
    return;
  }
  console.log('\nTodos os 5 projetos preenchidos e válidos. G(p) = soma das 5 categorias:\n');
  console.log('  proj | c1 c2 c3 c4 c5 | nota_global');
  console.log('  -----+----------------+------------');
  computed.forEach((r) => {
    const cs = CATS.map((c) => String(r[c]).padStart(2)).join(' ');
    console.log(`  ${r.projeto.padEnd(4)} | ${cs} |     ${String(r.nota_global).padStart(3)}`);
  });

  // Grava saídas
  const wideCols = ['projeto', 'projeto_nome', ...CATS, 'nota_global', 'observacoes'];
  const wideCsv = [wideCols.join(','), ...computed.map((r) => wideCols.map((c) => csvEsc(r[c])).join(','))].join('\n') + '\n';
  fs.writeFileSync(path.join(BASE, 'gabarito_computed.csv'), wideCsv);

  const longCols = ['projeto', 'categoria', 'nota_humana'];
  const longCsv = [longCols.join(','), ...long.map((r) => longCols.map((c) => csvEsc(r[c])).join(','))].join('\n') + '\n';
  fs.writeFileSync(path.join(BASE, 'gabarito_long.csv'), longCsv);

  console.log('\nGerados: gabarito_computed.csv (1 linha/projeto) e gabarito_long.csv (1 linha/projeto×categoria).');
  console.log('O notebook cruza nota_global com dados.csv para gerar erro_abs = |nota_IA − nota_global|.\n');
}

main();
