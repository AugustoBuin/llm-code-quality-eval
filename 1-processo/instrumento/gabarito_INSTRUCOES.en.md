> 🇬🇧 English · 🇧🇷 [Português](gabarito_INSTRUCOES.md)

# Human ground truth — how to fill it in

The ground truth is the **true reference score** for each project, given by **you** applying the
full rubric. It is what the AI's error is measured against: `erro_abs = |nota_IA − nota_humana|`.
**You score the 5 projects once** (not the 150 runs) — the human score is fixed per project.

## What to fill in

In the **`gabarito.csv`** file, fill in the 5 score columns, **each from 0 to 20 (integer)**:

| Column | Category | What it evaluates (summary — details in `rubrica-qualidade-codigo.en.md`) |
|---|---|---|
| `g1_funcionamento` | Functioning | ISO 25010 Functional Suitability: runs, delivers what's expected, no dead/broken code |
| `g2_legibilidade` | Readability | Clean Code: naming, formatting, useful comments, standardization |
| `g3_estrutura` | Structure | DRY / SRP: short, cohesive functions, no duplication, single responsibility |
| `g4_solid` | SOLID | Application of the 5 SOLID principles |
| `g5_nao_funcionais` | Non-functional | Security, tests, performance |

- The `observacoes` column is optional (free-form justification per project — helps in the oral presentation).
- Do **NOT** fill in `nota_global` — it does not exist in the template; the script computes it by summing.

## After filling it in

```
node gabarito_check.js
```

The script:
- validates that everything is filled in and that each score is an integer from 0 to 20;
- computes `nota_global = g1+g2+g3+g4+g5` (0–100, equal weights);
- generates `gabarito_computed.csv` (1 row/project) and `gabarito_long.csv` (1 row/project×category).

If a cell is missing, it lists exactly which ones and writes nothing — just complete them and run again.

## Tips

- Edit in a text editor or VS Code (not in pt-BR Excel, which may swap the comma for `;`).
- Score by looking at the **same code the AI saw**: the 5 projects sit in the folder you pointed to in
  `projetos.local.config` (the `ABP` variable), each in the subfolder mapped to P1…P5.
- Single-evaluator bias is a known limitation — declare it in the report (Part 5/12).
