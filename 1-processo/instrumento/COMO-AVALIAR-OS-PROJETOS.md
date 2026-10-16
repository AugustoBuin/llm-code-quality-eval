> 🇧🇷 Português · 🇬🇧 [English](COMO-AVALIAR-OS-PROJETOS.en.md)

# Como avaliar os 5 projetos e preencher o gabarito

Guia completo para produzir o **gabarito humano** (*ground truth*) — a nota de referência
verdadeira de cada projeto, contra a qual o erro da IA é medido: `erro_abs = |nota_IA − nota_humana|`.

> **Nota sobre anonimização.** Neste repositório público os projetos avaliados aparecem apenas como
> **P1–P5**. Os nomes e caminhos reais ficam só na sua máquina, no arquivo `projetos.local.config`
> (na pasta `3-codigos/coleta/`), que está fora do controle de versão de propósito. Onde este guia
> diz "a pasta do projeto Pn", entenda "a subpasta real mapeada para Pn no seu `projetos.local.config`".

**Ordem de trabalho:**
1. Ler a rubrica (`rubrica-qualidade-codigo.md`) e fixar suas âncoras de nota.
2. Avaliar os 5 projetos **às cegas** (categoria por categoria) — ver regra 🔒 na seção 4.
3. Preencher `gabarito.csv` (instruções em `gabarito_INSTRUCOES.md`).
4. Rodar `node gabarito_check.js` para validar e somar.

---

## 1. Regra de escopo — avalie exatamente o que a IA viu

A IA rodou na **raiz de cada repositório**, com permissão de leitura/busca, e a instrução
"explore os arquivos do diretório atual". Ou seja, ela enxergou **todo o código-fonte do projeto
(frontend + backend juntos)**, menos as dependências. Portanto você dá **uma nota holística por
categoria, para o projeto inteiro** — não separe front e back em notas diferentes.

**✅ No escopo (pontuar):** todo o código-fonte — `.ts .tsx .js .jsx .css .sql .prisma`,
configs (`package.json`, `tsconfig`, `docker-compose`, lint) e o que define a arquitetura.

**❌ Fora do escopo (ignorar — não conta e só atrapalha):**
- `node_modules/`, `.git/`, `dist/`, `build/`, `package-lock.json`
- **código gerado** (ex.: pastas `generated/prisma/`, geradas pelo Prisma — não é trabalho da equipe)
- binários/assets: `.png .pdf .svg .jpeg`
- `docs/` — documentação, não código (pode dar contexto, mas não é o que a rubrica mede)
- arquivos de contexto de IA (`.clinerules`, `CLAUDE.md`, `GEMINI.md`) — foram **escondidos da IA**
  durante a coleta, então você também os ignora, para manter paridade

As pastas dos projetos ficam dentro do diretório que você apontou em `projetos.local.config`
(variável `ABP`).

---

## 2. Mapa de cada projeto — onde olhar

Todos são full-stack TypeScript (React no front + Node/Express + Prisma/Postgres no back),
divididos numa pasta de backend e uma de frontend. (Os nomes reais das pastas ficam no seu
`projetos.local.config`.)

> **Versão pública:** o mapa de cada projeto (nomes das pastas, quantidade de arquivos e observações
> de escopo) foi omitido, porque permitiria identificar as equipes. Ele fica no `projetos.local.config`.

*Em todos, comece por: a pasta `src/` de cada
lado (back e front), o `package.json` (scripts e dependências), o schema do Prisma e as migrações SQL.*

---

## 3. Checklist da rubrica — para não esquecer nada

5 categorias, **cada uma de 0 a 20** (detalhe completo em `rubrica-qualidade-codigo.md`).
Para **cada projeto**, percorra os 5 critérios olhando estes lugares:

- **c1 — Funcionamento** (ISO 25010 Adequação Funcional): o código roda e entrega o esperado?
  Olhe pontos de entrada (`server`/`index`/`app`), rotas/controllers, integração front↔API,
  e código morto / `TODO` / mocks deixados pra trás.
- **c2 — Legibilidade** (Clean Code): nomes, formatação, consistência. Olhe componentes e services,
  se há padrão de lint configurado **e seguido**, comentários úteis vs. ruído.
- **c3 — Estrutura** (DRY / SRP): funções curtas e coesas, sem duplicação, responsabilidade única.
  Olhe o tamanho dos arquivos, repetição de lógica, separação de camadas.
- **c4 — SOLID**: abstrações, injeção de dependência, acoplamento. Olhe services/repositories,
  uso de interfaces, e se a regra de negócio depende direto do ORM.
- **c5 — Não-funcionais**: segurança, **testes**, performance. Olhe tratamento de auth/segredos,
  *você mesmo* verifique se há testes de verdade (e se valem algo) e o que o script `test` do
  `package.json` realmente faz.

> ⚠️ **Contagem de arquivos ≠ qualidade.** Um projeto pode ter dezenas de arquivos de teste triviais,
> ou zero testes por ausência real. Não confie em números agregados: abra e julgue o conteúdo.

---

## 4. Duas regras que protegem a validade do experimento

1. **Pontue o projeto inteiro** (frontend + backend) → um valor 0–20 por categoria, 5 por projeto.

2. **🔒 Pontue ANTES de olhar as respostas da IA.** Não abra `dados.csv` nem `problemas.csv`
   enquanto não fechar o gabarito. Se você ler primeiro os problemas que a IA apontou, sua nota
   ancora nela e o `erro_abs` cai de forma artificial — isso **invalidaria a tese inteira** (o
   gabarito precisa ser independente da IA). Pontue "às cegas", depois compare. **Este é o ponto
   mais importante de todos.**

---

## 5. Como garantir que não vai errar a conta

- Você **só digita inteiros de 0 a 20**; o `gabarito_check.js` calcula a soma `G(p) = c1+c2+c3+c4+c5`
  e valida tudo. **Zero aritmética manual = zero erro de cálculo.**
- **Calibre antes:** leia a rubrica e fixe suas âncoras (o que é um 20, um 15, um 10, um 5, um 0).
  Use a mesma régua nos 5 projetos.
- **Consistência:** pontue **uma categoria nos 5 projetos de uma vez** (todos os c1, depois todos
  os c2…) em vez de fechar um projeto por vez — reduz o "efeito halo" e a deriva entre projetos.
- Escreva **1 linha de justificativa por projeto** na coluna `observacoes` — ajuda muito na
  apresentação oral.

---

## TL;DR — o fluxo em uma frase

Ler a rubrica → pontuar os 5 projetos **às cegas**, categoria por categoria, olhando o código-fonte
(front + back, ignorando deps/gerados/assets) → preencher `gabarito.csv` → rodar
`node gabarito_check.js`. Pronto: sai o `gabarito_computed.csv` com a nota de referência de cada projeto.
