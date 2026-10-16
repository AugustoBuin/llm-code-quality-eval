> 🇬🇧 English · 🇧🇷 [Português](README.md)

# projetos-base/ — the 5 evaluated projects (deferred)

This folder is a **placeholder**. It does **not yet contain** the 5 software projects that this
study evaluated — and that is intentional.

## Why it is empty

1. **Third-party authorship.** The 5 projects were developed by **other teams** of students
   (Project-Based Learning — PBL). They are not the work of this study's author.
2. **Ethics of criticism.** The study **evaluates and critiques** the quality of these projects.
   Publishing them tied to identifiable teams would be delicate. That is why, throughout the
   repository, they appear only as **P1–P5** (anonymized), and the real names/paths live solely on
   the author's machine (in the file `3-codigos/coleta/projetos.local.config`, outside version
   control).

## Future plan (subject to authorization)

Once **each team authorizes** it, the plan is to reference its repository here as a
**Git submodule** (`git submodule`), pinning the exact *commit* that was evaluated — so the study
stays 100% reproducible **without copying** third-party code (the submodule only points to their
original repository, preserving authorship and license).

Example of how it will look (illustrative):

```bash
# (only after authorization from the corresponding team)
git submodule add <url-do-repo-da-equipe> projetos-base/P1
cd projetos-base/P1 && git checkout <commit-sha-avaliado>
```

Until then, to **reproduce the data collection** you point the scripts at your own local copy of the
projects by configuring `3-codigos/coleta/projetos.local.config` (see
`3-codigos/coleta/projetos.local.config.example`).
