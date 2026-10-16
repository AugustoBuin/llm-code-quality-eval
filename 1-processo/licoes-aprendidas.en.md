> 🇬🇧 English · 🇧🇷 [Português](licoes-aprendidas.md)

# Lessons Learned — "AI evaluation of code quality" project

**Context:** Final Applied Statistics assignment (DSM/FATEC) — Augusto Henrique Buin.
Retrospective of the **process** of running the project (not of the statistical results, which are in the
report). The focus here is the "how": engineering, operation, decisions and incidents throughout the
collection of **150 automated code evaluations** by two AI models.
**Date:** 2026-06-19.

> **Update (2026-06-19):** sections **1–5** cover the *data collection and analysis*; **Part 2**
> (sections 6–10, at the end) adds the retrospective of *organizing and publishing the GitHub repository*.

---

## 1. Process overview (5W3H)

| Dimension | In the project |
|---|---|
| **What** | End-to-end empirical project: factorial design → **instrument validation** → **collection of 150 runs** → data cleaning → statistical analysis → report/notebook/PDF/delivery. A large share of the effort was **engineering and operation** (scripts, orchestration, quota workarounds). |
| **Why** | Produce a piece of work with **real data** and a defensible question (effect of instruction level × model capacity on code evaluation). Rigor (validate first, blind ground truth, declare confounders) guided the decisions. |
| **Where** | Local Windows; Git Bash + PowerShell; two AI CLIs (Claude Code, Gemini CLI); 5 repositories; AI Studio dashboard. The environment weighed in (Windows paths/encoding, MSYS subshells, quota systems). |
| **When** | Tight window (~1–2 days). The **external timing** became critical: quota resets, throttle windows, multi-hour collection. |
| **Who** | Student (decisions + human ground truth + top-ups), AI assistant (orchestration/analysis/writing), subagents (hallucination verification) and the two models under study. Clear division: human on the *ground truth* and on the decisions; AI on the execution. |
| **How** | 5×2×5×3 design; *headless* runs; **resumable** scripts with anti-contamination neutralization; `parse.js`; pandas/scipy pipeline; **partitioned parallelization**; automated generation of report/charts/notebook/PDF. |
| **How much** | **~R$800** (Claude US$114.42 ≈ R$593 + Gemini ≈ R$210), plus wall-clock hours and significant consumption of the assistant's tokens/compute. |
| **How many** | 150 runs · ~5 collection restarts/incidents · 3 Gemini top-ups · 30 verified problems · 9 charts · 17 report parts · 58 notebook cells. |

---

## 2. Positive points (what worked)

1. **Validate before collecting in bulk.** The 8 validation runs caught a scale bug (the score turning into
   the *average* of the sub-scores, e.g. "9") **before** the 150. A cheap safeguard that saved the dataset.
2. **Resumability + idempotency.** It was the **most valuable design decision**: it saved the day in **every**
   incident (quota failures, process kills, concurrent runs). It was always possible to restart from where it stopped.
3. **Methodological discipline.** Ground truth filled in **blind** (independence), anti-contamination
   neutralization, declared vendor×tier confounding and — crucially — the AI did **not** generate the ground truth.
4. **Adaptation under constraint.** Each wall became a controlled pivot: Gemini quota ran out → API key; the API
   forced a different model → a clean decision (standardize, re-run, document) with a parity test.
5. **Verification culture.** Key test before the full run; notebook smoke test; model parity; hallucination
   verified by **independent agents reading the real code**. "Don't trust, verify."
6. **Robust result.** The analysis revealed a clean, non-obvious finding (the "U-shaped effect" conditional on
   model capacity).

---

## 3. Negative points (to improve)

1. **Assuming a process had stopped (verification failure).** A `TaskStop` returned *"not found"* and it was
   assumed the process had died — but it was **orphaned and running concurrently**, risking data corruption.
   *Verify the process's death, never assume it.*
2. **Repeatedly optimistic cost estimates.** The Gemini per-cell cost was underestimated by ~30× (guess
   ~R$0.03–0.10; actual ~R$2.70). Hasty conclusions ("it's more than enough", "it's used up for good").
   *Anchoring on the wrong token model and optimism without a hedge.*
3. **Infra/quotas undersized in planning.** The Claude session limit, the exhaustion of the Gemini free-tier
   capacity and the credit burn rate **were not anticipated**. The real clock ran far above the estimate; almost
   all the friction came from there.
4. **Auth→model mapping discovered late.** It was only noticed that the API key served a different model (3.5
   instead of 2.5) **in the middle** of the collection → it cost a re-run of 22 cells.
5. **Missing timeout at the start.** A hung subprocess stalled the collection for ~1h until it was noticed. A
   defense that should have been there from the beginning.
6. **Accumulated waste.** Re-collection, throttle *hammering* and failed attempts (which are still billed) spent
   avoidable time/money that a better pre-flight would have prevented.

---

## 4. Takeaways (principles for next time)

- **Pre-flight external dependencies** before scaling: quotas, rate limits, **auth→model** mapping and the
  **measured cost of 1 unit** before committing to N.
- **Long jobs are born resumable, idempotent and with a timeout** — it's not "later", it's day 1.
- **Verify state, don't assume** — especially "did this actually stop?". Confirm via `ps`/PID.
- **Anchor estimates in real data early** and **declare uncertainty**; when you get it wrong, **correct
  immediately and transparently**.
- **Keep the human on the ground truth and on the decisions**; keep the **AI's output out of the ground truth** —
  otherwise the experiment is invalidated.
- **Separate concerns and partition** to parallelize safely (premium×`leve`; `index % N`); **never** run two
  orchestrators in the same output directory.
- **Document deviations as they happen** (scale bug, model swap, cost) — the Limitations section practically
  writes itself.

---

## 5. Synthesis

The **methodological planning** was the strong point (validation, rigor and resumability saved the project); the
**infrastructure and cost forecasting** was the weak point (almost all the friction came from quotas/limits that a
pre-flight would have anticipated). The safety mechanisms — **resume, verify, document** — absorbed the friction
without loss of data or of validity. The most valuable stance, in the end, was to **verify everything**, including
admitting and correcting one's own estimation errors.

---

# Part 2 — Organizing and publishing the repository

*Retrospective of the phase after the academic delivery: turning the project into a **public, bilingual
GitHub repository** (3-part structure, anonymization, commit convention, English mirror, charts and PDFs in
both languages). Same format as sections 1–5; here the "how" is the **meta-process**.*

## 6. Publication overview (5W3H)

| Dimension | In the publication |
|---|---|
| **What** | Package the delivered project into a public 3-part repository (process / results / code): P1–P5 anonymization, script parameterization, a commit convention, an English mirror and bilingual charts/PDFs. |
| **Why** | Share the study in a **didactic and reproducible** way, without exposing third-party teams or secrets, and prepare the ground for a future article. |
| **Where** | Local Windows; Git Bash + PowerShell; Git/GitHub; Python (`markdown`, `matplotlib`), Node, headless Edge; 16 translation subagents. |
| **When** | Post-delivery — **no** quota/cost pressure this time; the bottleneck became **organization and consistency**, not infrastructure. |
| **Who** | Student (decisions: license, commit language, what to publish), AI assistant (assembly/anonymization/commits), 16 subagents (parallel translation under a **single brief**). |
| **How** | 3-part skeleton; `.gitignore` + sweeps (`grep`, `git check-ignore`, `git add -n`); gitignored local config; translation fan-out with a brief; link audit; PT/EN charts; PDF via headless Edge; incremental Conventional Commits. |
| **How much** | **No API cost** (no new collection); the cost was the assistant's tokens/compute + organization time. |
| **How many** | ~16 mirrored docs · 6 commits · 18 charts (9 PT + 9 EN) · 2 PDFs · 222 audited links · 2 pre-existing link bugs fixed. |

---

## 7. Positive points (what worked)

1. **Anonymization and secrets as machine-verified invariants.** At every commit: `grep` for real names,
   `git check-ignore`, `git add -n`. That — not the eye — caught the `.gitignore` swallowing a file and
   confirmed **zero leakage**.
2. **Parameterization via a gitignored config.** Real names and the key moved out of the scripts into a
   `projetos.local.config` outside Git → a clean **and** runnable public repo. A reusable pattern.
3. **"Does it actually run?" over "looks right".** Running `gerar_graficos.py` from an arbitrary directory
   proved the path refactor; the PDF-generation smoke test validated the toolchain. The same "don't trust,
   verify".
4. **Automated link audit.** The checker found **2 broken links I had introduced myself** when moving files
   into the new structure — something visual review does not catch.
5. **A single brief for the fan-out.** One terminology+links contract guided 16 subagents in parallel:
   consistency + lean context. And they **reported doubts**, which surfaced the real fixes.
6. **A commit convention before the first commit** — because history is permanent; the "anonymization applies
   to the message too" rule was born there.
7. **Incremental commits separated by concern** (e.g. the `fix(docs)` for pre-existing bugs kept apart from
   the `i18n` work).

---

## 8. Negative points (to improve)

1. **Bugs traveled along with the copy.** Moving the report/scripts into the 3-part structure broke relative
   links **silently**; they only surfaced 2 phases later. *Audit links/paths at the moment of relocating, not
   far downstream.*
2. **An allow-list `.gitignore` is fragile.** `/projetos-base/*` + exceptions swallowed a new file. *A folder
   with a list-based ignore needs a new exception for every file you want to keep.*
3. **Bash heredoc escaping bit twice.** A regex with `\` inside a heredoc lost a backslash twice. *In a
   heredoc, avoid regex with slashes/escapes — use `split/join` or write the script to a file.*
4. **MSYS vs native Windows paths.** `/c/...` failed in Python's `sys.path` (it needs `C:/...`). The same
   family of Windows friction as Part 1 (cp1252, quoting).
5. **Derived artifacts go stale.** Editing the English report **after** generating its PDF left the PDF
   outdated → regenerate. *Regenerating derivatives (PDF, charts) is a final **build** step, not ad-hoc.*
6. **No visual verification.** `pdftoppm` was missing, so the PDFs could only be checked by magic-byte/size.
   *Always have a verification path for a binary artifact.*

---

## 9. Takeaways (principles for next time)

- **Invariants hold across every artifact** — including the commit message and the Git history — and are
  checked by **command**, not by trust (no real name, no secret, links resolve, script runs).
- **Separate human decisions from mechanical execution**: license, commit language and what to publish were
  asked; the rest was automatic.
- **Every transition deserves an immediate check.** Almost all the friction came from *transitions* —
  changing structure, crossing PT↔EN, MSYS↔Windows, source↔artifact — where the error passes silently.
- **Parallelize with a contract** (the brief) and ask for **reported uncertainty**: the agents' divergence is
  the quality radar.

---

## 10. Synthesis

The discipline that saved the collection (validate, resume, verify) became, in publication, **mechanical
verification of invariants**: secrets, anonymization, links and build checked by command. The weak point was
the **transitions** — moving files between structures, crossing languages, MSYS↔Windows, source↔derivative —
where errors appear silently and charge a high price later. The lesson that stitches the two parts together:
**every transition needs an automatic check on the spot** — which, in the end, is what caught each problem.
