> 🇬🇧 English · 🇧🇷 [Português](desenho-experimental.md)

# Experimental design — the "how" and the "why"

This document explains **how the study was set up** and **why** each decision was made, in a way that
someone with no familiarity with statistics or AI models can follow along. Technical terms are explained
here and in the [GLOSSARY](../GLOSSARIO.en.md).

---

## 1. The question

> When we ask an **AI** to evaluate the quality of a piece of code, **how much does the level of detail
> in the instruction** we give it matter, and **how much does the capacity of the model** used matter?

"Evaluating quality" here means giving a **score from 0 to 100** to a software project and pointing out
its problems. We want to know whether the AI comes close to a **human ground truth** (the "true" score,
given by a person who read the code carefully) and what makes it err more or less.

---

## 2. The ingredients of the experiment (the "factors")

A **factorial experiment** is one in which we combine all the values of several factors with each other.
Here there are four factors:

| Factor | What it is | Values |
|---|---|---|
| **Project** | Which software is being evaluated | P1, P2, P3, P4, P5 (5 full-stack academic projects, anonymized) |
| **Configuration** | The "capacity" of the AI model | `premium` = Claude Opus 4.8 · `leve` = Gemini 3.5 Flash |
| **Instruction level** | How much of the evaluation yardstick is revealed in the request | 1, 2, 3, 4, 5 |
| **Repetition** | The same condition repeated to measure the "noise" | 1, 2, 3 |

Multiplying everything out: **5 × 2 × 5 × 3 = 150 runs**. Each run is **one** automated evaluation
(one AI configuration, at a given level, reads a project and returns a score + problems). 150 is the number of
"observations" in the study. (For an individual assignment, the required minimum was 80; we collected 150,
with room to spare.)

> **Why repeat 3 times?** AI models are not deterministic: asking the same thing twice
> can yield slightly different answers. Repeating measures this **variability** (called here
> *reliability*): how much the score "wobbles" between repetitions of the same condition.

---

## 3. The yardstick: the quality rubric

So that the score isn't a guess, we defined a fixed **rubric** — the same yardstick for the AI and for the
human ground truth. There are **5 categories, each from 0 to 20 points**, summing to **100**:

| Category | Measures | Conceptual basis |
|---|---|---|
| **c1 — Functioning** | Does the code run and deliver what is expected? | ISO/IEC 25010 (Functional Suitability) |
| **c2 — Readability** | Names, formatting, consistency | Clean Code |
| **c3 — Structure** | Cohesive functions, no duplication | DRY / SRP |
| **c4 — SOLID** | Abstractions and low coupling | SOLID principles |
| **c5 — Non-functional** | Security, tests, performance | — |

The five categories have **equal weight**. The complete rubric is in
[`instrumento/rubrica-qualidade-codigo.en.md`](instrumento/rubrica-qualidade-codigo.en.md).

---

## 4. The main factor: the instruction level

This is the factor the study "tweaks" on purpose. The **5 levels reveal the rubric progressively** —
from the vaguest request to the most detailed (and possibly *too detailed*):

| Level | How much of the rubric the prompt reveals |
|---|---|
| **1** | Nothing — just "give a score from 0 to 100 and point out problems" |
| **2** | The first 2 categories (c1, c2) |
| **3** | The first 3 (c1–c3) |
| **4** | All 5 categories, with descriptions |
| **5** | All 5 categories with **exhaustive** descriptions ("excessive" instruction) |

The exact texts are in [`instrumento/prompts/`](instrumento/prompts/) and the discussion of each level in
[`instrumento/prompts-niveis-instrucao.en.md`](instrumento/prompts-niveis-instrucao.en.md). For each level there
is also a **JSON schema** ([`instrumento/schemas/`](instrumento/schemas/)) that forces the AI's output into a
clean, validatable format (score, sub-scores, list of problems).

> **The "U-shaped effect" hypothesis:** we expected the error to **fall** from level 1 to 4 (more instruction,
> more precision) and perhaps **rise again** at level 5 (too much instruction confuses). That is why the design
> is "U"-shaped. The actual result (and the surprise) is in the [report](../2-resultados/relatorio-final.en.md).

---

## 5. The human ground truth

To measure the AI's **error**, we need a reference truth: the **human score** of each project, given by a
person applying the same rubric. This is the **ground truth**.

- It is fixed **per project**: `G(P1) … G(P5)` (a score 0–100 each), not per run.
- It was filled in **blind** — before looking at any AI response. This is crucial: if the person
  read first what the AI pointed out, the human score would "anchor" to the AI's and the error would fall
  artificially, **invalidating the study**. The independence of the ground truth is non-negotiable.
- The step-by-step is in [`instrumento/COMO-AVALIAR-OS-PROJETOS.en.md`](instrumento/COMO-AVALIAR-OS-PROJETOS.en.md)
  and [`instrumento/gabarito_INSTRUCOES.en.md`](instrumento/gabarito_INSTRUCOES.en.md).

---

## 6. The main calculations (derived variables)

From the AI's score (`nota_final`) and the ground truth (`G`), the following are computed:

- **Absolute error** — how far the AI was from the truth, without caring about the direction:
  $$\text{erro\_abs} = \lvert \text{nota\_final} - G(\text{projeto}) \rvert$$
- **Signed error (bias)** — shows whether the AI tends to be **generous** (positive) or **harsh**
  (negative):
  $$\text{erro\_sinal} = \text{nota\_final} - G(\text{projeto})$$

Other measures used in the report: **sample variance** (with *n*−1), **standard deviation**,
**coefficient of variation (CV)**, the **Mann-Whitney** test (to compare premium × leve without assuming
a normal distribution), **Spearman** and **Pearson** correlations, and **reliability** (standard deviation
across the 3 repetitions). What each one means is in the [GLOSSARY](../GLOSSARIO.en.md).

---

## 7. Safeguards that protect validity

- **Anti-contamination.** Before each run, the scripts **hide** files that would give hints to the
  AI (`CLAUDE.md`, `GEMINI.md`, `.clinerules`, etc.) and **restore** them at the end. This way the AI evaluates
  only the code, not instructions left behind by the authors.
- **Same yardstick, same scope.** The AI and the human evaluate the **whole project** (frontend + backend),
  ignoring dependencies (`node_modules`), generated code and assets.
- **Declared confounding.** The two configurations differ in **vendor** (Anthropic × Google) and in
  **tier** at the same time. The two effects cannot be separated, so the study always concludes in
  terms of "leve/premium configuration", **never** in terms of brand.
- **Resumability and timeout.** Collecting 150 runs is long and prone to quota/network failures; the
  scripts are **resumable** (they continue from where they stopped) and have a **timeout** per run.

The honest retrospective of everything that went right and wrong is in
[`licoes-aprendidas.en.md`](licoes-aprendidas.en.md).

---

## 8. In one sentence

> 5 projects × 2 AI configurations × 5 instruction levels × 3 repetitions = **150 automated
> evaluations**, compared against a **blind human ground truth**, to measure how **instruction** and
> **model capacity** affect the **precision**, the **severity** and the **cost** of code evaluation.
