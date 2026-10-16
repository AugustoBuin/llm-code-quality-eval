# Gera os 9 gráficos da análise (PNG), em português e inglês.
#   PT -> 2-resultados/graficos/        EN -> 2-resultados/graficos/en/
# Uso: python gerar_graficos.py   (pode rodar de qualquer diretório)
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Caminhos resolvidos a partir da localização deste script (layout do repositório:
# 3-codigos/analise/gerar_graficos.py  ->  raiz é dois níveis acima).
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(REPO, '2-resultados', 'dados')
GRAF = os.path.join(REPO, '2-resultados', 'graficos')
PREM, LEVE = '#4C72B0', '#C44E52'

# --- dados (compartilhado entre os dois idiomas) -----------------------------
d = pd.read_csv(os.path.join(DATA, 'dados.csv'))
d['parse_ok'] = d['parse_ok'].astype(str).str.lower().eq('true')
d = d[d['parse_ok']].copy()
for c in ['nota_final', 'n_problemas', 'cost_usd', 'duration_ms']:
    d[c] = pd.to_numeric(d[c], errors='coerce')
g = pd.read_csv(os.path.join(DATA, 'gabarito_computed.csv'))[['projeto', 'nota_global']].rename(columns={'nota_global': 'nota_humana'})
d = d.merge(g, on='projeto', how='left')
d['erro_abs'] = (d['nota_final'] - d['nota_humana']).abs()
levels = [1, 2, 3, 4, 5]
prem, leve = d[d.configuracao == 'premium'], d[d.configuracao == 'leve']

def by_level(sub, col, fn='mean'):
    return [getattr(sub[sub.nivel_instrucao == L][col], fn)() for L in levels]

# --- rótulos por idioma ------------------------------------------------------
# 'premium' e 'leve' são valores de configuração (tokens) e ficam iguais nos dois idiomas.
LABELS = {
    'pt': {
        'g1_title': 'Erro absoluto médio por nível e configuração', 'g1_x': 'Nível de instrução', 'g1_y': 'erro_abs médio (pontos)',
        'g2_title': 'Trajetória do erro por nível: premium cai, leve sobe no 5', 'g2_x': 'Nível de instrução', 'g2_y': 'erro_abs médio',
        'g3_title': 'Distribuição da nota_final (150 execuções)', 'g3_x': 'nota_final (0–100)', 'g3_y': 'frequência',
        'g4_title': 'nota_final por configuração', 'g4_y': 'nota_final',
        'g5_title': 'Erro absoluto por configuração', 'g5_y': 'erro_abs',
        'g6_title': 'Nº de problemas × nota (r ≈ −0,67)', 'g6_x': 'nº de problemas apontados', 'g6_y': 'nota_final',
        'g7_title': 'Confiabilidade: variação entre as 3 repetições', 'g7_x': 'Nível de instrução', 'g7_y': 'desvio-padrão entre repetições',
        'g8_title': 'Custo do premium por nível — o nível 5 (excesso) é o mais caro', 'g8_x': 'Nível de instrução', 'g8_y': 'custo médio por execução (US$)',
        'g9_title': 'Profundidade: problemas apontados por configuração', 'g9_y': 'nº médio de problemas apontados',
    },
    'en': {
        'g1_title': 'Mean absolute error by level and configuration', 'g1_x': 'Instruction level', 'g1_y': 'mean erro_abs (points)',
        'g2_title': 'Error trajectory by level: premium falls, leve rises at 5', 'g2_x': 'Instruction level', 'g2_y': 'mean erro_abs',
        'g3_title': 'Distribution of nota_final (150 runs)', 'g3_x': 'nota_final (0–100)', 'g3_y': 'frequency',
        'g4_title': 'nota_final by configuration', 'g4_y': 'nota_final',
        'g5_title': 'Absolute error by configuration', 'g5_y': 'erro_abs',
        'g6_title': 'Number of issues × score (r ≈ −0.67)', 'g6_x': 'number of issues reported', 'g6_y': 'nota_final',
        'g7_title': 'Reliability: variation across the 3 repetitions', 'g7_x': 'Instruction level', 'g7_y': 'standard deviation across repetitions',
        'g8_title': 'premium cost by level — level 5 (excess) is the most expensive', 'g8_x': 'Instruction level', 'g8_y': 'mean cost per run (US$)',
        'g9_title': 'Depth: issues reported by configuration', 'g9_y': 'mean number of issues reported',
    },
}

def make(lang, out):
    os.makedirs(out, exist_ok=True)
    L = LABELS[lang]
    x = np.arange(5); w = 0.38

    def save(name):
        plt.tight_layout(); plt.savefig(f'{out}/{name}', dpi=120); plt.close(); print('ok', lang, name)

    # 1) Barras agrupadas: erro_abs por nível, premium vs leve  (o achado do "U")
    plt.figure(figsize=(7, 4.2))
    plt.bar(x - w/2, by_level(prem, 'erro_abs'), w, label='premium', color=PREM)
    plt.bar(x + w/2, by_level(leve, 'erro_abs'), w, label='leve', color=LEVE)
    plt.xticks(x, levels); plt.xlabel(L['g1_x']); plt.ylabel(L['g1_y'])
    plt.title(L['g1_title']); plt.legend()
    save('g1_erro_por_nivel_barras.png')

    # 2) Linhas: erro_abs por nível (premium monotônico vs leve em U)
    plt.figure(figsize=(7, 4.2))
    plt.plot(levels, by_level(prem, 'erro_abs'), 'o-', color=PREM, label='premium')
    plt.plot(levels, by_level(leve, 'erro_abs'), 's-', color=LEVE, label='leve')
    plt.xticks(levels); plt.xlabel(L['g2_x']); plt.ylabel(L['g2_y'])
    plt.title(L['g2_title']); plt.legend(); plt.grid(alpha=.3)
    save('g2_erro_por_nivel_linha.png')

    # 3) Histograma de nota_final (geral)
    plt.figure(figsize=(7, 4.2))
    plt.hist(d['nota_final'].dropna(), bins=15, color='#55A868', edgecolor='white')
    plt.xlabel(L['g3_x']); plt.ylabel(L['g3_y']); plt.title(L['g3_title'])
    save('g3_histograma_nota.png')

    # 4) Boxplot nota_final por configuração
    plt.figure(figsize=(6, 4.2))
    plt.boxplot([prem['nota_final'].dropna(), leve['nota_final'].dropna()])
    plt.xticks([1, 2], ['premium', 'leve']); plt.ylabel(L['g4_y']); plt.title(L['g4_title'])
    save('g4_boxplot_nota_config.png')

    # 5) Boxplot erro_abs por configuração
    plt.figure(figsize=(6, 4.2))
    plt.boxplot([prem['erro_abs'].dropna(), leve['erro_abs'].dropna()])
    plt.xticks([1, 2], ['premium', 'leve']); plt.ylabel(L['g5_y']); plt.title(L['g5_title'])
    save('g5_boxplot_erro_config.png')

    # 6) Dispersão n_problemas × nota_final, cor por config
    plt.figure(figsize=(7, 4.2))
    for sub, cor, lab in [(prem, PREM, 'premium'), (leve, LEVE, 'leve')]:
        plt.scatter(sub['n_problemas'], sub['nota_final'], color=cor, alpha=.6, label=lab)
    plt.xlabel(L['g6_x']); plt.ylabel(L['g6_y']); plt.legend()
    plt.title(L['g6_title'])
    save('g6_dispersao_problemas_nota.png')

    # 7) Confiabilidade: dp entre repetições por nível, premium vs leve
    rel = d.groupby(['projeto', 'configuracao', 'nivel_instrucao'])['nota_final'].std(ddof=1).reset_index(name='dp')
    rp = [rel[(rel.configuracao == 'premium') & (rel.nivel_instrucao == L_)].dp.mean() for L_ in levels]
    rl = [rel[(rel.configuracao == 'leve') & (rel.nivel_instrucao == L_)].dp.mean() for L_ in levels]
    plt.figure(figsize=(7, 4.2))
    plt.bar(x - w/2, rp, w, label='premium', color=PREM)
    plt.bar(x + w/2, rl, w, label='leve', color=LEVE)
    plt.xticks(x, levels); plt.xlabel(L['g7_x']); plt.ylabel(L['g7_y'])
    plt.title(L['g7_title']); plt.legend()
    save('g7_confiabilidade_por_nivel.png')

    # 8) Custo do premium por nível (US$)
    plt.figure(figsize=(7, 4.2))
    plt.bar([str(L_) for L_ in levels], by_level(prem, 'cost_usd'), color=PREM)
    plt.xlabel(L['g8_x']); plt.ylabel(L['g8_y'])
    plt.title(L['g8_title'])
    save('g8_custo_premium_por_nivel.png')

    # 9) Nº de problemas médio por configuração
    plt.figure(figsize=(5.5, 4.2))
    plt.bar(['premium', 'leve'], [prem['n_problemas'].mean(), leve['n_problemas'].mean()], color=[PREM, LEVE])
    plt.ylabel(L['g9_y']); plt.title(L['g9_title'])
    save('g9_problemas_por_config.png')

make('pt', GRAF)
make('en', os.path.join(GRAF, 'en'))
print('TODOS os gráficos gerados em', GRAF, '(PT) e', os.path.join(GRAF, 'en'), '(EN)')
