> 🇬🇧 English · 🇧🇷 [Português](COMMITS.md)

# Commit convention

The commit-message convention for this repository. Based on
[Conventional Commits](https://www.conventionalcommits.org/), adapted to a bilingual and
**anonymized** research project.

> The **commit messages are in English** (the convention's keywords are already in English, and this
> helps discoverability in open source). The repository's **documentation** is PT-first — only the
> commit messages are written in English.

## Format

```
<type>(<scope>): <imperative summary, lowercase, no trailing period>

<optional body: what changed and why, in running text, ~72 columns>
```

- **Summary (title):** imperative ("add", "fix", "remove" — not "added"/"adds"), lowercase, ≤ ~50 col.
- **Body:** explains *what* changed and *why*, in clear language. It must be **self-contained**:
  anyone can understand the change **from the message alone**, without opening a plan, ticket or any
  other file.

## Types

| type | when to use |
|---|---|
| `feat` | new content or capability (new document, new analysis, new script feature) |
| `fix` | correction (bug in a script, calculation/data error, broken link, factual error) |
| `docs` | text/explanation without changing code or data |
| `data` | change to the **data** (CSVs, ground truth, regeneration of results/charts) |
| `chore` | structure, configuration, license, `.gitignore`, tooling |
| `refactor` | reorganize code/files without changing the output |
| `style` | formatting/typo that does not change the meaning |
| `i18n` | translation / English mirror (`*.en.md`) |

## Scopes

They map the 3-part structure and the cross-cutting artifacts (use the most specific one that fits).
**The scopes are in English**, to match the messages (the folders remain in Portuguese):

`process` · `results` · `code` · `instrument` · `data` · `charts` · `report` ·
`notebook` · `collection` · `analysis` · `repo` (root files: README, LICENSE, .gitignore, glossary).

The scope is optional when the change is broad (e.g., `docs: ...` covering several parts).

## Repository-specific rules

In addition to the general rules above, **three** always apply here:

1. 🔒 **Anonymization in the message too.** The evaluated projects appear **only** as `P1`–`P5`.
   **Never** mention a project's or a team's real name in a commit message — the Git history is
   permanent, and a real name stays leaked even after it is removed from the file.
2. **No secrets.** Never mention API keys, tokens or personal paths in the message.
3. **One concern per commit.** Each part (1-processo / 2-resultados / 3-codigos) is a separate
   concern; unrelated changes go in distinct commits.

## Examples

```
chore(repo): scaffold 3-part structure with dual license

Create the 1-processo / 2-resultados / 3-codigos layout, the MIT LICENSE
for code and the CC BY 4.0 LICENSE-CONTENT for text/data/figures, plus a
.gitignore that excludes secrets (.gemini_key), the local project config
and heavy collection outputs.
```

```
fix(data): drop real project-name column from gabarito CSVs

The gabarito files carried a projeto_nome column with the evaluated
teams' real repository names. Remove it so the published data is fully
anonymized to P1-P5; gabarito_check.js already tolerates its absence.
```

```
feat(code): parameterize collection scripts via gitignored local config

run_all/run_worker/run_validacao now source projetos.local.config (ABP
path + P1..P5 -> real folder mapping) instead of hardcoding real names.
A versioned .example documents the format; the real config stays out of
Git, keeping team names on the author's machine only.
```

```
data(results): regenerate the 9 charts from the anonymized dataset
```

```
i18n(repo): add English mirror of the main README
```
