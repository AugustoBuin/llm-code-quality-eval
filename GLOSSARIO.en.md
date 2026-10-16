> 🇬🇧 English · 🇧🇷 [Português](GLOSSARIO.md)

# Glossary

Technical terms used in the repository, explained in plain language. The idea is that you can understand
the study **with this repository alone**, without prior knowledge of statistics or AI.

## AI, models and the data collection

- **AI / LLM (Large Language Model).** A "language model" — a program trained on large amounts of text
  that responds to written requests. Here it is used to **read code and give it a grade**.
- **Configuration `premium` / `leve`.** The two AI "power levels" being compared. `premium` = a more
  capable (and expensive) model: **Claude Opus 4.8**. `leve` (the lighter model) = a faster, cheaper
  model: **Gemini 3.5 Flash**.
- **Prompt.** The text of the request sent to the AI ("evaluate this project and give it a grade..."). The
  5 prompts of the study are in [`1-processo/instrumento/prompts/`](1-processo/instrumento/prompts/).
- **Instruction level (1–5).** How much of the evaluation ruler the prompt reveals: from the minimum
  (level 1) to excessive detail (level 5). It is the factor the study deliberately manipulates.
- **Token.** The "slice" of text that models count to measure size and to bill. Roughly a word (or a piece
  of one). `tokens_total` and `output_tokens` measure the consumption of each run.
- **CLI (Command-Line Interface) / headless.** Running the AI from the **terminal**, without a graphical
  interface, controlled by scripts. "Headless" = no screen, automated.
- **JSON schema.** A "mold" that forces the AI's response to come in a fixed, validatable format (grade,
  sub-grades, list of problems). It guarantees clean data. See
  [`1-processo/instrumento/schemas/`](1-processo/instrumento/schemas/).
- **Hallucination.** When the AI confidently asserts something **false** — here, pointing out a "problem"
  in the code that **does not exist**. The hallucination rate was measured in
  [`2-resultados/analise-alucinacao/`](2-resultados/analise-alucinacao/).
- **Neutralization / anti-contamination.** Hiding files that would give the AI hints (`CLAUDE.md`,
  `GEMINI.md`, `.clinerules`) during the evaluation, so that it judges the code alone.

## Code quality evaluation

- **Rubric.** The evaluation "ruler": 5 categories from 0 to 20 (100 in total), the same for the AI and for
  the human. In [`1-processo/instrumento/rubrica-qualidade-codigo.en.md`](1-processo/instrumento/rubrica-qualidade-codigo.en.md).
- **Ground truth.** The reference **human** grade for each project — the "truth" against which the AI's
  error is measured. Fixed per project: `G(P1) … G(P5)`.
- **Blind.** Scoring the ground truth **before** seeing the AI's responses, so that the human grade is not
  influenced by it. Protecting this is what keeps the study valid.
- **ISO/IEC 25010.** An international **software quality** standard; here it inspires category c1
  (Functioning / Functional Suitability).
- **Clean Code.** A set of good **readability** practices (clear names, small functions); it inspires
  category c2.
- **DRY (Don't Repeat Yourself).** "Don't repeat yourself": avoiding duplicated code. The basis of
  category c3.
- **SRP (Single Responsibility Principle).** "Single responsibility": each part of the code does just one
  thing. Also in category c3.
- **SOLID.** Five object-oriented design principles (including the SRP) for flexible, decoupled code. It is
  category c4.

## Statistics

- **Factorial experiment.** A design in which **all** values of several factors are combined. Here:
  5 projects × 2 configurations × 5 levels × 3 repetitions = **150** runs.
- **Observation.** Each unit of data — here, **one run** (one recorded evaluation). There are 150.
- **`erro_abs` (absolute error).** How far the AI's grade fell from the ground truth, without direction:
  `|nota_IA − G|`. The smaller it is, the more accurate the AI.
- **`erro_sinal` / bias.** `nota_IA − G`. Positive = the AI was **generous**; negative = **harsh**.
- **Mean, median, mode.** Measures of "center": mean = sum/count; median = the middle value;
  mode = the most frequent value. The **median** is more robust to extreme values.
- **Sample variance / standard deviation.** They measure the "spread" of the data. The sample variance uses
  `n−1` in the denominator (a correction for samples). The standard deviation is the square root of the
  variance (same unit as the data).
- **Coefficient of variation (CV).** Standard deviation divided by the mean (in %). It lets you compare the
  dispersion of groups with different means.
- **Reliability.** Here: the standard deviation of the grade **across the 3 repetitions** of the same
  condition. It measures the "noise" of the automated evaluator — how much the grade wobbles when the same
  request is repeated.
- **Mann-Whitney test (U).** A **non-parametric** test that compares two groups (e.g. premium ×
  leve) without assuming the data follow a normal distribution. Useful when the data are skewed.
- **Spearman / Pearson correlation.** They measure whether two variables "move together". **Pearson**
  captures a **linear** relationship; **Spearman** captures a **monotonic** (rank-based) relationship and
  is more robust. Value from −1 to +1.
- **p-value / significance.** The chance of seeing a result as extreme as the observed one if there were no
  real effect. By convention, `p < 0.05` is considered "statistically significant".
- **U-shaped effect.** A "U"-shaped pattern: the error **drops** and then **rises again**. The hypothesis
  was that too much instruction (level 5) would worsen the AI. The study found a **conditional** U: it only
  appears in the leve model (see [report](2-resultados/relatorio-final.en.md)).
- **Confounding.** When two effects cannot be separated. Here, `premium` and `leve` differ in **vendor**
  and in **capacity** at the same time — which is why the conclusions speak of "configuration", never of
  brand.

## Git and the repository

- **Submodule (git submodule).** A Git repository **referenced** inside another, without copying the code.
  It will be used (subject to authorization) to point to the 5 base projects while preserving their
  authorship. See [`projetos-base/`](projetos-base/).
- **`.gitignore`.** A list of files that Git **ignores** on purpose — here, secrets (`.gemini_key`), local
  config (`projetos.local.config`) and heavy outputs.
- **MIT / CC BY 4.0 license.** MIT covers the **code**; CC BY 4.0 covers the **content** (texts, data,
  charts). See [`LICENSE`](LICENSE) and [`LICENSE-CONTENT.en.md`](LICENSE-CONTENT.en.md).
</content>
</invoke>
