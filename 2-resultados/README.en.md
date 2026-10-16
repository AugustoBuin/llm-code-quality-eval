> 🇬🇧 English · 🇧🇷 [Português](README.md)

# Part 2 — Results

This part presents **what was found**: the full report, the charts, the hallucination
check, and the raw (anonymized) data that backs everything up.

## The main finding, in one sentence

> The AI's error **drops** as the instruction becomes more detailed — but an **excess** of instruction only
> hurts the **`leve` (the lighter model)** (a U-shaped effect **conditional on capacity**). The premium model is more accurate,
> flags ~3× more problems, and is more reliable, at the cost of being ~2.8× more expensive.

## Contents

| File / folder | What it is |
|---|---|
| [`relatorio-final.en.md`](relatorio-final.en.md) | **The full report** (17 parts): descriptive statistics, tests, correlations, cost, hallucination, and interpretations. PDF version: [`relatorio-final.pdf`](relatorio-final.pdf). |
| [`graficos/`](graficos/) | The **9 charts** (PNG) used in the report — error by level, boxplots, scatter plots, reliability, cost, etc. |
| [`analise-alucinacao/`](analise-alucinacao/) | Factual check of a sample of 30 problems flagged by the AI: how many were real vs. invented. |
| [`dados/`](dados/) | The **data** that feeds the analysis (all anonymized as P1–P5). |

### The `dados/` folder

| File | 1 row = | Key columns |
|---|---|---|
| [`dados/dados.csv`](dados/dados.csv) | one **run** (out of 150) | `projeto, configuracao, nivel_instrucao, repeticao, nota_final, c1..c5, n_problemas, tokens, cost_usd, duration_ms` |
| [`dados/problemas.csv`](dados/problemas.csv) | one **problem flagged** by the AI | `projeto, configuracao, nivel, repeticao, idx, categoria, severidade` |
| [`dados/gabarito_computed.csv`](dados/gabarito_computed.csv) | one **project** (human ground truth) | `projeto, g1..g5, nota_global` |
| [`dados/gabarito.csv`](dados/gabarito.csv) | the human ground truth **input** (without the sum) | same, without `nota_global` |
| [`dados/gabarito_long.csv`](dados/gabarito_long.csv) | one **project × category** | `projeto, categoria, nota_humana` |

> **Anonymization.** The evaluated projects appear only as P1–P5. The real team names are nowhere
> in this repository (see Part 3 and [`projetos-base/`](../projetos-base/)). In this public version,
> the free-text fields that quoted the teams' code (each issue's description, the gold standard's notes and
> the hallucination-check evidence) are withheld; none of the numbers in the analysis depend on them.

## How to reproduce

The analysis that produces these numbers and charts is in **[Part 3 — Code](../3-codigos/)**. The fastest
path is to open the notebook in Google Colab (link in Part 3) and upload the CSVs from [`dados/`](dados/).
