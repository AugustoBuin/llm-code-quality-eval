> 🇬🇧 English · 🇧🇷 [Português](README.md)

# Part 3 — Code to run

Everything you need to **reproduce** the study: collecting the evaluations and analyzing the data.

There are **two paths**. Pick one based on your goal:

| Path | What it does | Requires | Costs money? |
|---|---|---|---|
| **A — Re-analyze only** | Regenerates charts and statistics from the already-collected data | Python (or just a browser, via Colab) | **No** |
| **B — Re-run the collection** | Runs all 150 AI evaluations from scratch | The 5 projects + AI CLIs + API keys + credits | **Yes** (~R$800 in the original study) |

> 🟢 **Most people want Path A.** Path B is only needed to generate new data
> (other projects, other models) and involves real API cost.

---

## Map of this part

| Folder / file | What it is for |
|---|---|
| [`coleta/`](coleta/) | Scripts that **run the 150 evaluations** and consolidate the JSONs into CSV. |
| [`coleta/run_all.sh`](coleta/run_all.sh) | Sequential collection of the 150 runs (resumable, with timeout and retries). |
| [`coleta/run_worker.sh`](coleta/run_worker.sh) | **Parallel** partitioned version (`idx % num_workers`), to speed things up. |
| [`coleta/run_validacao.sh`](coleta/run_validacao.sh) | Runs 8 **instrument-validation** executions before spending the full 150. |
| [`coleta/parse.js`](coleta/parse.js) | Reads the raw JSONs and generates `dados.csv` and `problemas.csv`. |
| [`coleta/projetos.local.config.example`](coleta/projetos.local.config.example) | Template for the **local** config (real project names/paths — you create your own). |
| [`analise/`](analise/) | Scripts that **turn the data into results**. |
| [`analise/gabarito_check.js`](analise/gabarito_check.js) | Validates the human ground truth and computes `nota_global = sum of the 5 categories`. |
| [`analise/gerar_graficos.py`](analise/gerar_graficos.py) | Generates the 9 PNG charts in **PT and EN** (`graficos/` and `graficos/en/`). |
| [`analise/gerar_pdf.py`](analise/gerar_pdf.py) | Generates the report PDFs (PT and EN) via headless Edge. Requires Microsoft Edge + `pip install markdown`. |
| [`analise/gerar_notebook.js`](analise/gerar_notebook.js) | Generates `notebook_colab.ipynb` (all analyses). |
| [`analise/notebook_colab.ipynb`](analise/notebook_colab.ipynb) | Ready-made notebook with the full analysis (descriptive, tests, correlations, cost). |

---

## Path A — Re-analyze the data only (no cost)

### A.1 — In the browser (Google Colab, easiest)

1. Open the notebook online:
   **https://colab.research.google.com/drive/1d2QHmFEUB4UFTtklEqs6vscVBlovVApI?usp=sharing**
2. **Upload** the 4 CSVs from [`../2-resultados/dados/`](../2-resultados/dados/): `dados.csv`,
   `problemas.csv`, `gabarito_computed.csv` and `gabarito_long.csv`.
3. Menu **Runtime → Run all**. The charts and tables appear inline.

### A.2 — On your machine (Python)

Prerequisites: **Python 3.10+** with `pandas`, `numpy`, `scipy`, `matplotlib`.

```bash
pip install pandas numpy scipy matplotlib

# gerar os 9 gráficos a partir dos CSVs em 2-resultados/dados/
cd 3-codigos/analise
python gerar_graficos.py
```

> The scripts expect to find the CSVs in `2-resultados/dados/`. If you moved the files, adjust the
> paths at the top of the script.

---

## Path B — Re-run the full collection (with cost)

Only follow this if you want to **generate new data**. It runs 75 executions of Claude Opus 4.8 and 75 of
Gemini 3.5 Flash — several hours and real API cost.

### B.1 — Prerequisites

- **Git Bash** (Windows) — the scripts are `bash`. (In the original study the environment was Windows + Git Bash.)
- **Node.js** (for `parse.js`).
- **Claude Code CLI** (`claude`) authenticated — `premium` config.
- **Gemini CLI** (`gemini`) with an **API key** — `leve` (the lighter model) config.
- Your **local copy of the 5 projects** to evaluate (this repository does **not** include them — see
  [`../projetos-base/`](../projetos-base/)).

### B.2 — Configure (the part that keeps the real names out of Git)

```bash
cd 3-codigos/coleta

# 1) Diga aos scripts onde estão os projetos e quais são (nomes reais ficam SÓ aqui):
cp projetos.local.config.example projetos.local.config
#   edite projetos.local.config -> ABP e PROJECTS (P1..P5 : pasta real)

# 2) Chave do Gemini (arquivo de 1 linha, NUNCA versionado):
printf '%s' 'SUA_CHAVE_GEMINI' > .gemini_key
```

> `projetos.local.config` and `.gemini_key` are in the [`.gitignore`](../.gitignore) — they do **not**
> go into the repository. That is how the real team names and your key stay protected.

### B.3 — Run

```bash
cd 3-codigos/coleta

# (recomendado) validar o instrumento primeiro — 8 execuções:
bash run_validacao.sh
node parse.js      # confira que as linhas saem limpas

# coleta completa (sequencial, resumível — pode interromper e recomeçar):
bash run_all.sh

#   OU, em paralelo (ex.: 2 workers por config), neutralizando arquivos de IA por fora:
#   bash run_worker.sh premium 0 2 &  bash run_worker.sh premium 1 2 &
#   bash run_worker.sh leve 0 2 &     bash run_worker.sh leve 1 2 &

# consolidar os JSONs brutos em CSV:
node parse.js
```

The raw JSONs go to `coleta/resultados/raw/` (Git-ignored). `parse.js` generates `dados.csv` and
`problemas.csv`; move them to `2-resultados/dados/` to feed the Path A analysis.

### B.4 — Human ground truth

To measure the error you need the ground truth (the human reference score). See
[`../1-processo/instrumento/COMO-AVALIAR-OS-PROJETOS.en.md`](../1-processo/instrumento/COMO-AVALIAR-OS-PROJETOS.en.md),
fill in `gabarito.csv` and run:

```bash
cd 3-codigos/analise
node gabarito_check.js   # valida e gera gabarito_computed.csv + gabarito_long.csv
```

---

## Cost and quota warning

The original collection cost **~R$800** (Claude ≈ R$593 + Gemini ≈ R$210), plus several hours of wall-clock
time. AI models have **quota limits** and **charge per use**. Before scaling up, read the cost section of the
[report](../2-resultados/relatorio-final.en.md) and the [lessons learned](../1-processo/licoes-aprendidas.en.md)
— much of the project's friction came from under-budgeted quota/cost.
