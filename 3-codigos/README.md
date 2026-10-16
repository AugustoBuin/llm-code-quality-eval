> 🇧🇷 Português · 🇬🇧 [English](README.en.md)

# Parte 3 — Códigos para rodar

Tudo que é necessário para **reproduzir** o estudo: a coleta das avaliações e a análise dos dados.

Há **dois caminhos**. Escolha pelo seu objetivo:

| Caminho | O que faz | Precisa de | Custa dinheiro? |
|---|---|---|---|
| **A — Só re-analisar** | Refaz gráficos e estatísticas a partir dos dados já coletados | Python (ou só o navegador, via Colab) | **Não** |
| **B — Refazer a coleta** | Roda as 150 avaliações de IA do zero | Os 5 projetos + CLIs de IA + chaves de API + créditos | **Sim** (~R$800 no estudo original) |

> 🟢 **A maioria das pessoas quer o Caminho A.** O Caminho B só é necessário para gerar dados novos
> (outros projetos, outros modelos) e envolve custo real de API.

---

## Mapa desta parte

| Pasta / arquivo | Para que serve |
|---|---|
| [`coleta/`](coleta/) | Scripts que **rodam as 150 avaliações** e consolidam os JSONs em CSV. |
| [`coleta/run_all.sh`](coleta/run_all.sh) | Coleta sequencial das 150 execuções (resumível, com timeout e retries). |
| [`coleta/run_worker.sh`](coleta/run_worker.sh) | Versão **paralela** particionada (`idx % num_workers`), para acelerar. |
| [`coleta/run_validacao.sh`](coleta/run_validacao.sh) | Roda 8 execuções de **validação do instrumento** antes de gastar as 150. |
| [`coleta/parse.js`](coleta/parse.js) | Lê os JSONs brutos e gera `dados.csv` e `problemas.csv`. |
| [`coleta/projetos.local.config.example`](coleta/projetos.local.config.example) | Modelo da config **local** (nomes/caminhos reais dos projetos — você cria o seu). |
| [`analise/`](analise/) | Scripts que **transformam os dados em resultados**. |
| [`analise/gabarito_check.js`](analise/gabarito_check.js) | Valida o gabarito humano e calcula `nota_global = soma das 5 categorias`. |
| [`analise/gerar_graficos.py`](analise/gerar_graficos.py) | Gera os 9 gráficos PNG em **PT e EN** (`graficos/` e `graficos/en/`). |
| [`analise/gerar_pdf.py`](analise/gerar_pdf.py) | Gera os PDFs do relatório (PT e EN) via Edge headless. Requer Microsoft Edge + `pip install markdown`. |
| [`analise/gerar_notebook.js`](analise/gerar_notebook.js) | Gera o `notebook_colab.ipynb` (todas as análises). |
| [`analise/notebook_colab.ipynb`](analise/notebook_colab.ipynb) | Notebook pronto com a análise completa (descritiva, testes, correlações, custo). |

---

## Caminho A — Só re-analisar os dados (sem custo)

### A.1 — Pelo navegador (Google Colab, mais fácil)

1. Abra o notebook online:
   **https://colab.research.google.com/drive/1d2QHmFEUB4UFTtklEqs6vscVBlovVApI?usp=sharing**
2. Faça **upload** dos 4 CSVs de [`../2-resultados/dados/`](../2-resultados/dados/): `dados.csv`,
   `problemas.csv`, `gabarito_computed.csv` e `gabarito_long.csv`.
3. Menu **Ambiente de execução → Executar tudo**. Os gráficos e tabelas aparecem inline.

### A.2 — Na sua máquina (Python)

Pré-requisitos: **Python 3.10+** com `pandas`, `numpy`, `scipy`, `matplotlib`.

```bash
pip install pandas numpy scipy matplotlib

# gerar os 9 gráficos a partir dos CSVs em 2-resultados/dados/
cd 3-codigos/analise
python gerar_graficos.py
```

> Os scripts esperam encontrar os CSVs em `2-resultados/dados/`. Se moveu os arquivos, ajuste os
> caminhos no topo do script.

---

## Caminho B — Refazer a coleta completa (com custo)

Só siga se você quer **gerar dados novos**. Isso roda 75 execuções do Claude Opus 4.8 e 75 do
Gemini 3.5 Flash — várias horas e custo real de API.

### B.1 — Pré-requisitos

- **Git Bash** (Windows) — os scripts são `bash`. (No estudo original o ambiente foi Windows + Git Bash.)
- **Node.js** (para `parse.js`).
- **Claude Code CLI** (`claude`) autenticado — config `premium`.
- **Gemini CLI** (`gemini`) com uma **chave de API** — config `leve`.
- Sua **cópia local dos 5 projetos** a avaliar (este repositório **não** os inclui — veja
  [`../projetos-base/`](../projetos-base/)).

### B.2 — Configurar (a parte que mantém os nomes reais fora do Git)

```bash
cd 3-codigos/coleta

# 1) Diga aos scripts onde estão os projetos e quais são (nomes reais ficam SÓ aqui):
cp projetos.local.config.example projetos.local.config
#   edite projetos.local.config -> ABP e PROJECTS (P1..P5 : pasta real)

# 2) Chave do Gemini (arquivo de 1 linha, NUNCA versionado):
printf '%s' 'SUA_CHAVE_GEMINI' > .gemini_key
```

> `projetos.local.config` e `.gemini_key` estão no [`.gitignore`](../.gitignore) — eles **não** vão
> para o repositório. É assim que os nomes reais das equipes e a sua chave ficam protegidos.

### B.3 — Rodar

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

Os JSONs brutos vão para `coleta/resultados/raw/` (ignorada pelo Git). O `parse.js` gera `dados.csv` e
`problemas.csv`; mova-os para `2-resultados/dados/` para alimentar a análise do Caminho A.

### B.4 — Gabarito humano

Para medir o erro você precisa do gabarito (a nota humana de referência). Veja
[`../1-processo/instrumento/COMO-AVALIAR-OS-PROJETOS.md`](../1-processo/instrumento/COMO-AVALIAR-OS-PROJETOS.md),
preencha o `gabarito.csv` e rode:

```bash
cd 3-codigos/analise
node gabarito_check.js   # valida e gera gabarito_computed.csv + gabarito_long.csv
```

---

## Aviso de custo e cota

A coleta original custou **~R$800** (Claude ≈ R$593 + Gemini ≈ R$210), além de várias horas de relógio.
Modelos de IA têm **limites de cota** e **cobram por uso**. Antes de escalar, leia a seção de custo do
[relatório](../2-resultados/relatorio-final.md) e as [lições aprendidas](../1-processo/licoes-aprendidas.md)
— boa parte do atrito do projeto veio de cota/custo subdimensionados.
