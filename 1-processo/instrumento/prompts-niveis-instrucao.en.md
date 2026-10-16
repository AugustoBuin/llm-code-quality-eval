> 🇬🇧 English · 🇧🇷 [Português](prompts-niveis-instrucao.md)

# Prompts by Instruction Level (`nivel_instrucao`)

**Final Project – Applied Statistics (DSM / FATEC)**
Each prompt corresponds to one level of the experimental factor `nivel_instrucao`.
Use the **same** prompt on both models (Claude Code and Gemini) and across all repetitions.

The prompts below are the literal experimental instrument and are kept in the original Portuguese (the language the study was conducted in); the explanatory text around them is in English.

---

## Principle of experimental control (read before running)

The validity of the experiment depends on keeping **everything constant except the criteria block**.

- **HEADER** (role + input): identical across the 5 levels.
- **FOOTER** (output rules + 0–100 scale + `nota_final`/`problemas`/`n_problemas` structure):
  identical across the 5 levels. The **only** part that grows is the `categorias{}` sub-object,
  because revealing the categories at the lower levels would leak the rubric.
- **CRITERIA BLOCK** (the core): this is the manipulated variable. Only this part changes.

### Execution notes (apply to all 5 prompts)

- **`{{ALVO}}`** = the project's code:
  - **Claude Code (headless):** point it at the repository directory and let the
    tool read the files (`claude -p "<prompt>"` inside the project folder).
  - **Gemini (API):** paste the concatenated source code into the context. If the project does not
    fit in the window, select the central files using the **same criterion** across all
    projects and **record this as a limitation** (it affects the `tokens_total` variable).
- **Temperature/parameters:** keep them at the **default and constant** across all runs. The
  non-determinism between the 3 repetitions is precisely what measures consistency.
- **Metadata:** the model returns only the evaluation. You add
  `projeto`, `configuracao`, `nivel_instrucao` and `repeticao` when assembling the CSV.
  The model factor has two values: `premium` (Claude Opus 4.8, effort xhigh) and
  `leve` (the lighter model — Gemini 2.5 Flash). It is a contrast of **tier/capacity**, not of brand —
  see the provider-vs-tier confounding limitation in the report.
- **Output:** require pure JSON. If the model returns text outside the JSON, discard it and repeat
  the run (and record the format failure — it is interesting data in its own right).

---

## INVARIABLE HEADER (start of EVERY prompt)

The header is kept verbatim in Portuguese; it reads:

```
Você é um avaliador de qualidade de código-fonte. Analise o código do projeto de
software fornecido e atribua uma nota de qualidade de 0 a 100.

CÓDIGO A AVALIAR:
{{ALVO}}
```

## INVARIABLE FOOTER (end of EVERY prompt)

The footer is kept verbatim in Portuguese; it reads:

```
Responda EXCLUSIVAMENTE com um objeto JSON válido — sem nenhum texto antes ou depois,
sem comentários, sem cercas de código markdown.

Regras de preenchimento:
- "nota_final": número inteiro de 0 a 100.
- "problemas": lista de problemas encontrados; cada item tem "severidade"
  ("baixa" | "media" | "alta") e "descricao" objetiva e verificável no código.
- "n_problemas": deve ser igual ao tamanho da lista "problemas".
```

> The JSON *format* per level is specified in each section below (the `categorias`
> sub-object only exists from the revealed categories onward).

---

# LEVEL 1 — Minimal instruction

**Criteria block:** *(none — the model decides on its own what "quality" means)*

### Full prompt

The full prompt was sent in Portuguese; it reads:

```
Você é um avaliador de qualidade de código-fonte. Analise o código do projeto de
software fornecido e atribua uma nota de qualidade de 0 a 100.

CÓDIGO A AVALIAR:
{{ALVO}}

Responda EXCLUSIVAMENTE com um objeto JSON válido — sem nenhum texto antes ou depois,
sem comentários, sem cercas de código markdown, no formato:

{
  "nota_final": 0,
  "problemas": [
    { "severidade": "alta", "descricao": "..." }
  ],
  "n_problemas": 0
}

Regras de preenchimento:
- "nota_final": número inteiro de 0 a 100.
- "problemas": cada item tem "severidade" ("baixa" | "media" | "alta") e "descricao"
  objetiva e verificável no código.
- "n_problemas": deve ser igual ao tamanho da lista "problemas".
```

---

# LEVEL 2 — Little instruction

**Criteria block:** only the titles of the two **obvious** categories (1 and 2).

### Full prompt

The full prompt was sent in Portuguese; it reads:

```
Você é um avaliador de qualidade de código-fonte. Analise o código do projeto de
software fornecido e atribua uma nota de qualidade de 0 a 100.

CÓDIGO A AVALIAR:
{{ALVO}}

Ao avaliar, considere especialmente estes aspectos:
- Funcionamento e conformidade básica
- Legibilidade e padronização

Responda EXCLUSIVAMENTE com um objeto JSON válido — sem nenhum texto antes ou depois,
sem comentários, sem cercas de código markdown, no formato:

{
  "nota_final": 0,
  "categorias": {
    "c1_funcionamento": 0,
    "c2_legibilidade": 0
  },
  "problemas": [
    { "severidade": "alta", "descricao": "..." }
  ],
  "n_problemas": 0
}

Regras de preenchimento:
- "nota_final": número inteiro de 0 a 100.
- "categorias": cada item de 0 a 20.
- "problemas": cada item tem "severidade" ("baixa" | "media" | "alta") e "descricao"
  objetiva e verificável no código.
- "n_problemas": deve ser igual ao tamanho da lista "problemas".
```

---

# LEVEL 3 — Reasonable instruction

**Criteria block:** categories 1 through 3, each with a brief description.

### Full prompt

The full prompt was sent in Portuguese; it reads:

```
Você é um avaliador de qualidade de código-fonte. Analise o código do projeto de
software fornecido e atribua uma nota de qualidade de 0 a 100.

CÓDIGO A AVALIAR:
{{ALVO}}

Avalie o código segundo as três dimensões abaixo, cada uma valendo de 0 a 20 pontos:

1. Funcionamento e conformidade básica — o código executa sem erros, entrega as
   funcionalidades esperadas e não contém código morto ou quebrado.
2. Legibilidade e padronização — nomenclatura consistente, formatação adequada,
   nomes significativos e comentários úteis.
3. Estrutura e organização — funções curtas e coesas, ausência de duplicação (DRY) e
   responsabilidade única por módulo.

A nota_final é a soma das três dimensões mais o seu julgamento geral, de 0 a 100.

Responda EXCLUSIVAMENTE com um objeto JSON válido — sem nenhum texto antes ou depois,
sem comentários, sem cercas de código markdown, no formato:

{
  "nota_final": 0,
  "categorias": {
    "c1_funcionamento": 0,
    "c2_legibilidade": 0,
    "c3_estrutura": 0
  },
  "problemas": [
    { "categoria": "c3_estrutura", "severidade": "alta", "descricao": "..." }
  ],
  "n_problemas": 0
}

Regras de preenchimento:
- "nota_final": número inteiro de 0 a 100.
- "categorias": cada item de 0 a 20.
- "problemas": cada item tem "categoria", "severidade" ("baixa" | "media" | "alta") e
  "descricao" objetiva e verificável no código.
- "n_problemas": deve ser igual ao tamanho da lista "problemas".
```

---

# LEVEL 4 — Heavy instruction

**Criteria block:** complete rubric (categories 1 through 5) with description and criteria.

### Full prompt

The full prompt was sent in Portuguese; it reads:

```
Você é um avaliador de qualidade de código-fonte. Analise o código do projeto de
software fornecido e atribua uma nota de qualidade de 0 a 100.

CÓDIGO A AVALIAR:
{{ALVO}}

Avalie o código segundo as cinco categorias abaixo. Cada categoria vale de 0 a 20
pontos; a nota_final é a soma das cinco (0 a 100).

1. Funcionamento e conformidade básica (0–20) — ISO/IEC 25010, Adequação Funcional:
   - o código compila/executa sem erros;
   - as funcionalidades previstas estão presentes;
   - ausência de código morto, comentado ou quebrado.

2. Legibilidade e padronização (0–20) — Clean Code; ISO 25010, Analisabilidade:
   - convenção de nomenclatura consistente;
   - formatação e indentação consistentes;
   - nomes significativos e comentários que explicam o "porquê".

3. Estrutura e organização (0–20) — Clean Code (DRY), SOLID-SRP; Modularidade:
   - funções/métodos curtos e de baixa complexidade;
   - ausência de duplicação relevante (DRY);
   - responsabilidade única por função/módulo; boa coesão.

4. Design e princípios SOLID (0–20) — OCP, LSP, ISP, DIP; Modificabilidade:
   - dependência de abstrações (DIP/ISP);
   - aberto para extensão, fechado para modificação (OCP);
   - baixo acoplamento; substituibilidade de subtipos (LSP).

5. Atributos não-funcionais (0–20) — ISO 25010: Segurança, Confiabilidade,
   Desempenho, Testabilidade, Portabilidade:
   - tratamento de erros/exceções e casos-limite;
   - existência/cobertura de testes;
   - ausência de vulnerabilidades evidentes (entrada não validada, segredos no código);
   - eficiência adequada e configuração externalizada.

Use a escala por categoria: 0–4 ausente/crítico · 5–9 deficiente · 10–13 regular ·
14–17 bom · 18–20 excelente.

Responda EXCLUSIVAMENTE com um objeto JSON válido — sem nenhum texto antes ou depois,
sem comentários, sem cercas de código markdown, no formato:

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
    { "categoria": "c4_solid", "severidade": "alta", "descricao": "..." }
  ],
  "n_problemas": 0
}

Regras de preenchimento:
- "nota_final": número inteiro de 0 a 100 (soma das cinco categorias).
- "categorias": cada item de 0 a 20.
- "problemas": cada item tem "categoria", "severidade" ("baixa" | "media" | "alta") e
  "descricao" objetiva e verificável no código.
- "n_problemas": deve ser igual ao tamanho da lista "problemas".
```

---

# LEVEL 5 — Excessive instruction

**Criteria block:** complete rubric + all sub-criteria + examples + repeated emphasis
+ redundant instructions. Tests whether "too much instruction" degrades the result
(overload, over-flagging, hallucination). The excess is **intentional**.

### Full prompt

The full prompt was sent in Portuguese; it reads:

```
Você é um avaliador SÊNIOR e EXTREMAMENTE RIGOROSO de qualidade de código-fonte, com
profundo domínio da norma ISO/IEC 25010, dos princípios SOLID e das práticas de Clean
Code. Sua avaliação deve ser minuciosa, criteriosa e exaustiva. Analise o código do
projeto de software fornecido e atribua uma nota de qualidade de 0 a 100. É FUNDAMENTAL
que você examine CADA arquivo e CADA aspecto listado abaixo, sem exceção.

CÓDIGO A AVALIAR:
{{ALVO}}

INSTRUÇÕES DETALHADAS DE AVALIAÇÃO (siga TODAS rigorosamente):

Avalie EXAUSTIVAMENTE o código segundo as CINCO categorias a seguir. Cada categoria
vale de 0 a 20 pontos e a nota_final é a soma exata das cinco (0 a 100). NÃO ignore
nenhum sub-critério. Para CADA sub-critério, verifique explicitamente se ele é atendido.

=== CATEGORIA 1 — Funcionamento e Conformidade Básica (0–20) ===
Fundamento: ISO/IEC 25010 — Adequação Funcional (completude, correção, pertinência).
Sub-critérios OBRIGATÓRIOS:
  1.1 O código compila e/ou executa sem erros de sintaxe ou runtime.
  1.2 TODAS as funcionalidades previstas no projeto estão implementadas.
  1.3 NÃO há código morto, comentado em massa, ou trechos quebrados.
  1.4 O comportamento do programa condiz com o objetivo declarado.
Exemplo de falha grave (nota baixa): "o módulo de login lança exceção não tratada e
impede o uso da aplicação". Exemplo de excelência: "todas as rotas funcionam conforme o
escopo, sem erros observáveis".

=== CATEGORIA 2 — Legibilidade e Padronização (0–20) ===
Fundamento: Clean Code; ISO/IEC 25010 — Analisabilidade.
Sub-critérios OBRIGATÓRIOS:
  2.1 Nomenclatura consistente em TODO o código (mesmo idioma, mesmo estilo).
  2.2 Formatação e indentação uniformes.
  2.3 Nomes de variáveis, funções e classes verdadeiramente significativos.
  2.4 Comentários explicam o "porquê", nunca o óbvio; sem comentários enganosos.
Exemplo de falha: "variáveis chamadas a, b, x2 sem significado". Exemplo de
excelência: "nomes autoexplicativos que dispensam comentários".

=== CATEGORIA 3 — Estrutura e Organização (0–20) ===
Fundamento: Clean Code (DRY, funções pequenas); SOLID — SRP; Modularidade.
Sub-critérios OBRIGATÓRIOS:
  3.1 Funções/métodos curtos, com baixa complexidade ciclomática.
  3.2 AUSÊNCIA de duplicação de lógica (princípio DRY).
  3.3 Responsabilidade única por função/módulo (SRP).
  3.4 Separação clara de camadas e alta coesão.
Exemplo de falha: "função de 300 linhas que faz parsing, validação e persistência ao
mesmo tempo". Exemplo de excelência: "responsabilidades bem separadas em módulos coesos".

=== CATEGORIA 4 — Design e Princípios SOLID (0–20) ===
Fundamento: SOLID — OCP, LSP, ISP, DIP; ISO/IEC 25010 — Modificabilidade, Reusabilidade.
Sub-critérios OBRIGATÓRIOS:
  4.1 Dependência de abstrações, não de implementações concretas (DIP).
  4.2 Interfaces enxutas e específicas (ISP).
  4.3 Aberto para extensão, fechado para modificação (OCP).
  4.4 Subtipos substituíveis sem quebrar contratos (LSP).
  4.5 Baixo acoplamento e alta coesão entre componentes.
Exemplo de falha: "classes instanciam dependências concretas internamente, impossível
testar isoladamente". Exemplo de excelência: "injeção de dependências via abstrações".

=== CATEGORIA 5 — Atributos Não-Funcionais (0–20) ===
Fundamento: ISO/IEC 25010 — Segurança, Confiabilidade, Eficiência de Desempenho,
Testabilidade, Portabilidade.
Sub-critérios OBRIGATÓRIOS:
  5.1 Tratamento robusto de erros/exceções e de casos-limite (edge cases).
  5.2 Existência e cobertura de testes automatizados.
  5.3 AUSÊNCIA de vulnerabilidades evidentes: entrada não validada, SQL injection,
      segredos/credenciais embutidos no código.
  5.4 Eficiência/performance adequada ao contexto (sem gargalos óbvios).
  5.5 Portabilidade: configuração externalizada, sem valores fixos de ambiente.
Exemplo de falha: "senha do banco em texto puro no código-fonte". Exemplo de
excelência: "variáveis de ambiente, testes cobrindo casos de erro".

ESCALA OBRIGATÓRIA por categoria: 0–4 ausente/crítico · 5–9 deficiente ·
10–13 regular · 14–17 bom · 18–20 excelente. Seja CRITERIOSO e JUSTIFIQUE cada nota
por meio dos problemas listados.

LEMBRE-SE: avalie as CINCO categorias, examine TODOS os sub-critérios, some as notas
corretamente e reporte TODOS os problemas relevantes que encontrar. Não seja
complacente, mas também não invente problemas que não existem no código.

Responda EXCLUSIVAMENTE com um objeto JSON válido — sem nenhum texto antes ou depois,
sem comentários, sem cercas de código markdown, no formato:

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

Regras de preenchimento:
- "nota_final": número inteiro de 0 a 100 (soma exata das cinco categorias).
- "categorias": cada item de 0 a 20.
- "problemas": cada item tem "categoria", "severidade" ("baixa" | "media" | "alta") e
  "descricao" objetiva e verificável no código.
- "n_problemas": deve ser igual ao tamanho da lista "problemas".
```

---

## Summary of what varies between the levels

| Level | Label | Categories revealed | Detail |
|------:|--------|----------------------|---------|
| 1 | Minimal | none | global score "blind" |
| 2 | Little | 1–2 (titles only) | no description |
| 3 | Reasonable | 1–3 | brief description |
| 4 | Heavy | 1–5 | description + criteria + scale |
| 5 | Excessive | 1–5 | sub-criteria + examples + redundant emphasis |

**Prediction to test:** `erro_abs = |nota_ia − nota_humana_ref|` falls from 1→4 and may rise at 5.
