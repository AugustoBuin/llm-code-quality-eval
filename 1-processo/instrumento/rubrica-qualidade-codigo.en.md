> 🇬🇧 English · 🇧🇷 [Português](rubrica-qualidade-codigo.md)

# Code Quality Assessment Rubric

**Final Project – Applied Statistics (DSM / FATEC)**
**Using AI to evaluate code in academic projects**

---

## How this rubric is used (read first)

This rubric has **two distinct roles** that must NOT be mixed:

1. **Measuring ruler (FIXED).** The complete rubric — the 5 categories, 100 points — is
   applied identically to:
   - **human ground truth**: you score the 5 projects once → produces `nota_humana_ref`;
   - **reading each AI output**: the AI returns its own score → `nota_ia`.
   The ruler **never changes** between runs. That is what makes the 150 observations comparable.

2. **Experimental manipulation (VARIABLE).** The `nivel_instrucao` factor controls **how much
   of this rubric is revealed to the AI in the prompt** (see table at the end). The way the
   output is scored does NOT change — only what the AI was told changes.

> Ordering principle: the categories are arranged **from the most obvious to the least obvious**
> for a beginner developer. A poorly instructed evaluator tends to capture the obvious
> categories on its own; the value of instructing lies in forcing attention to the non-obvious ones.

**Scale per category (0–20):**

| Range | Meaning |
|------:|---------|
| 0–4   | Absent / critical problem |
| 5–9   | Deficient |
| 10–13 | Fair |
| 14–17 | Good |
| 18–20 | Excellent |

**Final score = sum of the 5 categories (0–100).** Equal weights (20 each) by default —
adjustable if you want to give more weight to the non-obvious (record the decision in the report).

Legend: **[O]** = objective criterion (checkable by linter/metric/tool) ·
**[S]** = subjective criterion (depends on judgment).

---

## Category 1 — Functioning and Basic Conformance  *(MOST OBVIOUS)*  — 20 pts
Anchor: **ISO/IEC 25010 — Functional Suitability** (completeness, correctness, appropriateness).

- **[O]** The code compiles / runs without errors.
- **[O]** The features specified in the PBL are present.
- **[O]** Absence of obvious dead, commented-out or broken code.
- **[S]** The result matches the project's stated objective.

---

## Category 2 — Readability and Standardization  — 20 pts
Anchor: **Clean Code** (names, formatting) · **ISO 25010 — Analysability**.

- **[O]** Consistent naming convention (verifiable by linter).
- **[O]** Consistent formatting and indentation (formatter/linter).
- **[S]** Meaningful names for variables, functions and classes.
- **[S]** Useful comments — they explain the "why", not the obvious.

---

## Category 3 — Structure and Organization  — 20 pts
Anchor: **Clean Code (DRY, small functions)** · **SOLID — SRP** · **ISO 25010 — Modularity**.

- **[O]** Short functions/methods (e.g.: line limit; low cyclomatic complexity).
- **[O]** Absence of relevant duplication (DRY) — detectable by a clone detector.
- **[S]** Single responsibility per function/module (SRP).
- **[S]** Separation of layers / adequate cohesion.

---

## Category 4 — Design and SOLID Principles  — 20 pts
Anchor: **SOLID — OCP, LSP, ISP, DIP** · **ISO 25010 — Modifiability, Reusability**.

- **[S]** Adequate abstractions/interfaces; dependence on abstractions (DIP/ISP).
- **[S]** Open for extension, closed for modification (OCP).
- **[S]** Low coupling and high cohesion between modules.
- **[S]** Substitutability of subtypes without breaking the contract (LSP).

> Mostly subjective category: it requires experience → tends to be **invisible** for
> beginners and only appears when explicitly instructed.

---

## Category 5 — "Invisible" Non-Functional Attributes  *(LEAST OBVIOUS)*  — 20 pts
Anchor: **ISO/IEC 25010 — Security, Reliability, Performance Efficiency,
Testability, Portability**.

- **[O]** Error/exception handling and edge cases.
- **[O]** Existence / coverage of automated tests.
- **[O]** Obvious vulnerabilities (unvalidated input, secrets in the code) — SAST/lint.
- **[S]** Efficiency/performance appropriate to the project context.
- **[S]** Portability / externalized configuration (no hardcoded values in the code).

---

## Mapping: instruction levels (`nivel_instrucao`)

What changes is **how much of the rubric above goes into the prompt** — the way the output is scored is always the complete ruler.

| Level | Label | What is revealed to the AI in the prompt |
|------:|-------|------------------------------------------|
| 1 | Minimal | Nothing of the rubric. E.g.: *"Rate the quality of this code from 0 to 100 and justify."* |
| 2 | Little | Only the obvious categories (1 and 2), titles only. |
| 3 | Reasonable | Categories 1–3 with a brief description. |
| 4 | Much | Complete rubric (1–5) with description and criteria. |
| 5 | Excessive | Complete rubric + all sub-criteria, exhaustive examples, repeated emphasis and redundant instructions (tests whether "too much instruction" degrades the result). |

**Working hypothesis:** `erro_abs = |nota_ia − nota_humana_ref|` should decrease from
Minimal → Much (the AI starts to see the non-obvious) and may **rise again** at
Excessive (overload / hallucination). The shape of this curve is the central result.

---

## Standardized output expected from the AI (JSON schema)

To automate the collection of the 150 runs, instruct the AI to respond **only** with:

The model returns **only** the evaluation block below; the metadata (`projeto`,
`configuracao`, `nivel_instrucao`, `repeticao`) is appended by you when assembling the CSV.

```json
{
  "nota_final": 0,
  "categorias": {
    "c1_funcionamento": 0,
    "c2_legibilidade": 0,
    "c3_estrutura": 0,
    "c4_solid": 0,
    "c5_nao_funcionais": 0
  },
  "problemas": [
    { "categoria": "c5_nao_funcionais", "severidade": "alta", "descricao": "..." }
  ],
  "n_problemas": 0
}
```

`nota_final`, `categorias` and `n_problemas` feed directly into the CSV. `problemas[]` serves
for hallucination verification (checking, on a sample, whether each item really exists in the code).
