> 🇧🇷 Português · 🇬🇧 [English](prompts-niveis-instrucao.en.md)

# Prompts por Nível de Instrução (`nivel_instrucao`)

**Trabalho Final – Estatística Aplicada (DSM / FATEC)**
Cada prompt corresponde a um nível do fator experimental `nivel_instrucao`.
Use o **mesmo** prompt em ambos os modelos (Claude Code e Gemini) e em todas as repetições.

---

## Princípio de controle experimental (ler antes de rodar)

A validade do experimento depende de manter **tudo constante, exceto o bloco de critérios**.

- **CABEÇALHO** (papel + entrada): idêntico nos 5 níveis.
- **RODAPÉ** (regras de saída + escala 0–100 + estrutura `nota_final`/`problemas`/`n_problemas`):
  idêntico nos 5 níveis. A **única** parte que cresce é o sub-objeto `categorias{}`,
  porque revelar as categorias nos níveis baixos vazaria a rubrica.
- **BLOCO DE CRITÉRIOS** (miolo): é a variável manipulada. Só ele muda.

### Notas de execução (valem para os 5 prompts)

- **`{{ALVO}}`** = o código do projeto:
  - **Claude Code (headless):** aponte para o diretório do repositório e deixe a
    ferramenta ler os arquivos (`claude -p "<prompt>"` dentro da pasta do projeto).
  - **Gemini (API):** cole o código-fonte concatenado no contexto. Se o projeto não
    couber na janela, selecione os arquivos centrais pelo **mesmo critério** em todos os
    projetos e **registre isso como limitação** (afeta a variável `tokens_total`).
- **Temperatura/parâmetros:** mantenha o **padrão e constante** em todas as execuções. A
  não-determinância entre as 3 repetições é justamente o que mede a consistência.
- **Metadados:** o modelo devolve só a avaliação. Você acrescenta
  `projeto`, `configuracao`, `nivel_instrucao` e `repeticao` ao montar o CSV.
  O fator de modelo tem dois valores: `premium` (Claude Opus 4.8, effort xhigh) e
  `leve` (Gemini 2.5 Flash). É um contraste de **tier/capacidade**, não de marca —
  ver limitação do confundimento fornecedor-vs-tier no relatório.
- **Saída:** exija JSON puro. Se o modelo devolver texto fora do JSON, descarte e repita
  a execução (e registre a falha de formato — é um dado interessante por si só).

---

## CABEÇALHO INVARIÁVEL (início de TODOS os prompts)

```
Você é um avaliador de qualidade de código-fonte. Analise o código do projeto de
software fornecido e atribua uma nota de qualidade de 0 a 100.

CÓDIGO A AVALIAR:
{{ALVO}}
```

## RODAPÉ INVARIÁVEL (fim de TODOS os prompts)

```
Responda EXCLUSIVAMENTE com um objeto JSON válido — sem nenhum texto antes ou depois,
sem comentários, sem cercas de código markdown.

Regras de preenchimento:
- "nota_final": número inteiro de 0 a 100.
- "problemas": lista de problemas encontrados; cada item tem "severidade"
  ("baixa" | "media" | "alta") e "descricao" objetiva e verificável no código.
- "n_problemas": deve ser igual ao tamanho da lista "problemas".
```

> O *formato* do JSON por nível está especificado em cada seção abaixo (o sub-objeto
> `categorias` só existe a partir das categorias reveladas).

---

# NÍVEL 1 — Pouquíssima instrução

**Bloco de critérios:** *(nenhum — o modelo decide sozinho o que é "qualidade")*

### Prompt completo

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

# NÍVEL 2 — Pouca instrução

**Bloco de critérios:** apenas os títulos das duas categorias **óbvias** (1 e 2).

### Prompt completo

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

# NÍVEL 3 — Instrução razoável

**Bloco de critérios:** categorias 1 a 3, cada uma com uma descrição breve.

### Prompt completo

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

# NÍVEL 4 — Muita instrução

**Bloco de critérios:** rubrica completa (categorias 1 a 5) com descrição e critérios.

### Prompt completo

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

# NÍVEL 5 — Instrução excessiva

**Bloco de critérios:** rubrica completa + todos os sub-critérios + exemplos + ênfase
repetida + instruções redundantes. Testa se "instrução demais" degrada o resultado
(sobrecarga, super-apontamento, alucinação). O excesso é **proposital**.

### Prompt completo

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

## Resumo do que varia entre os níveis

| Nível | Rótulo | Categorias reveladas | Detalhe |
|------:|--------|----------------------|---------|
| 1 | Pouquíssima | nenhuma | nota global "às cegas" |
| 2 | Pouca | 1–2 (só títulos) | sem descrição |
| 3 | Razoável | 1–3 | descrição breve |
| 4 | Muita | 1–5 | descrição + critérios + escala |
| 5 | Excessiva | 1–5 | sub-critérios + exemplos + ênfase redundante |

**Previsão a testar:** `erro_abs = |nota_ia − nota_humana_ref|` cai de 1→4 e pode subir em 5.
