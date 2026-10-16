> 🇬🇧 English · 🇧🇷 [Português](README.md)

# Part 1 — Process used

This part tells **how** the study was conceived and assembled, and **why**. It is the methodology: the
experiment's design, the measurement instrument (the rubric and the prompts) and the lessons learned
along the way.

> 🟢 **Start here** if you want to understand the study. Parts 2 (results) and 3 (code) make more
> sense after reading this.

## Contents

| File | What it is |
|---|---|
| [`desenho-experimental.en.md`](desenho-experimental.en.md) | **The heart of this part.** Explains, for beginners, the 5×2×5×3 design, the factors, the rubric, the instruction levels, the human ground truth and the error formulas. |
| [`licoes-aprendidas.en.md`](licoes-aprendidas.en.md) | An honest retrospective of the process (in 5W3H): what worked, what failed, what it cost and what was learned. |
| [`instrumento/`](instrumento/) | The **collection instrument**: the ruler and the requests made to the AI. |

### The `instrumento/` folder

It is the experiment's "questionnaire" — except the respondent is an AI model.

| File / folder | What it is |
|---|---|
| [`instrumento/rubrica-qualidade-codigo.en.md`](instrumento/rubrica-qualidade-codigo.en.md) | The **rubric**: 5 categories from 0 to 20 (100 total). The single ruler, the same for the AI and for the human. |
| [`instrumento/prompts-niveis-instrucao.en.md`](instrumento/prompts-niveis-instrucao.en.md) | Discussion of the **5 instruction levels** (from minimal to excessive). |
| [`instrumento/prompts/`](instrumento/prompts/) | The **5 exact prompt texts** (`prompt_n1.txt` … `prompt_n5.txt`) sent to the AI. |
| [`instrumento/schemas/`](instrumento/schemas/) | The **5 JSON schemas** that force the output into a clean, validatable format. |
| [`instrumento/COMO-AVALIAR-OS-PROJETOS.en.md`](instrumento/COMO-AVALIAR-OS-PROJETOS.en.md) | Guide for producing the **human ground truth** (evaluating the 5 projects blind). |
| [`instrumento/gabarito_INSTRUCOES.en.md`](instrumento/gabarito_INSTRUCOES.en.md) | How to fill in the `gabarito.csv`. |

## Next parts

- **[Part 2 — Results](../2-resultados/)**: the report, the charts and the data.
- **[Part 3 — Code to run](../3-codigos/)**: how to reproduce the collection and the analysis.
