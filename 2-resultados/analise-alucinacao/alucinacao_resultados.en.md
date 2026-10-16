> 🇬🇧 English · 🇧🇷 [Português](alucinacao_resultados.md)

# Hallucination analysis — results

Sample of **30 issues** flagged by the AI (15 premium + 15 leve, 3 per project×config), verified
one by one against the **actual source code** of the projects. Verdict per claim:
- **TRUE** = the claim checks out against the code.
- **PARTIAL** = the core holds, but there is an inaccuracy in a described detail/mechanism.
- **FALSE** = hallucination (the claim is factually false; the code does not contain what is described).

> **Public version:** the evidence column is withheld. It quoted files, lines and excerpts of the
> teams' code, which would make them identifiable. The verdicts and the summary are unchanged.

| id | proj | config | verdict | evidence |
|---|---|---|---|---|
| 1 | P1 | leve | **FALSE** | *withheld* |
| 2 | P1 | leve | TRUE | *withheld* |
| 3 | P1 | leve | PARTIAL | *withheld* |
| 4 | P1 | premium | TRUE | *withheld* |
| 5 | P1 | premium | TRUE | *withheld* |
| 6 | P1 | premium | TRUE | *withheld* |
| 7 | P2 | leve | TRUE | *withheld* |
| 8 | P2 | leve | PARTIAL | *withheld* |
| 9 | P2 | leve | PARTIAL | *withheld* |
| 10 | P2 | premium | TRUE | *withheld* |
| 11 | P2 | premium | TRUE | *withheld* |
| 12 | P2 | premium | TRUE | *withheld* |
| 13 | P3 | leve | PARTIAL | *withheld* |
| 14 | P3 | leve | TRUE | *withheld* |
| 15 | P3 | leve | TRUE | *withheld* |
| 16 | P3 | premium | TRUE | *withheld* |
| 17 | P3 | premium | TRUE | *withheld* |
| 18 | P3 | premium | PARTIAL | *withheld* |
| 19 | P4 | leve | TRUE | *withheld* |
| 20 | P4 | leve | TRUE | *withheld* |
| 21 | P4 | leve | TRUE | *withheld* |
| 22 | P4 | premium | TRUE | *withheld* |
| 23 | P4 | premium | TRUE | *withheld* |
| 24 | P4 | premium | TRUE | *withheld* |
| 25 | P5 | leve | TRUE | *withheld* |
| 26 | P5 | leve | TRUE | *withheld* |
| 27 | P5 | leve | TRUE | *withheld* |
| 28 | P5 | premium | TRUE | *withheld* |
| 29 | P5 | premium | PARTIAL | *withheld* |
| 30 | P5 | premium | TRUE | *withheld* |

## Summary

| | TRUE | PARTIAL | **FALSE (hallucination)** |
|---|---|---|---|
| **premium** (15) | 13 (87%) | 2 (13%) | **0 (0%)** |
| **leve** (15) | 10 (67%) | 4 (27%) | **1 (6.7%)** |
| **Overall** (30) | 23 (77%) | 6 (20%) | **1 (3.3%)** |

**Hallucination rate (false claims): ~3.3% overall — 0% in premium, 6.7% in leve.**

- The claims are, in the vast majority, **factually correct**: both models rarely make things up.
- The **single hallucination** came from `leve` (the lighter model): a warning specific to React Compiler,
  which is not even enabled in the project — a technically plausible, yet false, claim.
- The **partial inaccuracies** are more frequent in leve (4 vs 2) and tend to be about *framing*
  (the fact exists, but the described mechanism/detail is inaccurate — e.g., calling something "validation"
  when it is an assertion failure; claiming the absence of a CONTRIBUTING.md that does exist).
- *Methodological note:* issues 7 and 8 (leve) flag the absence of a `GEMINI.md` — an AI instruction
  file, **not** a code defect; this is a low-value observation (and the AI files were neutralized during
  collection).

*Verification done by automated verifiers reading the code; human validation by sampling is recommended
(especially for the PARTIAL cases).*
