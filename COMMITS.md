> 🇧🇷 Português · 🇬🇧 [English](COMMITS.en.md)

# Padrão de commits

Convenção de mensagens de commit deste repositório. Baseada em
[Conventional Commits](https://www.conventionalcommits.org/), adaptada a um projeto de pesquisa
bilíngue e **anonimizado**.

> As **mensagens de commit são em inglês** (palavras-chave do padrão já são em inglês e isso ajuda na
> descoberta em open-source). A **documentação** do repositório é PT-first — só as mensagens de commit
> seguem em inglês.

## Formato

```
<tipo>(<escopo>): <resumo imperativo, em minúsculas, sem ponto final>

<corpo opcional: o que mudou e por quê, em texto corrido, ~72 colunas>
```

- **Resumo (título):** imperativo ("add", "fix", "remove" — não "added"/"adds"), minúsculas, ≤ ~50 col.
- **Corpo:** explica *o que* mudou e *por quê*, em linguagem clara. Deve ser **autossuficiente**:
  qualquer pessoa entende a mudança **só pela mensagem**, sem abrir plano, ticket ou outro arquivo.

## Tipos

| tipo | quando usar |
|---|---|
| `feat` | conteúdo ou capacidade nova (novo documento, nova análise, novo recurso de script) |
| `fix` | correção (bug em script, erro de cálculo/dado, link quebrado, erro factual) |
| `docs` | texto/explicação sem mudar código nem dados |
| `data` | mudança nos **dados** (CSVs, gabarito, regeneração de resultados/gráficos) |
| `chore` | estrutura, configuração, licença, `.gitignore`, tooling |
| `refactor` | reorganizar código/arquivos sem mudar a saída |
| `style` | formatação/typo que não muda o sentido |
| `i18n` | tradução / espelho em inglês (`*.en.md`) |

## Escopos

Mapeiam a estrutura em 3 partes e os artefatos transversais (use o mais específico que couber).
**Os escopos são em inglês**, para combinar com as mensagens (as pastas seguem em português):

`process` · `results` · `code` · `instrument` · `data` · `charts` · `report` ·
`notebook` · `collection` · `analysis` · `repo` (arquivos de raiz: README, LICENSE, .gitignore, glossário).

O escopo é opcional quando a mudança é ampla (ex.: `docs: ...` cobrindo várias partes).

## Regras específicas deste repositório

Além das regras gerais acima, **três** valem sempre aqui:

1. 🔒 **Anonimização também na mensagem.** Os projetos avaliados aparecem **somente** como `P1`–`P5`.
   **Nunca** cite o nome real de um projeto ou equipe numa mensagem de commit — o histórico do Git é
   permanente, e um nome real continua vazado mesmo depois de removido do arquivo.
2. **Sem segredos.** Nunca mencione chaves de API, tokens ou caminhos pessoais na mensagem.
3. **Um concern por commit.** Cada parte (1-processo / 2-resultados / 3-codigos) é uma preocupação
   separada; mudanças não relacionadas vão em commits distintos.

## Exemplos

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
