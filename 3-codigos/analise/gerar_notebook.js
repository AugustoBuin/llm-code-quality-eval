const fs = require('fs');
const cells = [];
const md = (s) => cells.push({ cell_type: 'markdown', metadata: {}, source: s });
const code = (s) => cells.push({ cell_type: 'code', execution_count: null, metadata: {}, outputs: [], source: s });

md(`# Avaliação automatizada de qualidade de código por IA — Análise estatística

**Estatística Aplicada — DSM/FATEC** · Autor: Augusto Henrique Buin (RA 1461392221018, 4º DSM)

**Pergunta:** o **nível de instrução** (1–5) e a **configuração do modelo** (premium = Claude Opus 4.8;
leve = Gemini 3.5 Flash) afetam a **precisão** (erro vs. gabarito humano), a **severidade** (nº de
problemas) e o **custo** da avaliação de qualidade de código?

Base: **150 execuções** = 5 projetos × 2 configurações × 5 níveis × 3 repetições.

> **Para rodar no Colab:** faça *upload* de \`dados.csv\`, \`problemas.csv\`, \`gabarito_computed.csv\` e
> \`gabarito_long.csv\` (menu Arquivos → Upload) e então Ambiente de execução → Executar tudo.`);

code(`import os
import pandas as pd, numpy as np
import matplotlib.pyplot as plt
from scipy import stats

CAMBIO = 5.18            # R$ por US$ (travado no dia da análise)
GEMINI_TOTAL_BRL = 209.95  # gasto total do Gemini (painel AI Studio; a CLI não reporta custo)
PREM, LEVE = '#4C72B0', '#C44E52'
pd.set_option('display.width', 200)
print('pandas', pd.__version__)`);

md(`## 1. Importação dos dados`);

code(`CANDIDATOS = ['.', '..', 'analise-manual', '../analise-manual', 'analysis-of-repos-by-ai']
def achar(nome):
    for dirp in CANDIDATOS:
        p = os.path.join(dirp, nome)
        if os.path.exists(p):
            return p
    return nome

dados = pd.read_csv(achar('dados.csv'))
problemas = pd.read_csv(achar('problemas.csv'))
gab = pd.read_csv(achar('gabarito_computed.csv'))
print('dados:', dados.shape, '| problemas:', problemas.shape, '| gabarito:', gab.shape)
dados.head()`);

md(`## 2. Limpeza e tratamento dos dados

Mantemos apenas execuções com \`parse_ok = True\`, convertemos as colunas numéricas e checamos duplicatas
e ausentes. **Nota:** as sub-notas \`c1\`–\`c5\` aparecem vazias nos níveis baixos **por desenho** (a rubrica
é revelada progressivamente: n1 sem categorias, n2 c1–c2, n3 c1–c3, n4–n5 todas) — ausência *estrutural*,
não erro de coleta. Por isso a variável central é \`nota_final\`, presente em todos os níveis.`);

code(`dados['parse_ok'] = dados['parse_ok'].astype(str).str.lower().eq('true')
n_bruto = len(dados)
d = dados[dados['parse_ok']].copy()
chave = ['projeto', 'configuracao', 'nivel_instrucao', 'repeticao']
n_dup = int(d.duplicated(chave).sum())
for c in ['nota_final', 'n_problemas', 'cost_usd', 'duration_ms', 'tokens_total',
          'c1_funcionamento', 'c2_legibilidade', 'c3_estrutura', 'c4_solid', 'c5_nao_funcionais']:
    d[c] = pd.to_numeric(d[c], errors='coerce')
print('Linhas:', n_bruto, '| validas:', len(d), '| duplicatas:', n_dup)
print('Ausentes (apenas > 0):')
print(d.isna().sum()[lambda s: s > 0])`);

md(`### 2.1 Cálculo do erro em relação ao gabarito

\`erro_abs = |nota_final − G(projeto)|\`, onde G(projeto) é a nota humana (soma das 5 categorias da rubrica),
**fixa por projeto**. \`erro_sinal = nota_final − G\` indica a direção (> 0 = IA generosa).`);

code(`ref = gab[['projeto', 'nota_global']].rename(columns={'nota_global': 'nota_humana'})
d = d.merge(ref, on='projeto', how='left')
d['erro_abs'] = (d['nota_final'] - d['nota_humana']).abs()
d['erro_sinal'] = d['nota_final'] - d['nota_humana']
prem = d[d.configuracao == 'premium']
leve = d[d.configuracao == 'leve']
print('Cobertura:', d.groupby('configuracao').size().to_dict())
print('Gabarito G(p):', dict(zip(gab.projeto, gab.nota_global)))`);

md(`## 3. Estatística descritiva

Medidas: média \`x̄ = Σxᵢ/n\`; mediana (valor central ordenado); moda (mais frequente); amplitude
\`xₘₐₓ − xₘᵢₙ\`; variância amostral \`s² = Σ(xᵢ−x̄)²/(n−1)\`; desvio-padrão \`s = √s²\`; coeficiente de
variação \`CV = (s/x̄)·100%\`.`);

code(`def descritiva(s):
    s = pd.Series(s).dropna().astype(float)
    m = s.mean(); moda = s.mode()
    return pd.Series({
        'n': int(s.count()), 'media': round(m, 2), 'mediana': round(s.median(), 2),
        'moda': round(moda.iloc[0], 2) if len(moda) else np.nan,
        'min': round(s.min(), 2), 'max': round(s.max(), 2), 'amplitude': round(s.max() - s.min(), 2),
        'variancia': round(s.var(ddof=1), 2), 'desvio': round(s.std(ddof=1), 2),
        'CV(%)': round(100 * s.std(ddof=1) / m, 1) if m else np.nan})

linhas = []
for v in ['nota_final', 'n_problemas', 'erro_abs']:
    for cfg in ['premium', 'leve']:
        r = descritiva(d[d.configuracao == cfg][v]); r['variavel'] = v; r['config'] = cfg
        linhas.append(r)
tabela = pd.DataFrame(linhas).set_index(['variavel', 'config'])
tabela`);

md(`**Interpretação:** o premium é mais acurado (erro médio ~7,6 vs ~12,7) e mais consistente (CV menor) que
o leve. O leve dá notas mais altas e muito mais dispersas (amplitude 59 vs 29). O premium aponta ~2,4× mais
problemas. O \`erro_abs\` é a variável mais dispersa nas duas configs — depende fortemente da condição.`);

md(`## 4. Cálculo detalhado — média, variância e desvio-padrão (amostra de 20 obs)

Demonstração passo a passo sobre as 20 primeiras \`nota_final\` do premium (ordenadas por projeto/nível/rep),
exibindo as somas intermediárias.`);

code(`amostra = (prem.sort_values(['projeto', 'nivel_instrucao', 'repeticao'])['nota_final']
           .dropna().head(20).reset_index(drop=True))
x = amostra.values.astype(float); n = len(x)
soma = x.sum(); media = soma / n
ssq = ((x - media) ** 2).sum(); var = ssq / (n - 1); dp = var ** 0.5
print('valores =', [int(v) for v in x])
print('n =', n, '| Soma(x) =', soma, '-> media = Soma(x)/n =', round(media, 4))
print('Soma((x-media)^2) =', round(ssq, 2))
print('variancia = Soma/(n-1) =', round(ssq, 2), '/', n - 1, '=', round(var, 4))
print('desvio-padrao = raiz(variancia) =', round(dp, 4))
print('conferencia pandas: media=%.4f var=%.4f dp=%.4f' % (amostra.mean(), amostra.var(ddof=1), amostra.std(ddof=1)))`);

md(`## 5. Visualizações

(9 gráficos com interpretação. As médias por nível usam a função auxiliar abaixo.)`);

code(`levels = [1, 2, 3, 4, 5]
def by_level(sub, col, fn='mean'):
    return [getattr(sub[sub.nivel_instrucao == L][col], fn)() for L in levels]`);

md(`### 5.1 Barras — erro por nível e configuração`);
code(`x = np.arange(5); w = 0.38
plt.figure(figsize=(7, 4.2))
plt.bar(x - w/2, by_level(prem, 'erro_abs'), w, label='premium', color=PREM)
plt.bar(x + w/2, by_level(leve, 'erro_abs'), w, label='leve', color=LEVE)
plt.xticks(x, levels); plt.xlabel('Nivel de instrucao'); plt.ylabel('erro_abs medio')
plt.title('Erro absoluto medio por nivel e configuracao'); plt.legend(); plt.tight_layout(); plt.show()`);
md(`*Interpretação:* em todo nível o premium erra menos. O premium decresce sempre; o leve sobe no n2 e
volta a subir no n5.`);

md(`### 5.2 Linhas — trajetória do erro (achado central)`);
code(`plt.figure(figsize=(7, 4.2))
plt.plot(levels, by_level(prem, 'erro_abs'), 'o-', color=PREM, label='premium')
plt.plot(levels, by_level(leve, 'erro_abs'), 's-', color=LEVE, label='leve')
plt.xticks(levels); plt.xlabel('Nivel de instrucao'); plt.ylabel('erro_abs medio')
plt.title('Trajetoria do erro: premium cai, leve sobe no 5'); plt.legend(); plt.grid(alpha=.3); plt.tight_layout(); plt.show()`);
md(`*Interpretação:* o premium cai de forma **monotônica** (9,7 → 5,1); o leve melhora até o n4 mas **piora
no n5** (9,0 → 10,7) — o efeito "excesso confunde" só no modelo leve.`);

md(`### 5.3 Histograma — distribuição da nota_final`);
code(`plt.figure(figsize=(7, 4.2))
plt.hist(d['nota_final'].dropna(), bins=15, color='#55A868', edgecolor='white')
plt.xlabel('nota_final (0-100)'); plt.ylabel('frequencia'); plt.title('Distribuicao da nota_final (150 execucoes)')
plt.tight_layout(); plt.show()`);
md(`*Interpretação:* a maioria das notas fica entre ~70 e ~90, com cauda à esquerda puxada pelo leve (mais disperso).`);

md(`### 5.4 Boxplot — nota_final por configuração`);
code(`plt.figure(figsize=(6, 4.2))
plt.boxplot([prem['nota_final'].dropna(), leve['nota_final'].dropna()])
plt.xticks([1, 2], ['premium', 'leve']); plt.ylabel('nota_final'); plt.title('nota_final por configuracao')
plt.tight_layout(); plt.show()`);
md(`*Interpretação:* o leve tem mediana mais alta (generoso) e dispersão bem maior, com outliers baixos.`);

md(`### 5.5 Boxplot — erro_abs por configuração`);
code(`plt.figure(figsize=(6, 4.2))
plt.boxplot([prem['erro_abs'].dropna(), leve['erro_abs'].dropna()])
plt.xticks([1, 2], ['premium', 'leve']); plt.ylabel('erro_abs'); plt.title('Erro absoluto por configuracao')
plt.tight_layout(); plt.show()`);
md(`*Interpretação:* o erro do leve é maior e muito mais espalhado (até 42 pontos); o do premium é contido.`);

md(`### 5.6 Dispersão — nº de problemas × nota`);
code(`plt.figure(figsize=(7, 4.2))
for sub, cor, lab in [(prem, PREM, 'premium'), (leve, LEVE, 'leve')]:
    plt.scatter(sub['n_problemas'], sub['nota_final'], color=cor, alpha=.6, label=lab)
plt.xlabel('n de problemas apontados'); plt.ylabel('nota_final'); plt.legend()
plt.title('Numero de problemas x nota'); plt.tight_layout(); plt.show()`);
md(`*Interpretação:* relação negativa (r ≈ −0,67): mais problemas → nota menor. Premium mais à direita (acha mais).`);

md(`### 5.7 Barras — confiabilidade (variação entre repetições)`);
code(`rel = d.groupby(['projeto', 'configuracao', 'nivel_instrucao'])['nota_final'].std(ddof=1).reset_index(name='dp')
rp = [rel[(rel.configuracao == 'premium') & (rel.nivel_instrucao == L)].dp.mean() for L in levels]
rl = [rel[(rel.configuracao == 'leve') & (rel.nivel_instrucao == L)].dp.mean() for L in levels]
plt.figure(figsize=(7, 4.2))
plt.bar(x - w/2, rp, w, label='premium', color=PREM)
plt.bar(x + w/2, rl, w, label='leve', color=LEVE)
plt.xticks(x, levels); plt.xlabel('Nivel'); plt.ylabel('desvio entre repeticoes')
plt.title('Confiabilidade: variacao entre as 3 repeticoes'); plt.legend(); plt.tight_layout(); plt.show()`);
md(`*Interpretação:* premium estável (~2–3); leve muito instável, sobretudo nos extremos (n1 e n5, dp > 11).`);

md(`### 5.8 Barras — custo do premium por nível`);
code(`plt.figure(figsize=(7, 4.2))
plt.bar([str(L) for L in levels], by_level(prem, 'cost_usd'), color=PREM)
plt.xlabel('Nivel'); plt.ylabel('custo medio por execucao (US$)')
plt.title('Custo do premium por nivel — n5 (excesso) e o mais caro'); plt.tight_layout(); plt.show()`);
md(`*Interpretação:* o nível 5 é o mais caro (~$2,21/exec, +44% vs n2) — mais verbosidade = mais tokens/tempo.`);

md(`### 5.9 Barras — profundidade (problemas) por configuração`);
code(`plt.figure(figsize=(5.5, 4.2))
plt.bar(['premium', 'leve'], [prem['n_problemas'].mean(), leve['n_problemas'].mean()], color=[PREM, LEVE])
plt.ylabel('n medio de problemas'); plt.title('Profundidade: problemas apontados por configuracao')
plt.tight_layout(); plt.show()`);
md(`*Interpretação:* premium aponta ~2,4× mais problemas — a profundidade separa as capacidades.`);

md(`## 6. Comparações entre grupos (premium × leve) — Mann-Whitney U`);
code(`for v in ['erro_abs', 'n_problemas', 'nota_final']:
    a = prem[v].dropna(); b = leve[v].dropna()
    u, p = stats.mannwhitneyu(a, b, alternative='two-sided')
    print('%-12s premium med=%.1f vs leve med=%.1f | U=%.0f p=%.4f %s' % (
        v, a.median(), b.median(), u, p, 'SIGNIFICATIVO' if p < 0.05 else 'ns'))
print()
print('Teste do U (n4 vs n5):')
for cfg, sub in [('premium', prem), ('leve', leve)]:
    a = sub[sub.nivel_instrucao == 4].erro_abs.mean(); b = sub[sub.nivel_instrucao == 5].erro_abs.mean()
    print('  %s: n4=%.2f -> n5=%.2f (delta=%+.2f)' % (cfg, a, b, b - a))`);
md(`*Interpretação:* as 3 diferenças premium×leve são significativas (α=0,05): premium mais preciso, aponta
mais problemas; leve mais generoso. O teste n4→n5 mostra o "U" só no leve (Δ=+1,73) — no premium Δ=−1,40.`);

md(`## 7. Correlações`);
code(`for cfg, sub in [('premium', prem), ('leve', leve)]:
    r5 = stats.spearmanr(sub.nivel_instrucao, sub.erro_abs)
    r4 = stats.spearmanr(sub[sub.nivel_instrucao <= 4].nivel_instrucao, sub[sub.nivel_instrucao <= 4].erro_abs)
    print('Spearman nivel x erro %-8s 1-5: rho=%.3f p=%.4f | 1-4: rho=%.3f p=%.4f' % (cfg, r5[0], r5[1], r4[0], r4[1]))
print()
for nome, sub in [('geral', d), ('premium', prem), ('leve', leve)]:
    s = sub.dropna(subset=['n_problemas', 'nota_final'])
    r = stats.pearsonr(s.n_problemas, s.nota_final)
    print('Pearson n_problemas x nota_final %-8s r=%.3f p=%.4f' % (nome, r[0], r[1]))`);
md(`*Interpretação:* a correlação nível×erro é significativa no premium (−0,36) mas **não** no leve — porque
o "U" do leve não é monotônico, o coeficiente linear se anula. Daí a importância de olhar o gráfico/o n4-vs-n5.`);

md(`## 8. Confiabilidade (variância entre repetições)`);
code(`print('dp medio entre repeticoes por configuracao:')
print(rel.groupby('configuracao')['dp'].mean().round(2).to_string())
print()
print('por nivel:')
print(rel.pivot_table('dp', 'nivel_instrucao', 'configuracao', 'mean').round(2).to_string())`);
md(`*Interpretação:* o leve é ~3× menos confiável que o premium (dp 8,0 vs 2,5), e mais instável nos extremos.`);

md(`## 9. Análise de custo

O Claude (premium) reporta custo por execução (\`cost_usd\`). O Gemini (leve) não — usamos o gasto total do
painel (R\\$ 209,95). Conversão ao câmbio de R\\$ 5,18/US\\$. **Tokens não são comparados**
(tokenizadores e cache diferentes); a comparação justa é em **\\$ e tempo**.`);
code(`prem_total_usd = prem['cost_usd'].sum()
print('PREMIUM: total US$%.2f = R$%.2f | media US$%.4f/exec = R$%.2f/exec' % (
    prem_total_usd, prem_total_usd * CAMBIO, prem['cost_usd'].mean(), prem['cost_usd'].mean() * CAMBIO))
print('LEVE:    total R$%.2f = US$%.2f | media R$%.2f/exec = US$%.4f/exec' % (
    GEMINI_TOTAL_BRL, GEMINI_TOTAL_BRL / CAMBIO, GEMINI_TOTAL_BRL / 75, (GEMINI_TOTAL_BRL / 75) / CAMBIO))
print('Premium / leve (custo total): %.2fx' % ((prem_total_usd * CAMBIO) / GEMINI_TOTAL_BRL))
print()
print('Custo medio premium por nivel (US$):')
print(prem.groupby('nivel_instrucao')['cost_usd'].mean().round(4).to_string())
print()
print('Tempo medio (s) por config:', {k: round(v, 0) for k, v in (d.groupby('configuracao')['duration_ms'].mean() / 1000).to_dict().items()})`);
md(`*Interpretação:* premium custou ~2,8× o leve; o nível 5 é o mais caro no premium. O leve **não** é grátis
(R\\$ 209,95). Trade-off: o premium custa mais mas entrega mais precisão e profundidade.`);

md(`## 10. Erro por categoria (premium, níveis 4 e 5)

Onde a IA mais erra ao decompor a nota? Compara as sub-notas \`c1\`–\`c5\` do premium (n4/n5, que revelam
todas as categorias) ao gabarito por categoria.`);
code(`glong = pd.read_csv(achar('gabarito_long.csv'))
catmap = {'g1_funcionamento': 'c1_funcionamento', 'g2_legibilidade': 'c2_legibilidade',
          'g3_estrutura': 'c3_estrutura', 'g4_solid': 'c4_solid', 'g5_nao_funcionais': 'c5_nao_funcionais'}
glong['ccol'] = glong['categoria'].map(catmap)
sub = prem[prem.nivel_instrucao.isin([4, 5])]
for ccol, lab in [('c1_funcionamento', 'c1 Funcionamento'), ('c2_legibilidade', 'c2 Legibilidade'),
                  ('c3_estrutura', 'c3 Estrutura'), ('c4_solid', 'c4 SOLID'), ('c5_nao_funcionais', 'c5 Nao-func')]:
    gk = glong[glong.ccol == ccol][['projeto', 'nota_humana']].rename(columns={'nota_humana': 'gk'})
    m = sub.merge(gk, on='projeto')
    print('%-18s erro=%.2f vies=%+.2f' % (lab, (m[ccol] - m['gk']).abs().mean(), (m[ccol] - m['gk']).mean()))`);
md(`*Interpretação:* erros pequenos (~1–1,7 de 20). O premium é mais acurado em Estrutura (c3) e levemente
generoso em Legibilidade (c2) e SOLID (c4), e levemente severo em Não-funcionais (c5).`);

md(`## 11. Principais descobertas e conclusão

1. **Mais instrução → menos erro** (premium: 9,7 → 5,1; ρ = −0,36, p = 0,002).
2. **O "efeito-U" é condicional à capacidade:** o excesso de instrução (n5) piora o modelo **leve** (9,0 →
   10,7) mas **não** o premium — descoberta-título.
3. **Profundidade revela o tier:** premium aponta ~3× mais problemas (12 vs 4; p < 0,001).
4. **Leve mais generoso e ~3× menos confiável** (nota 84 vs 74; dp entre reps 8,0 vs 2,5).
5. **Custo cresce com a verbosidade** (n5 o mais caro); premium custa ~2,8× o leve (R\\$ 592,70 vs R\\$ 209,95).
6. **Coerência interna:** mais problemas → nota menor (r ≈ −0,67 a −0,78).

**Conclusão:** a qualidade da instrução importa, mas o efeito do *excesso* depende da capacidade do modelo;
a capacidade pesa na profundidade e na confiabilidade; e há um trade-off claro de custo×qualidade. Para usar
IA na avaliação de código: rubrica detalhada (sem excesso), modelo capaz para profundidade, e validação humana.`);

const nb = {
  cells,
  metadata: {
    kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
    language_info: { name: 'python', version: '3.x' },
    colab: { provenance: [] },
  },
  nbformat: 4,
  nbformat_minor: 5,
};
fs.writeFileSync('entregaveis/notebook_colab.ipynb', JSON.stringify(nb, null, 1));
console.log('Notebook gerado: entregaveis/notebook_colab.ipynb | celulas:', cells.length);
